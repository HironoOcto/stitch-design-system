// scripts/emergent-probe.js —— 涌现层探针（合成层 composition-trait 捕获器）
//
// 【为什么这么写】设计意图是开放的（第 N 个站会冒出没见过的花样），但**浏览器能画
// 出来的东西是封闭的**（CSS 绘制模型成文有限：背景/渐变、box-shadow、filter、
// backdrop-filter、mix-blend-mode、transform、clip-path、mask、伪元素、字形渲染…）。
// 所以探针不问「这站有没有我列的某几种氛围」，而是**扫封闭的绘制基底**：任何涌现特征
// 只要被画出来，就一定落在这有限属性集里、一定被 dump 到。通用性来自 CSS 是封闭集，
// 不来自任何「N 轴清单」。下面的分桶只为可读，不是 schema、不是验收闸门。
//
// 【判据】涌现特征 = 无法用单个 `--stitch-*` 值复现、需「组合」才成立的视觉特征
// （多图层 / 定位 / 滤镜 / 混合 / 或刻意拒绝）。能塞进一个单槽 → 值槽（原子层），
// 不能 → 合成层（本探针的猎物）。术语见 CONTEXT.md「值槽 vs 合成层」。
//
// 【怎么用】三种都行，输出同一份 JSON：
//   1. 真站 DevTools 控制台：整段粘贴，返回值即结果（并 console.log 出 JSON）。
//   2. Playwright / Puppeteer：`await page.evaluate(emergentProbe)`。
//   3. 其它注入式浏览器 MCP：把 `emergentProbe` 函数体交给它的 evaluate。
// 注意：滚动/进场触发的效果要**先滚到底再跑**（懒加载的暗区/位图才会出现）。
//
// 验收协议见 docs/contributing/emergent-layer-acceptance.md。

function emergentProbe() {
  const sig = (el) => {
    const t = el.tagName.toLowerCase();
    const c = (el.className || '').toString().trim().split(/\s+/)[0] || '';
    return c ? `${t}.${c}` : t;
  };
  const box = (el) => {
    const r = el.getBoundingClientRect();
    return {
      w: Math.round(r.width),
      h: Math.round(r.height),
      top: Math.round(r.top + scrollY),
    };
  };
  const lum = (rgb) => {
    const m = rgb.match(/(\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return null;
    const [r, g, b] = [+m[1], +m[2], +m[3]];
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  };
  // 全 0 / 全透明的 box-shadow（Tailwind 的 shadow 占位）当噪声丢掉
  const deadShadow = (sh) =>
    !/[1-9]/.test(sh.replace(/rgba?\([^)]*\)/g, '')) ||
    /^(rgba?\(0,\s*0,\s*0,\s*0\)[^,]*,?\s*)+$/.test(sh.trim());

  const out = {};
  const seen = new Set();
  const push = (bucket, val, el) => {
    const k = bucket + '|' + val;
    if (seen.has(k)) return;
    seen.add(k);
    (out[bucket] ??= []).push({
      val: String(val).slice(0, 120),
      at: sig(el),
      ...box(el),
    });
  };

  const vw = innerWidth;
  for (const el of document.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    const area = r.width * r.height;
    const isMedia = el.tagName === 'IMG' || el.tagName === 'VIDEO';
    if (area < 40000 && !isMedia) continue; // 只看显著元素（≥~200×200）
    const s = getComputedStyle(el);

    // 0) 全出血位图/视频铺底：大幅面 media 贴在内容后面（定位脱流 或 满宽）
    if (isMedia && r.width >= vw * 0.9 && r.height > 400) {
      const src = (el.currentSrc || el.src || '').split('/').pop() || sig(el);
      push('backdrop_raster', decodeURIComponent(src).slice(0, 60), el);
    }

    // 1) 背景：渐变 / 位图 / 噪声纹理叠层
    if (s.backgroundImage.includes('gradient') && area > 150000)
      push('backdrop_gradient', s.backgroundImage, el);
    if (s.backgroundImage.includes('url(')) {
      const u = s.backgroundImage.match(/url\(([^)]+)\)/)?.[1] || '';
      const noise =
        /svg.*(filter|feTurbulence|feColorMatrix|noise|fractalNoise)/i.test(
          decodeURIComponent(u).slice(0, 160),
        );
      const raster = /\.(jpg|jpeg|png|webp|avif)/i.test(u);
      if (noise) push('overlay_texture', u.slice(0, 60), el);
      else if (raster && area > 150000)
        push('backdrop_raster', u.split('/').pop().slice(0, 50), el);
    }

    // 2) 阴影：辉光（彩色/大扩散）vs 常规抬升
    if (s.boxShadow && s.boxShadow !== 'none' && !deadShadow(s.boxShadow)) {
      const colored =
        /\b(rgb|oklab|oklch|hsl)\(/.test(s.boxShadow) &&
        !/^rgba?\(0,\s*0,\s*0/.test(s.boxShadow);
      const bigBlur = /\b([4-9]\d|\d{3,})px\b/.test(s.boxShadow);
      if (colored) push('shadow_glow', s.boxShadow, el);
      else if (bigBlur) push('shadow_elevation', s.boxShadow, el);
    }

    // 3) 滤镜 / 背景滤镜 / 混合模式
    if (s.filter && s.filter !== 'none') push('filter', s.filter, el);
    if (s.backdropFilter && s.backdropFilter !== 'none')
      push('backdrop_filter', s.backdropFilter, el);
    if (s.mixBlendMode && s.mixBlendMode !== 'normal')
      push('blend', s.mixBlendMode, el);

    // 4) 形变 / 裁剪 / 蒙版（装饰性合成）
    if (
      s.transform &&
      s.transform !== 'none' &&
      !/matrix\(1, 0, 0, 1/.test(s.transform)
    )
      push('transform', s.transform, el);
    if (s.clipPath && s.clipPath !== 'none' && s.clipPath !== 'fill-box')
      push('clip', s.clipPath, el);
    const mask =
      s.maskImage !== 'none'
        ? s.maskImage
        : s.webkitMaskImage !== 'none'
          ? s.webkitMaskImage
          : null;
    if (mask) push('mask', mask, el);

    // 5) 暗区：真绘制底色 luminance<0.2 的大块（明暗幕）
    const L = lum(s.backgroundColor);
    if (L !== null && L < 0.2 && area > 300000)
      push('dark_region', `${s.backgroundColor} L=${L.toFixed(2)}`, el);

    // 6) 字形设备：文字渐变（背景裁剪到字）
    if (s.webkitBackgroundClip === 'text' || s.backgroundClip === 'text')
      push('type_gradient_text', s.backgroundImage.slice(0, 60), el);
  }

  // 7) 字形设备：标题内联斜体（如 steep 的 <em>zero chaos</em>）
  document
    .querySelectorAll('h1 i, h1 em, h2 i, h2 em, h3 i, h3 em')
    .forEach((e) =>
      push(
        'type_italic',
        `<${e.tagName.toLowerCase()}> in ${e.closest('h1,h2,h3').tagName}: "${e.textContent.trim().slice(0, 24)}"`,
        e,
      ),
    );

  // 8) 图像材质处理：img/video 上的滤镜（如 seline 的 grayscale(1) contrast(0.94)）
  const imgFilters = new Set();
  document.querySelectorAll('img, video').forEach((im) => {
    const f = getComputedStyle(im).filter;
    if (f && f !== 'none') imgFilters.add(f.slice(0, 60));
  });
  out._imgTreatment = [...imgFilters];
  out._counts = {
    imgs: document.querySelectorAll('img').length,
    svgs: document.querySelectorAll('svg').length,
  };

  return out;
}

// 这是浏览器端脚本（不是 node 脚本）。三种用法：
//   · DevTools 控制台：整段粘贴 → 自动挂 window.emergentProbe，再执行 `copy(emergentProbe())` 拷走 JSON。
//   · Playwright/Puppeteer：读本文件取 emergentProbe 函数体，`await page.evaluate(<函数体>)`（返回值即结果）。
//   · 注入式浏览器 MCP：把 emergentProbe 的函数体交给它的 evaluate。
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.emergentProbe = emergentProbe;
  // eslint-disable-next-line no-console
  console.log(
    'emergentProbe() 就绪 —— 执行 `copy(emergentProbe())` 拷走真站涌现信号 JSON',
  );
}
