# XXXXXX — Creator Marketplace (Brand side)

React + JavaScript frontend scaffolded from the Figma **brand-side** design.
Built with Vite and React Router. No TypeScript, no CSS framework — plain CSS
with design tokens so it stays easy to read and extend.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # preview the production build
```

## Structure

```
src/
  main.jsx              # entry — mounts <App/> inside <BrowserRouter>
  App.jsx               # routes + shared nav/footer
  styles/
    tokens.css          # design tokens (colors, radii, spacing) from Figma
    global.css          # resets, layout helpers, button + card primitives
  components/
    Navbar.jsx          # dark pill nav (signed-in state)
    Footer.jsx          # dark footer with link columns
    HeroCreatorCard.jsx # creator tile with quote bubbles (home hero grid)
    CreatorCard.jsx     # creator tile used in /creators listings
    HiringSteps.jsx     # "Post a Job. Let Creators Bid." 5-step section
    ScrollToTop.jsx     # resets scroll on route change
  pages/
    Home.jsx            # landing page (search+grid hero → value props →
                        #   stats → testimonials → how-hiring-works → CTA)
    FindCreators.jsx    # search + filters + results grid
    CreatorProfile.jsx  # gallery, packages, reviews, booking card
  data/
    creators.js         # mock creator catalogue (swap for a real API)
```

## Routes

| Path             | Screen (Figma frame)        |
| ---------------- | --------------------------- |
| `/`              | Brand – Home                |
| `/creators`      | Brand – Find creators       |
| `/creators/:id`  | Brand – Creator profile     |

## Notes

- Creator photos use `picsum.photos` seeds so the UI renders without any API
  keys. Replace `src/data/creators.js` with your backend when ready.
- Design tokens live in `src/styles/tokens.css` — change the brand once there.
- This is a UI scaffold: filters, pagination, cart and auth are presentational
  and ready to be wired to real data.
