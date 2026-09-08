import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrgSettings } from '../../context/OrgSettingsContext';
import { getFullMediaUrl } from '../../utils/mediaUrl';
import {
  Gauge,
  FileText,
  Sliders,
  Menu as MenuIcon,
  Layout,
  Image,
  Users,
  ShieldCheck,
  Building,
  ClipboardList,
  Layers,
  Circle,
  Building2,
  BookOpen,
  GraduationCap,
  Newspaper,
  CalendarDays,
  Mail,
  MessageSquare,
  UserCircle
} from 'lucide-react';

const Sidebar = ({ collapsed, onNavigate }) => {
  const { user, hasPermission } = useAuth();
  const { orgSettings, headerConfig } = useOrgSettings();

  const siteTitle = orgSettings?.siteName || 'AdminLTE CMS';
  const logoUrl = orgSettings?.logoMedia?.url;

  const mainNavItems = [
    { label: 'Dashboard', path: '/admin', icon: <Gauge size={17} />, module: null },
    { label: 'Dynamic Pages', path: '/admin/pages', icon: <FileText size={17} />, module: 'pages' },
    { label: 'Sliders & Carousels', path: '/admin/carousels', icon: <Sliders size={17} />, module: 'carousels' },
    { label: 'Menu Management', path: '/admin/menus', icon: <MenuIcon size={17} />, module: 'menus' },
    { label: 'Header Settings', path: '/admin/headers', icon: <Layout size={17} />, module: 'headers' },
    { label: 'Footer Settings', path: '/admin/footers', icon: <Layout size={17} />, module: 'footers' },
    { label: 'Media Library', path: '/admin/media', icon: <Image size={17} />, module: 'media' }
  ];

  const academicNavItems = [
    { label: 'Departments', path: '/admin/departments', icon: <Building2 size={17} />, module: 'departments' },
    { label: 'Courses', path: '/admin/courses', icon: <BookOpen size={17} />, module: 'courses' },
    { label: 'Course Modules', path: '/admin/course-modules', icon: <Layers size={17} />, module: 'course_modules' },
    { label: 'Units', path: '/admin/units', icon: <GraduationCap size={17} />, module: 'units' },
    { label: 'News', path: '/admin/news', icon: <Newspaper size={17} />, module: 'news' },
    { label: 'Events', path: '/admin/events', icon: <CalendarDays size={17} />, module: 'events' },
    { label: 'Subscribers', path: '/admin/subscribers', icon: <Mail size={17} />, module: 'subscribers' },
    { label: 'Contact Messages', path: '/admin/contacts', icon: <MessageSquare size={17} />, module: 'contacts' },
  ];

  const systemNavItems = [
    { label: 'Users Management', path: '/admin/users', icon: <Users size={17} />, module: 'users' },
    { label: 'Roles & Privileges', path: '/admin/roles', icon: <ShieldCheck size={17} />, module: 'roles' },
    { label: 'Individual Overrides', path: '/admin/privileges', icon: <ShieldCheck size={17} />, module: 'user_privileges' },
    { label: 'Assign User Roles', path: '/admin/assign-role', icon: <ShieldCheck size={17} />, module: 'assign_roles' },
    { label: 'Organization Info', path: '/admin/organization', icon: <Building size={17} />, module: 'organization_settings' },
    { label: 'Audit Trail Logs', path: '/admin/audit-trails', icon: <ClipboardList size={17} />, module: 'audit_trails' },
    { label: 'My Profile', path: '/admin/profile', icon: <UserCircle size={17} />, module: null }
  ];

  const initials = `${user?.firstName?.[0] || 'A'}${user?.lastName?.[0] || 'U'}`;

  const avatarUrl = user?.profilePicture?.url
    ? getFullMediaUrl(user.profilePicture.url)
    : null;

  return (
    <aside className={`main-sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Brand Logo & App Title */}
      <Link to="/admin" className="brand-link flex items-center gap-2" onClick={onNavigate}>
        <div className="brand-image flex items-center justify-center">
          {logoUrl ? (
            <img src={getFullMediaUrl(logoUrl)} alt={siteTitle} style={{ height: '24px', width: 'auto', objectFit: 'contain', borderRadius: '2px' }} />
          ) : (
            <Layers size={18} />
          )}
        </div>
        <span className="brand-text" style={{ fontSize: '1rem', fontWeight: 700 }}>{siteTitle}</span>
      </Link>

      {/* User Panel with Online Status and Clickable Profile Link */}
      <Link
        to="/admin/profile"
        className="user-panel"
        style={{ textDecoration: 'none', transition: 'background 0.2s', cursor: 'pointer' }}
        title="View & Edit Your Profile"
        onClick={onNavigate}
      >
        <div className="user-avatar" style={{ overflow: 'hidden' }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            initials
          )}
        </div>
        <div className="info" style={{ lineHeight: 1.2 }}>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>
            {user?.firstName} {user?.lastName}
          </div>
          <div className="flex items-center gap-1" style={{ color: '#28a745', fontSize: '0.75rem', marginTop: '2px' }}>
            <Circle size={8} fill="#28a745" />
            <span>Online</span>
          </div>
        </div>
      </Link>

      {/* Sidebar Navigation */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '1rem' }}>
        <div className="nav-header">MAIN NAVIGATION</div>
        <nav className="nav-sidebar">
          {mainNavItems.map((item) => {
            if (item.module && !hasPermission(item.module, 'read')) return null;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={onNavigate}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="nav-header" style={{ marginTop: '0.5rem' }}>ACADEMIC &amp; CONTENT</div>
        <nav className="nav-sidebar">
          {academicNavItems.map((item) => {
            if (item.module && !hasPermission(item.module, 'read')) return null;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={onNavigate}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="nav-header" style={{ marginTop: '0.5rem' }}>SYSTEM MODULES</div>
        <nav className="nav-sidebar">
          {systemNavItems.map((item) => {
            if (item.module && !hasPermission(item.module, 'read')) return null;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={onNavigate}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
