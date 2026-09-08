import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const OrgSettingsContext = createContext(null);

export const OrgSettingsProvider = ({ children }) => {
  const [orgSettings, setOrgSettings] = useState(null);
  const [headerConfig, setHeaderConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveSettings = async () => {
    try {
      // 1. Fetch organization settings
      const res = await api.get('/organization-settings');
      if (res.data.success && res.data.settings?.length > 0) {
        const active = res.data.settings.find(s => s.status === 'active') || res.data.settings[0];
        setOrgSettings(active);
      } else {
        setOrgSettings(null);
      }

      // 2. Fetch active header configuration
      const headerRes = await api.get('/headers/active');
      if (headerRes.data.success) {
        setHeaderConfig(headerRes.data.data);
      } else {
        setHeaderConfig(null);
      }
    } catch (err) {
      console.error('Failed to load branding settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveSettings();
  }, []);

  useEffect(() => {
    if (orgSettings) {
      // Dynamic document title
      document.title = orgSettings.siteName || 'Core CMS';

      // Dynamic favicon
      const faviconUrl = orgSettings.faviconMedia?.url 
        ? `http://localhost:5000${orgSettings.faviconMedia.url}` 
        : '/favicon.svg';
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = faviconUrl;

      // Dynamic colors
      if (orgSettings.primaryColor) {
        document.documentElement.style.setProperty('--primary', orgSettings.primaryColor);
        document.documentElement.style.setProperty('--primary-light', `${orgSettings.primaryColor}15`);
      }
      if (orgSettings.secondaryColor) {
        document.documentElement.style.setProperty('--secondary', orgSettings.secondaryColor);
      }
    }
  }, [orgSettings]);

  const refreshSettings = () => {
    fetchActiveSettings();
  };

  return (
    <OrgSettingsContext.Provider value={{ orgSettings, headerConfig, loading, refreshSettings }}>
      {children}
    </OrgSettingsContext.Provider>
  );
};

export const useOrgSettings = () => useContext(OrgSettingsContext);
