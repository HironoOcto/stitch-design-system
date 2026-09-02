# 组件源代码规范（src/components/）

> stitch 组件的目录结构与 TSX / Less / 测试 / 桶导出写作约定。组件只读角色变量 `var(--stitch-*)`，值住在 [contract.css](../../packages/tokens/contract.css) + 各站 adapter。

### 3.0 复用优先（动手做任何 UI 元素前的第一判断）

建组件、写 demo、在别的组件里拼 markup——**动手前先查「库里是不是已经有它了」**，别重复手搓（内联 style 仿一个、或从零再建一个）。确认无可复用，才从零建。

**怎么查**：按角色扫现成组件——`packages/react/src/components/` + 族表 [`scripts/component-families.md`](../../scripts/component-families.md)（按功能分组）。

**判定（三档）**：

| 情况 | 做法 |
|---|---|
| **同角色已有**（要按钮 → `Button`、要输入框 → `Input`、要带边容器 → `Card`…） | **复用**，传 props。**信号**：一旦发现自己在用内联 style 描某现成组件的样子（它的边框 / 形状 / 交互态），那长相就是「你需要它」的信号——复用，别仿。 |
| **近似但差一点** | **扩已有件**（加 prop / 变体，如 Toggle 扩 Button），别手克隆——克隆会漂移、丢掉真件的换肤 / a11y / 状态。 |
| **确无同角色** | **才从零建**；若可复用就建成真组件（四件套），别散落内联。纯一次性排版才留内联，且仍不许仿造已有组件的长相。 |

### 3.1 目录结构 pattern

#### 通用"四件套"（简单组件）

```
src/components/Button/
├── Button.tsx              // 组件 + 类型 + 导出
├── Button.test.tsx         // 测试
├── button.module.less      // 样式（小写文件名）
└── index.ts                // 桶导出（barrel export）
```

**硬约定**：一个组件一个文件夹，四个文件缺一不可。

#### 拆分文件的时机（复杂组件）

只有出现以下情况才拆更多文件：

```
src/components/Form/
├── Form.tsx            // 主组件
├── Form.module.less    // 样式
├── FormItem.tsx        // ← 有子组件
├── context.ts          // ← 需要 React Context
├── useForm.ts          // ← 独立 Hook
├── validators.ts       // ← 纯函数逻辑
├── types.ts            // ← 类型爆炸
├── Form.test.tsx
└── index.ts
```

**原则**：不要过度拆分。中等复杂度的组件（Modal 有 focus trap、portal、复用其他组件）仍然坚持单文件。

#### 就近放静态资源

图片/字体等资源直接放在组件目录下：

```
src/components/Divider/
├── divider_line.png    ← 就近放
├── Divider.tsx
└── ...
```

### 3.2 TSX 文件写作约定

#### Import 顺序（严格三段）

```tsx
// 1. React 及其生态
import React, { useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

// 2. 内部组件（相对路径）
import { Button } from '../Button';

// 3. 样式（永远最后）
import styles from './modal.module.less';
```

**关键**：样式 import 永远放最后，视觉上一眼看清"这个组件依赖了哪些代码"。

#### Props Interface 定义

```tsx
// 独立字面量子类型先声明
export type ButtonType = 'primary' | 'default' | 'dashed' | 'text' | 'link';
export type ButtonSize = 'small' | 'middle' | 'large';

// 交互类组件继承原生 HTML 属性，用 Omit 剔除冲突字段
export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
    /** 按钮类型 */
    type?: ButtonType;
    /** 尺寸 */
    size?: ButtonSize;
    /** 危险按钮样式 */
    danger?: boolean;
    /**
     * 加载状态
     * @default false
     */
    loading?: boolean;
}
```

**规则**：
- **每个字段一行 JSDoc `/** 中文说明 */`**（IDE 提示 = 免费文档）
- 有默认值的 `@default X` 单独注释
- **纯自研组件不 extends**，只列自己的 props
- **跨-prop 短注写主接口头顶 JSDoc**（普通件 `<X>Props`、命令式件 `*Config` / `*Static` 头顶）——`build:refs` 抽它当 skill 的 component note，**skill 的注意事项即源自这段 interface 级 JSDoc**。
- **硬规则·边界**（不只 JSDoc——**整个 `packages/react/src` 源码注释**，含 `.less` 分节注释与测试）：**只写 stitch 语汇的使用约束**（角色变量 `--stitch-*`、a11y、受控/非受控、`<Icon>` 等）；**主题值（hex / 字面尺寸）、迁移溯源（`animal` / 源码由来 / 丢弃招牌）、他站长相对比、任一站名（含当下 active）一律不进**——去仓库根 `迁移笔记.md`。漏进去会被 `check:skill` §5（skill 面）与 `check:boundary` 的 `source` 层（整个源码树，定义正本见 ADR 0003）拦红。

#### 统一 props 约定（权威：Ant Design v5）

props 命名**照搬 Ant Design v5 的名字，不自创**。Ant 本身对不同组件就用不同名（关闭回调 Modal 用 `onCancel`、Drawer 用 `onClose`、气泡类用 `onOpenChange`）——照它各自的，不强捏成一个。

> **本表全是「对外 props」**——组件暴露给使用者的接口。组件**内部**把它接到 Radix 等底层库时用的原生名（`onValueChange` 等）是实现细节，不归本表管，也改不了（是底层库定的）。
>
> 所以下方「归一映射」意思是**对外露我们的名、内部转成底层库的名**，在组件里一行接过去，不是去改底层库：
>
> ```tsx
> // 对外露 onChange；内部接到 Radix 的 onValueChange
> <RadixSelect.Root value={value} onValueChange={onChange}>
> ```

| 场景 | 定死约定（= Ant v5） |
|---|---|
| 取值类（Select / Radio / DatePicker…） | `value` / `defaultValue` / `onChange` |
| 勾选类（Checkbox / Switch） | `checked` / `defaultChecked` / `onChange` |
| 气泡浮层（Tooltip / Popover / Dropdown） | `open` / `onOpenChange` |
| Modal | `open` / `onOk` / `onCancel`（`onCancel` = 关闭） |
| Drawer | `open` / `onClose` |
| 尺寸 | `size?: 'small' \| 'middle' \| 'large'` |
| 禁用 | `disabled?: boolean` |
| 状态 | `status?: 'error' \| 'warning'` |

**归一映射**——不论 Radix 件还是手写件，对外都长一个样：对外 props 命名遵循 Ant Design v5 约定（size 用 `'middle'`、Modal 用 `onCancel` / `onOk`），底层库的原生名在组件内一行转过去。

| 底层库的名 | 对外改成 |
|---|---|
| Radix 取值类 `onValueChange` | `onChange` |
| Radix 勾选类 `onCheckedChange` | `onChange` |
| Radix `open` / `defaultOpen` / `onOpenChange` | 同名沿用 |

#### 组件本体三件套

```tsx
// 1. React.FC + 泛型 props + 参数解构默认值
export const Button: React.FC<ButtonProps> = ({
    type = 'default',
    size = 'middle',
    danger = false,
    loading = false,
    className,
    children,
    ...rest
}) => {
    // 2. className 拼接（clsx，顺序：基础类 → 变体 → 状态 → 透传）
    const cls = clsx(
        styles.btn,
        styles[`btn-${type}`],
        styles[`btn-${size}`],
        danger && styles['btn-danger'],
        loading && styles['btn-loading'],
        className,
    );

    return <button className={cls} {...rest}>{children}</button>;
};

// 3. 必设 displayName
Button.displayName = 'Button';
```

**硬约定**：
- **不用 `defaultProps`**——完全用参数解构默认值
- **用 `clsx` 拼 class**——列普通 `dependencies`（随包自动装、**非 peer**）。理由：clsx 是纯工具、无单例问题，bundle 不会版本冲突，比手写省事且支持对象语法；**clsx 不设为 peer**（纯工具 peer 只白给用户加负担）。react/react-dom 才是 peer（单例，bundle 会有两份 React 崩掉）
- **必设 `Xxx.displayName`**（React DevTools 里看得清）
- className 拼接顺序：**基础类 → 变体（模板字符串索引）→ 布尔状态类 → 透传 className**

#### 什么时候用 forwardRef

**默认不用**——除非需要泛型或对外暴露 ref：

```tsx
// 只有 Form 这样的泛型组件才用
function FormInner<T extends Record<string, unknown>>(
    props: FormProps<T>, ref: React.Ref<HTMLFormElement>
): React.ReactElement { ... }

export const Form = React.forwardRef(FormInner) as unknown as FormComponent;
Form.Item = FormItem;   // 静态挂载子组件
```

#### 受控/非受控双模式（Input、Switch 的标准范式）

```tsx
const [innerValue, setInnerValue] = useState(defaultValue ?? '');
const isControlled = value !== undefined;
const currentValue = isControlled ? value : innerValue;
```

#### 性能优化时机

- **简单组件不做优化**（Button、Divider、Card 都没有 useCallback）
- **有 useState 的交互组件必用 useCallback** 稳定回调引用
- **Context provider value 必用 useMemo**

#### 无障碍性（a11y）—— 每个交互组件的一等公民

```tsx
<button
    type="button"
    role="switch"
    aria-checked={isChecked}
    aria-label={ariaLabel}
    aria-labelledby={ariaLabelledBy}
    aria-busy={loading || undefined}  // ← 惯用法：不需要该属性时给 undefined
    onClick={handleClick}
    onKeyDown={handleKeyDown}
    disabled={disabled}
>
```

**a11y 硬约束清单**：
- 非原生控件（用 div/button 模拟 switch/checkbox）必须加 `role` + `aria-checked`
- 纯图标按钮必须有 `aria-label`
- 错误状态用 `aria-invalid={cond ? 'true' : undefined}`
- Modal 用 `useId()` + `aria-labelledby` + `aria-describedby`
- 键盘操作：手动处理 Enter/Space（对非 button 元素）
- Focus 管理：Modal open 时记录 previouslyFocused，close 时归还

### 3.3 Less Module 写作约定

#### 文件命名

- **小写 kebab-case + `.module.less`**：`button.module.less`
- 一个组件只有一个 less 文件，不做二级拆分

#### 顶部分节注释（全库统一格式）

```less
// ============================================
// Button
// ============================================

// ---------- Wrapper ----------
.btn { ... }

// ---------- Size ----------
.btn-small { ... }
.btn-middle { ... }

// ---------- Type: primary ----------
.btn-primary { ... }

// ---------- Type: default ----------
.btn-default { ... }
```

**两种分隔线**：
- `// ============` 大节标题（组件名）
- `// ---------- xxx ----------` 子节（Type / Size / State）

#### class 命名（基础类 + 修饰类，非严格 BEM）

```less
.btn { ... }              // 基础类
.btn-small { ... }        // 尺寸修饰
.btn-primary { ... }      // 类型修饰
.btn-danger { ... }       // 状态修饰
.btn-icon { ... }         // 子元素（flat，不用 __）
```

**规则**：
- 不用 BEM 的 `__` `--` 分隔符，纯 `-` 连字
- 子元素也是同级 flat class（CSS Modules 已经提供作用域）
- 组合类靠 tsx 侧拼接：`styles.btn styles['btn-primary'] styles['btn-large']`

#### CSS 变量（tokens）

**组件级样式全部用 `var(--stitch-*)` 角色变量**（完整清单见 [contract.css](../../packages/tokens/contract.css)（角色契约；说明见 [多站换肤架构](../design-system/multi-site-theming.md）），绝不硬编码：

```less
gap: var(--stitch-spacing-sm);
font-family: var(--stitch-font-body);
transition: all var(--stitch-motion-duration-base) var(--stitch-motion-ease);
box-shadow: var(--stitch-shadow-sm);
height: var(--stitch-height-sm);
```

**命名空间**：统一 `--stitch-` 前缀，按角色/类别分组（`bg-*`、`text-*`、`accent*`、`link`、`border-*`、`radius-*`、`shadow-*`、`font-*`、`spacing-*`、`motion-*`、`height-*`，及反馈色 `danger/success/warning/info`）——**完整清单以 [contract.css](../../packages/tokens/contract.css)（角色契约；说明见 [多站换肤架构](../design-system/multi-site-theming.md））为准**。

**例外**：品牌标志色（如 Button primary 的特色阴影色）可以硬编码——因为这是"设计不可替代的部分"，不属于可替换的 token。

#### hover / focus / disabled 写法

```less
.btn-default {
    color: var(--stitch-text-primary);

    &:hover:not(:disabled) {         // ← :not(:disabled) 保护
        color: var(--stitch-accent);
        transform: translateY(-1px);
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }
}

.btn {
    &:focus-visible {                // ← focus-visible 而非 focus
        outline: 2px solid var(--stitch-focus-ring);
        outline-offset: 2px;
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }
}
```

**硬约定**：
- hover 必带 `:not(:disabled)`
- 焦点样式用 `:focus-visible` 而非 `:focus`（避免鼠标点击残留焦点环）

#### Dark mode 处理

**组件级 less 文件没有任何 dark mode media query**——全部下放给 CSS 变量的主题切换。dark 主题只在 `src/styles/themes/` 里换 token 值即可，组件代码零改动。

### 3.4 测试文件（xxx.test.tsx）写作约定

#### 框架栈

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';
import styles from './button.module.less';   // 直接 import 样式做类断言
```

**Vitest 4 + Testing Library + jest-dom**。

#### 一个组件必测的 7 个维度

1. **基本渲染**（渲染 children 文案）
2. **props → class 映射**（每个枚举都测）
3. **原生属性透传**（htmlType、data-*、aria-*、style、className）
4. **交互事件**（onClick、userEvent.click）
5. **禁用/边界态**（disabled 阻止点击、loading 特殊行为）
6. **键盘操作**（Enter/Space 触发；disabled 时不触发）
7. **a11y 契约**（`toHaveAccessibleName()`）

#### 命名风格

- `describe('Button', ...)` 用组件名做外层
- `it('中文短句')` —— 测试名一律中文
- 用 `for` 循环遍历所有枚举变体，减少重复

#### 完整片段示例

```tsx
it('键盘 Enter 触发 onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>x</Button>);
    screen.getByRole('button').focus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
});

it('disabled 状态禁用键盘 Enter 触发', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>x</Button>);
    screen.getByRole('button').focus();
    await user.keyboard('{Enter}');
    expect(onClick).not.toHaveBeenCalled();
});
```

**技巧**：
- 用 `styles['btn-primary']` 直接引 CSS Modules 的 hashed class，天然抗改名
- 优先 `getByRole` / `getByTestId`，不用 querySelector
- 边界注释很多——把 test 也当文档写

### 3.5 index.ts（桶文件）

#### 简单组件

```ts
// src/components/Button/index.ts
export { Button } from './Button';
export type { ButtonProps, ButtonType, ButtonSize } from './Button';
```

**同时导出组件 + 所有类型**，字面量子类型也导出。用 `export type` 而非 `export`。

#### 复合组件（Form）

```ts
import Form from './Form';

export { Form } from './Form';
export { useForm } from './useForm';
export { FormItem } from './FormItem';

export type {
    FormProps, FormItemProps, FormInstance, NamePath,
    RuleObject, ValidateError, ...
} from './types';

export default Form;   // 兼容默认导入
```

### 3.6 `src/index.ts`（库总入口）

```ts
// 全局样式：第一行 side-effect import
import './styles/index.less';

// ============================================
// 基础 UI 组件
// ============================================
export { Button } from './components/Button';
export type { ButtonProps, ButtonType, ButtonSize } from './components/Button';

export { Input } from './components/Input';
export type { InputProps, InputSize } from './components/Input';

// ============================================
// 覆盖层组件
// ============================================
export { Modal } from './components/Modal';
export type { ModalProps } from './components/Modal';
// ...
```

**关键规则**：
1. **首行 side-effect import 样式**——用户装库后自动拿到 tokens/字体/reset
2. **一组件一双 export**：`export { X }` + `export type { XProps, ... }` 相邻成对
3. **大分节注释**分类
4. **不使用 `export *`**——每一项显式列出，IDE 补全 + API 追踪友好

### 3.7 Demo 页面（看效果 + 供 build:refs 抽用例）

不引 Storybook，用自建 demo 站（`npm run demo` 起 dev server，浏览器里看）。**demo 是自动发现式的：丢一个 `demo/components/<Name>/index.tsx` 就自动上架，零手动注册**（外壳 + 侧栏 + 路由的机制见 [demo 站](./demo-site.md)）。

**一个 demo 文件 = 两个导出**（`demo/components/<Name>/index.tsx`）：

- `export const meta = { title, description }`——组件页的标题 + 一句话描述。
- `export default`——一个示例组件，`import` **真组件**（包别名 `@octohirono/stitch-design-system`）并演示主要用法。这个默认导出就是 [skill 构建流程 §4.3](./skill-build-pipeline.md) 里 `build:refs` 抽 tsx 用例的来源。

```tsx
import { MyComponent } from '@octohirono/stitch-design-system';

export const meta = {
    title: 'MyComponent',
    description: '一句话说明这个组件干嘛的。',
};

export default function MyComponentDemo() {
    return (
        <div>
            <MyComponent size="large">内容</MyComponent>
            {/* 铺开主要 size / 语义态 / disabled / 关键交互——
                demo-acceptance 第 2 条要求「示例够全」，只放默认态不算 */}
        </div>
    );
}
```

**自动上架规则**（无 `MENU_ITEMS` / `PAGES` / `pageInfo` 那套手动注册；机制见 [demo 站 · 族表派生侧栏](./demo-site.md)）：

- 侧栏分组从 `scripts/component-families.md` **族表派生**；**文件夹名须与族表成员名对齐**（大小写不敏感，族表 `Button` ↔ 文件夹 `button`），不齐则 `console.warn` 且**不上架**——去族表加成员名或改文件夹名。
- 路由 `#/<文件夹名>`，`npm run demo` 热更新即见。

> 验收照 [demo-acceptance.md](./demo-acceptance.md)：第 1 条「上架正确」核的就是这里——族对、页面不空白、console 无 warn。

---

