// Dashboard (logged-in brand app) — docs/API.md section 7.
import { api } from '../lib/apiClient.js'

// Home screen: { greetingName, todos, stats, topCreators }.
export const getSummary = (opts) => api.get('/dashboard/summary', opts)

// Tick / untick an onboarding to-do.
export const setTodo = (id, done) => api.patch(`/dashboard/todos/${id}`, { done })
