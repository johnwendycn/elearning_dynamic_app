/**
 * Normalizes an image or asset URL.
 * If the URL is relative (e.g. /media/123.jpg), prepends the backend server host.
 * If it is already absolute (http, https, data, blob), returns it as is.
 */
export const getFullMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  const backendHost = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') 
    : 'http://localhost:5000';
  return `${backendHost}${url.startsWith('/') ? '' : '/'}${url}`;
};
