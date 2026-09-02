// `import 'virtual:stitch-theme'`（src/index.ts 顶部）—— 由 vite-plugin-stitch-theme
// 在构建时提供的虚拟模块（副作用式注入主题 :root）。这里声明其类型，dts emit 才不报
// TS2307。
declare module 'virtual:stitch-theme';
