# 发布分发：scope 包名 + skill 靠 vercel-labs/skills 零自研 + .claude-plugin 双路径

摘成独立 repo（`github.com:HironoOcto/stitch-design-system`）并对外可消费时，**组件库**与 **skill** 走两条独立分发链，各自的名字与机制在此定死。

**组件库**发到 npm，包名 **`@octohirono/stitch-design-system`**（scope 化）。scope = npm 账号 `octohirono`；npm 强制小写，故 import 名恒为全小写 `@octohirono/stitch-design-system`。这个名字同时是 `packages/react/package.json` 的 `name` 与开发别名（`vite.config.ts` alias + `tsconfig.json` paths）的目标——**内部别名 = 外部消费名，一个名字**，杜绝"源码叫 A、发布叫 B"的历史漂移（旧占位 `@stitch/react` 废弃）。skill 的 `references/react-project.md` 教消费者 `import from '@octohirono/stitch-design-system'`，与发布名逐字一致。

**skill** 不自研安装器、不单独发 npm 包，靠第三方通用 CLI **[vercel-labs/skills](https://github.com/vercel-labs/skills)** 从 GitHub repo 直接安装：`npx skills add HironoOcto/stitch-design-system`（交互选 skill + 选目标 agent，76+ agent 各写入自己的 skills 目录，不做格式转换——各 agent 都读共享 Agent Skills 规范）。仓库现有的 `skills/stitch-design-system/SKILL.md`（`skills/<name>/SKILL.md`、frontmatter 有 `name`+`description`）**天然符合** CLI 约定，零结构改动。**额外**提供 `.claude-plugin/`（`plugin.json` + `marketplace.json`），给 Claude Code 用户一条原生 `claude plugins install` 路径。两条路径并存（`npx skills add` 通吃多 agent、`.claude-plugin` 是 Claude 原生），与 mattpocock/skills 同款双给。

## Considered Options

- **自研 npx 安装器发到 npm**（选平台 → 拷到对应目录）：完全可控；但要多维护一个包 + 一套平台映射，等于重造 vercel-labs/skills 已有的轮子（违背"先查再建"）。
- **靠 vercel-labs/skills + .claude-plugin 双路径 ← 采用**：零自研、76+ agent 覆盖、维护成本几乎为零；代价是 `npx skills add` 依赖 repo 公开（或本地路径装）。
- **无 scope 裸名 `stitch-design-system`**：import 最短；但该名 2019 年被 publish→unpublish，能否重占不 100% 保证，且裸名占坑心智负担大。
- **scope 名 `@octohirono/stitch-design-system` ← 采用**：铁定可占（scope=自己账号）、命名空间清晰；代价是 scope 包发布须显式 `--access public`（scope 包默认私有）。

## Consequences

- **repo 须公开**：`npx skills add HironoOcto/stitch-design-system` 从公开 GitHub repo 拉取——独立 repo 必须 public（否则退本地路径装）。
- **scope 包发布须 `--access public`**：`packages/react/package.json` 带 `"publishConfig": { "access": "public" }`，否则首发被当私有包拒。
- **旧名进 denylist**：`@stitch/react` 与裸 `from 'stitch-design-system'` 加进 `check:boundary`，CI 拦回归——防 codegen 或手改把废弃名灌回（虽然现流水线不模板化包名，护栏兜底）。
- **发布名散落点统一**：package.json name + 双别名（vite/tsconfig）+ skill `react-project.md` + 打包/流程文档，全指向同一个 scope 名；改名是一次性静态编辑，无模板会重新生成它。
- **npm 用户名前提**：scope 必须等于 npm 账号名 `octohirono`（GitHub 用户名 ≠ npm 用户名是常见踩坑）——发布前须确认账号名一致。

## Note（2026-09-02）：npm scope 从 `@hironoocto` → `@octohirono`（GitHub owner 不变）

发布前把 **npm scope** 从占位 `@hironoocto` 改为 `@octohirono`（= npm 账号名 `octohirono`，scope 须等于账号名）。**GitHub owner 保持 `HironoOcto` 不变**——`npx skills add HironoOcto/stitch-design-system`、repo、git remote、`.claude-plugin`（plugin 作者/URL、marketplace `name: hironoocto` + owner）全不动。即 **GitHub 账号（`HironoOcto`）与 npm scope（`@octohirono`）刻意不同名、各自独立**（GitHub owner 与 npm 账号本就是两套身份）。改动仅限 npm scope 的散落点：`packages/react/package.json` name + 双别名（vite/tsconfig）+ demo import + skill `react-project.md` import + 相关文档；`npm run ci` 全绿。
