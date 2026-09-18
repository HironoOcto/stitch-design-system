// demo/layouts/landing/seline/index.tsx —— 「Landing」的 **seline 版**落地页（per-site 版式）
//
// 每个真实主题一个自包含子目录；分发器 demo/layouts/landing/index.tsx 按 active-site
// 分发到这里。registry 的 glob 只扫单层 `/demo/layouts/*/index.tsx`，本子目录不会被
// 误当成独立 layout 条目（与 steep/ 同例）。
//
// 设计一律读 skills/stitch-design-system 的 seline 预置得出（style.md → rules.md →
// composition.md），非照抄任何 prompt。seline = 暖石灰纸面上的**极简拼贴 · 近单色分析师案头**：
//   · 铺底**纯平到底**——暖石灰纸底（bg-canvas #fafaf9），无全出血位图 / 无颗粒 / 无 mesh /
//     无彩色渐变；全站唯一渐变是区块边缘一道**近白→透明的 achromatic 功能性淡出**；
//   · Roobert 大标题**恒 weight 400**（永不加粗），靠字号立威；正文 Inter 14px；
//   · 全站彩度预算 = **一支青**：每条标题**恰好一处**柔蓝高亮 wash（sky-wash 药丸底 + 蓝字），
//     青色填充 CTA 是屏上**唯一**色彩填充控件；其余全是石灰中性；
//   · 内容卡 = 白面 + 1px 发丝边（边框即结构）+ 极淡软影（outlined）；**唯一**浮起的产品预览
//     吃那道深软大扩散影（elevated → shadow-lg）并施 grayscale(1) contrast(0.94) 静音为单色材质；
//   · 产品预览做**缩放 + 几度旋转 + 负位移**的贴纸式拼贴；**刻意无暗幕**（全站零反色全出血区）；
//   · 玻璃只给站 chrome：sticky 顶栏磨砂（~60% 白 + 12px blur），内容面从不上玻璃。
//
// 连接件（band 外壳 / 网格 / 高亮 span / logo 标 / 磨砂栏）**只读 var(--stitch-*)**：
// 色 / 圆角 / 字体 / 间距一律走角色变量，绝不落 hex（数值几何——旋转角、模糊半径、贴纸位移
// 的 px——非主题值，与 steep / phantom 同例）。交互 / 展示元素一律是经
// @octohirono/stitch-design-system import 的**真组件**。
//
// 两处对全局红线（禁裸 SVG / 禁 Unicode 符号，AGENTS 硬规则高于预置文档）的**刻意取舍**：
//   1) rules.md 的「★ 星级信任行」——无 star 图标、★ 是 Unicode 符号、禁裸 SVG，故信任行改用
//      **数值评分 + 平台名内联**（保「无卡片外壳、内联文案流」的意图，去掉不合规的星字符）。
//   2) composition/rules 的「灰阶轮廓吉祥物贴纸」——是需内联的轮廓 SVG 内容资产，禁裸 SVG 且
//      demo 无该素材，故**不放**吉祥物（红线高于合成层的可选点睛）；composition 其余承重项
//      （纯平铺底 / 无暗幕 / 缩放旋转拼贴 / 唯一软影预览 / 灰阶材质 / 单处青高亮 / 玻璃只给 chrome）**全数落地**。

import type { CSSProperties, ReactNode } from 'react';
import {
  Accordion,
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
// 连接件字阶（Roobert 显示标题恒 400 + Inter 正文；只读角色变量）
// ---------------------------------------------------------------------------
// display 52px / heading-sm 32px / subheading 20px —— 紧负字距走 tracking-* 角色变量，
// weight 恒 normal（400），靠尺寸与青色高亮 span 立层级，绝不升 500/600 加粗。
const display: CSSProperties = {
  fontFamily: 'var(--stitch-font-display)',
  fontSize: 'var(--stitch-text-display)',
  lineHeight: 'var(--stitch-leading-display)',
  letterSpacing: 'var(--stitch-tracking-display)',
  fontWeight: 'var(--stitch-font-weight-normal)',
  color: 'var(--stitch-text-primary)',
  margin: 0,
  textWrap: 'balance',
};
const heading: CSSProperties = {
  fontFamily: 'var(--stitch-font-display)',
  fontSize: 'var(--stitch-text-heading-sm)',
  lineHeight: 'var(--stitch-leading-heading-sm)',
  letterSpacing: 'var(--stitch-tracking-heading-sm)',
  fontWeight: 'var(--stitch-font-weight-normal)',
  color: 'var(--stitch-text-primary)',
  margin: 0,
  textWrap: 'balance',
};
// 卡内小标：subheading 20px，仍 Roobert 恒 400（seline 标题永不加粗，混 Inter 破坏层级）。
const cardTitle: CSSProperties = {
  fontFamily: 'var(--stitch-font-display)',
  fontSize: 'var(--stitch-text-subheading)',
  lineHeight: 'var(--stitch-leading-subheading)',
  letterSpacing: 'var(--stitch-tracking-subheading)',
  fontWeight: 'var(--stitch-font-weight-normal)',
  color: 'var(--stitch-text-primary)',
  margin: 0,
};
// 引导副标：body-lg 16px Inter。
const lead: CSSProperties = {
  fontFamily: 'var(--stitch-font-body)',
  fontSize: 'var(--stitch-text-body-lg)',
  lineHeight: 'var(--stitch-leading-body-lg)',
  letterSpacing: 'var(--stitch-tracking-body-lg)',
  color: 'var(--stitch-text-secondary)',
  margin: 0,
};
// 主导正文：14px Inter weight 400。行高走 var(--stitch-line-height-base)——rules.md 记「1.64」
// 是散文意图，但 tokens.css 该站发出的 line-height-base = 1.5；权威顺序「源码/tokens 赢过 rules」
// （见 AGENTS.md），故取 token 值、不落 1.64 字面量（连接件只读 var 的硬纪律同样要求这个）。
const body: CSSProperties = {
  fontFamily: 'var(--stitch-font-body)',
  fontSize: 'var(--stitch-font-size-base)',
  lineHeight: 'var(--stitch-line-height-base)',
  color: 'var(--stitch-text-secondary)',
  margin: 0,
};

/** seline 招牌强调设备：每条标题**恰好一处**柔蓝高亮 wash——sky-wash 药丸底 + 蓝字，weight 继承 400。
 *  这处承载整条标题的全部彩度预算，绝不进正文 / 导航，一条标题最多一个（克制即要点）。
 *  white-space: nowrap 让高亮短语整体成一枚不裂的药丸（需要时整段折到下一行、绝不从词中撕开）；
 *  box-decoration-break: clone 兜底万一仍换行时每行各自成盒、不被拉裂。 */
function Hl({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        background: 'var(--stitch-bg-accent)',
        color: 'var(--stitch-text-on-accent)',
        borderRadius: 'var(--stitch-radius-button)',
        padding: '0 0.28em',
        whiteSpace: 'nowrap',
        boxDecorationBreak: 'clone',
        WebkitBoxDecorationBreak: 'clone',
      }}
    >
      {children}
    </span>
  );
}

const stack = (gap = 'var(--stitch-space-16)'): CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  gap,
});
const grid = (min: string): CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fit, minmax(${min}, 1fr))`,
  gap: 'var(--stitch-space-24)',
});

// ---------------------------------------------------------------------------
// 连接件外壳（页面尺度层：page-max-width 1200 / section-gap 96 / space-*）
// ---------------------------------------------------------------------------
/** 通栏区块：背景 full-bleed 贴边，内部正文列收 page-max-width 居中，上下留白各出半个
 *  section-gap → 相邻区块之间正好 = section-gap（96px 编辑式呼吸）。
 *  seline 铺底恒纯平：paper 带透明（透出纸底本色）、raise 带用白面（bg-card）在纸上抬一步；
 *  **无 dark tone**——seline 刻意无暗幕，本组件不提供反色带。 */
function Band({
  tone = 'paper',
  children,
  tight = false,
  edgeFade = false,
}: {
  tone?: 'paper' | 'raise';
  children: ReactNode;
  tight?: boolean;
  edgeFade?: boolean;
}) {
  return (
    <section
      style={{
        position: 'relative',
        background:
          tone === 'raise'
            ? 'var(--stitch-bg-card)'
            : 'var(--stitch-bg-canvas)',
        color: 'var(--stitch-text-primary)',
        // raise 带与纸底同为浅色、无强对比，上缘描一道发丝边区分层级（边框即结构）。
        borderBlock:
          tone === 'raise'
            ? 'var(--stitch-border-width) solid var(--stitch-border)'
            : undefined,
        paddingBlock: tight
          ? 'var(--stitch-space-16)'
          : 'calc(var(--stitch-section-gap) / 2)',
        paddingInline: 'var(--stitch-space-24)',
        overflowX: 'clip',
      }}
    >
      {/* 全站唯一允许的渐变：区块顶缘一道近白→透明的 achromatic 功能性淡出（柔化边缘、非装饰色 wash）。 */}
      {edgeFade && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            insetInline: 0,
            top: 0,
            height: 'var(--stitch-space-40)',
            background:
              'linear-gradient(to bottom, var(--stitch-bg-card), transparent)',
            pointerEvents: 'none',
          }}
        />
      )}
      <div
        style={{
          position: 'relative',
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

/** Logo 字标：小型黑色火花标记（旋转方块 = 纯 CSS 几何抽象，非裸 SVG）+ 'Seline' 字标
 *  （Inter weight 500 · 14px · ink）；紧凑，居导航左侧。青色不进 logo——彩度只花在 CTA/高亮。 */
function Brand() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--stitch-space-8)',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 12,
          height: 12,
          background: 'var(--stitch-text-primary)',
          borderRadius: 'var(--stitch-radius-input)',
          transform: 'rotate(45deg)',
        }}
      />
      <span
        style={{
          fontFamily: 'var(--stitch-font-body)',
          fontSize: 'var(--stitch-font-size-base)',
          fontWeight: 'var(--stitch-font-weight-medium)',
          letterSpacing: '0.004em',
          color: 'var(--stitch-text-primary)',
          lineHeight: 1,
        }}
      >
        Seline
      </span>
    </span>
  );
}

/** 灰阶去彩 + 轻降对比的图像材质滤镜：把产品预览的数据色静音为近单色「素材」。 */
const muted: CSSProperties = { filter: 'grayscale(1) contrast(0.94)' };

// ---------------------------------------------------------------------------
// 数据
// ---------------------------------------------------------------------------
const engagement = [
  { week: '第 1 周', active: 62 },
  { week: '第 2 周', active: 68 },
  { week: '第 3 周', active: 71 },
  { week: '第 4 周', active: 78 },
];
const throughput = [
  { day: '一', tasks: 240 },
  { day: '二', tasks: 300 },
  { day: '三', tasks: 280 },
  { day: '四', tasks: 360 },
  { day: '五', tasks: 330 },
];
const revenue = [
  { month: '一月', revenue: 28200 },
  { month: '二月', revenue: 31500 },
  { month: '三月', revenue: 29800 },
  { month: '四月', revenue: 36400 },
  { month: '五月', revenue: 39100 },
  { month: '六月', revenue: 42076 },
];
const visitors = [
  { month: '一月', visitors: 3200 },
  { month: '二月', visitors: 4100 },
  { month: '三月', visitors: 3800 },
  { month: '四月', visitors: 5200 },
  { month: '五月', visitors: 4900 },
  { month: '六月', visitors: 6100 },
];
const pct = (v: number) => `${v}%`;
const compact = (v: number) => v.toLocaleString('en-US');
const usd = (v: number) => `$${v.toLocaleString('en-US')}`;

// 预览底部的 4 药丸 tab（rules「Tab Pill Group」：激活 Soot 填充白字、未激活透明 + 发丝边）。
const previewTabs = [
  { label: '概览', active: true },
  { label: '活跃', active: false },
  { label: '留存', active: false },
  { label: '收入', active: false },
];

// 导航中部社群佐证头像簇（signed-in avatar link：24px 圆、-8px 重叠）。
const proofAvatars = ['林', '周', '陈', '许'];

const features = [
  {
    icon: 'search' as const,
    title: '即时检索',
    body: '毫秒级返回结果，输入即所见，无需等待索引重建——像翻案头笔记一样顺手。',
  },
  {
    icon: 'send' as const,
    title: '一键发布',
    body: '从草稿到上线一步到位，多环境切换零配置，交付安静而确定。',
  },
  {
    icon: 'arrow-up-right' as const,
    title: '弹性扩容',
    body: '流量峰谷自动伸缩，只为真正用到的算力付费，账目一目了然。',
  },
];

// 证言（无卡片外壳，直接流于纸底；引文含一处内联青色高亮）。
const testimonials = [
  {
    fallback: '林',
    name: '林晚',
    role: '产品负责人 · Northwind',
    lead: '换肤这件事以前要开三个会，现在',
    hl: '改一个变量就全站跟着走',
    tail: '。',
    score: '5.0',
  },
  {
    fallback: '周',
    name: '周知',
    role: '前端负责人 · Contoso',
    lead: '同一套组件契约，四个品牌站共用，',
    hl: '维护成本直接砍半',
    tail: '。',
    score: '4.9',
  },
];

const plans = [
  {
    name: '入门',
    price: '$0',
    period: '永久免费',
    features: ['单个项目', '社区支持', '基础组件'],
    featured: false,
  },
  {
    name: '团队',
    price: '$29',
    period: '每席 / 每月',
    features: ['无限项目', '优先支持', '全部组件', '多站换肤'],
    featured: true,
  },
  {
    name: '企业',
    price: '定制',
    period: '联系我们',
    features: ['私有部署', '专属 SLA', '安全审计'],
    featured: false,
  },
];

const footerGroups = [
  { title: '产品', links: ['功能', '价格', '更新日志', '路线图'] },
  { title: '资源', links: ['文档', '示例', '博客', '社区'] },
  { title: '公司', links: ['关于', '招聘', '联系', '媒体'] },
];

const faqItems: AccordionItem[] = [
  {
    key: 'themes',
    header: '一套组件如何支持多个品牌站？',
    children: (
      <p style={body}>
        组件只读 <code>--stitch-*</code>{' '}
        角色契约，每站在自己的适配层填值；切站即整站换肤，组件代码一字不改。
      </p>
    ),
  },
  {
    key: 'migrate',
    header: '迁移现有页面成本高吗？',
    children: (
      <p style={body}>
        逐块替换即可，真组件与手写连接件可共存；先接管交互件，再收敛版式。
      </p>
    ),
  },
  {
    key: 'a11y',
    header: '无障碍是默认开启的吗？',
    children: (
      <p style={body}>
        是。焦点环、键盘可达、对比度都在组件层保证，跨主题也不掉。
      </p>
    ),
  },
];

// ---------------------------------------------------------------------------
// 浮动仪表盘预览（全站**唯一**吃 shadow-lg 抬升的元素；施灰阶材质滤镜；
// 真组件 Stat / LineChart + 底部 tab pill 组）。缩放旋转由外层拼贴壳负责。
// ---------------------------------------------------------------------------
function DashboardPreview() {
  return (
    <div
      style={{
        ...muted,
        background: 'var(--stitch-bg-card)',
        borderRadius: 'var(--stitch-radius-image)', // 16px：浮动预览专属圆角
        boxShadow: 'var(--stitch-shadow-lg)', // 全页唯一的深软大扩散影
        padding: 'var(--stitch-space-8)', // 内 8px padding 让仪表盘 UI 落在框内
      }}
    >
      <div
        style={{
          ...stack('var(--stitch-space-16)'),
          background: 'var(--stitch-bg-card)',
          borderRadius: 'var(--stitch-radius-card)',
          border: 'var(--stitch-border-width) solid var(--stitch-border)',
          padding: 'var(--stitch-space-24)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 'var(--stitch-space-16)',
            flexWrap: 'wrap',
          }}
        >
          <span style={cardTitle}>产品案头</span>
          <span style={{ ...body, fontSize: 'var(--stitch-text-caption)' }}>
            过去 4 周
          </span>
        </div>
        <StatGroup>
          <Stat title="周活跃" value={78} suffix="%" caption="较上周 +7" />
          <Stat title="任务吞吐" value={1510} caption="本周累计" />
          <Stat
            title="留存"
            value={94.2}
            precision={1}
            suffix="%"
            caption="30 日"
          />
        </StatGroup>
        <div style={grid('220px')}>
          <LineChart
            data={engagement}
            xField="week"
            series={[{ dataKey: 'active', name: '周活跃' }]}
            smooth
            height={150}
            valueFormatter={pct}
            ariaLabel="近四周周活跃率折线图"
          />
          <BarChart
            data={throughput}
            xField="day"
            series={[{ dataKey: 'tasks', name: '任务吞吐' }]}
            height={150}
            valueFormatter={compact}
            ariaLabel="一周逐日任务吞吐柱状图"
          />
        </div>
        {/* Tab pill 组：激活 Soot 填充白字、未激活透明 + 发丝边（rules「Tab Pill Group」规格）。
            预览内的静态标签条属连接件 chrome，只读 var（bg-inverted / text-on-dark / border）。 */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--stitch-space-8)',
            flexWrap: 'wrap',
          }}
        >
          {previewTabs.map((t) => (
            <span
              key={t.label}
              style={{
                fontFamily: 'var(--stitch-font-body)',
                fontSize: 'var(--stitch-font-size-base)',
                padding: '4px 16px',
                borderRadius: 'var(--stitch-radius-button)',
                background: t.active
                  ? 'var(--stitch-bg-inverted)'
                  : 'transparent',
                color: t.active
                  ? 'var(--stitch-text-on-dark)'
                  : 'var(--stitch-text-primary)',
                border: t.active
                  ? 'var(--stitch-border-width) solid transparent'
                  : 'var(--stitch-border-width) solid var(--stitch-border)',
              }}
            >
              {t.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 页面
// ---------------------------------------------------------------------------
export default function SelineLanding() {
  return (
    <div
      style={{
        minWidth: 0,
        background: 'var(--stitch-bg-canvas)', // 暖石灰纸面，纯平到底
        color: 'var(--stitch-text-primary)',
        fontFamily: 'var(--stitch-font-body)',
      }}
    >
      {/* ---- 磨砂半透明导航（玻璃只给站 chrome：~60% 白 + 12px blur）---- */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background:
            'color-mix(in srgb, var(--stitch-bg-card), transparent 40%)',
          backdropFilter: 'blur(12px)',
          borderBottom: 'var(--stitch-border-width) solid var(--stitch-border)',
        }}
      >
        <Band tight>
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--stitch-space-24)',
              flexWrap: 'wrap',
            }}
          >
            <Brand />
            {/* 导航链接居中（次要灰、weight 400、无填充无边框）*/}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--stitch-space-4)',
                flexWrap: 'wrap',
              }}
            >
              <Button type="link">产品</Button>
              <Button type="link">功能</Button>
              <Button type="link">文档</Button>
              <Button type="link">价格</Button>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--stitch-space-12)',
                flexWrap: 'wrap',
              }}
            >
              {/* 社群佐证头像簇（-8px 重叠）*/}
              <span
                style={{ display: 'inline-flex', paddingInlineStart: 8 }}
                aria-label="已加入的团队成员"
              >
                {proofAvatars.map((a) => (
                  <span key={a} style={{ marginInlineStart: -8 }}>
                    <Avatar fallback={a} size="small" />
                  </span>
                ))}
              </span>
              <Button type="link">登录</Button>
              {/* 站 chrome 常驻的唯一青色填充 CTA（页面最响的声音）*/}
              <Button type="primary">开始使用</Button>
            </div>
          </nav>
        </Band>
      </div>

      {/* ---- Hero：左对齐文字块（单一青高亮）+ 双 CTA 行 + 灰度伙伴行 + 数值信任行，
              下接全宽浮动仪表盘预览（缩放旋转贴纸拼贴，略微叠入下一区块）---- */}
      <Band>
        <div style={stack('var(--stitch-space-48)')}>
          <div
            style={{ ...stack('var(--stitch-space-24)'), maxWidth: '40rem' }}
          >
            <h1 style={display}>
              把复杂，收成 <Hl>清晰可行</Hl> 的秩序。
            </h1>
            <p style={{ ...lead, maxWidth: '34rem' }}>
              同一套 React
              组件、一套角色契约，构建时切换成不同网站的风格。设计语言与实现，从此说同一种话。
            </p>
            <div
              style={{
                display: 'flex',
                gap: 'var(--stitch-space-12)',
                flexWrap: 'wrap',
              }}
            >
              {/* 青药丸 + ghost 药丸（本区唯一青色填充 = primary）*/}
              <Button type="primary" size="large">
                免费开始
              </Button>
              <Button
                type="default"
                size="large"
                icon={<Icon name="play" size={18} />}
              >
                看演示
              </Button>
            </div>
            {/* 灰度伙伴行（无 logo 素材，以字标名代之；灰阶静音、内联文案流）*/}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--stitch-space-24)',
                flexWrap: 'wrap',
                ...muted,
              }}
            >
              <span style={{ ...body, fontSize: 'var(--stitch-text-caption)' }}>
                已被信任
              </span>
              {['Northwind', 'Contoso', 'Fabrikam', 'Tailspin'].map((p) => (
                <span
                  key={p}
                  style={{
                    fontFamily: 'var(--stitch-font-display)',
                    fontSize: 'var(--stitch-font-size-lg)',
                    fontWeight: 'var(--stitch-font-weight-normal)',
                    color: 'var(--stitch-text-muted)',
                    letterSpacing: 'var(--stitch-tracking-subheading)',
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
            {/* 信任行：红线取舍——无 ★ 字符（Unicode 符号）/ 无 star 图标 / 禁裸 SVG，
                改用数值评分 + 平台名内联（保「无卡片外壳、内联文案流」的意图）*/}
            <p style={{ ...body, color: 'var(--stitch-text-primary)' }}>
              <span style={{ fontWeight: 'var(--stitch-font-weight-medium)' }}>
                4.9 / 5.0
              </span>
              <span style={{ color: 'var(--stitch-text-secondary)' }}>
                {' '}
                · 来自 2,000+ 团队 · G2 · Capterra · Product Hunt
              </span>
            </p>
          </div>

          {/* 浮动预览拼贴：主预览略右倾贴纸式（-1.5°），角上叠一张更小的旋转灰阶 stat 贴纸
              （缩放 + 旋转 + 负位移 = seline 拼贴母题）；整簇底部负外距略叠入下一区块。 */}
          <div
            style={{
              position: 'relative',
              marginBottom: 'calc(-1 * var(--stitch-space-64))',
              zIndex: 1,
            }}
          >
            <div style={{ transform: 'rotate(-1.5deg)' }}>
              <DashboardPreview />
            </div>
            {/* 角上贴纸小卡：缩放 0.85 + 旋转 5° + 负位移，露出拼贴层叠关系 */}
            <div
              style={{
                position: 'absolute',
                right: 'calc(-1 * var(--stitch-space-8))',
                bottom: 'calc(-1 * var(--stitch-space-24))',
                width: 220,
                maxWidth: '46vw',
                transform: 'scale(0.85) rotate(5deg)',
                transformOrigin: 'bottom right',
                ...muted,
              }}
            >
              <Card variant="elevated">
                <div style={stack('var(--stitch-space-8)')}>
                  <Tag variant="text" color="cat-3" size="small">
                    New users
                  </Tag>
                  <Stat title="本周新增" value={3503} caption="较上周 +5.5×" />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Band>

      {/* ---- Feature：标题（单一青高亮）+ 3 张平白 feature 卡（16px 圆角 · 发丝边 · 无重影）---- */}
      <Band tone="raise" edgeFade>
        <div style={stack('var(--stitch-space-40)')}>
          <div
            style={{ ...stack('var(--stitch-space-12)'), maxWidth: '40rem' }}
          >
            <h2 style={heading}>
              把重复的活，<Hl>交给契约</Hl>。
            </h2>
            <p style={lead}>
              基元组件读同一套角色变量，换肤只改值不改结构——安静，也更省心。
            </p>
          </div>
          <div style={grid('260px')}>
            {features.map((f) => (
              <Card
                key={f.title}
                variant="outlined"
                // feature 卡专属 16px 圆角（rules「feature 卡 16px」= radius-image），
                // 覆盖 Card 默认的 radius-card(10px)；仍读角色变量。
                style={{ borderRadius: 'var(--stitch-radius-image)' }}
              >
                <div style={stack('var(--stitch-space-16)')}>
                  {/* 1px 描边轮廓图标（icon-stroke-width=1），色取 ink，从不填充 */}
                  <Icon name={f.icon} label={f.title} size={24} />
                  <h3 style={cardTitle}>{f.title}</h3>
                  <p style={{ ...body, color: 'var(--stitch-text-secondary)' }}>
                    {f.body}
                  </p>
                  {/* 文字链（可供性，不引第二处青色填充）*/}
                  <div>
                    <Button type="link">
                      了解更多
                      <Icon name="arrow-up-right" size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Band>

      {/* ---- 指标带：真 StatGroup / Stat（delta 走 caption 灰字，不走彩色 trend——不引入绿/红）---- */}
      <Band>
        <div style={stack('var(--stitch-space-24)')}>
          <h2 style={heading}>
            被很多团队<Hl>安静地信任</Hl>。
          </h2>
          <StatGroup>
            <Stat title="活跃团队" value={12400} caption="覆盖 40+ 行业" />
            <Stat
              title="月度增长"
              value={18}
              suffix="%"
              caption="连续六个季度"
            />
            <Stat
              title="服务可用性"
              value={99.98}
              precision={2}
              suffix="%"
              caption="过去一年"
            />
            <Stat title="组件数" value={48} caption="四件套齐备" />
          </StatGroup>
        </div>
      </Band>

      {/* ---- 图表：真 LineChart / BarChart（系列色从 cat-* 槽取、随站换肤——seline 下即 cyan/石灰）---- */}
      <Band tone="raise" edgeFade>
        <div style={stack('var(--stitch-space-40)')}>
          <div
            style={{ ...stack('var(--stitch-space-12)'), maxWidth: '40rem' }}
          >
            <h2 style={heading}>
              数据随主题<Hl>一起换肤</Hl>。
            </h2>
            <p style={lead}>
              分类色只从契约色槽取值，切站即整图跟随——组件代码一字不改。
            </p>
          </div>
          <div style={grid('320px')}>
            <Card variant="outlined">
              <div style={stack('var(--stitch-space-16)')}>
                <h3 style={cardTitle}>月度营收</h3>
                <LineChart
                  data={revenue}
                  xField="month"
                  series={[{ dataKey: 'revenue', name: '营收' }]}
                  area
                  height={240}
                  valueFormatter={usd}
                  ariaLabel="上半年月度营收面积图"
                />
              </div>
            </Card>
            <Card variant="outlined">
              <div style={stack('var(--stitch-space-16)')}>
                <h3 style={cardTitle}>独立访客</h3>
                <BarChart
                  data={visitors}
                  xField="month"
                  series={[{ dataKey: 'visitors', name: '独立访客' }]}
                  height={240}
                  valueFormatter={compact}
                  ariaLabel="上半年月度独立访客柱状图"
                />
              </div>
            </Card>
          </div>
        </div>
      </Band>

      {/* ---- 证言：无卡片外壳，直接流于纸底；引文含一处内联青色高亮 + 32px 头像 + 姓名/角色 ---- */}
      <Band>
        <div style={stack('var(--stitch-space-40)')}>
          <h2 style={heading}>
            用户<Hl>怎么说</Hl>。
          </h2>
          <div style={grid('320px')}>
            {testimonials.map((t) => (
              <div key={t.name} style={stack('var(--stitch-space-16)')}>
                {/* 评分数值（红线取舍，同上：不用 ★ 字符）*/}
                <p style={{ ...body, color: 'var(--stitch-text-secondary)' }}>
                  <span
                    style={{
                      color: 'var(--stitch-text-primary)',
                      fontWeight: 'var(--stitch-font-weight-medium)',
                    }}
                  >
                    {t.score}
                  </span>{' '}
                  / 5.0
                </p>
                <p
                  style={{
                    fontFamily: 'var(--stitch-font-body)',
                    fontSize: 'var(--stitch-text-body-lg)',
                    lineHeight: 'var(--stitch-leading-body-lg)',
                    color: 'var(--stitch-text-primary)',
                    margin: 0,
                  }}
                >
                  「{t.lead}
                  <Hl>{t.hl}</Hl>
                  {t.tail}」
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--stitch-space-12)',
                  }}
                >
                  <Avatar fallback={t.fallback} size="middle" />
                  <span style={stack('0')}>
                    <span
                      style={{
                        fontSize: 'var(--stitch-font-size-base)',
                        fontWeight: 'var(--stitch-font-weight-medium)',
                        color: 'var(--stitch-text-primary)',
                      }}
                    >
                      {t.name}
                    </span>
                    <span
                      style={{
                        fontSize: 'var(--stitch-font-size-sm)',
                        color: 'var(--stitch-text-secondary)',
                      }}
                    >
                      {t.role}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Band>

      {/* ---- 定价：3 张平白卡；主推卡靠**唯一青色填充 CTA**领起（其余 ghost），不引第二处青 ---- */}
      <Band tone="raise" edgeFade>
        <div style={stack('var(--stitch-space-40)')}>
          <div
            style={{ ...stack('var(--stitch-space-12)'), maxWidth: '40rem' }}
          >
            <h2 style={heading}>
              选一个<Hl>适合你</Hl>的方案。
            </h2>
            <p style={lead}>透明定价，随时可升可降。</p>
          </div>
          <div style={grid('240px')}>
            {plans.map((p) => (
              <Card key={p.name} variant="outlined">
                <div style={stack('var(--stitch-space-16)')}>
                  {p.featured && (
                    <div>
                      <Tag variant="outlined" size="small">
                        最受欢迎
                      </Tag>
                    </div>
                  )}
                  <h3 style={cardTitle}>{p.name}</h3>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 'var(--stitch-space-8)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--stitch-font-display)',
                        fontSize: 'var(--stitch-text-heading-sm)',
                        lineHeight: 'var(--stitch-leading-heading-sm)',
                        letterSpacing: 'var(--stitch-tracking-heading-sm)',
                        fontWeight: 'var(--stitch-font-weight-normal)',
                        color: 'var(--stitch-text-primary)',
                      }}
                    >
                      {p.price}
                    </span>
                    <span style={{ ...body, margin: 0 }}>{p.period}</span>
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
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--stitch-space-8)',
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
              </Card>
            ))}
          </div>
        </div>
      </Band>

      {/* ---- FAQ：真 Accordion ---- */}
      <Band>
        <div style={{ ...stack('var(--stitch-space-24)'), maxWidth: '48rem' }}>
          <h2 style={heading}>
            常见<Hl>问题</Hl>。
          </h2>
          <Accordion items={faqItems} defaultValue="themes" />
        </div>
      </Band>

      {/* ---- CTA：坐在纸上的平白卡（**无暗幕**——seline 刻意零反色全出血区）；
              标题一处青高亮 + 唯一青色填充 CTA + ghost 伴侣 ---- */}
      <Band>
        <div
          style={{
            background: 'var(--stitch-bg-card)',
            borderRadius: 'var(--stitch-radius-card)',
            border: 'var(--stitch-border-width) solid var(--stitch-border)',
            padding: 'var(--stitch-space-48)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--stitch-space-24)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ ...stack('var(--stitch-space-8)'), maxWidth: '40rem' }}>
            <h2 style={heading}>
              准备好<Hl>换肤</Hl>了吗？
            </h2>
            <p style={lead}>五分钟接入第一个组件，跨主题效果立等可见。</p>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 'var(--stitch-space-12)',
              flexWrap: 'wrap',
            }}
          >
            <Button type="primary" size="large">
              立即开始
            </Button>
            <Button type="default" size="large">
              联系我们
            </Button>
          </div>
        </div>
      </Band>

      {/* ---- Footer：品牌列 + 三链接组（真 Button link）+ Divider + 底部条 ---- */}
      <Band tone="raise">
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
                暖纸上的安静分析师案头——一套 React
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
                      fontFamily: 'var(--stitch-font-display)',
                      fontSize: 'var(--stitch-text-subheading)',
                      lineHeight: 'var(--stitch-leading-subheading)',
                      letterSpacing: 'var(--stitch-tracking-subheading)',
                      fontWeight: 'var(--stitch-font-weight-normal)',
                      color: 'var(--stitch-text-primary)',
                      // 链接组用真 Button type="link"（padding 0 spacing-lg=16px），标题须补同宽
                      // 横向内距，左缘才与链接文字齐——否则标题外凸 16px（footer 三列显歪）。
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
            <p style={{ ...body, fontSize: 'var(--stitch-text-caption)' }}>
              © 2026 Seline · 版式样例，per-site 落地页综合换肤演示。
            </p>
            <div style={{ display: 'flex', gap: 'var(--stitch-space-8)' }}>
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
