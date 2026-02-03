import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleRoute } from "@/components/auth/RoleRoute";
import { AuthRedirect } from "@/components/auth/AuthRedirect";
import { PatientLayout } from "@/components/layout/PatientLayout";
import { TherapistLayout } from "@/components/layout/TherapistLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";

// Public pages
import Landing from "@/pages/public/Landing";
import Plans from "@/pages/public/Plans";
import Terms from "@/pages/public/Terms";
import Privacy from "@/pages/public/Privacy";
import FAQ from "@/pages/public/FAQ";
import PrivacyDashboard from "@/pages/privacy/Dashboard";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import RoleSelection from "@/pages/onboarding/RoleSelection";
import SubscriptionSuccess from "@/pages/subscription/Success";
import SubscriptionCanceled from "@/pages/subscription/Canceled";
import SubscriptionPage from "@/pages/subscription/Index";
import NotFound from "@/pages/NotFound";

// Patient pages
import PatientDashboard from "@/pages/patient/Dashboard";
import CheckIn from "@/pages/patient/CheckIn";
import CheckInHistory from "@/pages/patient/CheckInHistory";
import EmotionalRecords from "@/pages/patient/EmotionalRecords";
import Diary from "@/pages/patient/Diary";
import Questionnaires from "@/pages/patient/Questionnaires";
import MyHistory from "@/pages/patient/MyHistory";
import Timeline from "@/pages/patient/Timeline";
import PatientProfile from "@/pages/patient/Profile";
import MyTherapist from "@/pages/patient/MyTherapist";
import SelfView from "@/pages/patient/SelfView";
import IntakeFormPage from "@/pages/patient/IntakeForm";

// Therapist pages
import TherapistDashboard from "@/pages/therapist/Dashboard";
import PatientList from "@/pages/therapist/PatientList";
import PatientDetail from "@/pages/therapist/PatientDetail";
import PrivateNotes from "@/pages/therapist/PrivateNotes";
import Schedule from "@/pages/therapist/Schedule";
import TherapistProfile from "@/pages/therapist/Profile";

import PublicProfileConfig from "@/pages/therapist/PublicProfileConfig";
import FindTherapist from "@/pages/patient/FindTherapist";

// Admin pages
import AdminDashboard from "@/pages/admin/Dashboard";
import Users from "@/pages/admin/Users";
import Subscriptions from "@/pages/admin/Subscriptions";
import Coupons from "@/pages/admin/Coupons";
import AdminMetrics from "@/pages/admin/Metrics";
import Logs from "@/pages/admin/Logs";
import AdminCompliance from "@/pages/admin/Compliance";
import { CookieConsent } from "@/components/privacy/CookieConsent";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <CookieConsent />
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/planos" element={<Plans />} />
              <Route path="/subscription/success" element={<ProtectedRoute><SubscriptionSuccess /></ProtectedRoute>} />
              <Route path="/subscription/canceled" element={<ProtectedRoute><SubscriptionCanceled /></ProtectedRoute>} />
              <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/privacy/dashboard" element={<ProtectedRoute><PrivacyDashboard /></ProtectedRoute>} />

              {/* Onboarding */}
              <Route path="/onboarding/role" element={<ProtectedRoute><RoleSelection /></ProtectedRoute>} />

              {/* Patient */}
              <Route path="/patient" element={<RoleRoute role="patient"><PatientLayout /></RoleRoute>}>
                <Route index element={<PatientDashboard />} />
                <Route path="find-therapist" element={<FindTherapist />} />
                <Route path="intake" element={<IntakeFormPage />} />
                <Route path="self-view" element={<SelfView />} />
                <Route path="checkin" element={<CheckIn />} />
                <Route path="checkin-history" element={<CheckInHistory />} />
                <Route path="records" element={<EmotionalRecords />} />
                <Route path="diary" element={<Diary />} />
                <Route path="questionnaires" element={<Questionnaires />} />
                <Route path="history" element={<MyHistory />} />
                <Route path="timeline" element={<Timeline />} />
                <Route path="therapist" element={<MyTherapist />} />
                <Route path="profile" element={<PatientProfile />} />
              </Route>

              {/* Therapist */}
              <Route path="/therapist" element={<RoleRoute role="therapist"><TherapistLayout /></RoleRoute>}>
                <Route index element={<TherapistDashboard />} />
                <Route path="public-profile" element={<PublicProfileConfig />} />
                <Route path="patients" element={<PatientList />} />
                <Route path="patients/:id" element={<PatientDetail />} />
                <Route path="notes" element={<PrivateNotes />} />
                <Route path="schedule" element={<Schedule />} />
                <Route path="profile" element={<TherapistProfile />} />
              </Route>

              {/* Admin */}
              <Route path="/admin" element={<RoleRoute role="admin"><AdminLayout /></RoleRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="subscriptions" element={<Subscriptions />} />
                <Route path="coupons" element={<Coupons />} />
                <Route path="metrics" element={<AdminMetrics />} />
                <Route path="compliance" element={<AdminCompliance />} />
                <Route path="logs" element={<Logs />} />
              </Route>

              <Route path="/dashboard" element={<AuthRedirect />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
