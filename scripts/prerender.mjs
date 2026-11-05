import { createServer } from 'vite'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server.js'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const siteHost = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://influncer-market-place-frontend.vercel.app')
const siteUrl = siteHost ? new URL(siteHost).origin : ''
const isPreview = process.env.VERCEL_ENV === 'preview'
const pages = [
  { path: '/', file: 'index.html', title: 'LinkLoom | Find Influencers and Creators for Your Brand', description: 'Find Indian creators for your next brand campaign. Explore profiles, compare proposals, and manage collaborations in one place.' },
  { path: '/creators', file: 'creators/index.html', title: 'Find Indian Influencers and Creators | LinkLoom', description: 'Browse creators across beauty, tech, travel, fitness, food, and more. Compare audiences, locations, and starting prices on LinkLoom.' },
]
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
const xmlEscape = escapeHtml

const template = await readFile('dist/index.html', 'utf8')
await writeFile('dist/spa.html', template.replace('</head>', '    <meta name="robots" content="noindex, nofollow" />\n  </head>'))
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
try {
  const { default: App } = await vite.ssrLoadModule('/src/App.jsx')
  for (const page of pages) {
    const content = renderToString(React.createElement(StaticRouter, { location: page.path }, React.createElement(App)))
    const canonical = siteUrl && !isPreview ? `${siteUrl}${page.path}` : ''
    const schema = canonical ? {
      '@context': 'https://schema.org',
      '@type': page.path === '/' ? 'WebSite' : 'CollectionPage',
      name: page.path === '/' ? 'LinkLoom' : 'Find creators on LinkLoom',
      url: canonical,
      description: page.description,
    } : null
    const head = [
      `<meta name="description" content="${escapeHtml(page.description)}" />`,
      `<meta name="robots" content="${isPreview ? 'noindex, nofollow' : 'index, follow'}" />`,
      canonical && `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
      `<meta property="og:type" content="website" />`,
      `<meta property="og:title" content="${escapeHtml(page.title)}" />`,
      `<meta property="og:description" content="${escapeHtml(page.description)}" />`,
      canonical && `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
      schema && `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`,
    ].filter(Boolean).join('\n    ')
    const html = template
      .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(page.title)}</title>`)
      .replace('</head>', `    ${head}\n  </head>`)
      .replace('<div id="root"></div>', `<div id="root">${content}</div>`)
    const target = path.join('dist', page.file)
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, html)
  }
  if (siteUrl && !isPreview) {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(({ path }) => `  <url><loc>${xmlEscape(`${siteUrl}${path}`)}</loc></url>`).join('\n')}\n</urlset>\n`
    await writeFile('dist/sitemap.xml', sitemap)
    await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`)
  } else {
    await writeFile('dist/robots.txt', isPreview ? 'User-agent: *\nDisallow: /\n' : 'User-agent: *\nAllow: /\n')
    if (!siteUrl && !isPreview) console.warn('Set SITE_URL (or VERCEL_PROJECT_PRODUCTION_URL) to emit canonical URLs and sitemap.xml.')
  }
} finally {
  await vite.close()
}
