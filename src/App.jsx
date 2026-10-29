import { Routes, Route, Navigate } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import MarketingLayout from './components/MarketingLayout.jsx'
import DashboardLayout from './components/dashboard/DashboardLayout.jsx'
import Home from './pages/Home.jsx'
import FindCreators from './pages/FindCreators.jsx'
import CreatorProfile from './pages/CreatorProfile.jsx'
import AuthPage from './pages/auth/AuthPage.jsx'
import OnboardingPage from './pages/onboarding/OnboardingPage.jsx'
import DashHome from './pages/dashboard/DashHome.jsx'
import DashSearch from './pages/dashboard/DashSearch.jsx'
import DashLists from './pages/dashboard/DashLists.jsx'
import DashFavorites from './pages/dashboard/DashFavorites.jsx'
import DashJobs from './pages/dashboard/DashJobs.jsx'
import DashDeliverables from './pages/dashboard/DashDeliverables.jsx'
import DashOrders from './pages/dashboard/DashOrders.jsx'
import DashReporting from './pages/dashboard/DashReporting.jsx'
import DashMore from './pages/dashboard/DashMore.jsx'
import DashAccount from './pages/dashboard/DashAccount.jsx'

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public marketing site */}
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/creators" element={<FindCreators />} />
          <Route
            path="/creators/:id"
            element={
              <RequireAuth>
                <CreatorProfile />
              </RequireAuth>
            }
          />
        </Route>

        {/* Auth */}
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route
          path="/onboarding"
          element={
            <RequireAuth>
              <OnboardingPage />
            </RequireAuth>
          }
        />

        {/* Logged-in dashboard */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DashHome />} />
          <Route path="search" element={<DashSearch />} />
          <Route path="lists" element={<Navigate to="/dashboard/favorites" replace />} />
          <Route path="favorites" element={<DashFavorites />} />
          <Route path="jobs" element={<DashJobs />} />
          <Route path="deliverables" element={<DashDeliverables />} />
          <Route path="orders" element={<DashOrders />} />
          <Route path="reporting" element={<DashReporting />} />
          <Route path="more" element={<DashMore />} />
          <Route path="account/:section" element={<DashAccount />} />
        </Route>

        {/* Unknown paths → home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
