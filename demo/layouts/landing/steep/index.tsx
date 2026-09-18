// demo/layouts/landing/steep/index.tsx —— 「Landing」的 **steep 版**落地页（per-site 版式）
//
// 每个真实主题一个自包含子目录（steep/ 下：本版式 + landing.module.less 滚动动画 + bg.jpg 位图）；
// 分发器 demo/layouts/landing/index.tsx 按 active-site 分发到这里。registry 的 glob 只扫单层
// `/demo/layouts/*/index.tsx`，本子目录不会被误当成独立 layout 条目。
//
// 设计一律读 skills/stitch-design-system 的 steep 预置得出（style.md → rules.md →
// composition.md），非照抄任何 prompt。steep = warm paper 上的杂志内页式 serif analytics：
//   · 近乎无彩（97% achromatic），全站唯一暖桃点缀留给**一张**编辑强调卡（peach 面 + sienna 墨）；
//   · Signifier 衬线大标题恒 weight 400，每条展示/标题保留**一处**斜体强调短语（<em>，不加粗）；
//   · 全药丸按钮（filled 深 + 次要 outlined 成对）；文字链带箭头后缀（走 Icon 组件，非 Unicode 箭头字符）；
//   · 内容卡 24px 软边**无阴影**（Card variant="filled"）；唯有**浮动产品 artifact** 配可见阴影
//     （Card variant="elevated" → shadow-lg）；
//   · 80px 区块节奏，paper / fog 安静交替；页面下部砸下**一整幕近黑 AI 暗场**（bg-inverted），
//     顶部用 白→透明渐隐带 与其上亮场衔接；招牌**毛玻璃 composer**（真 Input + 圆形发送键）浮其上；
//   · 暖纸画布不是死白：氛围铺底用角色变量渐变叠出光晕层次（无裸 SVG，红线洁净）；导航磨砂半透明；
//     浮动 artifact 做轻微旋转错位拼贴。
//
// 连接件（band 外壳 / 网格 / 铺底 / composer 壳）**只读 var(--stitch-*)**：色/圆角/字体一律
// 走角色变量，绝不落 hex（数值几何——间距 px、模糊半径、旋转角——非主题值，与 seline / phantom 同例）。
// 交互 / 展示元素一律是经 @octohirono/stitch-design-system import 的**真组件**。

import type { CSSProperties, ReactNode } from 'react';
import {
  Accordion,
  Avatar,
  BarChart,
  Button,
  Card,
  Divider,
  Icon,
  Input,
  LineChart,
  Stat,
  StatGroup,
  Tag,
} from '@octohirono/stitch-design-system';
import type { AccordionItem } from '@octohirono/stitch-design-system';
import styles from './landing.module.less';

// steep 真站的氛围铺底位图（暖白→桃粉柔和渐变，composition「氛围铺底」的图像材质）。
// 下载入 demo 本地引用——不热链外部资源、不依赖别人 CDN；仅 steep 版式（per-site）渲染，
// 不进发货面（check:boundary 明确豁免 demo），不污染换肤契约。
const heroBg = new URL('./bg.jpg', import.meta.url).href;

// ---------------------------------------------------------------------------
// 连接件字阶（Signifier 衬线标题恒 400 + Sohne 正文；只读角色变量）
// ---------------------------------------------------------------------------
// display 90px / heading-lg 64px / heading 44px —— 越大越紧，字距签名走 tracking-* 角色变量。
const display: CSSProperties = {
  fontFamily: 'var(--stitch-font-display)',
  fontSize: 'var(--stitch-text-display)',
  lineHeight: 'var(--stitch-leading-display)',
  letterSpacing: 'var(--stitch-tracking-display)',
  fontWeight: 'var(--stitch-font-weight-normal)', // Signifier 永远 400，绝不加粗
  color: 'var(--stitch-text-primary)',
  margin: 0,
  textWrap: 'balance',
};
const headingLg: CSSProperties = {
  fontFamily: 'var(--stitch-font-display)',
  fontSize: 'var(--stitch-text-heading-lg)',
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
// 卡内小标：steep 用 Sohne（无衬线）做 20px 卡标题，非衬线（衬线只领 44/64/90 三档）。
const cardTitle: CSSProperties = {
  fontFamily: 'var(--stitch-font-body)',
  fontSize: 'var(--stitch-text-body-lg)',
  lineHeight: 'var(--stitch-leading-body-lg)',
  fontWeight: 'var(--stitch-font-weight-medium)',
  color: 'var(--stitch-text-primary)',
  margin: 0,
};
const lead: CSSProperties = {
  fontFamily: 'var(--stitch-font-body)',
  fontSize: 'var(--stitch-text-body-lg)',
  lineHeight: 'var(--stitch-leading-body-lg)',
  color: 'var(--stitch-text-secondary)',
  margin: 0,
};
const body: CSSProperties = {
  fontFamily: 'var(--stitch-font-body)',
  fontSize: 'var(--stitch-text-body)',
  lineHeight: 'var(--stitch-leading-body)',
  color: 'var(--stitch-text-secondary)',
  margin: 0,
};

/** steep 招牌字形设备：句中**一处**斜体强调短语——衬线靠斜体制造重音，不加粗。 */
function Em({ children }: { children: ReactNode }) {
  return (
    <em style={{ fontStyle: 'italic', fontWeight: 'inherit' }}>{children}</em>
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
// 连接件外壳（页面尺度层：page-max-width / section-gap 80px / space-*）
// ---------------------------------------------------------------------------
type BandTone = 'paper' | 'fog' | 'dark';
const bandBg: Record<BandTone, string | undefined> = {
  // paper 带透明 → 透出根部氛围铺底（暖纸的光晕层次，而非死白）；
  paper: 'transparent',
  // fog 带在铺底上抬一步，做无强对比的安静交替；
  fog: 'var(--stitch-bg-section)',
  // dark 带砸下一整幕近黑暗场（中性近黑，非有色暗调）。
  dark: 'var(--stitch-bg-inverted)',
};

/** 通栏区块：背景 full-bleed 贴边，内部正文列收 page-max-width 居中，上下留白各出半个
 *  section-gap → 相邻区块之间正好 = section-gap（80px 杂志式呼吸）。
 *  tight：骨架件（导航条）用小留白，避免栏与内容被撑开一整个区块间距。 */
function Band({
  tone,
  children,
  tight = false,
  seam = false,
}: {
  tone: BandTone;
  children: ReactNode;
  tight?: boolean;
  seam?: boolean;
}) {
  return (
    <section
      style={{
        position: 'relative',
        background: bandBg[tone],
        color:
          tone === 'dark'
            ? 'var(--stitch-text-on-dark)'
            : 'var(--stitch-text-primary)',
        paddingBlock: tight
          ? 'var(--stitch-space-20)'
          : 'calc(var(--stitch-section-gap) / 2)',
        paddingInline: 'var(--stitch-space-24)',
        // 铺底光晕会溢出旋转的浮动 artifact——band 内收敛横向溢出，避免误触横向滚动。
        overflowX: 'clip',
      }}
    >
      {/* 明暗幕衔接：暗场顶部一道 白→透明 渐隐带，把其上亮场柔和地带入暗幕，避免硬切。 */}
      {seam && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            insetInline: 0,
            top: 0,
            height: 'var(--stitch-section-gap)',
            background:
              'linear-gradient(to bottom, var(--stitch-bg-canvas), transparent)',
            opacity: 0.14,
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

/** 品牌字标：Signifier 衬线字标 whisper-quiet（无徽标块，导航安静轻盈）。 */
function Brand() {
  return (
    <span
      style={{
        fontFamily: 'var(--stitch-font-display)',
        fontSize: 'var(--stitch-text-subheading)',
        fontWeight: 'var(--stitch-font-weight-normal)',
        letterSpacing: '-0.01em',
        color: 'inherit',
        lineHeight: 1,
      }}
    >
      steep
    </span>
  );
}

/** 文字链 + 箭头后缀（steep：链接可供性靠箭头而非下划线；箭头走 Icon 组件，非 Unicode 箭头字符）。 */
function ArrowLink({ children }: { children: ReactNode }) {
  return (
    <Button type="link">
      {children}
      <Icon name="arrow-up-right" size={16} />
    </Button>
  );
}

// ---------------------------------------------------------------------------
// 数据
// ---------------------------------------------------------------------------
const activation = [
  { month: '八月', activation: 31 },
  { month: '九月', activation: 38 },
  { month: '十月', activation: 42 },
  { month: '十一月', activation: 46 },
];
const registrations = [
  { month: '八月', signups: 1800 },
  { month: '九月', signups: 2100 },
  { month: '十月', signups: 2600 },
  { month: '十一月', signups: 2400 },
];
// 区域表 artifact 的日活柱（真站 hero 的 New users 片段：一周逐日）。
const newUsers = [
  { day: '一', users: 280 },
  { day: '二', users: 340 },
  { day: '三', users: 310 },
  { day: '四', users: 420 },
  { day: '五', users: 360 },
  { day: '六', users: 300 },
  { day: '日', users: 390 },
];
const regionRows = [
  { region: '欧洲', value: '1,373' },
  { region: '北美', value: '930' },
  { region: '非洲', value: '745' },
  { region: '亚洲', value: '432' },
];
const pct = (v: number) => `${v}%`;
const compact = (v: number) => v.toLocaleString('en-US');

const features = [
  {
    label: 'Marketing',
    icon: 'search' as const,
    title: '即时检索',
    body: '毫秒级返回，输入即所见——无需等待索引重建，编辑手感般顺滑。',
  },
  {
    label: 'Finance',
    icon: 'arrow-up-right' as const,
    title: '弹性扩容',
    body: '流量峰谷自动伸缩，只为真正用到的算力付费，账目一目了然。',
  },
  {
    label: 'Sales',
    icon: 'send' as const,
    title: '一键发布',
    body: '从草稿到上线一步到位，多环境切换零配置，交付像翻页一样轻。',
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
// 页面
// ---------------------------------------------------------------------------
export default function SteepLanding() {
  return (
    <div
      style={{
        // 画布基色走角色变量兜底；氛围铺底位图只铺在 hero 段（下方 heroBg），
        // 让暖白→桃粉的光晕正对标题四周，其余区块回到 paper/fog 安静交替。
        background: 'var(--stitch-bg-canvas)',
        color: 'var(--stitch-text-primary)',
        fontFamily: 'var(--stitch-font-body)',
        minWidth: 0,
      }}
    >
      {/* ---- 磨砂半透明导航（logo 左 · 导航项中 · text link + filled pill 右）---- */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background:
            'color-mix(in srgb, var(--stitch-bg-canvas), transparent 28%)',
          backdropFilter: 'blur(12px)',
          borderBottom:
            'var(--stitch-border-width) solid color-mix(in srgb, var(--stitch-border), transparent 40%)',
        }}
      >
        <Band tone="paper" tight>
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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--stitch-space-8)',
                flexWrap: 'wrap',
              }}
            >
              <Button type="link">产品</Button>
              <Button type="link">资源</Button>
              <Button type="link">客户</Button>
              <Button type="link">价格</Button>
              <Button type="link">登录</Button>
              <Button type="primary">开始使用</Button>
            </div>
          </nav>
        </Band>
      </div>

      {/* ---- Hero：真站式环绕拼贴——中央超大衬线标题+composer，四周浮动产品 artifact，
              整段铺在暖纸氛围位图上（光晕正对标题）。artifact 是唯一带可见阴影的元素。 ---- */}
      <section
        style={{
          position: 'relative',
          overflowX: 'clip',
          paddingBlock: 'calc(var(--stitch-section-gap) / 2)',
          paddingInline: 'var(--stitch-space-24)',
        }}
      >
        {/* 氛围铺底位图（full-bleed，光晕居上正对标题；桃色只在图里，不入任何 token 面） */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'top center',
            backgroundRepeat: 'no-repeat',
            pointerEvents: 'none',
          }}
        />
        {/* 底部反向渐隐：位图柔和落回下方 paper，不硬切 */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            insetInline: 0,
            bottom: 0,
            height: 'var(--stitch-section-gap)',
            background:
              'linear-gradient(to top, var(--stitch-bg-canvas), transparent)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            maxWidth: 'var(--stitch-page-max-width)',
            marginInline: 'auto',
            width: '100%',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--stitch-space-24)',
          }}
        >
          {/* 左列 artifact：区域表（New users 柱 + 地区列表）＋ Activation 折线。
              className 挂滚动视差聚拢（向右上收拢淡出，见 landing.module.less）。 */}
          <div
            className={styles.collapseLeft}
            style={{
              ...stack('var(--stitch-space-24)'),
              flex: '1 1 240px',
              minWidth: 0,
            }}
          >
            <div style={{ transform: 'rotate(-2deg)' }}>
              <Card variant="elevated">
                <div style={stack('var(--stitch-space-12)')}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      gap: 'var(--stitch-space-12)',
                    }}
                  >
                    <Tag variant="text" color="cat-3" size="small">
                      New users
                    </Tag>
                    <span style={{ ...cardTitle }}>3,503</span>
                  </div>
                  <BarChart
                    data={newUsers}
                    xField="day"
                    series={[{ dataKey: 'users', name: '新增用户' }]}
                    height={110}
                    valueFormatter={compact}
                    ariaLabel="一周逐日新增用户柱状图"
                  />
                  <ul
                    style={{
                      ...stack('var(--stitch-space-8)'),
                      listStyle: 'none',
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    {regionRows.map((r) => (
                      <li
                        key={r.region}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 'var(--stitch-text-caption)',
                          color: 'var(--stitch-text-secondary)',
                        }}
                      >
                        <span>{r.region}</span>
                        <span style={{ color: 'var(--stitch-text-primary)' }}>
                          {r.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </div>
            <div style={{ transform: 'rotate(1.5deg)' }}>
              <Card variant="elevated">
                <div style={stack('var(--stitch-space-12)')}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 'var(--stitch-space-12)',
                    }}
                  >
                    <Tag variant="text" color="cat-3" size="small">
                      Activation
                    </Tag>
                    {/* 在场指示 avatar（真站的实时交互母题） */}
                    <Avatar fallback="JB" size="small" />
                  </div>
                  <Stat
                    title="激活率"
                    value={46.2}
                    precision={1}
                    suffix="%"
                    caption="达成目标 103%"
                  />
                  <LineChart
                    data={activation}
                    xField="month"
                    series={[{ dataKey: 'activation', name: '激活率' }]}
                    smooth
                    height={110}
                    valueFormatter={pct}
                    ariaLabel="八月至十一月激活率折线图"
                  />
                </div>
              </Card>
            </div>
          </div>

          {/* 中列：超大衬线标题 + 副标 + 药丸对 + 招牌毛玻璃 composer */}
          <div
            style={{
              ...stack('var(--stitch-space-24)'),
              flex: '2 1 360px',
              maxWidth: '40rem',
              textAlign: 'center',
              alignItems: 'center',
            }}
          >
            <h1 style={display}>
              把混乱，<Em>安静地</Em>收成秩序。
            </h1>
            <p style={{ ...lead, maxWidth: '32rem' }}>
              同一套 React
              组件、一套角色契约，构建时切换成不同网站的风格。设计语言与实现，从此说同一种话。
            </p>
            <div
              style={{
                display: 'flex',
                gap: 'var(--stitch-space-12)',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
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
            {/* 毛玻璃 composer：真 Input + 圆形深填充发送键（真站 hero 中下母题） */}
            <div
              style={{
                width: '100%',
                maxWidth: '30rem',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--stitch-space-12)',
                padding: 'var(--stitch-space-12)',
                borderRadius: 'var(--stitch-radius-card)',
                background:
                  'color-mix(in srgb, var(--stitch-bg-elevated), transparent 8%)',
                backdropFilter: 'blur(16px)',
                border:
                  'var(--stitch-border-width) solid color-mix(in srgb, var(--stitch-border), transparent 30%)',
                boxShadow:
                  'inset 0 1px 0 0 color-mix(in srgb, var(--stitch-bg-canvas), transparent 40%), var(--stitch-shadow-lg)',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <Input
                  placeholder="问点什么…"
                  aria-label="向 AI 提问"
                  prefix={<Icon name="search" size={18} />}
                />
              </div>
              <Button
                type="primary"
                aria-label="发送"
                icon={<Icon name="send" size={18} />}
                style={{ width: 40, minWidth: 40, padding: 0 }}
              />
            </div>
          </div>

          {/* 右列 artifact：Registrations（向左上收拢淡出）。 */}
          <div
            className={styles.collapseRight}
            style={{
              ...stack('var(--stitch-space-24)'),
              flex: '1 1 240px',
              minWidth: 0,
            }}
          >
            <div style={{ transform: 'rotate(2deg)' }}>
              <Card variant="elevated">
                <div style={stack('var(--stitch-space-12)')}>
                  <Tag variant="text" color="cat-3" size="small">
                    Registrations
                  </Tag>
                  <Stat
                    title="注册数"
                    value={2400}
                    caption="较上周增长 5.5 倍"
                  />
                  <BarChart
                    data={registrations}
                    xField="month"
                    series={[{ dataKey: 'signups', name: '注册' }]}
                    height={110}
                    valueFormatter={compact}
                    ariaLabel="八月至十一月注册数柱状图"
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Feature：eyebrow + 衬线标题 + 3 张 Neutral Card（filled，无阴影）---- */}
      <Band tone="fog">
        <div style={stack('var(--stitch-space-40)')}>
          <div
            style={{ ...stack('var(--stitch-space-12)'), maxWidth: '40rem' }}
          >
            <Tag variant="text" color="cat-3" size="small">
              为什么选 stitch
            </Tag>
            <h2 style={heading}>
              把重复的活，<Em>交给契约</Em>。
            </h2>
          </div>
          <div style={grid('260px')}>
            {features.map((f) => (
              <Card key={f.title} variant="filled">
                <div style={stack('var(--stitch-space-16)')}>
                  <Icon name={f.icon} label={f.title} size={24} />
                  <Tag variant="text" color="cat-3" size="small">
                    {f.label}
                  </Tag>
                  <h3 style={cardTitle}>{f.title}</h3>
                  <p style={{ ...body, color: 'var(--stitch-text-primary)' }}>
                    {f.body}
                  </p>
                  <div>
                    <ArrowLink>了解更多</ArrowLink>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Band>

      {/* ---- 指标带：真 StatGroup / Stat（delta 走 caption 灰字，不走彩色 trend）---- */}
      <Band tone="paper">
        <div style={stack('var(--stitch-space-24)')}>
          <h2 style={heading}>
            被这些团队<Em>安静地</Em>信任。
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

      {/* ---- 编辑强调卡：全站**唯一**桃色面（filled + accent），坐在 paper 上做客户引言 ---- */}
      <Band tone="paper">
        <Card variant="filled" color="accent">
          <div
            style={{
              // 宽度限值用绝对 rem（不用 ch：ch 按外壳 17px 正文算，会把 26px 引言压进偏窄列、
              // 折在词中把「」甩成孤尾）。给引言留够一行的行宽。
              ...stack('var(--stitch-space-24)'),
              maxWidth: '52rem',
              paddingBlock: 'var(--stitch-space-16)',
            }}
          >
            <Tag variant="text" size="small">
              客户故事
            </Tag>
            <p
              style={{
                fontFamily: 'var(--stitch-font-display)',
                fontSize: 'var(--stitch-text-heading-sm)',
                lineHeight: 'var(--stitch-leading-heading-sm)',
                letterSpacing: 'var(--stitch-tracking-heading-sm)',
                fontWeight: 'var(--stitch-font-weight-normal)',
                color: 'inherit',
                margin: 0,
                // 均衡断行：万一仍需两行，也把两行匀开、不留孤字尾（与 display/heading 同策）。
                textWrap: 'balance',
              }}
            >
              「换肤这件事以前要开三个会，现在改一个变量，<Em>全站跟着走</Em>
              。」
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--stitch-space-12)',
              }}
            >
              <Avatar fallback="林" size="middle" />
              <span style={stack('0')}>
                <span
                  style={{
                    fontSize: 'var(--stitch-text-body)',
                    fontWeight: 'var(--stitch-font-weight-medium)',
                    color: 'inherit',
                  }}
                >
                  林晚
                </span>
                <span
                  style={{
                    fontSize: 'var(--stitch-font-size-sm)',
                    color: 'inherit',
                    opacity: 0.85,
                  }}
                >
                  产品负责人 · Northwind
                </span>
              </span>
            </div>
          </div>
        </Card>
      </Band>

      {/* ---- 定价：3 张 Neutral Card。主推卡不靠桃色（桃色已花在编辑卡）——
              靠 accent 深墨描边环 + ghost 标签 + filled 药丸三管齐下区分。 ---- */}
      <Band tone="fog">
        <div style={stack('var(--stitch-space-40)')}>
          <div
            style={{ ...stack('var(--stitch-space-12)'), maxWidth: '40rem' }}
          >
            <Tag variant="text" color="cat-3" size="small">
              简单透明
            </Tag>
            <h2 style={heading}>
              选一个<Em>适合你</Em>的方案。
            </h2>
          </div>
          <div style={grid('240px')}>
            {plans.map((p) => (
              <Card
                key={p.name}
                variant="filled"
                // 主推卡：accent（steep 下即深墨）描边环，不引第二处桃色。
                style={
                  p.featured
                    ? { boxShadow: '0 0 0 2px var(--stitch-accent)' }
                    : undefined
                }
              >
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
                        fontSize: 'var(--stitch-text-heading)',
                        lineHeight: 'var(--stitch-leading-heading)',
                        letterSpacing: 'var(--stitch-tracking-heading)',
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
                          fontSize: 'var(--stitch-text-body)',
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
      <Band tone="paper">
        <div style={{ ...stack('var(--stitch-space-24)'), maxWidth: '48rem' }}>
          <h2 style={heading}>
            常见<Em>问题</Em>。
          </h2>
          <Accordion items={faqItems} defaultValue="themes" />
        </div>
      </Band>

      {/* ---- AI 暗场：整幕近黑，顶部渐隐带衔接亮场；招牌毛玻璃 composer 浮其上 ---- */}
      <Band tone="dark" seam>
        <div
          style={{ ...stack('var(--stitch-space-40)'), alignItems: 'center' }}
        >
          <div
            style={{
              ...stack('var(--stitch-space-16)'),
              maxWidth: '32rem',
              textAlign: 'center',
              alignItems: 'center',
            }}
          >
            <Tag variant="text" size="small">
              <span
                style={{ color: 'var(--stitch-text-on-dark)', opacity: 0.7 }}
              >
                问点什么
              </span>
            </Tag>
            <h2 style={{ ...headingLg, color: 'var(--stitch-text-on-dark)' }}>
              把问题<Em>交给它</Em>。
            </h2>
            <p
              style={{
                ...lead,
                color: 'var(--stitch-text-on-dark)',
                opacity: 0.72,
                maxWidth: '44ch',
              }}
            >
              自然语言问一句，跨主题的组件与数据即刻应答——像和一位同事对话。
            </p>
          </div>

          {/* 毛玻璃 composer：真 Input + 圆形深填充发送键；backdrop-blur + inset 近白高光。 */}
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--stitch-space-12)',
              padding: 'var(--stitch-space-12)',
              borderRadius: 'var(--stitch-radius-card)',
              background:
                'color-mix(in srgb, var(--stitch-bg-elevated), transparent 8%)',
              backdropFilter: 'blur(16px)',
              border:
                'var(--stitch-border-width) solid color-mix(in srgb, var(--stitch-border), transparent 30%)',
              boxShadow:
                'inset 0 1px 0 0 color-mix(in srgb, var(--stitch-bg-canvas), transparent 40%), var(--stitch-shadow-lg)',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <Input
                placeholder="问点什么…"
                aria-label="向 AI 提问"
                prefix={<Icon name="search" size={18} />}
              />
            </div>
            <Button
              type="primary"
              aria-label="发送"
              icon={<Icon name="send" size={18} />}
              style={{ width: 40, minWidth: 40, padding: 0 }}
            />
          </div>
        </div>
      </Band>

      {/* ---- Footer：品牌列 + 三链接组（真 Button link）+ Divider + 底部条 ---- */}
      <Band tone="fog">
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
                把分析做成杂志内页——一套 React
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
                      fontWeight: 'var(--stitch-font-weight-normal)',
                      color: 'var(--stitch-text-primary)',
                      // 与下方 Button type="link" 的内建左内距（spacing-lg=16px）对齐，
                      // 否则标题左缘比链接文字缩进 16px、三列读作「歪」。
                      paddingInline: 'var(--stitch-space-16)',
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
              © 2026 steep · 版式样例，per-site 落地页综合换肤演示。
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
