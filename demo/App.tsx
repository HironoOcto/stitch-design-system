// demo/App.tsx —— 换肤外壳（方案 B）：侧栏 + 顶栏 + 内容区 + hash 路由。
// 外壳/侧栏一律只读 var(--stitch-*)，切 activeSite 整站换肤（含侧栏）。

import { useEffect, useState } from 'react';
import { sites, setSite, getSite } from './theme';
import { nav, demos } from './registry';
import './shell.less';

function useHashRoute(): string {
  const [route, setRoute] = useState(() =>
    window.location.hash.replace(/^#\/?/, ''),
  );
  useEffect(() => {
    const on = () => setRoute(window.location.hash.replace(/^#\/?/, ''));
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

function useSite(): [string, (s: string) => void] {
  const [site, setSiteState] = useState(getSite);
  const change = (s: string) => {
    setSite(s);
    setSiteState(s);
  };
  return [site, change];
}

export default function App() {
  const route = useHashRoute();
  const [site, changeSite] = useSite();

  // 默认落到第一个已建组件（没有路由或路由无效时）
  const firstKey = nav[0]?.members[0]?.key;
  const activeKey = demos[route] ? route : firstKey;
  const active = activeKey ? demos[activeKey] : undefined;

  return (
    <div className="shell">
      <aside className="shell__sidebar">
        <div className="shell__brand">stitch</div>
        <nav className="shell__nav">
          {nav.map((group) => (
            <div key={group.family} className="shell__group">
              <div className="shell__group-title">{group.family}</div>
              <ul className="shell__member-list">
                {group.members.map((m) => (
                  <li key={m.key}>
                    <a
                      href={`#/${m.key}`}
                      className={
                        'shell__member' +
                        (m.key === activeKey ? ' shell__member--active' : '')
                      }
                    >
                      {m.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div className="shell__main">
        <header className="shell__topbar">
          <div className="shell__topbar-title">
            {active?.meta.title ?? 'stitch-design-system'}
          </div>
          <label className="shell__switcher">
            <span className="shell__switcher-label">site</span>
            <select
              className="shell__switcher-select"
              value={site}
              onChange={(e) => changeSite(e.target.value)}
            >
              {sites.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        </header>

        <main className="shell__content">
          {active ? (
            <article className="page">
              <h1 className="page__title">{active.meta.title}</h1>
              <p className="page__desc">{active.meta.description}</p>
              <div className="page__examples">
                <active.Component />
              </div>
            </article>
          ) : (
            <p className="shell__empty">
              还没有已建的 demo 组件。丢一个 demo/components/&lt;X&gt;/
              即可上架。
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
