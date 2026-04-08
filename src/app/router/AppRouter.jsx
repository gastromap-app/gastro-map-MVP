import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import RequireAuth from '@/shared/components/guards/RequireAuth'
import RequireAdmin from '@/shared/components/guards/RequireAdmin'
import RequireFeatureFlag from '@/shared/components/guards/RequireFeatureFlag'
import MainLayout from '@/shared/components/layout/MainLayout'
import PublicLayout from '@/shared/components/layout/PublicLayout'

// ── Eager (critical path) ──────────────────────────────────────────────────
import LandingPage from '@/features/public/pages/LandingPage'
import LoginPage from '@/features/auth/pages/LoginPage'
import SignUpPage from '@/features/auth/pages/SignUpPage'

// ── Lazy (code-split) ──────────────────────────────────────────────────────
const ForgotPasswordPage  = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'))
const ResetPasswordPage   = lazy(() => import('@/features/auth/pages/ResetPasswordPage'))

const ExplorePage         = lazy(() => import('@/features/explore/pages/ExplorePage'))
const LocationPage        = lazy(() => import('@/features/explore/pages/LocationPage'))

const DashboardPage       = lazy(() => import('@/features/user/pages/DashboardPage'))
const GastroGuidePage     = lazy(() => import('@/features/gastroguide/pages/GastroGuidePage'))
const SavedPage           = lazy(() => import('@/features/user/pages/SavedPage'))
const VisitedPage         = lazy(() => import('@/features/user/pages/VisitedPage'))
const LeaderboardPage     = lazy(() => import('@/features/user/pages/LeaderboardPage'))
const ProfilePage         = lazy(() => import('@/features/user/pages/ProfilePage'))
const ProfileEditPage     = lazy(() => import('@/features/user/pages/ProfileEditPage'))

const AddPlacePage        = lazy(() => import('@/features/community/pages/AddPlacePage'))
const MySubmissionsPage   = lazy(() => import('@/features/community/pages/MySubmissionsPage'))

const DonatePage          = lazy(() => import('@/features/payments/pages/DonatePage'))
const DonateSuccessPage   = lazy(() => import('@/features/payments/pages/DonateSuccessPage'))
const PricingPage         = lazy(() => import('@/features/payments/pages/PricingPage'))

const FeaturesPage        = lazy(() => import('@/features/public/pages/FeaturesPage'))
const AboutPage           = lazy(() => import('@/features/public/pages/AboutPage'))
const ContactPage         = lazy(() => import('@/features/public/pages/ContactPage'))

const AdminLayout         = lazy(() => import('@/features/admin/layout/AdminLayout'))
const AdminDashboardPage  = lazy(() => import('@/features/admin/pages/AdminDashboardPage'))
const AdminLocationsPage  = lazy(() => import('@/features/admin/pages/AdminLocationsPage'))
const AdminUsersPage      = lazy(() => import('@/features/admin/pages/AdminUsersPage'))
const AdminModerationPage = lazy(() => import('@/features/admin/pages/AdminModerationPage'))
const AdminSubmissionsPage= lazy(() => import('@/features/admin/pages/AdminSubmissionsPage'))
const AdminFeatureFlagsPage=lazy(() => import('@/features/admin/pages/AdminFeatureFlagsPage'))
const AdminDonationsPage  = lazy(() => import('@/features/admin/pages/AdminDonationsPage'))
const AdminSubscriptionsPage=lazy(()=>import('@/features/admin/pages/AdminSubscriptionsPage'))
const AdminAIPage         = lazy(() => import('@/features/admin/pages/AdminAIPage'))
const AdminKnowledgePage  = lazy(() => import('@/features/admin/pages/AdminKnowledgePage'))
const AdminSettingsPage   = lazy(() => import('@/features/admin/pages/AdminSettingsPage'))

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-900">
    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
)

export default function AppRouter() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* ── Public (no auth required) ──────────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route path="/"          element={<LandingPage />} />
          <Route path="/features"  element={<FeaturesPage />} />
          <Route path="/about"     element={<AboutPage />} />
          <Route path="/contact"   element={<ContactPage />} />
          <Route path="/pricing"   element={<PricingPage />} />
          <Route path="/donate"    element={<DonatePage />} />
          <Route path="/donate/success" element={<DonateSuccessPage />} />
        </Route>

        {/* ── Auth pages (standalone, no layout) ────────────────────── */}
        <Route path="/login"  element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password"  element={<ResetPasswordPage />} />

        {/* ── App (MainLayout, no auth needed for explore) ───────────── */}
        <Route element={<MainLayout />}>
          <Route path="/explore"         element={<ExplorePage />} />
          <Route path="/explore/:city"   element={<ExplorePage />} />
          <Route path="/location/:id"    element={<LocationPage />} />

          {/* Authenticated */}
          <Route element={<RequireAuth />}>
            <Route path="/dashboard"   element={<DashboardPage />} />
            <Route path="/ai-guide"    element={<GastroGuidePage />} />
            <Route path="/saved"       element={<SavedPage />} />
            <Route path="/visited"     element={<VisitedPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/profile"     element={<ProfilePage />} />
            <Route path="/profile/edit" element={<ProfileEditPage />} />

            {/* Community Submissions — controlled by feature flag */}
            <Route element={<RequireFeatureFlag flag="community_submissions" />}>
              <Route path="/add-place"        element={<AddPlacePage />} />
              <Route path="/my-submissions"   element={<MySubmissionsPage />} />
            </Route>
          </Route>
        </Route>

        {/* ── Admin ─────────────────────────────────────────────────── */}
        <Route element={<RequireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin"                  element={<AdminDashboardPage />} />
            <Route path="/admin/locations"        element={<AdminLocationsPage />} />
            <Route path="/admin/users"            element={<AdminUsersPage />} />
            <Route path="/admin/moderation"       element={<AdminModerationPage />} />
            <Route path="/admin/submissions"      element={<AdminSubmissionsPage />} />
            <Route path="/admin/feature-flags"    element={<AdminFeatureFlagsPage />} />
            <Route path="/admin/donations"        element={<AdminDonationsPage />} />
            <Route path="/admin/subscriptions"    element={<AdminSubscriptionsPage />} />
            <Route path="/admin/ai"               element={<AdminAIPage />} />
            <Route path="/admin/knowledge"        element={<AdminKnowledgePage />} />
            <Route path="/admin/settings"         element={<AdminSettingsPage />} />
          </Route>
        </Route>

        {/* ── Fallback ──────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
