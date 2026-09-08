import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
            localStorage.setItem('user', JSON.stringify(res.data.data));
          }
        } catch (error) {
          console.error('Session restore failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { user: userData, token: jwtToken } = res.data.data;
      setUser(userData);
      setToken(jwtToken);
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    }
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data.success) {
      const data = res.data.data;
      if (data?.token) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success && res.data.data) {
        setUser(res.data.data);
        localStorage.setItem('user', JSON.stringify(res.data.data));
        return res.data.data;
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
    return null;
  };

  /**
   * Evaluates role permissions & user privilege overrides
   */
  const hasPermission = (moduleCode, action = 'read') => {
    if (!user) return false;

    // Check user-level overrides first
    if (user.customModulePermissions && user.customModulePermissions.length > 0) {
      const override = user.customModulePermissions.find(
        (p) => p.Module && p.Module.code === moduleCode
      );

      if (override) {
        if (override.isAllowed === false) return false;
        if (Array.isArray(override.deniedActions) && override.deniedActions.includes(action)) return false;
        if (Array.isArray(override.allowedActions) && override.allowedActions.includes(action)) return true;
      }
    }

    // Super Admin role check
    const isAdmin = user.roles && user.roles.some((r) => 
      r.name === 'Super Admin' || 
      r.name === 'Admin' || 
      (r.name && r.name.toLowerCase().includes('admin')) || 
      r.code === 'admin' || 
      r.code === 'super_admin'
    );
    if (isAdmin) return true;

    // Role-level check
    if (user.roles && user.roles.length > 0) {
      for (const role of user.roles) {
        if (role.modules && role.modules.length > 0) {
          for (const mod of role.modules) {
            if (mod.code === moduleCode) {
              const perms = mod.RoleModule?.permissions || mod.permissions || [];
              if (perms.includes(action)) return true;
            }
          }
        }
      }
    }

    return false;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
