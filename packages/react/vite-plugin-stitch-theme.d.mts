// 类型声明伴随 vite-plugin-stitch-theme.mjs —— 根 vite.config.ts（被 tsc 检查）
// 也注册这个插件，需要它有类型。
import type { Plugin } from 'vite';

export declare function stitchTheme(): Plugin;
