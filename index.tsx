import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { APPLE_TOUCH_ICON_DATA_URL, FAVICON_DATA_URL } from './utils/brandAssets';

const setIconLink = (selector: string, rel: string, href: string, sizes?: string) => {
  const existing = document.querySelector<HTMLLinkElement>(selector);
  const link = existing ?? document.createElement('link');
  link.rel = rel;
  link.href = href;
  link.type = 'image/png';
  if (sizes) {
    link.setAttribute('sizes', sizes);
  }
  if (!existing) {
    document.head.appendChild(link);
  }
};

setIconLink('link[rel="icon"]', 'icon', FAVICON_DATA_URL, '64x64');
setIconLink('link[rel="apple-touch-icon"]', 'apple-touch-icon', APPLE_TOUCH_ICON_DATA_URL, '180x180');

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
