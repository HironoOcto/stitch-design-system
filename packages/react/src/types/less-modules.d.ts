// CSS Modules（Less）—— `import styles from './x.module.less'` 的类型声明。
// vite/vitest 把 *.module.less 转成 { className: hashedName } 的对象。
declare module '*.module.less' {
  const classes: { readonly [className: string]: string };
  export default classes;
}
