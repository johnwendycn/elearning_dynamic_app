/**
 * Returns the active backend base URL (without /api suffix).
 * Dynamically resolves to the current window hostname so that mobile phones
 * and remote network devices (e.g. 192.168.x.x, 10.x.x.x, or public domains)
 * can load all images, assets, and APIs seamlessly.
 */
export const getBackendBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname) {
    const protocol = window.location.protocol || 'http:';
    return `${protocol}//${window.location.hostname}:5000`;
  }
  return 'http://localhost:5000';
};

/**
 * Normalizes an image or asset URL.
 * If the URL is relative (e.g. /media/123.jpg or /uploads/foo.png), prepends the dynamic backend server host.
 * If it is already absolute (http, https, data, blob), returns it as is.
 */
export const getFullMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  if (
    url.startsWith('http://') || 
    url.startsWith('https://') || 
    url.startsWith('data:') || 
    url.startsWith('blob:')
  ) {
    return url;
  }
  const backendHost = getBackendBaseUrl();
  return `${backendHost}${url.startsWith('/') ? '' : '/'}${url}`;
};
