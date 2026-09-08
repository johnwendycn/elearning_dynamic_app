import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { 
  CheckCircle2, AlertCircle, AlertTriangle, Info, X 
} from 'lucide-react';

const AlertContext = createContext(null);

/**
 * Individual Floating Toast Alert Component
 */
const FloatingToast = ({ alert, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef(Date.now());
  const remainingRef = useRef(alert.duration || 4500);

  const triggerDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(alert.id);
    }, 280);
  }, [alert.id, onDismiss]);

  // Handle countdown & auto-dismiss
  useEffect(() => {
    if (alert.duration === 0) return; // 0 means persistent until closed

    let timer;
    const interval = 30; // update progress every 30ms

    if (!isPaused) {
      startTimeRef.current = Date.now();
      timer = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, remainingRef.current - elapsed);
        const percent = (remaining / (alert.duration || 4500)) * 100;
        setProgress(percent);

        if (remaining <= 0) {
          clearInterval(timer);
          triggerDismiss();
        }
      }, interval);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (!isPaused) {
        const elapsed = Date.now() - startTimeRef.current;
        remainingRef.current = Math.max(0, remainingRef.current - elapsed);
      }
    };
  }, [alert.duration, isPaused, triggerDismiss]);

  const getVariant = () => {
    switch (alert.type) {
      case 'success':
        return {
          icon: <CheckCircle2 size={20} style={{ color: '#10b981', flexShrink: 0 }} />,
          barColor: '#10b981',
          bgIcon: 'rgba(16, 185, 129, 0.12)',
          defaultTitle: 'Success'
        };
      case 'error':
      case 'danger':
        return {
          icon: <AlertCircle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />,
          barColor: '#ef4444',
          bgIcon: 'rgba(239, 68, 68, 0.12)',
          defaultTitle: 'Error'
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />,
          barColor: '#f59e0b',
          bgIcon: 'rgba(245, 158, 11, 0.12)',
          defaultTitle: 'Attention'
        };
      case 'info':
      default:
        return {
          icon: <Info size={20} style={{ color: '#3b82f6', flexShrink: 0 }} />,
          barColor: '#3b82f6',
          bgIcon: 'rgba(59, 130, 246, 0.12)',
          defaultTitle: 'Notice'
        };
    }
  };

  const config = getVariant();
  const title = alert.title || config.defaultTitle;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        pointerEvents: 'auto',
        width: '100%',
        maxWidth: '380px',
        minWidth: '280px',
        background: 'var(--bg-surface, #ffffff)',
        color: 'var(--text-main, #1e293b)',
        borderRadius: '12px',
        boxShadow: '0 12px 36px -6px rgba(0, 0, 0, 0.22), 0 4px 12px -2px rgba(0, 0, 0, 0.1)',
        border: '1px solid var(--border, #e2e8f0)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(12px)',
        transform: isExiting ? 'translateX(110%) opacity(0)' : 'translateX(0)',
        opacity: isExiting ? 0 : 1,
        transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.28s ease',
        animation: 'slideInRight 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}
      role="alert"
    >
      {/* Top / Left Accent Strip */}
      <div 
        style={{ 
          position: 'absolute', 
          left: 0, 
          top: 0, 
          bottom: 0, 
          width: '4.5px', 
          background: config.barColor 
        }} 
      />

      {/* Main Toast Content */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: '12px', 
          padding: '14px 14px 14px 18px' 
        }}
      >
        {/* Icon Pill */}
        <div 
          style={{ 
            width: '34px', 
            height: '34px', 
            borderRadius: '9px', 
            background: config.bgIcon, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '1px'
          }}
        >
          {config.icon}
        </div>

        {/* Message Info */}
        <div style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
          {title && (
            <div 
              style={{ 
                fontWeight: 700, 
                fontSize: '0.9rem', 
                marginBottom: '3px',
                color: 'var(--text-main, #0f172a)' 
              }}
            >
              {title}
            </div>
          )}
          <div 
            style={{ 
              fontSize: '0.835rem', 
              color: 'var(--text-muted, #64748b)', 
              wordBreak: 'break-word',
              fontWeight: 450,
              lineHeight: 1.45 
            }}
          >
            {alert.message}
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={triggerDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '4px',
            color: 'var(--text-muted, #94a3b8)',
            cursor: 'pointer',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-main, #0f172a)';
            e.currentTarget.style.background = 'rgba(0,0,0,0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted, #94a3b8)';
            e.currentTarget.style.background = 'transparent';
          }}
          aria-label="Dismiss alert"
        >
          <X size={15} />
        </button>
      </div>

      {/* Countdown Progress Bar */}
      {alert.duration !== 0 && (
        <div 
          style={{ 
            height: '3px', 
            width: '100%', 
            background: 'rgba(0,0,0,0.06)', 
            overflow: 'hidden' 
          }}
        >
          <div 
            style={{ 
              height: '100%', 
              width: `${progress}%`, 
              background: config.barColor,
              transition: 'width 30ms linear' 
            }} 
          />
        </div>
      )}
    </div>
  );
};

/**
 * Floating Alert Container positioned fixed at the Top-Right Corner
 */
const FloatingAlertContainer = ({ alerts, onDismiss }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '18px',
        right: '18px',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '10px',
        maxWidth: 'calc(100vw - 36px)',
        pointerEvents: 'none'
      }}
    >
      {alerts.map((alert) => (
        <FloatingToast key={alert.id} alert={alert} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

/**
 * Alert Provider Component
 */
export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const removeAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const showAlert = useCallback(({ type = 'info', message, title, duration = 4500 }) => {
    if (!message) return;
    const id = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const newAlert = {
      id,
      type,
      message,
      title,
      duration: duration ?? 4500
    };

    setAlerts((prev) => {
      // Keep maximum 5 concurrent alerts to avoid cluttering screen
      const trimmed = prev.length >= 5 ? prev.slice(prev.length - 4) : prev;
      return [...trimmed, newAlert];
    });

    return id;
  }, []);

  const showSuccess = useCallback((message, title = 'Success', duration = 4500) => {
    return showAlert({ type: 'success', message, title, duration });
  }, [showAlert]);

  const showError = useCallback((message, title = 'Error', duration = 6000) => {
    return showAlert({ type: 'error', message, title, duration });
  }, [showAlert]);

  const showWarning = useCallback((message, title = 'Warning', duration = 5000) => {
    return showAlert({ type: 'warning', message, title, duration });
  }, [showAlert]);

  const showInfo = useCallback((message, title = 'Information', duration = 4500) => {
    return showAlert({ type: 'info', message, title, duration });
  }, [showAlert]);

  // Expose global window helper and seamlessly intercept standard window.alert
  useEffect(() => {
    const globalAlertHandler = (type, message, title, duration) => {
      showAlert({ type, message, title, duration });
    };

    window.showFloatingAlert = globalAlertHandler;
    window.toast = {
      success: showSuccess,
      error: showError,
      warning: showWarning,
      info: showInfo,
      show: showAlert
    };

    // Replace native blocking window.alert with smooth floating alert
    const originalAlert = window.alert;
    window.alert = (msg) => {
      if (typeof msg === 'string') {
        const lower = msg.toLowerCase();
        if (lower.includes('success') || lower.includes('saved') || lower.includes('approved')) {
          showSuccess(msg);
          return;
        }
        if (lower.includes('error') || lower.includes('fail') || lower.includes('denied')) {
          showError(msg);
          return;
        }
        if (lower.includes('warning') || lower.includes('require') || lower.includes('specify')) {
          showWarning(msg);
          return;
        }
      }
      showInfo(String(msg || ''));
    };

    return () => {
      delete window.showFloatingAlert;
      delete window.toast;
      window.alert = originalAlert;
    };
  }, [showAlert, showSuccess, showError, showWarning, showInfo]);

  const value = {
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeAlert
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
      <FloatingAlertContainer alerts={alerts} onDismiss={removeAlert} />
    </AlertContext.Provider>
  );
};

/**
 * useAlert Custom Hook
 */
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    // Graceful fallback if invoked outside AlertProvider
    return {
      showAlert: ({ message }) => console.log('Alert:', message),
      showSuccess: (message) => console.log('Success:', message),
      showError: (message) => console.error('Error:', message),
      showWarning: (message) => console.warn('Warning:', message),
      showInfo: (message) => console.info('Info:', message),
      removeAlert: () => {}
    };
  }
  return context;
};

export default AlertContext;
