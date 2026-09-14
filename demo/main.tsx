// demo/main.tsx —— demo 站入口：装主题 → 定默认站 → 挂 React。
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { installTheme, setSite, getSite } from './theme';
import App from './App';
// demo 预览替代字体映射（真商用/定制体不发布；见 demo/fonts.css）。放在最后 import，
// 且用 html[data-site] 高特异性，确保压过 installTheme 注入的 [data-site] 字族。
import './fonts.css';

installTheme();
if (!getSite()) setSite('seline'); // 默认站 seline

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
