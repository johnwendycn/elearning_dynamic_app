import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { getFullMediaUrl } from '../utils/mediaUrl';

const OrgSettingsContext = createContext(null);

export const OrgSettingsProvider = ({ children }) => {
  const [orgSettings, setOrgSettings] = useState(null);
  const [headerConfig, setHeaderConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveSettings = async () => {
    try {
      const [settingsRes, headerRes] = await Promise.allSettled([
        api.get('/organization-settings/active'),
        api.get('/headers/active')
      ]);

      if (settingsRes.status === 'fulfilled' && settingsRes.value.data?.success) {
        const orgData = settingsRes.value.data.data || (Array.isArray(settingsRes.value.data.settings) ? settingsRes.value.data.settings[0] : null);
        setOrgSettings(orgData);
      }
      if (headerRes.status === 'fulfilled' && headerRes.value.data?.success) {
        setHeaderConfig(headerRes.value.data.data);
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
        ? getFullMediaUrl(orgSettings.faviconMedia.url) 
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
