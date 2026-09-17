// demo/layouts/landing/_fallback.tsx —— 落地页分发管道的**回退版式**（theme-agnostic）
//
// 一套 theme-agnostic 结构、跨站换值：真组件（@octohirono/stitch-design-system import）
// 组合成整页，仅连接件（hero 外壳 / section 通栏带 / 网格）手写、只读 var(--stitch-*)。
// 尚无专属 per-site 落地页的站（seline/phantom 待 #28/#29）由 landing 分发器回退到这里。
// meta 由分发器 index.tsx 统一持有，本文件只导出版式组件。

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

// ----- 连接件字阶（display - caption 整条，只读角色变量）
const displayText: CSSProperties = {
  fontFamily: 'var(--stitch-font-display)',
  fontSize: 'var(--stitch-text-display)',
  lineHeight: 'var(--stitch-leading-display)',
  letterSpacing: 'var(--stitch-tracking-display)',
  color: 'var(--stitch-text-primary)',
  margin: 0,
  // 大字号下按语义均衡断行、不留孤字（不 clamp 降字号——各站 display 峰值是招牌）。
  textWrap: 'balance',
};
const headingText: CSSProperties = {
  fontFamily: 'var(--stitch-font-display)',
  fontSize: 'var(--stitch-text-heading-sm)',
  lineHeight: 'var(--stitch-leading-heading-sm)',
  letterSpacing: 'var(--stitch-tracking-heading-sm)',
  color: 'var(--stitch-text-primary)',
  margin: 0,
};
const subheadingText: CSSProperties = {
  fontSize: 'var(--stitch-text-subheading)',
  lineHeight: 'var(--stitch-leading-subheading)',
  color: 'inherit',
  margin: 0,
};
const bodyText: CSSProperties = {
  fontSize: 'var(--stitch-font-size-base)',
  lineHeight: 'var(--stitch-line-height-base)',
  color: 'var(--stitch-text-secondary)',
  margin: 0,
};
const captionText: CSSProperties = {
  fontSize: 'var(--stitch-text-caption)',
  lineHeight: 'var(--stitch-leading-caption)',
  color: 'var(--stitch-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  margin: 0,
};
// 区块眉标（kicker）：body 档而非 caption——领起 heading 的小标不该比正文还小。
const eyebrowText: CSSProperties = {
  fontSize: 'var(--stitch-font-size-base)',
  fontWeight: 'var(--stitch-font-weight-medium)',
  color: 'var(--stitch-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  margin: 0,
};

// ----- 连接件外壳（页面尺度层四键：page-max-width / section-gap
//                              / card-padding / element-gap）
/** 通栏底色带：背景 full-bleed 贴边，内部正文列收 page-max-width 居中，竖向留白 = section-gap。
 *  tight：区块骨架件（导航条）用 spacing-lg 而非 section-gap，避免栏与正文被撑开一整个区块间距。 */
function Band({
  bg,
  children,
  ink,
  tight = false,
  borderBottom = false,
}: {
  bg: string;
  children: ReactNode;
  ink?: string;
  tight?: boolean;
  borderBottom?: boolean;
}) {
  return (
    <section
      style={{
        background: bg,
        color: ink ?? 'var(--stitch-text-primary)',
        // 每带各出半个 section-gap → 相邻区块之间的竖向留白正好 = section-gap
        // （而非两带各出一整个、叠成 2×，让整页松垮）。
        paddingBlock: tight
          ? 'var(--stitch-spacing-lg)'
          : 'calc(var(--stitch-section-gap) / 2)',
        paddingInline: 'var(--stitch-spacing-xl)',
        borderBottom: borderBottom
          ? 'var(--stitch-border-width) solid var(--stitch-border)'
          : undefined,
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

/** 品牌标记：accent 徽标（accent 底 + accent-text 前景，契约天然成对可读，不受站的低对比 accent 影响）
 *  + display 字族字标。给导航/页脚一个像样的 logo，而非孤零零一行字。 */
function Brand({ size = 'var(--stitch-font-size-lg)' }: { size?: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--stitch-spacing-sm)',
      }}
    >
      <span
        aria-hidden
        style={{
          display: 'inline-grid',
          placeItems: 'center',
          width: 30,
          height: 30,
          borderRadius: 'var(--stitch-radius-input)',
          background: 'var(--stitch-accent)',
          color: 'var(--stitch-accent-text)',
          fontFamily: 'var(--stitch-font-display)',
          fontSize: 'var(--stitch-font-size-base)',
          fontWeight: 'var(--stitch-font-weight-medium)',
          lineHeight: 1,
        }}
      >
        S
      </span>
      <span
        style={{
          fontFamily: 'var(--stitch-font-display)',
          fontSize: size,
          lineHeight: 1,
          letterSpacing: '-0.01em',
          color: 'var(--stitch-text-primary)',
        }}
      >
        stitch
      </span>
    </span>
  );
}

/** 连接件面板：手写"卡片"用页面尺度层的 card-padding（与真 Card 的内建 padding 互补显形）。 */
const panel: CSSProperties = {
  padding: 'var(--stitch-card-padding)',
  borderRadius: 'var(--stitch-radius-card)',
  border: 'var(--stitch-border-width) solid var(--stitch-border)',
  background: 'var(--stitch-bg-card)',
};

const responsiveGrid = (min: string): CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fit, minmax(${min}, 1fr))`,
  gap: 'var(--stitch-spacing-lg)',
});

const stack = (gap = 'var(--stitch-spacing-md)'): CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  gap,
});

// ----- 数据
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
const usd = (v: number) => `$${v.toLocaleString('en-US')}`;
const compact = (v: number) => v.toLocaleString('en-US');

const features = [
  {
    icon: 'search' as const,
    title: '即时检索',
    body: '毫秒级返回结果，输入即所见，无需等待索引重建。',
  },
  {
    icon: 'send' as const,
    title: '一键发布',
    body: '从草稿到上线一步到位，多环境切换零配置。',
  },
  {
    icon: 'arrow-up-right' as const,
    title: '弹性扩容',
    body: '流量峰谷自动伸缩，只为真正用到的算力付费。',
  },
];

const testimonials = [
  {
    fallback: '林',
    name: '林晚',
    role: '产品负责人 · Northwind',
    quote: '换肤这件事以前要开三个会，现在改一个变量就全站跟着走。',
  },
  {
    fallback: '周',
    name: '周知',
    role: '前端负责人 · Contoso',
    quote: '同一套组件契约，四个品牌站共用，维护成本直接砍半。',
  },
  {
    fallback: '陈',
    name: '陈屿',
    role: '设计总监 · Fabrikam',
    quote: '设计语言落到角色变量后，交付和实现终于说的是同一种话。',
  },
];

const plans = [
  {
    name: '入门',
    price: '$0',
    period: '永久免费',
    features: ['单个项目', '社区支持', '基础组件'],
    accent: false,
  },
  {
    name: '团队',
    price: '$29',
    period: '每席 / 每月',
    features: ['无限项目', '优先支持', '全部组件', '多站换肤'],
    accent: true,
  },
  {
    name: '企业',
    price: '定制',
    period: '联系我们',
    features: ['私有部署', '专属 SLA', '安全审计', '架构陪跑'],
    accent: false,
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
      <p style={bodyText}>
        组件只读 <code>--stitch-*</code>{' '}
        角色契约，每站在自己的适配层填值；切站即整站换肤，组件代码一字不改。
      </p>
    ),
  },
  {
    key: 'migrate',
    header: '迁移现有页面成本高吗？',
    children: (
      <p style={bodyText}>
        逐块替换即可，真组件与手写连接件可共存；先接管交互件，再收敛版式。
      </p>
    ),
  },
  {
    key: 'a11y',
    header: '无障碍是默认开启的吗？',
    children: (
      <p style={bodyText}>
        是。焦点环、键盘可达、对比度都在组件层保证，跨主题也不掉。
      </p>
    ),
  },
];

// ----- 页面（回退版式：theme-agnostic 结构、跨站换值）
export default function FallbackLanding() {
  return (
    <div
      style={{
        minWidth: 0,
        background: 'var(--stitch-bg-canvas)',
        color: 'var(--stitch-text-primary)',
        fontFamily: 'var(--stitch-font-body)',
      }}
    >
      {/* 导航条（真组件：Button link/primary + Icon）—— tight 骨架件，与 hero 只隔一个 section-gap */}
      <Band bg="var(--stitch-bg-elevated)" tight borderBottom>
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--stitch-spacing-lg)',
            flexWrap: 'wrap',
          }}
        >
          <Brand />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--stitch-spacing-xs)',
              flexWrap: 'wrap',
            }}
          >
            <Button type="link">功能</Button>
            <Button type="link">价格</Button>
            <Button type="link">文档</Button>
            <Button
              type="primary"
              icon={<Icon name="arrow-up-right" size={16} />}
            >
              开始使用
            </Button>
          </div>
        </nav>
      </Band>

      {/* Hero（display 大标题 + body + 双 Button + Tag 眉标）*/}
      <Band bg="var(--stitch-bg-canvas)">
        <div style={{ ...stack('var(--stitch-spacing-lg)'), maxWidth: '52ch' }}>
          <div
            style={{
              display: 'flex',
              gap: 'var(--stitch-element-gap)',
              flexWrap: 'wrap',
            }}
          >
            <Tag color="cat-1" variant="soft">
              v2 已发布
            </Tag>
            <Tag color="cat-3" variant="soft">
              多站换肤
            </Tag>
          </div>
          <h1 style={displayText}>一套组件，处处是你的品牌。</h1>
          <p style={{ ...bodyText, fontSize: 'var(--stitch-text-subheading)' }}>
            同一套 React
            组件、一套角色契约，构建时切换成不同网站的风格。设计语言与实现，从此说同一种话。
          </p>
          <div
            style={{
              display: 'flex',
              gap: 'var(--stitch-spacing-md)',
              flexWrap: 'wrap',
            }}
          >
            <Button
              type="primary"
              size="large"
              icon={<Icon name="send" size={18} />}
            >
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
        </div>
      </Band>

      {/* Feature 三卡（真 Card + Icon）*/}
      <Band bg="var(--stitch-bg-section)">
        <div style={stack('var(--stitch-spacing-xl)')}>
          <div style={stack('var(--stitch-spacing-sm)')}>
            <p style={eyebrowText}>为什么选 stitch</p>
            <h2 style={headingText}>把重复的活，交给契约。</h2>
          </div>
          <div style={responsiveGrid('220px')}>
            {features.map((f) => (
              <Card key={f.title} variant="elevated">
                <div style={stack('var(--stitch-spacing-md)')}>
                  {/* 图标底走中性面 + text-primary（正文墨对卡面本就达标，三站图标都清晰；
                      不用 accent 软面——seline 那对仅 2.29:1，图标会发虚沉底）。 */}
                  <span
                    style={{
                      display: 'inline-grid',
                      placeItems: 'center',
                      width: 48,
                      height: 48,
                      borderRadius: 'var(--stitch-radius-input)',
                      background: 'var(--stitch-bg-section)',
                      border:
                        'var(--stitch-border-width) solid var(--stitch-border)',
                      color: 'var(--stitch-text-primary)',
                    }}
                  >
                    <Icon name={f.icon} label={f.title} size={24} />
                  </span>
                  <h3
                    style={{
                      ...subheadingText,
                      fontFamily: 'var(--stitch-font-display)',
                    }}
                  >
                    {f.title}
                  </h3>
                  <p style={{ ...bodyText, color: 'inherit' }}>{f.body}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Band>

      {/* Stat 指标带（真 StatGroup / Stat）*/}
      <Band bg="var(--stitch-bg-canvas)">
        <div style={stack('var(--stitch-spacing-lg)')}>
          <h2 style={headingText}>被这些团队信任</h2>
          <StatGroup>
            <Stat
              title="活跃团队"
              value={12400}
              trend={{ value: 8, direction: 'up' }}
              caption="较上期"
            />
            <Stat title="月度增长" value={18} suffix="%" />
            <Stat title="服务可用性" value={99.98} precision={2} suffix="%" />
            <Stat title="组件数" value={48} />
          </StatGroup>
        </div>
      </Band>

      {/* 图表卡（真 LineChart / BarChart —— 分类色走 var(--stitch-cat-*)，切站跟随）*/}
      <Band bg="var(--stitch-bg-section)">
        <div style={stack('var(--stitch-spacing-xl)')}>
          <div style={stack('var(--stitch-spacing-sm)')}>
            <p style={eyebrowText}>看得见的增长</p>
            <h2 style={headingText}>数据随主题一起换肤。</h2>
          </div>
          <div style={responsiveGrid('320px')}>
            <Card variant="outlined">
              <div style={stack('var(--stitch-spacing-md)')}>
                <h3
                  style={{
                    ...subheadingText,
                    fontFamily: 'var(--stitch-font-display)',
                  }}
                >
                  月度营收
                </h3>
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
              <div style={stack('var(--stitch-spacing-md)')}>
                <h3
                  style={{
                    ...subheadingText,
                    fontFamily: 'var(--stitch-font-display)',
                  }}
                >
                  独立访客
                </h3>
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

      {/* 证言卡（真 Card + Avatar）*/}
      <Band bg="var(--stitch-bg-canvas)">
        <div style={stack('var(--stitch-spacing-xl)')}>
          <h2 style={headingText}>用户怎么说</h2>
          <div style={responsiveGrid('260px')}>
            {testimonials.map((t) => (
              <Card key={t.name} variant="filled">
                <div style={stack('var(--stitch-spacing-md)')}>
                  <p style={{ ...bodyText, color: 'inherit' }}>「{t.quote}」</p>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--stitch-spacing-sm)',
                    }}
                  >
                    <Avatar fallback={t.fallback} size="middle" />
                    <span style={stack('0')}>
                      <span
                        style={{
                          fontSize: 'var(--stitch-font-size-base)',
                          fontWeight: 'var(--stitch-font-weight-medium)',
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
              </Card>
            ))}
          </div>
        </div>
      </Band>

      {/* 定价三卡（真 Card，一张 accent 高亮；真 Button + Icon check）*/}
      <Band bg="var(--stitch-bg-section)">
        <div style={stack('var(--stitch-spacing-xl)')}>
          <div style={stack('var(--stitch-spacing-sm)')}>
            <p style={eyebrowText}>简单透明</p>
            <h2 style={headingText}>选一个适合你的方案。</h2>
          </div>
          <div style={responsiveGrid('240px')}>
            {plans.map((p) => (
              <Card
                key={p.name}
                variant={p.accent ? 'filled' : 'outlined'}
                color={p.accent ? 'accent' : 'default'}
                // 高亮卡不只靠底色区分：accent 描边环 + 抬升影 + 角标三管齐下
                // （phantom 的 accent 软底对 section 底仅 1.16:1，单靠底色分不出）。
                style={
                  p.accent
                    ? {
                        boxShadow:
                          '0 0 0 2px var(--stitch-accent), var(--stitch-shadow-lg)',
                      }
                    : undefined
                }
              >
                <div style={stack('var(--stitch-spacing-md)')}>
                  {p.accent && (
                    <div>
                      <Tag variant="solid" size="small">
                        最受欢迎
                      </Tag>
                    </div>
                  )}
                  <h3
                    style={{
                      ...subheadingText,
                      fontFamily: 'var(--stitch-font-display)',
                    }}
                  >
                    {p.name}
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 'var(--stitch-element-gap)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--stitch-font-display)',
                        fontSize: 'var(--stitch-text-heading-sm)',
                        lineHeight: 'var(--stitch-leading-heading-sm)',
                      }}
                    >
                      {p.price}
                    </span>
                    <span
                      style={{
                        ...captionText,
                        textTransform: 'none',
                        color: 'inherit',
                      }}
                    >
                      {p.period}
                    </span>
                  </div>
                  <ul
                    style={{
                      ...stack('var(--stitch-spacing-sm)'),
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
                          gap: 'var(--stitch-element-gap)',
                          fontSize: 'var(--stitch-font-size-base)',
                        }}
                      >
                        <Icon name="check" label="包含" size={16} />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <Button type={p.accent ? 'primary' : 'default'} block>
                    选择{p.name}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Band>

      {/* FAQ（真 Accordion）*/}
      <Band bg="var(--stitch-bg-canvas)">
        <div
          style={{ ...stack('var(--stitch-spacing-lg)'), maxWidth: '48rem' }}
        >
          <h2 style={headingText}>常见问题</h2>
          <Accordion items={faqItems} defaultValue="themes" />
        </div>
      </Band>

      {/* CTA 高亮带（暗带 bg-inverted + text-on-dark + 浅色 default 按钮）。
          为何不用 bg-accent 软带：phantom 的 accent≈bg-accent 同为浅紫，primary 按钮落上去隐形；
          暗带三站皆深（soot / ink / aubergine），浅色 default 按钮三站都强对比，accent 仍在别处发声。 */}
      <Band bg="var(--stitch-bg-canvas)">
        <div
          style={{
            ...panel,
            background: 'var(--stitch-bg-inverted)',
            borderColor: 'transparent',
            color: 'var(--stitch-text-on-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--stitch-spacing-lg)',
            flexWrap: 'wrap',
          }}
        >
          <div style={stack('var(--stitch-spacing-sm)')}>
            <h2 style={{ ...headingText, color: 'inherit' }}>
              准备好换肤了吗？
            </h2>
            <p style={{ ...bodyText, color: 'inherit' }}>
              五分钟接入第一个组件，跨主题效果立等可见。
            </p>
          </div>
          <Button
            type="default"
            size="large"
            icon={<Icon name="send" size={18} />}
          >
            立即开始
          </Button>
        </div>
      </Band>

      {/* Footer（真 Button link + Divider + caption）—— 品牌列 + 三链接组 + 底部条 */}
      <Band bg="var(--stitch-bg-section)">
        <div style={stack('var(--stitch-spacing-xl)')}>
          <div
            style={{
              display: 'flex',
              gap: 'var(--stitch-spacing-xl)',
              flexWrap: 'wrap',
            }}
          >
            {/* 品牌列 */}
            <div
              style={{
                ...stack('var(--stitch-spacing-md)'),
                flex: '1 1 260px',
                maxWidth: '34ch',
              }}
            >
              <Brand />
              <p style={bodyText}>
                一套 React
                组件、一套角色契约，构建时切换成不同网站的风格。设计语言与实现，从此说同一种话。
              </p>
            </div>

            {/* 链接组：flex-grow 填满品牌列右侧，各组均分，不靠 space-between 甩到两端造空谷 */}
            <div
              style={{
                flex: '2 1 380px',
                display: 'flex',
                gap: 'var(--stitch-spacing-lg)',
                flexWrap: 'wrap',
              }}
            >
              {footerGroups.map((g) => (
                <div
                  key={g.title}
                  style={{
                    ...stack('var(--stitch-spacing-xs)'),
                    // flex-start：链接按钮收成内容宽、不被拉满后居中——文字左缘与标题对齐
                    alignItems: 'flex-start',
                    flex: '1 1 100px',
                  }}
                >
                  <span
                    style={{
                      fontSize: 'var(--stitch-text-subheading)',
                      lineHeight: 'var(--stitch-leading-subheading)',
                      fontFamily: 'var(--stitch-font-display)',
                      color: 'var(--stitch-text-primary)',
                      paddingInline: 'var(--stitch-spacing-lg)',
                      marginBottom: 'var(--stitch-spacing-xs)',
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

          {/* 底部条：版权 + 法务链接 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 'var(--stitch-spacing-md)',
              flexWrap: 'wrap',
            }}
          >
            <p style={{ ...captionText, textTransform: 'none' }}>
              © 2026 stitch · 版式样例，跨主题综合换肤演示。
            </p>
            <div style={{ display: 'flex', gap: 'var(--stitch-spacing-xs)' }}>
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
