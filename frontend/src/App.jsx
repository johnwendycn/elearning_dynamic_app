import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { OrgSettingsProvider } from './context/OrgSettingsContext';
import { AlertProvider } from './context/AlertContext';
import { ShieldAlert } from 'lucide-react';

// Layout
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CookieConsent from './components/common/CookieConsent';
import ScrollToTop from './components/common/ScrollToTop';
import Sidebar from './components/admin/Sidebar';

// Public Pages
import Home from './pages/Home';
import DynamicPage from './pages/DynamicPage';
import ContactPage from './pages/ContactPage';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CoursesPage from './pages/CoursesPage';
import CourseDetail from './pages/CourseDetail';
import NewsPage from './pages/NewsPage';
import NewsDetail from './pages/NewsDetail';
import EventsPage from './pages/EventsPage';
import EventDetail from './pages/EventDetail';
import UnsubscribePage from './pages/UnsubscribePage';

// Student LMS & Certificates Pages
import StudentDashboard from './pages/student/StudentDashboard';
import CoursePlayer from './pages/student/CoursePlayer';
import CertificateViewer from './pages/CertificateViewer';
import VerifyCertificate from './pages/VerifyCertificate';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import PageManager from './pages/admin/PageManager';
import CarouselManager from './pages/admin/CarouselManager';
import AuditTrailViewer from './pages/admin/AuditTrailViewer';
import UserManager from './pages/admin/UserManager';
import RoleManager from './pages/admin/RoleManager';
import UserPrivilegeOverrides from './pages/admin/UserPrivilegeOverrides';
import AssignUserRole from './pages/admin/AssignUserRole';
import OrganizationSettings from './pages/admin/OrganizationSettings';
import HeaderManager from './pages/admin/HeaderManager';
import MenuManager from './pages/admin/MenuManager';
import MediaManager from './pages/admin/MediaManager';
import FooterManager from './pages/admin/FooterManager';
import DepartmentManager from './pages/admin/DepartmentManager';
import CourseManager from './pages/admin/CourseManager';
import CourseModuleManager from './pages/admin/CourseModuleManager';
import UnitManager from './pages/admin/UnitManager';
import NewsManager from './pages/admin/NewsManager';
import EventManager from './pages/admin/EventManager';
import SubscriberManager from './pages/admin/SubscriberManager';
import AdminProfile from './pages/admin/AdminProfile';
import ContactManager from './pages/admin/ContactManager';
import EventRegister from './pages/EventRegister';

import AdminNavbar from './components/admin/AdminNavbar';

const ProtectedStudentRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '70vh' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading session...</p>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const ProtectedAdminLayout = () => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  // Responsive sidebar: track mobile state dynamically
  const [isMobile, setIsMobile] = React.useState(() => typeof window !== 'undefined' ? window.innerWidth < 992 : false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(() => typeof window !== 'undefined' ? window.innerWidth < 992 : false);

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-collapse sidebar on route change on mobile
  React.useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, [location.pathname, isMobile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '100vh' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading administrative session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login?portal=admin&redirect=/admin" replace />;
  }

  const isStaff = user.roles?.some(r =>
    ['Super Admin', 'Admin', 'Curator', 'admin', 'superadmin'].includes(r.name)
  );

  if (!isStaff) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '80vh', padding: '2rem' }}>
        <div className="card text-center" style={{ maxWidth: '500px', padding: '2.5rem 2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <ShieldAlert size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Admin Privileges Required</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            You are currently signed in as <strong>{user.email}</strong>. This account does not possess administrative staff credentials to access the management dashboard.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => { logout(); window.location.href = '/login?portal=admin&redirect=/admin'; }}
              className="btn btn-primary w-full"
            >
              Sign In with Admin Account
            </button>
            <Link to="/student/my-learning" className="btn btn-secondary w-full">
              Go to Student Learning Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="adminlte-wrapper">
      {/* Mobile-only backdrop overlay to close sidebar on click (never displayed on desktop) */}
      {isMobile && !sidebarCollapsed && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setSidebarCollapsed(true)}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}

      {/* AdminLTE Dark Main Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onNavigate={() => {
          if (isMobile) {
            setSidebarCollapsed(true);
          }
        }}
      />

      {/* AdminLTE Content Wrapper */}
      <div className="content-wrapper">
        {/* Top Navbar */}
        <AdminNavbar onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />

        {/* Nested Content View */}
        <div style={{ flex: 1 }}>
          <Outlet />
        </div>

        {/* AdminLTE Main Footer */}
        <footer className="main-footer">
          <div>
            <strong>Copyright &copy; {currentYear} <a href="/" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>JONIKWIRIA Core</a>.</strong> All rights reserved.
          </div>
          <div className="mobile-hide">
            <b>Version</b> 3.2.0-core
          </div>
        </footer>
      </div>
    </div>
  );
};

const PublicLayout = () => {
  return (
    <div className="flex flex-col" style={{ minHeight: '100vh' }}>
      <Header />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
      <CookieConsent />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <OrgSettingsProvider>
        <AuthProvider>
          <AlertProvider>
            <Router>
              <ScrollToTop />
              <Routes>
              {/* Public Website & Student Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/courses/:slug" element={<CourseDetail />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/news/:slug" element={<NewsDetail />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:slug" element={<EventDetail />} />
                <Route path="/events/:slug/register" element={<EventRegister />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/contact-us" element={<ContactPage />} />
                <Route path="/p/:slug" element={<DynamicPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/unsubscribe" element={<UnsubscribePage />} />

                {/* Certificate Public Verification */}
                <Route path="/verify" element={<VerifyCertificate />} />
                <Route path="/verify/:credentialId" element={<VerifyCertificate />} />

                {/* Authenticated Student Learning Portal */}
                <Route
                  path="/student/my-learning"
                  element={
                    <ProtectedStudentRoute>
                      <StudentDashboard />
                    </ProtectedStudentRoute>
                  }
                />
                <Route
                  path="/student/courses/:courseIdOrSlug/learn"
                  element={
                    <ProtectedStudentRoute>
                      <CoursePlayer />
                    </ProtectedStudentRoute>
                  }
                />
                <Route
                  path="/certificates/view/:courseId"
                  element={
                    <ProtectedStudentRoute>
                      <CertificateViewer />
                    </ProtectedStudentRoute>
                  }
                />
              </Route>

              {/* Admin Management Routes */}
              <Route path="/admin" element={<ProtectedAdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="users" element={<UserManager />} />
                <Route path="roles" element={<RoleManager />} />
                <Route path="privileges" element={<UserPrivilegeOverrides />} />
                <Route path="assign-role" element={<AssignUserRole />} />
                <Route path="pages" element={<PageManager />} />
                <Route path="carousels" element={<CarouselManager />} />
                <Route path="headers" element={<HeaderManager />} />
                <Route path="footers" element={<FooterManager />} />
                <Route path="menus" element={<MenuManager />} />
                <Route path="media" element={<MediaManager />} />
                <Route path="organization" element={<OrganizationSettings />} />
                <Route path="audit-trails" element={<AuditTrailViewer />} />
                {/* Academic & Content */}
                <Route path="departments" element={<DepartmentManager />} />
                <Route path="courses" element={<CourseManager />} />
                <Route path="course-modules" element={<CourseModuleManager />} />
                <Route path="units" element={<UnitManager />} />
                <Route path="news" element={<NewsManager />} />
                <Route path="events" element={<EventManager />} />
                <Route path="subscribers" element={<SubscriberManager />} />
                <Route path="contacts" element={<ContactManager />} />
                <Route path="profile" element={<AdminProfile />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AlertProvider>
      </AuthProvider>
      </OrgSettingsProvider>
    </ThemeProvider>
  );
}

export default App;
