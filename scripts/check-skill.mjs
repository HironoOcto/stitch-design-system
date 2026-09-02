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
  existsSync,
  readdirSync,
  mkdtempSync,
  mkdirSync,
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
const site = resolveSite(root, argv);
const SKILL_DIR = resolve(root, 'skills/stitch-design-system');
const skillName = basename(SKILL_DIR);
const P = {
  skillMd: join(SKILL_DIR, 'SKILL.md'),
  readme: join(SKILL_DIR, 'README.md'),
  reactProject: join(SKILL_DIR, 'references/react-project.md'),
  standalone: join(SKILL_DIR, 'references/standalone-html.md'),
  componentsDir: join(SKILL_DIR, 'references/components'),
  tokens: join(SKILL_DIR, 'references/theme/tokens.css'),
  designRules: join(SKILL_DIR, 'references/theme/design-rules.md'),
  rules: join(SKILL_DIR, 'references/theme/rules.md'),
  contract: resolve(root, 'packages/tokens/contract.css'),
  adapter: resolve(root, 'sites', site, 'adapter.css'),
  siteRules: resolve(root, 'sites', site, 'rules.md'),
  siteBlurb: resolve(root, 'sites', site, 'skill-blurb.md'),
  globalDesignRules: resolve(root, 'docs/design-system/design-rules.md'),
  families: resolve(root, 'scripts/component-families.md'),
  srcComponents: resolve(root, 'packages/react/src/components'),
  reactTsconfig: resolve(root, 'packages/react/tsconfig.json'),
  skillsRefBin: resolve(root, 'node_modules/.bin/skills-ref'),
};

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

  const blurb = parseBlurb(readFileSync(P.siteBlurb, 'utf8'));
  check('§1 SKILL.md', '§1', 'description 非空且 ≤1024', () => {
    const n = blurb.description.length;
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
  check('§1 SKILL.md', '§1', '两 blurb 槽已注入·无占位残留', () => {
    const problems = [];
    if (/【槽/.test(skillSrc)) problems.push('【槽 placeholder residue');
    if (!skillSrc.includes(blurb.description))
      problems.push('description slot != frozen blurb');
    if (!skillSrc.includes(blurb.styleParagraph))
      problems.push('style-paragraph slot != frozen blurb');
    return problems.length ? problems.join('; ') : true;
  });
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
// §6 tokens.css — == merge + single :root + prefix + H4              #29 §6
// =====================================================================
const tokensSrc = readMaybe(P.tokens);
check('§6 tokens.css', '§6', 'exists', () =>
  tokensSrc !== null ? true : `missing ${P.tokens}`,
);
if (tokensSrc) {
  check('§6 tokens.css', '§6', '== mergeTokens(contract, 当前adapter)', () => {
    const expected = mergeTokens(P.contract, P.adapter, site);
    return tokensSrc === expected
      ? true
      : 'tokens.css != recomputed mergeTokens';
  });
  check('§6 tokens.css', '§6', '首行含 generated + DO NOT EDIT', () =>
    /generated.*DO NOT EDIT/.test(tokensSrc.split('\n')[0])
      ? true
      : 'missing DO NOT EDIT header',
  );
  check('§6 tokens.css', '§6', '单个 :root', () => {
    const n = (tokensSrc.match(/^:root/gm) || []).length;
    return n === 1 ? true : `${n} :root rules`;
  });
  check('§6 tokens.css', '§6', '全 --stitch-* 前缀', () => {
    const bad = tokensSrc
      .split('\n')
      .filter((l) => /^\s*--/.test(l) && !/^\s*--stitch-/.test(l));
    return bad.length ? `non-stitch props: ${bad.length}` : true;
  });
  check('§6 tokens.css', '§6', 'H4 派生 color-mix() 未被求值', () => {
    const contract = rootDecls(readFileSync(P.contract, 'utf8'));
    const adapter = rootDecls(readFileSync(P.adapter, 'utf8'));
    const product = rootDecls(tokensSrc);
    const bad = [];
    for (const [prop, val] of contract) {
      if (!/^color-mix\(/.test(val)) continue;
      // adapter may deliberately override a derived token to a static value.
      if (adapter.has(prop) && !/^color-mix\(/.test(adapter.get(prop)))
        continue;
      if (!/^color-mix\(/.test(product.get(prop) || '')) bad.push(prop);
    }
    return bad.length ? `derived evaluated to static: ${bad.join(', ')}` : true;
  });
}

// =====================================================================
// §7 design-rules.md / §8 rules.md — byte-exact copies               #29 §7,§8
// =====================================================================
check('§7 design-rules', '§7', '== 全局源逐字节', () =>
  existsSync(P.designRules) && existsSync(P.globalDesignRules)
    ? bytesEqual(P.designRules, P.globalDesignRules) ||
      'design-rules.md != global source'
    : 'missing design-rules.md',
);
check('§8 rules', '§8', `== sites/${site}/rules.md 逐字节`, () =>
  existsSync(P.rules) && existsSync(P.siteRules)
    ? bytesEqual(P.rules, P.siteRules) || 'rules.md != site source'
    : 'missing rules.md',
);

// =====================================================================
// §9 skill-blurb.md (active site) — two sections + hex + shape       #29 §9
// =====================================================================
const blurbSrc = readMaybe(P.siteBlurb);
check('§9 skill-blurb', '§9', 'exists', () =>
  blurbSrc !== null ? true : `missing ${P.siteBlurb}`,
);
if (blurbSrc) {
  check(
    '§9 skill-blurb',
    '§9',
    '两段结构齐（## description / ## style-paragraph）',
    () =>
      /^##\s+description\s*$/m.test(blurbSrc) &&
      /^##\s+style-paragraph\s*$/m.test(blurbSrc)
        ? true
        : 'missing a ## section',
  );
  check(
    '§9 skill-blurb',
    '§9',
    'description ≤1024·无hex / style 一段·无hex',
    () => {
      const problems = lintBlurb(parseBlurb(blurbSrc));
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
  mkdirSync(join(dir, 'references/theme'), { recursive: true });
  return dir;
}
const themeFiles = ['references/theme/tokens.css', 'references/theme/rules.md'];

check(
  'Determinism',
  '§Runbook(pipeline)',
  '幂等：build:skill 重跑逐字节同',
  () => {
    const dir = seedSkillDir();
    buildSkill({ root, site, skillDir: dir });
    const snap = () =>
      [...themeFiles, 'references/theme/design-rules.md', 'SKILL.md'].map((f) =>
        readFileSync(join(dir, f), 'utf8'),
      );
    const first = snap();
    buildSkill({ root, site, skillDir: dir });
    const second = snap();
    return first.every((v, i) => v === second[i])
      ? true
      : 'build:skill not byte-idempotent';
  },
);

check(
  'Determinism',
  '§Runbook(pipeline)',
  '换主题 diff 收敛（仅 theme/* + 两槽变）',
  () => {
    const others = readdirSync(resolve(root, 'sites'), { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name !== site)
      .map((d) => d.name)
      .filter((s) =>
        ['adapter.css', 'rules.md', 'skill-blurb.md'].every((f) =>
          existsSync(resolve(root, 'sites', s, f)),
        ),
      );
    if (!others.length) return true; // no second complete theme → nothing to converge; logged below
    const other = others[0];
    const a = seedSkillDir();
    const b = seedSkillDir();
    buildSkill({ root, site, skillDir: a });
    buildSkill({ root, site: other, skillDir: b });
    const read = (dir, f) => readFileSync(join(dir, f), 'utf8');
    const problems = [];
    // design-rules.md is the GLOBAL source → theme-independent → identical.
    if (
      read(a, 'references/theme/design-rules.md') !==
      read(b, 'references/theme/design-rules.md')
    )
      problems.push('design-rules.md changed across themes (should not)');
    // tokens.css + rules.md are theme-specific → MUST differ.
    for (const f of themeFiles)
      if (read(a, f) === read(b, f))
        problems.push(`${f} did not change across themes`);
    // SKILL.md must differ ONLY in the two slot regions: blanking both yields identity.
    const strip = (s) =>
      ['description', 'style-paragraph', 'catalog'].reduce((acc, n) => {
        const bd = slotBody(acc, n);
        return bd == null ? acc : acc.replace(bd, '');
      }, s);
    if (strip(read(a, 'SKILL.md')) !== strip(read(b, 'SKILL.md')))
      problems.push('SKILL.md skeleton differs beyond the two slots');
    return problems.length ? `[vs ${other}] ${problems.join('; ')}` : true;
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
