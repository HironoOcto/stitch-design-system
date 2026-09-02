// demo/main.tsx —— demo 站入口：装主题 → 定默认站 → 挂 React。
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { installTheme, setSite, getSite } from './theme';
import App from './App';

installTheme();
if (!getSite()) setSite('seline'); // 默认站 seline

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
