// scripts/check-skill.mjs — check:skill.
// Hardens every MACHINE-tier ("机器") assertion from docs/contributing/skill-acceptance.md
// (the #29 spec) into one runnable gate. The doc is the assertion TRUTH; this script is
// the implementation. Every check below is tagged `#29 §N` back to the doc row it enforces.
//
// Read-only by design (§Runbook): it compares the COMMITTED skill products against their
// SOURCES via pure functions (mergeTokens / renderCatalog / extractPropsInterfaces / byte
// diff) + static grep. The two determinism properties the pipeline owns (idempotence,
// switch-theme isolation) are exercised by building into THROWAWAY temp dirs — never the
// real skill, never git. skills-ref validate is the frontmatter one-vote-veto (Runbook step 1).
//
// Guards structural Hook H3 (skill self-contained) — see docs/issue-management.zh-CN.md.
import {
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  mkdtempSync,
  copyFileSync,
} from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, basename } from 'node:path';
import postcss from 'postcss';
import { encode } from 'gpt-tokenizer';
import { mergeTokens } from './lib/merge-tokens.mjs';
import {
  parseFamilies,
  renderCatalog,
  builtFamilyRows,
} from './lib/families.mjs';
import { parseBlurb, lintBlurb } from './build-blurb.mjs';
import { buildSkill, resolveSite } from './build-skill.mjs';
import { extractPropsInterfaces, propsProjectFor } from './lib/props.mjs';
import { listPublishableSites } from './lib/publishable-sites.mjs';
import { resolveActiveSite } from './lib/resolve-preset.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..'); // stitch-design-system/
const argv = process.argv.slice(2);

// ---------- assertion harness ----------
const results = [];
/** Record one assertion. `fn` returns true (pass) / string (fail detail) / throws. */
function check(section, ref, name, fn) {
  try {
    const r = fn();
    if (r === true) results.push({ section, ref, name, ok: true });
    else results.push({ section, ref, name, ok: false, detail: String(r) });
  } catch (e) {
    results.push({ section, ref, name, ok: false, detail: e.message });
  }
}
const readMaybe = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);
const bytesEqual = (a, b) => readFileSync(a).equals(readFileSync(b));

// ---------- paths ----------
// `site` = the published default (stitch.config.json activeSite / --site). PRESET_SITES =
// every publishable site (#7): build:skill emits one preset per site, the read-time pointer
// picks which is active (ADR 0010). The default must be one of them.
const site = resolveSite(root, argv);
const PRESET_SITES = listPublishableSites(root);
const SKILL_DIR = resolve(root, 'skills/stitch-design-system');
const skillName = basename(SKILL_DIR);
const presetFile = (s, f) => join(SKILL_DIR, 'references/theme-presets', s, f);
const P = {
  skillMd: join(SKILL_DIR, 'SKILL.md'),
  readme: join(SKILL_DIR, 'README.md'),
  reactProject: join(SKILL_DIR, 'references/react-project.md'),
  standalone: join(SKILL_DIR, 'references/standalone-html.md'),
  componentsDir: join(SKILL_DIR, 'references/components'),
  presetsDir: join(SKILL_DIR, 'references/theme-presets'),
  designRules: join(SKILL_DIR, 'references/theme/design-rules.md'),
  contract: resolve(root, 'packages/tokens/contract.css'),
  globalDesignRules: resolve(root, 'docs/design-system/design-rules.md'),
  families: resolve(root, 'scripts/component-families.md'),
  srcComponents: resolve(root, 'packages/react/src/components'),
  reactTsconfig: resolve(root, 'packages/react/tsconfig.json'),
  skillsRefBin: resolve(root, 'node_modules/.bin/skills-ref'),
};
// Per-site source paths (adapter / rules / blurb), for recomputing each preset's expected.
const siteSrc = (s) => ({
  adapter: resolve(root, 'sites', s, 'adapter.css'),
  rules: resolve(root, 'sites', s, 'rules.md'),
  blurb: resolve(root, 'sites', s, 'skill-blurb.md'),
});

// ---------- helpers ----------
/** Inner body between <!-- SLOT:name … --> and <!-- /SLOT:name -->, trimmed. */
function slotBody(src, name) {
  const open = src.indexOf(`<!-- SLOT:${name}`);
  if (open === -1) return null;
  const openEnd = src.indexOf('-->', open);
  const close = src.indexOf(`<!-- /SLOT:${name} -->`, openEnd);
  if (openEnd === -1 || close === -1) return null;
  return src.slice(openEnd + 3, close).trim();
}
/** Custom-property decls of every :root rule, insertion-ordered. */
function rootDecls(css) {
  const map = new Map();
  postcss.parse(css).walkRules(':root', (rule) => {
    rule.walkDecls(/^--/, (d) => map.set(d.prop, d.value));
  });
  return map;
}
const frontmatter = (src) =>
  (src.match(/^---\n([\s\S]*?)\n---/) || ['', ''])[1];
const body = (src) => src.replace(/^---\n[\s\S]*?\n---\n?/, '');
// Markdown link targets: [...](target)
const linkTargets = (src) =>
  [...src.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1].trim());
const HEX = /#[0-9a-fA-F]{3,8}\b/;
// A custom property whose prefix is NOT --stitch- (foreign design-system residue).
const FOREIGN_VAR = /--(?!stitch-)[a-z]+-/;

const skillSrc = readMaybe(P.skillMd);
const readmeSrc = readMaybe(P.readme);

// =====================================================================
// Runbook step 1 — skills-ref validate (frontmatter one-vote-veto)  #29 §Runbook.1
// =====================================================================
check('Runbook', '§Runbook.1', 'skills-ref validate (official)', () => {
  if (!existsSync(P.skillsRefBin))
    return `skills-ref not installed — run \`npm i\` (devDependency skills-ref@0.1.5). check:skill will not skip this silently.`;
  try {
    execFileSync(P.skillsRefBin, ['validate', SKILL_DIR], {
      encoding: 'utf8',
      stdio: 'pipe',
    });
    return true;
  } catch (e) {
    return `skills-ref validate failed: ${(e.stdout || '') + (e.stderr || '') || e.message}`;
  }
});

// =====================================================================
// §1 SKILL.md — spec + self-contained + slots                        #29 §1
// =====================================================================
check('§1 SKILL.md', '§1', 'exists', () =>
  skillSrc !== null ? true : `missing ${P.skillMd}`,
);
if (skillSrc) {
  const fm = frontmatter(skillSrc);
  const nameVal = (fm.match(/^name:\s*(.+)$/m) || ['', ''])[1].trim();

  check('§1 SKILL.md', '§1', 'name == 父目录名', () =>
    nameVal === skillName ? true : `name "${nameVal}" != dir "${skillName}"`,
  );
  check('§1 SKILL.md', '§1', 'name 字符合法', () =>
    /^[a-z0-9]([a-z0-9-]{0,62}[a-z0-9])?$/.test(nameVal) &&
    !nameVal.includes('--')
      ? true
      : `illegal name "${nameVal}"`,
  );

  // description is now the STATIC, theme-neutral frontmatter value (no longer injected
  // from a site blurb) — measure the frontmatter's own `description:` block scalar.
  const fmDescription = (() => {
    const m = fm.match(/description:\s*>\s*\n([\s\S]*?)$/);
    if (!m) return (fm.match(/description:\s*(.+)$/m) || ['', ''])[1].trim();
    return m[1]
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .join(' ')
      .trim();
  })();
  check('§1 SKILL.md', '§1', 'description 非空且 ≤1024', () => {
    const n = fmDescription.length;
    return n > 0 && n <= 1024 ? true : `description length ${n}`;
  });
  check('§1 SKILL.md', '§1', 'SKILL.md < 500 行', () => {
    const n = skillSrc.split('\n').length;
    return n < 500 ? true : `${n} lines`;
  });
  check('§1 SKILL.md', '§1', 'SKILL.md body < 5000 token', () => {
    const n = encode(body(skillSrc)).length;
    return n < 5000 ? true : `${n} tokens`;
  });
  check('§1 SKILL.md', '§1', '文件引用只一层深', () => {
    const bad = linkTargets(skillSrc).filter(
      (t) =>
        t.startsWith('references/') && !/^references\/[^/]+(\/[^/]+)?$/.test(t),
    );
    return bad.length ? `deep refs: ${bad.join(', ')}` : true;
  });
  check('§1 SKILL.md', '§1', '自包含·无外链/无出skill ../ /无外来前缀', () => {
    const problems = [];
    if (/raw\.githubusercontent|github\.com/.test(skillSrc))
      problems.push('external repo link');
    if (linkTargets(skillSrc).some((t) => t.startsWith('../')))
      problems.push('out-of-skill ../ link');
    if (FOREIGN_VAR.test(skillSrc)) problems.push('foreign --*- var prefix');
    if (/\brefero\b/i.test(skillSrc)) problems.push('source bundle "refero"');
    return problems.length ? problems.join('; ') : true;
  });
  check(
    '§1 SKILL.md',
    '§1',
    'default-site 槽已注入·是发布默认站·无占位残留',
    () => {
      const problems = [];
      if (/【槽/.test(skillSrc)) problems.push('【槽 placeholder residue');
      const def = slotBody(skillSrc, 'default-site');
      if (def == null) problems.push('missing SLOT:default-site');
      else if (def !== site)
        problems.push(`default-site "${def}" != published default "${site}"`);
      return problems.length ? problems.join('; ') : true;
    },
  );
  check(
    '§1 SKILL.md',
    '§1',
    'description 主题中性（讲系统·无站名·无烤入招牌散文）',
    () => {
      const problems = [];
      // no site name (denylist = every sites/ dir — zero hardcoded names)
      for (const s of readdirSync(resolve(root, 'sites'), {
        withFileTypes: true,
      })
        .filter((d) => d.isDirectory())
        .map((d) => d.name))
        if (new RegExp(`\\b${s}\\b`, 'i').test(fmDescription))
          problems.push(`site name "${s}" in description`);
      // no per-site blurb description got baked back into the neutral frontmatter
      for (const s of PRESET_SITES) {
        const { description } = parseBlurb(
          readFileSync(siteSrc(s).blurb, 'utf8'),
        );
        if (fmDescription.includes(description))
          problems.push(`${s} blurb description baked into frontmatter`);
      }
      // talks about the design system itself: names the role-variable contract
      if (!/--stitch-/.test(fmDescription))
        problems.push('description does not name the --stitch-* contract');
      return problems.length ? problems.join('; ') : true;
    },
  );
  check(
    '§1 SKILL.md',
    '§1',
    'catalog 槽 == renderCatalog(built families)',
    () => {
      // Built = family's <family>.md exists (builtFamilyRows) — same definition build:refs
      // uses when injecting, so roadmap families with no components in source yet are excluded.
      const rows = builtFamilyRows(parseFamilies(P.families), P.componentsDir);
      const expected = renderCatalog(rows).trim();
      const got = slotBody(skillSrc, 'catalog');
      return got === expected
        ? true
        : 'catalog slot != renderCatalog(built families)';
    },
  );
}

// =====================================================================
// §2 README.md — catalog parity + self-contained                     #29 §2
// =====================================================================
check('§2 README', '§2', 'exists', () =>
  readmeSrc !== null ? true : `missing ${P.readme}`,
);
if (skillSrc && readmeSrc) {
  check('§2 README', '§2', 'catalog 槽 == SKILL.md 同一份', () =>
    slotBody(readmeSrc, 'catalog') === slotBody(skillSrc, 'catalog')
      ? true
      : 'README catalog != SKILL catalog',
  );
  check('§2 README', '§2', '自包含·无外链/无出skill ../ /无外来前缀', () => {
    const problems = [];
    if (/raw\.githubusercontent|github\.com/.test(readmeSrc))
      problems.push('external repo link');
    if (linkTargets(readmeSrc).some((t) => t.startsWith('../')))
      problems.push('out-of-skill ../ link');
    if (FOREIGN_VAR.test(readmeSrc)) problems.push('foreign --*- var prefix');
    if (/\brefero\b/i.test(readmeSrc)) problems.push('source bundle "refero"');
    return problems.length ? problems.join('; ') : true;
  });
}

// =====================================================================
// §3 react-project.md / §4 standalone-html.md — theme-agnostic       #29 §3,§4
// =====================================================================
function themeAgnostic(section, ref, path, { extra = [] } = {}) {
  const src = readMaybe(path);
  check(section, ref, `${basename(path)} exists`, () =>
    src !== null ? true : `missing ${path}`,
  );
  if (src === null) return;
  check(section, ref, '无 hex 主题值', () =>
    HEX.test(src) ? `contains hex: ${src.match(HEX)[0]}` : true,
  );
  check(section, ref, '无引号字体族字面量', () =>
    /font-family:\s*['"]/.test(src) ? 'quoted font-family literal' : true,
  );
  check(section, ref, '引用不出 skill（无 ../../）', () =>
    linkTargets(src).some((t) => t.startsWith('../../'))
      ? 'out-of-skill ../../ link'
      : true,
  );
  for (const [nm, re, msg] of extra)
    check(section, ref, nm, () => (re.test(src) ? msg : true));
}
themeAgnostic('§3 react-project', '§3', P.reactProject);
themeAgnostic('§4 standalone-html', '§4', P.standalone, {
  extra: [
    ['无字面 box-shadow 值', /box-shadow:\s*(#|[0-9])/, 'literal box-shadow'],
    ['无 clip-path polygon 字面', /clip-path:\s*polygon/, 'literal clip-path'],
  ],
});

// =====================================================================
// §5 components/* — one-family-one-file + props == source            #29 §5
// =====================================================================
check('§5 components', '§5', '一族一文件·无 <族>-N.md 分片', () => {
  if (!existsSync(P.componentsDir)) return `missing ${P.componentsDir}`;
  const shards = readdirSync(P.componentsDir).filter((f) =>
    /-\d+\.md$/.test(f),
  );
  return shards.length ? `sharded files: ${shards.join(', ')}` : true;
});
check('§5 components', '§5', 'catalog 每条组件链接指向存在的族文件', () => {
  // Independent of the §1 renderCatalog invariant: whatever the catalog lists, every
  // components/*.md link it carries MUST resolve to a real file — no dead links reach
  // the consumed skill. Catches a roadmap family (e.g. navigation) leaking a link.
  if (skillSrc == null) return 'missing SKILL.md';
  const catalog = slotBody(skillSrc, 'catalog');
  if (catalog == null) return 'missing catalog slot';
  const dead = linkTargets(catalog)
    .filter((t) => t.startsWith('references/components/'))
    .filter((t) => !existsSync(join(SKILL_DIR, t)));
  return dead.length ? `dead catalog links: ${dead.join(', ')}` : true;
});
check(
  '§5 components',
  '§5',
  '组件文件整文件无越界痕迹（animal/源hex/非active站名）',
  () => {
    // #37 收紧：references/components/* is theme-agnostic AND boundary-clean end to end.
    // Everything here is generated from source (interface verbatim + interface-level
    // JSDoc note + demo examples) — the notes.md sidecar is gone (#37), so the WHOLE
    // file must be clean, not just the ```fences```. A denylist hit means a source
    // JSDoc leaked a foreign/out-of-repo trace / a foreign theme value / another site's name
    // into the consumed skill → this fails CI instead of relying on human review.
    //   · animal / Animal Crossing / --animal-  → 外来/越界痕迹（不属独立 DS）
    //   · 源 hex                                → 主题值（值只属 adapter，不属组件参考）
    //   · 非 active 站名（phantom/…）           → 他站长相对比（组件参考主题无关）
    if (!existsSync(P.componentsDir)) return `missing ${P.componentsDir}`;
    const inactiveSites = readdirSync(resolve(root, 'sites'), {
      withFileTypes: true,
    })
      .filter((d) => d.isDirectory() && d.name !== site)
      .map((d) => d.name);
    const denylist = [
      ['animal', /animal/i], // 覆盖 "animal" / "Animal Crossing" / "--animal-"
      ['hex', HEX],
      ...inactiveSites.map((s) => [`site:${s}`, new RegExp(`\\b${s}\\b`, 'i')]),
    ];
    const bad = [];
    for (const f of readdirSync(P.componentsDir).filter((f) =>
      f.endsWith('.md'),
    )) {
      const src = readFileSync(join(P.componentsDir, f), 'utf8');
      for (const [label, re] of denylist) {
        const m = src.match(re);
        if (m) bad.push(`${f}: ${label} → "${m[0]}"`);
      }
    }
    return bad.length ? `boundary leak: ${bad.join('; ')}` : true;
  },
);
check('§5 components', '§5', 'props == 源码（ts-morph 抽取复算）', () => {
  const rows = parseFamilies(P.families);
  const famOf = new Map();
  for (const r of rows) for (const m of r.members) famOf.set(m, r.family);
  const project = propsProjectFor(P.reactTsconfig);
  const components = readdirSync(P.srcComponents, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
    .map((d) => d.name);
  const drift = [];
  for (const name of components) {
    const fam = famOf.get(name);
    if (!fam) continue; // planned-but-unclassified — build:refs warns, not our gate
    const refFile = join(P.componentsDir, `${fam}.md`);
    if (!existsSync(refFile)) continue; // family not yet built
    // Same multi-file scan as build:refs (shared lib): gather the whole component
    // dir so *Config/*Static in types.ts / sibling files are recomputed too.
    const compDir = join(P.srcComponents, name);
    const sourceFiles = project
      .getSourceFiles()
      .filter((sf) => sf.getFilePath().startsWith(compDir + '/'))
      .sort((a, b) => a.getFilePath().localeCompare(b.getFilePath()));
    if (!sourceFiles.length) continue;
    const product = readFileSync(refFile, 'utf8');
    for (const iface of extractPropsInterfaces(sourceFiles, name))
      if (!product.includes(iface.text)) drift.push(`${name}.${iface.name}`);
  }
  return drift.length ? `props drift vs source: ${drift.join(', ')}` : true;
});

// =====================================================================
// §Presets — one preset per publishable site (ADR 0010); set == #7 judge
// =====================================================================
check(
  '§Presets',
  '§Presets',
  'preset 站集合 == listPublishableSites(#7)',
  () => {
    if (!existsSync(P.presetsDir)) return `missing ${P.presetsDir}`;
    const dirs = readdirSync(P.presetsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();
    return JSON.stringify(dirs) === JSON.stringify(PRESET_SITES)
      ? true
      : `preset dirs [${dirs}] != publishable [${PRESET_SITES}]`;
  },
);
check('§Presets', '§Presets', '发布默认站有 preset', () =>
  PRESET_SITES.includes(site)
    ? true
    : `published default "${site}" has no preset`,
);

// =====================================================================
// §6 tokens.css (per preset) — == merge + single :root + prefix + H4  #29 §6
// =====================================================================
for (const s of PRESET_SITES) {
  const src = readMaybe(presetFile(s, 'tokens.css'));
  const { adapter } = siteSrc(s);
  check('§6 tokens.css', '§6', `[${s}] exists`, () =>
    src !== null ? true : `missing ${presetFile(s, 'tokens.css')}`,
  );
  if (src === null) continue;
  check(
    '§6 tokens.css',
    '§6',
    `[${s}] == mergeTokens(contract, adapter)`,
    () =>
      src === mergeTokens(P.contract, adapter, s)
        ? true
        : 'tokens.css != recomputed mergeTokens',
  );
  check('§6 tokens.css', '§6', `[${s}] 首行含 generated + DO NOT EDIT`, () =>
    /generated.*DO NOT EDIT/.test(src.split('\n')[0])
      ? true
      : 'missing DO NOT EDIT header',
  );
  check('§6 tokens.css', '§6', `[${s}] 单个 :root`, () => {
    const n = (src.match(/^:root/gm) || []).length;
    return n === 1 ? true : `${n} :root rules`;
  });
  check('§6 tokens.css', '§6', `[${s}] 全 --stitch-* 前缀`, () => {
    const bad = src
      .split('\n')
      .filter((l) => /^\s*--/.test(l) && !/^\s*--stitch-/.test(l));
    return bad.length ? `non-stitch props: ${bad.length}` : true;
  });
  check('§6 tokens.css', '§6', `[${s}] H4 派生 color-mix() 未被求值`, () => {
    const contract = rootDecls(readFileSync(P.contract, 'utf8'));
    const adp = rootDecls(readFileSync(adapter, 'utf8'));
    const product = rootDecls(src);
    const bad = [];
    for (const [prop, val] of contract) {
      if (!/^color-mix\(/.test(val)) continue;
      // adapter may deliberately override a derived token to a static value.
      if (adp.has(prop) && !/^color-mix\(/.test(adp.get(prop))) continue;
      if (!/^color-mix\(/.test(product.get(prop) || '')) bad.push(prop);
    }
    return bad.length ? `derived evaluated to static: ${bad.join(', ')}` : true;
  });
}

// =====================================================================
// §7 design-rules.md — global, theme-neutral, byte-exact copy         #29 §7
// =====================================================================
check('§7 design-rules', '§7', '== 全局源逐字节', () =>
  existsSync(P.designRules) && existsSync(P.globalDesignRules)
    ? bytesEqual(P.designRules, P.globalDesignRules) ||
      'design-rules.md != global source'
    : 'missing design-rules.md',
);

// =====================================================================
// §8 rules.md (per preset) — byte-exact copy of the site's rules.md   #29 §8
// =====================================================================
for (const s of PRESET_SITES) {
  const p = presetFile(s, 'rules.md');
  const { rules } = siteSrc(s);
  check('§8 rules', '§8', `[${s}] == sites/${s}/rules.md 逐字节`, () =>
    existsSync(p) && existsSync(rules)
      ? bytesEqual(p, rules) || 'rules.md != site source'
      : `missing ${p}`,
  );
}

// =====================================================================
// §9 style.md (per preset) — two blurb sections verbatim + hex/shape  #29 §9
// =====================================================================
for (const s of PRESET_SITES) {
  const p = presetFile(s, 'style.md');
  const src = readMaybe(p);
  const { blurb } = siteSrc(s);
  check('§9 style.md', '§9', `[${s}] exists`, () =>
    src !== null ? true : `missing ${p}`,
  );
  if (src === null) continue;
  check(
    '§9 style.md',
    '§9',
    `[${s}] 两段结构齐（description / style-paragraph）`,
    () =>
      /^##\s+description\s*$/m.test(src) &&
      /^##\s+style-paragraph\s*$/m.test(src)
        ? true
        : 'missing a ## section',
  );
  check('§9 style.md', '§9', `[${s}] == sites/${s}/skill-blurb.md 两段`, () => {
    const got = parseBlurb(src);
    const want = parseBlurb(readFileSync(blurb, 'utf8'));
    return got.description === want.description &&
      got.styleParagraph === want.styleParagraph
      ? true
      : 'style.md sections != frozen blurb';
  });
  check(
    '§9 style.md',
    '§9',
    `[${s}] description ≤1024·无hex / style 一段·无hex`,
    () => {
      const problems = lintBlurb(parseBlurb(src));
      return problems.length ? problems.join('; ') : true;
    },
  );
}

// =====================================================================
// Determinism (command coverage) — idempotence + switch-theme isolation
// Built into THROWAWAY temp dirs; the real skill and git are never touched.
// #29 assigns these to pipeline tests; the issue asks check:skill to also cover them.
// =====================================================================
function seedSkillDir() {
  const dir = mkdtempSync(join(tmpdir(), 'check-skill-'));
  copyFileSync(P.skillMd, join(dir, 'SKILL.md'));
  return dir; // build:skill makes references/theme{,-presets}/ itself
}
const presetFileList = (s) =>
  [`tokens.css`, `rules.md`, `style.md`].map(
    (f) => `references/theme-presets/${s}/${f}`,
  );

check(
  'Determinism',
  '§Runbook(pipeline)',
  '幂等：build:skill 重跑逐字节同',
  () => {
    const dir = seedSkillDir();
    buildSkill({ root, site, skillDir: dir });
    const files = [
      'SKILL.md',
      'references/theme/design-rules.md',
      ...PRESET_SITES.flatMap(presetFileList),
    ];
    const snap = () => files.map((f) => readFileSync(join(dir, f), 'utf8'));
    const first = snap();
    buildSkill({ root, site, skillDir: dir });
    return first.every((v, i) => v === snap()[i])
      ? true
      : 'build:skill not byte-idempotent';
  },
);

// The switch moved to READ time (ADR 0010): all presets coexist in the built skill; the
// consumer's stitch.config.json pointer picks which one the AI reads. Exercise that the
// pointer resolves each publishable site (fallback = published default) and that switching
// it yields a DISTINCT preset (isolation), while the global/theme-neutral files never move.
check(
  'Determinism',
  '§Runbook(read-time)',
  '读时解析：消费指针→对应 preset，无指针→发布默认',
  () => {
    const dir = seedSkillDir();
    buildSkill({ root, site, skillDir: dir });
    const problems = [];
    // no pointer → published default
    const bare = mkdtempSync(join(tmpdir(), 'consumer-bare-'));
    if (resolveActiveSite(bare, site) !== site)
      problems.push(
        'no-pointer consumer did not fall back to published default',
      );
    // each publishable site as a pointer → that site, and its preset dir is present
    for (const s of PRESET_SITES) {
      const c = mkdtempSync(join(tmpdir(), 'consumer-'));
      writeFileSync(
        join(c, 'stitch.config.json'),
        JSON.stringify({ activeSite: s }),
      );
      if (resolveActiveSite(c, site) !== s)
        problems.push(`pointer activeSite=${s} did not resolve to ${s}`);
      for (const f of ['tokens.css', 'rules.md', 'style.md'])
        if (!existsSync(join(dir, `references/theme-presets/${s}/${f}`)))
          problems.push(`resolved preset ${s}/${f} missing`);
    }
    return problems.length ? problems.join('; ') : true;
  },
);

check(
  'Determinism',
  '§Runbook(read-time)',
  '换主题隔离：切指针得不同 preset，全局件不随主题变',
  () => {
    if (PRESET_SITES.length < 2) return true; // need two presets to converge
    const dir = seedSkillDir();
    buildSkill({ root, site, skillDir: dir });
    const [a, b] = PRESET_SITES;
    const read = (s, f) =>
      readFileSync(join(dir, `references/theme-presets/${s}/${f}`), 'utf8');
    const problems = [];
    // switching the pointer a↔b must hand the AI DIFFERENT theme content.
    for (const f of ['tokens.css', 'rules.md', 'style.md'])
      if (read(a, f) === read(b, f))
        problems.push(`${f} identical across presets ${a}/${b} (no switch)`);
    // the global, theme-neutral rules live in ONE place, not per preset → never move.
    if (existsSync(join(dir, 'references/theme-presets', a, 'design-rules.md')))
      problems.push(
        'design-rules.md leaked into a preset dir (should be global)',
      );
    if (!existsSync(join(dir, 'references/theme/design-rules.md')))
      problems.push('global references/theme/design-rules.md missing');
    // SKILL.md skeleton carries no per-site prose beyond the default-site slot: blanking
    // it + catalog yields a theme-free skeleton (no site name anywhere in it).
    const strip = (src) =>
      ['default-site', 'catalog'].reduce((acc, n) => {
        const bd = slotBody(acc, n);
        return bd == null ? acc : acc.replace(bd, '');
      }, src);
    const skel = strip(readFileSync(join(dir, 'SKILL.md'), 'utf8'));
    for (const s of PRESET_SITES)
      if (new RegExp(`\\b${s}\\b`, 'i').test(skel))
        problems.push(`site name "${s}" in SKILL.md skeleton (not isolated)`);
    return problems.length ? problems.join('; ') : true;
  },
);

// ---------- report ----------
const pass = results.filter((r) => r.ok).length;
const fail = results.filter((r) => !r.ok);
let lastSection = '';
for (const r of results) {
  if (r.section !== lastSection) {
    console.log(`\n${r.section}`);
    lastSection = r.section;
  }
  console.log(
    `  ${r.ok ? '✓' : '✗'} [${r.ref}] ${r.name}` +
      (r.ok ? '' : `\n       → ${r.detail}`),
  );
}
console.log(
  `\ncheck:skill ${fail.length ? '✗' : '✓'} site=${site} — ${pass}/${results.length} passed` +
    (fail.length ? `, ${fail.length} FAILED` : ''),
);
process.exit(fail.length ? 1 : 0);
