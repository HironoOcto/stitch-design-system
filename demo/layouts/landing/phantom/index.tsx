// demo/layouts/landing/phantom/index.tsx —— 「Landing」的 **phantom 版**落地页（per-site 版式）
//
// 每个真实主题一个自包含子目录；分发器 demo/layouts/landing/index.tsx 按 active-site
// 分发到这里。registry 的 glob 只扫单层 `/demo/layouts/*/index.tsx`，本子目录不会被
// 误当成独立 layout 条目（与 steep/ · seline/ 同例）。
//
// 设计一律读 skills/stitch-design-system 的 phantom 预置得出（style.md → rules.md →
// composition.md），非照抄任何 prompt。phantom = **黄昏薰衣草糖果铺**：整页浮在一层淡紫
// 近白平面上，主体是一片**实心彩色瓦片拼成的 bento 网格**，被一只顽皮的幽灵和药丸几何点缀。
//   · 铺底 = **淡紫近白平面**——用 bg-canvas 掺一丝 accent（薰衣草）混出淡紫底，刻意平：
//     无渐变 mesh / 无颗粒 / 无毛玻璃 / 无背景图，氛围只来自**色相**（composition §1）；
//   · **主体是实心彩糖瓦片**（薰衣草 / 矢车菊蓝 / 奶油 / 腮红 / 雾灰糖色，穿插近黑 obsidian
//     与深紫 aubergine 深瓦），每块罩同一道**极淡紫环境光晕**（shadow-base = 4px 零扩散淡紫，
//     系统唯一的「阴影」）——composition §3；
//   · **深色只活在单块瓦片里、绝不铺成整幕**（composition §4）：无满幅 dark hero、无明暗段落
//     交替——这一条**刻意背离** rules.md「组件规格」段里写的暗色 hero / 明暗交替（见下「取舍 1」）；
//   · 排版 = **低语权威**：巨型 display（96px 上限）配 -0.025em 紧负字距，字重**恒 350 永不加粗**
//     （font-weight-normal 该站即 350），靠尺寸与留白拿气场；**刻意无斜体**（composition §5）；
//   · **药丸几何是招牌轮廓**：导航 / 按钮 / 标签皆 100px 胶囊（radius-button），瓦片 / 卡片
//     24px 柔角（radius-card）——世界由药丸与柔软胶囊构成，不用尖角；
//   · **玻璃全禁**（composition §6）：sticky 导航是**实心白药丸**、不上磨砂——区别于 seline 的
//     磨砂顶栏。
//
// 连接件（band 外壳 / 淡紫画布 / 彩糖瓦片 / logo 标 / 幽灵吉祥物 / 药丸导航）**只读 var(--stitch-*)**：
// 色 / 圆角 / 字体 / 间距 / 光晕一律走角色变量，绝不落 hex（数值几何——瓦片纵横比、幽灵眼位百分比、
// min() 响应上限的 vw——非主题值，与 steep / seline 同例）。交互 / 展示元素一律是经
// @octohirono/stitch-design-system import 的**真组件**。
//
// 三处对预置的**刻意取舍 / 设计判定**（都由读 skill 得出，AGENTS 硬规则 > 预置文档；authority 序
// 内 style.md/composition.md 是「吸收 composition 修正后重生成」的更新真相，胜过 rules.md 旧组件规格段）：
//   1) **无满幅暗幕**：rules.md「组件规格」段列了「Hero 区（暗）Aubergine 满幅背景」与「交替亮暗
//      区块」，但 composition §4 与 style.md 明确「dark lives only at tile scale and never as a
//      full-bleed band」「刻意无满幅暗幕……复刻不要把 aubergine 铺成整屏 dark hero 或明暗段落交替」。
//      composition 是承重层、且是后期重生成吸收进 style 的更新态，故**深色只作单块瓦片**，绝不通栏。
//   2) **实心彩糖瓦片 = 连接件**：真 `<Card color="cat-N">` 走契约的 a11y 软底（cat 混 canvas 88%
//      的淡色 wash），那是「白底描边卡」不是 phantom 的**实心糖色瓦片**（composition §3 反复强调
//      「每块都是实心填色、不是白底描边卡」）。故招牌 bento 瓦片**手写连接件外壳**（bg 读
//      var(--stitch-cat-N) 实心 + var(--stitch-shadow-base) 光晕），**内部装真组件**（Stat / Tag /
//      Button / Avatar / 文案）——正合本 issue「区块 = 真组件 + 连接件」模型。真 `<Card>` 留给中性
//      浅色内容容器（图表 / FAQ）。
//   3) **幽灵吉祥物 = 纯 CSS**：幽灵是 phantom 唯一反复出现的招牌品牌设备（内联替换标题元音、
//      periwinkle 渲染），但图标集无 `ghost`、且全局红线禁 emoji / Unicode 符号 / 裸 SVG，
//      demo 也无该轮廓 SVG 素材。故以**纯 CSS 药丸几何**塑一只 periwinkle 幽灵（纯 CSS 抽象非裸
//      SVG——沿 seline「旋转方块 logo」先例），色读 var(--stitch-cat-1)、眼读 var(--stitch-bg-inverted)，
//      内联替换 hero 标题里 "Phantom" 的元音 o。**刻意从简**（药丸圆顶 + 双眼，不搓易碎的锯齿尾），
//      保住招牌识别点而不越红线。
//
// Hero「视频秀」取舍：composition §2 记 hero = 一段**全宽圆角静音自动循环视频**，但那是**每站自备的
// 内容资产**、demo 无素材，且意象规则禁摄影 / 截图 / 抽象图形。故以一枚**全宽圆角深瓦「视频框」**
// （真 AspectRatio 16:9 + obsidian 实瓦 + 光晕 + 一枚 play 图标可供性 + 「静音自动循环」说明）忠实
// 复刻「满宽、圆角收入、坐在淡紫画布上」的形，不臆造影像内容。

import type { CSSProperties, ReactNode } from 'react';
import {
  Accordion,
  AspectRatio,
  Avatar,
  BarChart,
  Button,
  Card,
  Divider,
  Icon,
  LineChart,
  Stat,
  StatGroup,
  Tag,
} from '@octohirono/stitch-design-system';
import type { AccordionItem } from '@octohirono/stitch-design-system';

// ---------------------------------------------------------------------------
// 淡紫近白画布（composition §1：不是纯白、也不是中性纸白——bg-canvas 掺一丝 accent 薰衣草
// 混出淡紫底；只读 var、由 color-mix 派生，非硬编码 #f5f2ff）。
// ---------------------------------------------------------------------------
const CANVAS =
  'color-mix(in srgb, var(--stitch-bg-canvas), var(--stitch-accent) 30%)';

// ---------------------------------------------------------------------------
// 连接件字阶（低语权威：display 恒 350、-0.025em 紧负字距走 tracking-* 角色变量；
// 巨型字用 min(token, 响应上限 vw) 兜移动端不溢出——vw 是几何守卫、非主题值）。
// ---------------------------------------------------------------------------
const display: CSSProperties = {
  fontFamily: 'var(--stitch-font-display)',
  fontSize: 'min(var(--stitch-text-display), 13vw)',
  lineHeight: 'var(--stitch-leading-display)',
  letterSpacing: 'var(--stitch-tracking-display)',
  fontWeight: 'var(--stitch-font-weight-normal)', // 350，永不加粗
  color: 'var(--stitch-text-primary)',
  margin: 0,
  textWrap: 'balance',
};
const headingLg: CSSProperties = {
  fontFamily: 'var(--stitch-font-display)',
  fontSize: 'min(var(--stitch-text-heading-lg), 9vw)',
  lineHeight: 'var(--stitch-leading-heading-lg)',
  letterSpacing: 'var(--stitch-tracking-heading-lg)',
  fontWeight: 'var(--stitch-font-weight-normal)',
  color: 'var(--stitch-text-primary)',
  margin: 0,
  textWrap: 'balance',
};
const heading: CSSProperties = {
  fontFamily: 'var(--stitch-font-display)',
  fontSize: 'var(--stitch-text-heading)',
  lineHeight: 'var(--stitch-leading-heading)',
  letterSpacing: 'var(--stitch-tracking-heading)',
  fontWeight: 'var(--stitch-font-weight-normal)',
  color: 'var(--stitch-text-primary)',
  margin: 0,
  textWrap: 'balance',
};
const headingSm: CSSProperties = {
  fontFamily: 'var(--stitch-font-display)',
  fontSize: 'var(--stitch-text-heading-sm)',
  lineHeight: 'var(--stitch-leading-heading-sm)',
  letterSpacing: 'var(--stitch-tracking-heading-sm)',
  fontWeight: 'var(--stitch-font-weight-normal)',
  color: 'var(--stitch-text-primary)',
  margin: 0,
};
const subheading: CSSProperties = {
  fontFamily: 'var(--stitch-font-display)',
  fontSize: 'var(--stitch-text-subheading)',
  lineHeight: 'var(--stitch-leading-subheading)',
  letterSpacing: 'var(--stitch-tracking-subheading)',
  fontWeight: 'var(--stitch-font-weight-normal)',
  color: 'var(--stitch-text-primary)',
  margin: 0,
};
// 引导副标 / 正文：20px 与 15px，350 字重；行高 ≤1.4（正文克制可读性红线）；紧字距走 tracking 角色变量。
const lead: CSSProperties = {
  fontFamily: 'var(--stitch-font-body)',
  fontSize: 'var(--stitch-text-subheading)',
  lineHeight: 'var(--stitch-leading-subheading)',
  letterSpacing: 'var(--stitch-tracking-subheading)',
  fontWeight: 'var(--stitch-font-weight-normal)',
  color: 'var(--stitch-text-secondary)',
  margin: 0,
};
const body: CSSProperties = {
  fontFamily: 'var(--stitch-font-body)',
  fontSize: 'var(--stitch-text-body-sm)',
  lineHeight: 'var(--stitch-leading-body-sm)',
  letterSpacing: 'var(--stitch-tracking-body-sm)',
  fontWeight: 'var(--stitch-font-weight-normal)',
  color: 'var(--stitch-text-secondary)',
  margin: 0,
};
const caption: CSSProperties = {
  fontFamily: 'var(--stitch-font-body)',
  fontSize: 'var(--stitch-text-caption)',
  lineHeight: 'var(--stitch-leading-caption)',
  fontWeight: 'var(--stitch-font-weight-normal)',
  color: 'var(--stitch-text-secondary)',
  margin: 0,
};

const stack = (gap = 'var(--stitch-space-16)'): CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  gap,
});
const row = (gap = 'var(--stitch-space-12)'): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap,
  flexWrap: 'wrap',
});
const grid = (min: string): CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fit, minmax(${min}, 1fr))`,
  gap: 'var(--stitch-space-24)',
});

// ---------------------------------------------------------------------------
// 幽灵吉祥物（招牌品牌设备 · 纯 CSS · 见文件头「取舍 3」）：药丸圆顶 + 双眼，periwinkle 平涂。
// 顶圆角走 radius-button（100px 药丸）、底圆角走 radius-card——形状本身即 phantom 的胶囊语汇；
// 眼睛用 bg-inverted（茄紫）。inline 时基线微调、随字号缩放，替换标题里的一个元音。
// ---------------------------------------------------------------------------
function Ghost({
  size = '1em',
  inline = false,
}: {
  size?: string;
  inline?: boolean;
}) {
  const eye: CSSProperties = {
    position: 'absolute',
    top: '36%',
    width: '15%',
    height: '22%',
    borderRadius: 'var(--stitch-radius-button)',
    background: 'var(--stitch-bg-inverted)',
  };
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-block',
        width: size,
        aspectRatio: '1 / 1.12',
        background: 'var(--stitch-cat-1)', // periwinkle
        borderRadius:
          'var(--stitch-radius-button) var(--stitch-radius-button) var(--stitch-radius-card) var(--stitch-radius-card)',
        boxShadow: 'var(--stitch-shadow-base)', // 同瓦片的淡紫环境光晕
        position: 'relative',
        verticalAlign: inline ? '-0.14em' : 'middle',
        flex: 'none',
      }}
    >
      <span style={{ ...eye, left: '26%' }} />
      <span style={{ ...eye, left: '59%' }} />
    </span>
  );
}

// Logo 字标：幽灵标记 + 'Phantom' 字标（display 字族、恒 350、紧字距；亮底 aubergine 文字）。
function Brand({ onDark = false }: { onDark?: boolean }) {
  return (
    <span style={row('var(--stitch-space-8)')}>
      <Ghost size="1.35em" />
      <span
        style={{
          fontFamily: 'var(--stitch-font-display)',
          fontSize: 'var(--stitch-font-size-lg)',
          fontWeight: 'var(--stitch-font-weight-normal)',
          letterSpacing: 'var(--stitch-tracking-subheading)',
          color: onDark ? 'var(--stitch-text-on-dark)' : 'var(--stitch-brand)',
          lineHeight: 1,
        }}
      >
        Phantom
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// 连接件外壳
// ---------------------------------------------------------------------------
/** 通栏区块：背景 full-bleed（淡紫画布），内部正文列收 page-max-width 居中，上下留白各出半个
 *  section-gap → 相邻区块之间正好 = section-gap（64px 节奏）。phantom 铺底恒淡紫平面——**无 dark
 *  tone**（深色只作瓦片、不通栏，见文件头「取舍 1」），故本组件不提供反色带。 */
function Band({
  children,
  tight = false,
}: {
  children: ReactNode;
  tight?: boolean;
}) {
  return (
    <section
      style={{
        position: 'relative',
        background: CANVAS,
        color: 'var(--stitch-text-primary)',
        paddingBlock: tight
          ? 'var(--stitch-space-16)'
          : 'calc(var(--stitch-section-gap) / 2)',
        paddingInline: 'var(--stitch-space-24)',
        overflowX: 'clip',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--stitch-page-max-width)',
          marginInline: 'auto',
          width: '100%',
        }}
      >
        {children}
      </div>
    </section>
  );
}

/** 实心糖色 / 深色瓦片（招牌 bento 单元 · 连接件 · 见文件头「取舍 2」）：bg 读 var(--stitch-cat-N)
 *  或深瓦 var，罩统一淡紫环境光晕（shadow-base），24px 柔角，慷慨内距。深瓦上文字走 text-on-dark，
 *  糖色瓦上走 text-primary（obsidian）——尊重原站长相、不「纠正」浅底上深字的刻意配色。内部装真组件。 */
type TileFill =
  | 'periwinkle' // cat-1
  | 'cornflower' // cat-2
  | 'buttercream' // cat-3
  | 'blush' // cat-4
  | 'fog' // bg-section 中性浅
  | 'lavender' // accent 主 CTA 面
  | 'aubergine' // bg-inverted 深瓦
  | 'obsidian'; // text-primary 近黑深瓦

const FILL: Record<TileFill, { bg: string; dark: boolean }> = {
  periwinkle: { bg: 'var(--stitch-cat-1)', dark: false },
  cornflower: { bg: 'var(--stitch-cat-2)', dark: false },
  buttercream: { bg: 'var(--stitch-cat-3)', dark: false },
  blush: { bg: 'var(--stitch-cat-4)', dark: false },
  fog: { bg: 'var(--stitch-bg-section)', dark: false },
  lavender: { bg: 'var(--stitch-accent)', dark: false },
  aubergine: { bg: 'var(--stitch-bg-inverted)', dark: true },
  obsidian: { bg: 'var(--stitch-text-primary)', dark: true },
};

function Tile({
  fill,
  children,
  style,
}: {
  fill: TileFill;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const f = FILL[fill];
  return (
    <div
      style={{
        background: f.bg,
        color: f.dark
          ? 'var(--stitch-text-on-dark)'
          : 'var(--stitch-text-primary)',
        borderRadius: 'var(--stitch-radius-card)', // 24px 柔角
        boxShadow: 'var(--stitch-shadow-base)', // 全瓦统一淡紫环境光晕（唯一阴影）
        padding: 'var(--stitch-card-padding)', // 48px 慷慨内距
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 数据（真组件 Stat / LineChart / BarChart 用）
// ---------------------------------------------------------------------------
const balance = [
  { month: '一月', value: 12400 },
  { month: '二月', value: 13850 },
  { month: '三月', value: 13120 },
  { month: '四月', value: 15600 },
  { month: '五月', value: 17240 },
  { month: '六月', value: 19080 },
];
const volume = [
  { day: '一', tx: 32 },
  { day: '二', tx: 41 },
  { day: '三', tx: 38 },
  { day: '四', tx: 52 },
  { day: '五', tx: 47 },
  { day: '六', tx: 29 },
  { day: '日', tx: 24 },
];
const usd = (v: number) => `$${v.toLocaleString('en-US')}`;
const plain = (v: number) => v.toLocaleString('en-US');

// bento 招牌网格：实心糖瓦 + 深瓦混排，每块一个真组件。
const bento: {
  fill: TileFill;
  title: string;
  body: string;
  slot: 'stat' | 'tag' | 'link' | 'success';
}[] = [
  {
    fill: 'periwinkle',
    title: '一眼看全资产',
    body: '多链余额收进同一枚薰衣草卡片，切换网络零等待，账目安静而清楚。',
    slot: 'stat',
  },
  {
    fill: 'aubergine',
    title: '隐身模式',
    body: '本地签名、私钥不出设备；进入私密态，界面沉入深紫，只有你看得见。',
    slot: 'tag',
  },
  {
    fill: 'buttercream',
    title: '秒级结算',
    body: '一次确认即达，Gas 估算内联在按钮旁，付款像递出一张糖纸一样轻。',
    slot: 'link',
  },
  {
    fill: 'cornflower',
    title: '多链聚合',
    body: '主流网络一键接入，跨链路由自动择优，复杂留给我们、清晰留给你。',
    slot: 'stat',
  },
  {
    fill: 'blush',
    title: '实时信号',
    body: '到账、异动、价格触发即时提醒，重要的事第一时间浮到眼前。',
    slot: 'success',
  },
  {
    fill: 'obsidian',
    title: '端到端加密',
    body: '备份以你的密钥加密，任何环节都读不到明文；近黑之下，只余轮廓。',
    slot: 'tag',
  },
];

const testimonials = [
  {
    fill: 'periwinkle' as TileFill,
    fallback: '林',
    name: '林晚',
    role: '独立开发者',
    quote: '第一次觉得钱包可以这么轻——薰衣草底色加一只幽灵，紧张感就没了。',
    score: '5.0',
  },
  {
    fill: 'blush' as TileFill,
    fallback: '周',
    name: '周知',
    role: '设计负责人 · Northwind',
    quote: '药丸几何和低语字重是一整套语言，换到别的钱包再也回不去了。',
    score: '4.9',
  },
];

const plans = [
  {
    name: '轻语',
    price: '$0',
    period: '永久免费',
    features: ['单设备', '多链余额', '基础提醒'],
    featured: false,
  },
  {
    name: '幽灵',
    price: '$8',
    period: '每月',
    features: ['多设备同步', '隐身模式', '实时信号', '优先支持'],
    featured: true,
  },
  {
    name: '典藏',
    price: '定制',
    period: '联系我们',
    features: ['团队金库', '专属 SLA', '安全审计'],
    featured: false,
  },
];

const footerGroups = [
  { title: '产品', links: ['功能', '定价', '更新日志', '路线图'] },
  { title: '资源', links: ['文档', '开发者', '博客', '社区'] },
  { title: '公司', links: ['关于', '招聘', '联系', '媒体'] },
];

const faqItems: AccordionItem[] = [
  {
    key: 'custody',
    header: '我的私钥保存在哪里？',
    children: (
      <p style={body}>
        私钥只在你的设备本地生成与签名，永不上传；备份以你自己的密钥端到端加密。
      </p>
    ),
  },
  {
    key: 'chains',
    header: '支持哪些网络？',
    children: (
      <p style={body}>
        主流公链一键接入，跨链路由自动择优；新增网络随版本持续扩充，无需重装。
      </p>
    ),
  },
  {
    key: 'themes',
    header: '这套界面是怎么做到跨站换肤的？',
    children: (
      <p style={body}>
        组件只读 <code>--stitch-*</code> 角色契约，phantom
        在自己的适配层填淡紫糖色；切站即整站换肤，组件代码一字不改。
      </p>
    ),
  },
];

// 导航链接（rules「药丸导航栏」：Features / Learn / Explore / Company / Support，各带 4px 人字形指示）。
const navLinks = ['Features', 'Learn', 'Explore', 'Company', 'Support'];

// ---------------------------------------------------------------------------
// 页面
// ---------------------------------------------------------------------------
export default function PhantomLanding() {
  return (
    <div
      style={{
        minWidth: 0,
        background: CANVAS, // 淡紫近白平面，纯平到底
        color: 'var(--stitch-text-primary)',
        fontFamily: 'var(--stitch-font-body)',
      }}
    >
      {/* ---- 药丸导航（sticky · 实心白药丸 · 玻璃全禁，不磨砂）---- */}
      <Band tight>
        <nav
          style={{
            position: 'sticky',
            top: 'var(--stitch-space-16)',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--stitch-space-24)',
            flexWrap: 'wrap',
            // 实心白药丸容器（满 100px 圆角）+ 淡紫环境光晕（唯一阴影）
            background: 'var(--stitch-bg-card)',
            borderRadius: 'var(--stitch-radius-button)',
            boxShadow: 'var(--stitch-shadow-base)',
            padding: 'var(--stitch-space-12) var(--stitch-space-24)',
          }}
        >
          <Brand />
          <div style={row('var(--stitch-space-4)')}>
            {navLinks.map((l) => (
              // 导航链接 + 4px 人字形指示（chevron-down 走 <Icon>，非裸 svg）
              <Button
                key={l}
                type="link"
                icon={<Icon name="chevron-down" size={14} />}
              >
                {l}
              </Button>
            ))}
          </div>
          <div style={row('var(--stitch-space-8)')}>
            {/* 头部搜索图标按钮（纯图标、描边 aubergine，走 <Icon> + aria-label）*/}
            <Button
              type="text"
              aria-label="搜索"
              icon={<Icon name="search" size={18} />}
            />
            {/* 导航内主 CTA：Ghost Lavender 填充药丸（type=primary → accent 面 + accent-text 深字 + 光晕）*/}
            <Button type="primary" icon={<Icon name="download" size={16} />}>
              下载
            </Button>
          </div>
        </nav>
      </Band>

      {/* ---- Hero：低语巨型标题（幽灵替换 Phantom 的元音 o）+ 副标 + 药丸 CTA 行，
              下接全宽圆角深瓦「视频秀」框（obsidian 实瓦 + 光晕 + play 可供性）---- */}
      <Band>
        <div style={stack('var(--stitch-space-48)')}>
          <div
            style={{ ...stack('var(--stitch-space-24)'), maxWidth: '46rem' }}
          >
            <h1 style={display}>
              把每一笔，收进{' '}
              <span style={{ whiteSpace: 'nowrap' }}>
                Phant
                <Ghost size="0.72em" inline />m
              </span>
              。
            </h1>
            <p style={{ ...lead, maxWidth: '34rem' }}>
              一枚淡紫糖果铺般的自托管钱包——多链资产、隐身签名、实时信号，都收进柔软的药丸里。
            </p>
            <div style={row()}>
              {/* 主 CTA：Ghost Lavender 填充药丸（唯一靠光晕显形的浅上加浅按钮）*/}
              <Button type="primary" size="large">
                免费下载
              </Button>
              {/* 次要行动：ghost 透明药丸 + play 图标 */}
              <Button
                type="default"
                ghost
                size="large"
                icon={<Icon name="play" size={18} />}
              >
                看演示
              </Button>
            </div>
          </div>

          {/* 全宽圆角「视频秀」框（见文件头 Hero 取舍）：真 AspectRatio 16:9 + obsidian 深瓦 + 光晕，
              居中一枚 play 可供性 + 静音自动循环说明；忠实复刻满宽圆角视频门面，不臆造影像。 */}
          <div
            style={{
              borderRadius: 'var(--stitch-radius-card)',
              boxShadow: 'var(--stitch-shadow-base)',
              overflow: 'hidden',
            }}
          >
            <AspectRatio ratio={16 / 9}>
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'var(--stitch-text-primary)', // 近黑 obsidian 深瓦
                  color: 'var(--stitch-text-on-dark)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--stitch-space-16)',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 'var(--stitch-space-64)',
                    height: 'var(--stitch-space-64)',
                    borderRadius: 'var(--stitch-radius-button)',
                    background: 'var(--stitch-accent)',
                    color: 'var(--stitch-accent-text)',
                    boxShadow: 'var(--stitch-shadow-base)',
                  }}
                >
                  <Icon name="play" label="播放产品短片" size={24} />
                </span>
                <span
                  style={{ ...caption, color: 'var(--stitch-text-on-dark)' }}
                >
                  产品短片 · 静音自动循环
                </span>
              </div>
            </AspectRatio>
          </div>
        </div>
      </Band>

      {/* ---- Bento 招牌网格：实心彩糖瓦 + 深瓦混排，每块罩统一淡紫光晕，内部装真组件 ---- */}
      <Band>
        <div style={stack('var(--stitch-space-40)')}>
          <div
            style={{ ...stack('var(--stitch-space-12)'), maxWidth: '40rem' }}
          >
            <h2 style={headingLg}>一整片糖果货架的能力。</h2>
            <p style={lead}>
              每块瓦片一种糖色、一件真组件——薰衣草与深紫并排，浮在同一层薄光里。
            </p>
          </div>
          <div style={grid('300px')}>
            {bento.map((b) => (
              <Tile
                key={b.title}
                fill={b.fill}
                style={stack('var(--stitch-space-16)')}
              >
                <h3
                  style={{
                    ...headingSm,
                    color: FILL[b.fill].dark
                      ? 'var(--stitch-text-on-dark)'
                      : 'var(--stitch-text-primary)',
                  }}
                >
                  {b.title}
                </h3>
                <p
                  style={{
                    ...body,
                    color: FILL[b.fill].dark
                      ? 'var(--stitch-text-on-dark)'
                      : 'var(--stitch-text-primary)',
                  }}
                >
                  {b.body}
                </p>
                {/* 每块瓦一件真组件（Stat / Tag / Button / 成功徽章）*/}
                {b.slot === 'stat' && (
                  <Stat
                    title={b.fill === 'periwinkle' ? '总资产' : '接入网络'}
                    value={b.fill === 'periwinkle' ? 19080 : 14}
                    prefix={b.fill === 'periwinkle' ? '$' : undefined}
                    caption={
                      b.fill === 'periwinkle' ? '本月 +9.4%' : '持续扩充'
                    }
                  />
                )}
                {b.slot === 'tag' && (
                  <div style={row('var(--stitch-space-8)')}>
                    <Tag variant="solid" color="cat-1" size="small">
                      隐私优先
                    </Tag>
                    <Tag variant="outlined" color="cat-1" size="small">
                      本地签名
                    </Tag>
                  </div>
                )}
                {b.slot === 'link' && (
                  // See More 药丸链接（Ghost Lavender 填充 + 对角箭头）—— rules「See More 链接按钮」
                  <div>
                    <Button
                      type="primary"
                      size="small"
                      icon={<Icon name="arrow-up-right" size={16} />}
                    >
                      了解结算
                    </Button>
                  </div>
                )}
                {b.slot === 'success' && (
                  // 成功徽章（Mint Signal cat-6，少用）—— rules「成功徽章」
                  <div>
                    <Tag variant="solid" color="cat-6" size="small">
                      实时在线
                    </Tag>
                  </div>
                )}
              </Tile>
            ))}
          </div>
        </div>
      </Band>

      {/* ---- 指标带：真 StatGroup / Stat（趋势走 caption 灰字，不引饱和绿/红——尊重 phantom 窄调色板）---- */}
      <Band>
        <div style={stack('var(--stitch-space-24)')}>
          <h2 style={heading}>被安静地信任着。</h2>
          <StatGroup>
            <Stat title="活跃钱包" value={128000} caption="覆盖 40+ 网络" />
            <Stat
              title="月度结算额"
              value={4.2}
              precision={1}
              prefix="$"
              suffix="B"
              caption="连续六个月增长"
            />
            <Stat
              title="到账中位耗时"
              value={1.8}
              precision={1}
              suffix="s"
              caption="全网平均"
            />
            <Stat
              title="可用性"
              value={99.98}
              precision={2}
              suffix="%"
              caption="过去一年"
            />
          </StatGroup>
        </div>
      </Band>

      {/* ---- 图表：真 LineChart / BarChart（系列色从 cat-* 槽取、随站换肤——phantom 下即薰衣草 / 矢车菊蓝）。
              盛在中性浅色内容卡（真 Card，24px 柔角 + 淡紫光晕）---- */}
      <Band>
        <div style={stack('var(--stitch-space-40)')}>
          <div
            style={{ ...stack('var(--stitch-space-12)'), maxWidth: '40rem' }}
          >
            <h2 style={heading}>数据也随主题一起换肤。</h2>
            <p style={lead}>
              分类色只从契约色槽取值，切到 phantom
              即成薰衣草与矢车菊蓝——组件代码一字不改。
            </p>
          </div>
          <div style={grid('320px')}>
            <Card variant="filled">
              <div style={stack('var(--stitch-space-16)')}>
                <h3 style={subheading}>资产走势</h3>
                <LineChart
                  data={balance}
                  xField="month"
                  series={[{ dataKey: 'value', name: '总资产' }]}
                  area
                  smooth
                  height={240}
                  valueFormatter={usd}
                  ariaLabel="上半年总资产面积图"
                />
              </div>
            </Card>
            <Card variant="filled">
              <div style={stack('var(--stitch-space-16)')}>
                <h3 style={subheading}>每日交易</h3>
                <BarChart
                  data={volume}
                  xField="day"
                  series={[{ dataKey: 'tx', name: '笔数' }]}
                  height={240}
                  valueFormatter={plain}
                  ariaLabel="一周逐日交易笔数柱状图"
                />
              </div>
            </Card>
          </div>
        </div>
      </Band>

      {/* ---- 证言：实心糖瓦（真 Avatar + 引文）；评分数值（无 ★ 符号，同 seline 红线取舍）---- */}
      <Band>
        <div style={stack('var(--stitch-space-40)')}>
          <h2 style={heading}>用户怎么说。</h2>
          <div style={grid('320px')}>
            {testimonials.map((t) => (
              <Tile
                key={t.name}
                fill={t.fill}
                style={stack('var(--stitch-space-16)')}
              >
                <p style={caption}>
                  <span style={{ color: 'var(--stitch-text-primary)' }}>
                    {t.score}
                  </span>{' '}
                  / 5.0
                </p>
                <p
                  style={{ ...subheading, color: 'var(--stitch-text-primary)' }}
                >
                  「{t.quote}」
                </p>
                <div style={row('var(--stitch-space-12)')}>
                  <Avatar fallback={t.fallback} size="middle" />
                  <span style={stack('0')}>
                    <span
                      style={{
                        fontSize: 'var(--stitch-font-size-base)',
                        fontWeight: 'var(--stitch-font-weight-normal)',
                        color: 'var(--stitch-text-primary)',
                      }}
                    >
                      {t.name}
                    </span>
                    <span
                      style={{
                        fontSize: 'var(--stitch-font-size-sm)',
                        color: 'var(--stitch-text-primary)',
                      }}
                    >
                      {t.role}
                    </span>
                  </span>
                </div>
              </Tile>
            ))}
          </div>
        </div>
      </Band>

      {/* ---- 定价：3 张卡；主推卡 = 实心薰衣草糖瓦（lavender accent 面）领起 + 主 CTA；余为中性浅卡 ---- */}
      <Band>
        <div style={stack('var(--stitch-space-40)')}>
          <div
            style={{ ...stack('var(--stitch-space-12)'), maxWidth: '40rem' }}
          >
            <h2 style={heading}>选一个适合你的方案。</h2>
            <p style={lead}>透明定价，随时可升可降。</p>
          </div>
          <div style={grid('260px')}>
            {plans.map((p) => {
              const inner = (
                <div style={stack('var(--stitch-space-16)')}>
                  {p.featured && (
                    <div>
                      <Tag variant="solid" color="cat-6" size="small">
                        最受欢迎
                      </Tag>
                    </div>
                  )}
                  <h3 style={subheading}>{p.name}</h3>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 'var(--stitch-space-8)',
                    }}
                  >
                    <span style={headingSm}>{p.price}</span>
                    <span style={caption}>{p.period}</span>
                  </div>
                  <ul
                    style={{
                      ...stack('var(--stitch-space-8)'),
                      listStyle: 'none',
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    {p.features.map((feat) => (
                      <li
                        key={feat}
                        style={{
                          ...row('var(--stitch-space-8)'),
                          fontSize: 'var(--stitch-font-size-base)',
                          color: 'var(--stitch-text-primary)',
                        }}
                      >
                        <Icon name="check" label="包含" size={16} />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <Button type={p.featured ? 'primary' : 'default'} block>
                    选择{p.name}
                  </Button>
                </div>
              );
              // 主推卡是实心薰衣草糖瓦（连接件 Tile）；其余走真 Card outlined（中性浅卡 + 光晕）。
              return p.featured ? (
                <Tile key={p.name} fill="lavender">
                  {inner}
                </Tile>
              ) : (
                <Card key={p.name} variant="outlined">
                  {inner}
                </Card>
              );
            })}
          </div>
        </div>
      </Band>

      {/* ---- FAQ：真 Accordion ---- */}
      <Band>
        <div style={{ ...stack('var(--stitch-space-24)'), maxWidth: '48rem' }}>
          <h2 style={heading}>常见问题。</h2>
          <Accordion items={faqItems} defaultValue="custody" />
        </div>
      </Band>

      {/* ---- CTA：实心薰衣草糖瓦（**非满幅暗幕**——深色只作瓦片，见文件头「取舍 1」）+ 主 CTA ---- */}
      <Band>
        <Tile
          fill="lavender"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--stitch-space-24)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ ...stack('var(--stitch-space-8)'), maxWidth: '40rem' }}>
            <h2 style={heading}>把资产收进糖果铺。</h2>
            <p style={lead}>
              五分钟创建第一个钱包，多链、隐身、实时信号都在手边。
            </p>
          </div>
          <div style={row()}>
            <Button type="primary" size="large">
              免费下载
            </Button>
            <Button type="default" ghost size="large">
              联系我们
            </Button>
          </div>
        </Tile>
      </Band>

      {/* ---- Footer：品牌列 + 三链接组（真 Button link）+ Divider + 底部条 ---- */}
      <Band>
        <div style={stack('var(--stitch-space-40)')}>
          <div
            style={{
              display: 'flex',
              gap: 'var(--stitch-space-40)',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                ...stack('var(--stitch-space-16)'),
                flex: '1 1 260px',
                maxWidth: '34ch',
              }}
            >
              <Brand />
              <p style={body}>
                黄昏薰衣草糖果铺里的自托管钱包——一套 React
                组件、一套角色契约，构建时切换成不同网站的风格。
              </p>
            </div>
            <div
              style={{
                flex: '2 1 380px',
                display: 'flex',
                gap: 'var(--stitch-space-24)',
                flexWrap: 'wrap',
              }}
            >
              {footerGroups.map((g) => (
                <div
                  key={g.title}
                  style={{
                    ...stack('var(--stitch-space-4)'),
                    alignItems: 'flex-start',
                    flex: '1 1 120px',
                  }}
                >
                  <span
                    style={{
                      ...subheading,
                      // 链接组用真 Button type="link"（padding 0 spacing-lg=16px），标题须补同宽
                      // 横向内距，左缘才与链接文字齐——否则标题外凸 16px（footer 三列显歪）。
                      // 与 seline/steep 同款修法，token 取 spacing-lg（= Button 自身左内距）。
                      paddingInline: 'var(--stitch-spacing-lg)',
                      marginBottom: 'var(--stitch-space-4)',
                    }}
                  >
                    {g.title}
                  </span>
                  {g.links.map((l) => (
                    <Button key={l} type="link">
                      {l}
                    </Button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <Divider />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 'var(--stitch-space-12)',
              flexWrap: 'wrap',
            }}
          >
            <p style={caption}>
              © 2026 Phantom · 版式样例，per-site 落地页综合换肤演示。
            </p>
            <div style={row('var(--stitch-space-8)')}>
              <Button type="link" size="small">
                隐私
              </Button>
              <Button type="link" size="small">
                条款
              </Button>
            </div>
          </div>
        </div>
      </Band>
    </div>
  );
}
