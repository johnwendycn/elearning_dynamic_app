import React, { useState, useEffect, useRef } from 'react';
import {
  User, Mail, Phone, MapPin, Calendar, Globe, Briefcase,
  Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Save, Camera,
  Shield, ChevronRight, Edit3, Link2, Twitter, Linkedin, Github,
  Image as ImageIcon, UploadCloud, Trash2, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import MediaSelectorModal from './MediaSelectorModal';

const TAB_PERSONAL = 'personal';
const TAB_PROFILE = 'profile';
const TAB_PASSWORD = 'password';

/* ── Password strength indicator ─────────────────────────────────── */
const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password)
  ];
  const score = checks.filter(Boolean).length;
  const labels = ['Too weak', 'Weak', 'Fair', 'Strong'];
  const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i < score ? colors[score - 1] : 'var(--border)',
            transition: 'background 0.2s'
          }} />
        ))}
      </div>
      <span style={{ fontSize: '0.75rem', color: score > 0 ? colors[score - 1] : 'var(--text-muted)', fontWeight: 600, marginTop: 4, display: 'block' }}>
        {score > 0 ? labels[score - 1] : ''}
      </span>
    </div>
  );
};

/* ── Field wrapper ─────────────────────────────────────────────────── */
const Field = ({ label, children, required }) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3 }}>
      {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
    </label>
    {children}
  </div>
);

const inputStyle = {
  width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
  border: '1px solid var(--border)', background: 'var(--bg-app)',
  color: 'var(--text-main)', fontSize: '0.92rem', outline: 'none',
  transition: 'border-color 0.15s'
};

/* ── Toast alert ─────────────────────────────────────────────────── */
const Alert = ({ type, msg }) => {
  if (!msg) return null;
  const isSuccess = type === 'success';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '0.85rem 1rem',
      borderRadius: 10, marginBottom: '1.25rem',
      background: isSuccess ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
      border: `1px solid ${isSuccess ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
      color: isSuccess ? '#10b981' : '#ef4444', fontSize: '0.875rem', fontWeight: 600
    }}>
      {isSuccess ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {msg}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════════════════════════ */
const AdminProfile = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState(TAB_PERSONAL);

  /* ── Personal info state ─────────────────────────────────────────── */
  const [personal, setPersonal] = useState({ firstName: '', lastName: '', email: '' });
  const [personalSaving, setPersonalSaving] = useState(false);
  const [personalAlert, setPersonalAlert] = useState({ type: '', msg: '' });

  /* ── Extended profile state ──────────────────────────────────────── */
  const [profile, setProfile] = useState({
    phoneNumber: '', bio: '', address: '', city: '', state: '',
    country: '', dateOfBirth: '', gender: '',
    socialLinks: { twitter: '', linkedin: '', github: '', website: '' }
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileAlert, setProfileAlert] = useState({ type: '', msg: '' });
  const [profileId, setProfileId] = useState(null);

  /* ── Password state ──────────────────────────────────────────────── */
  const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ current: false, newPwd: false, confirm: false });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdAlert, setPwdAlert] = useState({ type: '', msg: '' });

  /* ── Profile Picture & Media Library state ───────────────────────── */
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarAlert, setAvatarAlert] = useState({ type: '', msg: '' });
  const fileInputRef = useRef(null);

  const backendHost = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') 
    : 'http://localhost:5000';

  const avatarUrl = user?.profilePicture?.url
    ? (user.profilePicture.url.startsWith('http') ? user.profilePicture.url : `${backendHost}${user.profilePicture.url}`)
    : null;

  /* Handle selecting an existing image from Media Library */
  const handleSelectMedia = async (selectedMedia) => {
    if (!selectedMedia?.id) return;
    setAvatarUploading(true);
    setAvatarAlert({ type: '', msg: '' });
    try {
      await api.put(`/users/${user.id}`, { profilePicId: selectedMedia.id });
      if (refreshUser) {
        await refreshUser();
      }
      setAvatarAlert({ type: 'success', msg: 'Profile picture updated from Media Library successfully!' });
    } catch (err) {
      setAvatarAlert({ type: 'error', msg: err?.response?.data?.error || 'Failed to update profile picture.' });
    } finally {
      setAvatarUploading(false);
    }
  };

  /* Direct upload from device -> saves into Media table and sets user's profilePicId */
  const handleDirectFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('module', 'avatars');

    setAvatarUploading(true);
    setAvatarAlert({ type: '', msg: '' });
    try {
      // 1. Upload to media storage (persisted in DB table 'media' and stored in /media/avatars)
      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success && res.data?.data?.id) {
        const newMediaId = res.data.data.id;
        // 2. Link newly created media asset to the user's profile picture
        await api.put(`/users/${user.id}`, { profilePicId: newMediaId });
        if (refreshUser) {
          await refreshUser();
        }
        setAvatarAlert({ type: 'success', msg: 'Profile picture uploaded and saved to Media successfully!' });
      } else {
        throw new Error('Upload succeeded but media record was not returned.');
      }
    } catch (err) {
      setAvatarAlert({ type: 'error', msg: err?.response?.data?.error || err.message || 'Failed to upload photo.' });
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  /* Remove profile picture */
  const handleRemovePhoto = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;
    setAvatarUploading(true);
    setAvatarAlert({ type: '', msg: '' });
    try {
      await api.put(`/users/${user.id}`, { profilePicId: null });
      if (refreshUser) {
        await refreshUser();
      }
      setAvatarAlert({ type: 'success', msg: 'Profile picture removed.' });
    } catch (err) {
      setAvatarAlert({ type: 'error', msg: err?.response?.data?.error || 'Failed to remove picture.' });
    } finally {
      setAvatarUploading(false);
    }
  };

  /* ── Load user data ──────────────────────────────────────────────── */
  useEffect(() => {
    if (user) {
      setPersonal({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      });
      // Load profile
      api.get(`/user-profiles/user/${user.id}`)
        .then(res => {
          const p = res.data.data;
          setProfileId(p.id);
          setProfile({
            phoneNumber: p.phoneNumber || '',
            bio: p.bio || '',
            address: p.address || '',
            city: p.city || '',
            state: p.state || '',
            country: p.country || '',
            dateOfBirth: p.dateOfBirth || '',
            gender: p.gender || '',
            socialLinks: p.socialLinks || { twitter: '', linkedin: '', github: '', website: '' }
          });
        })
        .catch(() => {});
    }
  }, [user]);

  /* ── Save personal info ──────────────────────────────────────────── */
  const savePersonal = async (e) => {
    e.preventDefault();
    setPersonalSaving(true);
    setPersonalAlert({ type: '', msg: '' });
    try {
      await api.put(`/users/${user.id}`, personal);
      if (refreshUser) await refreshUser();
      setPersonalAlert({ type: 'success', msg: 'Personal info updated successfully!' });
    } catch (err) {
      setPersonalAlert({ type: 'error', msg: err?.response?.data?.error || 'Failed to update personal info.' });
    } finally {
      setPersonalSaving(false);
    }
  };

  /* ── Save extended profile ───────────────────────────────────────── */
  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileAlert({ type: '', msg: '' });
    try {
      if (profileId) {
        await api.put(`/user-profiles/user/${user.id}`, profile);
      } else {
        await api.post('/user-profiles', { userId: user.id, ...profile });
      }
      setProfileAlert({ type: 'success', msg: 'Profile details saved successfully!' });
    } catch (err) {
      setProfileAlert({ type: 'error', msg: err?.response?.data?.error || 'Failed to save profile.' });
    } finally {
      setProfileSaving(false);
    }
  };

  /* ── Change password ─────────────────────────────────────────────── */
  const changePassword = async (e) => {
    e.preventDefault();
    setPwdAlert({ type: '', msg: '' });
    if (pwd.newPwd !== pwd.confirm) {
      setPwdAlert({ type: 'error', msg: 'New passwords do not match.' });
      return;
    }
    if (pwd.newPwd.length < 8) {
      setPwdAlert({ type: 'error', msg: 'New password must be at least 8 characters.' });
      return;
    }
    setPwdSaving(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pwd.current, newPassword: pwd.newPwd });
      setPwdAlert({ type: 'success', msg: 'Password changed successfully! Please use your new password next time you log in.' });
      setPwd({ current: '', newPwd: '', confirm: '' });
    } catch (err) {
      setPwdAlert({ type: 'error', msg: err?.response?.data?.error || 'Failed to change password.' });
    } finally {
      setPwdSaving(false);
    }
  };

  const initials = `${user?.firstName?.[0] || 'A'}${user?.lastName?.[0] || 'U'}`;

  const tabs = [
    { id: TAB_PERSONAL, label: 'Personal Info', icon: User },
    { id: TAB_PROFILE, label: 'Extended Profile', icon: Edit3 },
    { id: TAB_PASSWORD, label: 'Change Password', icon: Shield }
  ];

  return (
    <div>
      {/* Content Header */}
      <div className="content-header">
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>My Profile</h1>
        <ol className="breadcrumb">
          <li><a href="/admin">Dashboard</a></li>
          <li className="active">My Profile</li>
        </ol>
      </div>

      <div className="main-content">
        <div className="admin-profile-grid">
          {/* ── Left Panel: Avatar + Nav ─────────────────────────────── */}
          <div>
            {/* Avatar Card */}
            <div className="card profile-card-body" style={{ padding: '2rem 1.5rem', textAlign: 'center', borderRadius: 16, border: '1px solid var(--border)', marginBottom: '1rem', position: 'relative' }}>
              {/* Hidden Direct File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleDirectFileUpload}
                accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                style={{ display: 'none' }}
              />

              {/* Avatar Picture with Camera Click */}
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
                <div
                  onClick={() => setMediaModalOpen(true)}
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    background: avatarUrl ? 'var(--bg-surface)' : 'linear-gradient(135deg, #007bff, #0284c7)',
                    color: '#fff',
                    fontSize: '2rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    boxShadow: '0 4px 15px rgba(0,123,255,0.25)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '3px solid var(--primary)',
                    position: 'relative'
                  }}
                  title="Click to browse profile picture from Media"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    initials
                  )}

                  {avatarUploading && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Loader2 size={24} className="animate-spin" color="#fff" />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setMediaModalOpen(true)}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    border: '2px solid var(--bg-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                  }}
                  title="Browse Media Library"
                >
                  <Camera size={15} color="#fff" />
                </button>
              </div>

              <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: 4 }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8, wordBreak: 'break-all' }}>{user?.email}</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 50, background: 'rgba(16,185,129,0.1)', color: '#10b981', fontSize: '0.75rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                {user?.roles?.[0]?.name || 'Admin'}
              </div>

              {/* Avatar Notification Alert */}
              <Alert type={avatarAlert.type} msg={avatarAlert.msg} />

              {/* Photo Actions: Browse Media & Upload New */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setMediaModalOpen(true)}
                  disabled={avatarUploading}
                  className="btn btn-primary btn-sm w-full"
                  style={{ justifyContent: 'center', gap: '0.4rem', fontWeight: 700, padding: '0.55rem' }}
                >
                  <ImageIcon size={15} />
                  <span>Browse Media Library</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="btn btn-secondary btn-sm w-full"
                  style={{ justifyContent: 'center', gap: '0.4rem', fontWeight: 600, padding: '0.55rem' }}
                >
                  <UploadCloud size={15} />
                  <span>Upload from Device</span>
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={avatarUploading}
                    className="btn btn-sm w-full"
                    style={{
                      justifyContent: 'center',
                      gap: '0.4rem',
                      color: '#ef4444',
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      padding: '0.45rem'
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tab Nav */}
            <div className="card" style={{ borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
              {tabs.map((tab, idx) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                      padding: '0.9rem 1.25rem', border: 'none', cursor: 'pointer',
                      background: isActive ? 'rgba(0,123,255,0.08)' : 'transparent',
                      borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                      color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                      fontWeight: isActive ? 700 : 500, fontSize: '0.88rem',
                      borderBottom: idx < tabs.length - 1 ? '1px solid var(--border)' : 'none',
                      textAlign: 'left', transition: 'all 0.15s'
                    }}
                  >
                    <Icon size={17} />
                    <span style={{ flex: 1 }}>{tab.label}</span>
                    <ChevronRight size={15} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Right Panel: Forms ───────────────────────────────────── */}
          <div>
            {/* ── Tab: Personal Info ──────────────────────────────────── */}
            {activeTab === TAB_PERSONAL && (
              <div className="card profile-card-body" style={{ padding: '2rem', borderRadius: 16, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.75rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(0,123,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={20} color="var(--primary)" />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Personal Information</h2>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>Update your name and email address</p>
                  </div>
                </div>

                <Alert type={personalAlert.type} msg={personalAlert.msg} />

                <form onSubmit={savePersonal}>
                  <div className="profile-form-grid-2" style={{ marginBottom: '1.25rem' }}>
                    <Field label="First Name" required>
                      <input style={inputStyle} required value={personal.firstName} onChange={e => setPersonal({ ...personal, firstName: e.target.value })} placeholder="First name" />
                    </Field>
                    <Field label="Last Name" required>
                      <input style={inputStyle} required value={personal.lastName} onChange={e => setPersonal({ ...personal, lastName: e.target.value })} placeholder="Last name" />
                    </Field>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <Field label="Email Address" required>
                        <div style={{ position: 'relative' }}>
                          <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                          <input style={{ ...inputStyle, paddingLeft: 38 }} type="email" required value={personal.email} onChange={e => setPersonal({ ...personal, email: e.target.value })} placeholder="Email" />
                        </div>
                      </Field>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                    <button type="submit" disabled={personalSaving} className="btn btn-primary profile-submit-btn" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.7rem 1.75rem', borderRadius: 10, fontWeight: 700 }}>
                      <Save size={16} />
                      {personalSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Tab: Extended Profile ────────────────────────────────── */}
            {activeTab === TAB_PROFILE && (
              <div className="card profile-card-body" style={{ padding: '2rem', borderRadius: 16, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.75rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Edit3 size={20} color="#6366f1" />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Extended Profile</h2>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>Bio, contact details, and social links</p>
                  </div>
                </div>

                <Alert type={profileAlert.type} msg={profileAlert.msg} />

                <form onSubmit={saveProfile}>
                  <div className="profile-form-grid-2" style={{ marginBottom: '1.25rem' }}>
                    <Field label="Phone Number">
                      <div style={{ position: 'relative' }}>
                        <Phone size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input style={{ ...inputStyle, paddingLeft: 36 }} type="tel" value={profile.phoneNumber} onChange={e => setProfile({ ...profile, phoneNumber: e.target.value })} placeholder="+234 800 000 0000" />
                      </div>
                    </Field>
                    <Field label="Date of Birth">
                      <div style={{ position: 'relative' }}>
                        <Calendar size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input style={{ ...inputStyle, paddingLeft: 36 }} type="date" value={profile.dateOfBirth} onChange={e => setProfile({ ...profile, dateOfBirth: e.target.value })} />
                      </div>
                    </Field>
                    <Field label="Gender">
                      <select style={inputStyle} value={profile.gender} onChange={e => setProfile({ ...profile, gender: e.target.value })}>
                        <option value="">Select gender</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Non-binary</option>
                        <option>Prefer not to say</option>
                      </select>
                    </Field>
                    <Field label="Country">
                      <div style={{ position: 'relative' }}>
                        <Globe size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input style={{ ...inputStyle, paddingLeft: 36 }} value={profile.country} onChange={e => setProfile({ ...profile, country: e.target.value })} placeholder="Country" />
                      </div>
                    </Field>
                    <Field label="City">
                      <input style={inputStyle} value={profile.city} onChange={e => setProfile({ ...profile, city: e.target.value })} placeholder="City" />
                    </Field>
                    <Field label="State / Region">
                      <input style={inputStyle} value={profile.state} onChange={e => setProfile({ ...profile, state: e.target.value })} placeholder="State or region" />
                    </Field>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <Field label="Address">
                        <div style={{ position: 'relative' }}>
                          <MapPin size={15} style={{ position: 'absolute', left: 11, top: 13, color: 'var(--text-muted)' }} />
                          <input style={{ ...inputStyle, paddingLeft: 36 }} value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} placeholder="Street address" />
                        </div>
                      </Field>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <Field label="Bio">
                        <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} placeholder="A brief bio about yourself..." />
                      </Field>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div style={{ padding: '1.25rem', background: 'var(--bg-app)', borderRadius: 12, border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                      <Link2 size={16} color="var(--primary)" />
                      <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Social Links</span>
                    </div>
                    <div className="profile-social-grid">
                      {[
                        { key: 'twitter', label: 'Twitter / X', icon: Twitter, placeholder: 'https://twitter.com/...' },
                        { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/...' },
                        { key: 'github', label: 'GitHub', icon: Github, placeholder: 'https://github.com/...' },
                        { key: 'website', label: 'Personal Website', icon: Globe, placeholder: 'https://yoursite.com' }
                      ].map(({ key, label, icon: Icon, placeholder }) => (
                        <div key={key}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>{label}</label>
                          <div style={{ position: 'relative' }}>
                            <Icon size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                              style={{ ...inputStyle, paddingLeft: 32, fontSize: '0.82rem' }}
                              type="url"
                              value={profile.socialLinks[key] || ''}
                              onChange={e => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, [key]: e.target.value } })}
                              placeholder={placeholder}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" disabled={profileSaving} className="btn btn-primary profile-submit-btn" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.7rem 1.75rem', borderRadius: 10, fontWeight: 700 }}>
                      <Save size={16} />
                      {profileSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Tab: Change Password ────────────────────────────────── */}
            {activeTab === TAB_PASSWORD && (
              <div className="card profile-card-body" style={{ padding: '2rem', borderRadius: 16, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.75rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Shield size={20} color="#ef4444" />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Change Password</h2>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>Set a strong password to protect your account</p>
                  </div>
                </div>

                <Alert type={pwdAlert.type} msg={pwdAlert.msg} />

                <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {[
                    { key: 'current', label: 'Current Password', placeholder: 'Your current password' },
                    { key: 'newPwd', label: 'New Password', placeholder: 'At least 8 characters' },
                    { key: 'confirm', label: 'Confirm New Password', placeholder: 'Re-enter new password' }
                  ].map(({ key, label, placeholder }) => (
                    <Field key={key} label={label} required>
                      <div style={{ position: 'relative' }}>
                        <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                          type={showPwd[key] ? 'text' : 'password'}
                          required
                          value={pwd[key]}
                          onChange={e => setPwd({ ...pwd, [key]: e.target.value })}
                          placeholder={placeholder}
                          style={{ ...inputStyle, paddingLeft: 36, paddingRight: 40 }}
                        />
                        <button type="button" onClick={() => setShowPwd({ ...showPwd, [key]: !showPwd[key] })}
                          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                          {showPwd[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {key === 'newPwd' && <PasswordStrength password={pwd.newPwd} />}
                    </Field>
                  ))}

                  {/* Tips */}
                  <div style={{ padding: '1rem', background: 'var(--bg-app)', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-muted)' }}>Password Requirements:</p>
                    {['At least 8 characters', 'At least one uppercase letter (A-Z)', 'At least one number (0-9)', 'At least one special character (!@#$...)'].map((tip, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--primary)' }} />
                        {tip}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" disabled={pwdSaving} className="btn btn-primary profile-submit-btn" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.7rem 1.75rem', borderRadius: 10, fontWeight: 700, background: '#ef4444', borderColor: '#ef4444' }}>
                      <Lock size={16} />
                      {pwdSaving ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Media Library Selector Modal for Profile Picture */}
      <MediaSelectorModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={handleSelectMedia}
        title="Select Profile Picture from Media"
      />
    </div>
  );
};

export default AdminProfile;
