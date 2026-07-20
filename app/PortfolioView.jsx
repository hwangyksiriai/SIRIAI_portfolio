'use client';

import { useEffect, useRef, useState } from 'react';

const BRAND_SYMBOL = '/media/brand/symbol.png';
const BRAND_LOGO = '/media/brand/logo-white.png';

function Clip({ src, landscape }) {
  const cls = 'clip' + (landscape ? ' landscape' : '') + (src ? '' : ' empty');
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!src || !ref.current) return;
    const el = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [src]);

  return (
    <div className={cls} ref={ref}>
      {src ? (
        visible && <video className="fill" src={src} autoPlay muted loop playsInline />
      ) : (
        <span className="slot-msg"><span className="plus">+</span><span className="label">준비중</span></span>
      )}
    </div>
  );
}

function IdxTag({ n, label }) {
  return (
    <div className="idx-tag">
      {n != null && <span className="accent">{String(n).padStart(2, '0')}</span>}
      {n != null && <span className="rule"></span>}
      <span>{label}</span>
    </div>
  );
}

function RegionToggle({ regions, active, onChange }) {
  return (
    <div className="region-toggle">
      {regions.map((r) => (
        <button
          key={r.key}
          type="button"
          className={'region-btn' + (r.key === active ? ' active' : '')}
          onClick={() => onChange(r.key)}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

function CategorySection({ cat, idx }) {
  const hasRegions = Array.isArray(cat.regions) && cat.regions.length > 0;
  const [activeRegion, setActiveRegion] = useState(hasRegions ? cat.regions[0].key : null);
  const clips = hasRegions
    ? (cat.regions.find((r) => r.key === activeRegion)?.clips || [])
    : (cat.clips || []);

  return (
    <section className="page" id={cat.id}>
      <IdxTag n={idx} label={(cat.tag || cat.navLabel).toUpperCase()} />
      <div className="cat-head">
        <h1 className="disp">{cat.title}</h1>
        {hasRegions && (
          <RegionToggle regions={cat.regions} active={activeRegion} onChange={setActiveRegion} />
        )}
      </div>
      <div className="clip-grid">
        {cat.layout === 'travel' ? (
          <div className="travel-grid">
            {[0, 1].map((colIndex) => {
              const half = Math.ceil(clips.length / 2);
              const colClips = colIndex === 0 ? clips.slice(0, half) : clips.slice(half);
              return (
                <div className="travel-col" key={colIndex}>
                  {(colClips.length ? colClips : [null]).map((src, i) => (
                    <Clip key={i} src={src} landscape />
                  ))}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="reel-strip">
            {(clips.length ? clips : [null]).map((src, i) => (
              <Clip key={i} src={src} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function PortfolioView({ config }) {
  const deckRef = useRef(null);
  const pageRefs = useRef([]);
  const [activeCat, setActiveCat] = useState(config.categories[0]?.id);
  const [pageLabel, setPageLabel] = useState('01');

  const categories = config.categories;
  const totalPages = 3 + categories.length; // cover, values, segments + categories

  function collectPages() {
    if (!deckRef.current) return [];
    return Array.from(deckRef.current.querySelectorAll('.page'));
  }

  function currentIndex() {
    const pages = collectPages();
    const y = deckRef.current.scrollTop;
    let idx = 0;
    let best = Infinity;
    pages.forEach((p, i) => {
      const d = Math.abs(p.offsetTop - y);
      if (d < best) { best = d; idx = i; }
    });
    return idx;
  }

  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;

    function update() {
      const pages = collectPages();
      const i = currentIndex();
      setPageLabel(String(i + 1).padStart(2, '0'));
      const id = pages[i]?.id;
      if (id) setActiveCat(id);
    }

    function onKeydown(e) {
      if (!['ArrowDown', 'ArrowUp'].includes(e.key)) return;
      e.preventDefault();
      const pages = collectPages();
      const i = currentIndex();
      const next = e.key === 'ArrowDown' ? Math.min(i + 1, pages.length - 1) : Math.max(i - 1, 0);
      pages[next].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    let wheelLocked = false;
    function onWheel(e) {
      if (e.deltaY <= 0) return; // scrolling up stays free, no snapping
      e.preventDefault();
      if (wheelLocked) return;
      const pages = collectPages();
      const i = currentIndex();
      const next = Math.min(i + 1, pages.length - 1);
      if (next === i) return;
      wheelLocked = true;
      pages[next].scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => { wheelLocked = false; }, 700);
    }

    deck.addEventListener('scroll', update, { passive: true });
    deck.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeydown);
    update();
    return () => {
      deck.removeEventListener('scroll', update);
      deck.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeydown);
    };
  }, []);

  function goToCategory(id) {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <>
      <nav className="cat-nav" id="cat-nav">
        <div className="cat-nav-inner">
          <a className="wordmark" href="#" onClick={(e) => { e.preventDefault(); deckRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <span className="mark"><img src={BRAND_SYMBOL} alt="" /></span>
            <img className="word-logo" src={BRAND_LOGO} alt="Siriai" />
          </a>
          <div className="cat-nav-links">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className={activeCat === cat.id ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); goToCategory(cat.id); }}
              >
                {cat.navLabel}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <div className="deck" id="deck" ref={deckRef}>
        {/* 01 COVER */}
        <section className="page cover">
          <div className="cover-top">
            <div className="cover-title">
              <img className="cover-logo" src={BRAND_LOGO} alt="Siriai" />
              <div className="jp">しりあい</div>
            </div>
            <div className="cover-copy">
              <p className="primary">새로움을 설계하는 프라이빗 인플루언서 풀<br />—그것이 SIRIAI의 방식입니다.</p>
              <p className="secondary">시리아이는 브랜드의 미적 기준과 정교하게 호흡하는 감도 높은 크리에이터를<br />기반으로 큐레이션을 수행합니다. AI 기반 분석과 무드 중심 선별 방식을 결합해,<br />브랜드의 아이덴티티에 가장 근접한 인플루언서를 제공합니다.</p>
            </div>
          </div>
          <div className="cover-still">
            <img className="fill" src="/media/cover.png" alt="" onError={(e) => e.currentTarget.remove()} />
          </div>
        </section>

        {/* 02 VALUES */}
        <section className="page">
          <h1 className="disp" style={{ fontSize: 'clamp(42px,6.2vw,68px)', marginTop: '48px' }}>Curating Creators,<br />Elevating Brands</h1>
          <div className="values-grid">
            <div className="value-card">
              <div className="still"><img src="/media/value-1.png" alt="" onError={(e) => e.currentTarget.remove()} /></div>
              <h3>Mood-Centric Curation</h3>
              <p>브랜드에 딱 맞는 크리에이터를 선별해,<br />브랜드의 가치를 더 높여드립니다.</p>
            </div>
            <div className="value-card">
              <div className="still"><img src="/media/value-2.png" alt="" onError={(e) => e.currentTarget.remove()} /></div>
              <h3>AI-Driven Discovery</h3>
              <p>AI 시스템을 통해 신규 인플루언서를<br />지속적으로 발굴합니다.</p>
            </div>
            <div className="value-card">
              <div className="still"><img src="/media/value-3.png" alt="" onError={(e) => e.currentTarget.remove()} /></div>
              <h3>Premium Content Quality</h3>
              <p>합리적 고효율 · 높은 영상 퀄리티로<br />캠페인마다 중복 없는 풀을 설계합니다.</p>
            </div>
          </div>
        </section>

        {/* 03 SEGMENTS */}
        <section className="page">
          <h1 className="disp" style={{ fontSize: 'clamp(42px,6.2vw,68px)', marginTop: '48px' }}>Our Core<br />Campaign Segments</h1>
          <p className="lead">SIRIAI는 다양한 카테고리의 캠페인을 폭넓게 수행하며,<br />브랜드별 니즈에 맞춘 인플루언서 협업을 설계합니다.</p>
          <div className="seg-grid">
            {categories.map((cat, i) => (
              <a className="seg-cell" href={`#${cat.id}`} key={cat.id} onClick={(e) => { e.preventDefault(); goToCategory(cat.id); }}>
                <SegIcon id={cat.id} />
                <div className="name">{cat.navLabel}</div>
              </a>
            ))}
          </div>
        </section>

        {categories.map((cat, i) => (
          <CategorySection cat={cat} idx={1 + i} key={cat.id} />
        ))}
      </div>

      <div className="hud">
        <div className="hud-pill">{pageLabel} / {totalPages}</div>
        <div className="hud-pill">↑ ↓ ARROW KEYS</div>
      </div>

      <a className="contact-fab" href="mailto:jysiriai@gmail.com">문의하기</a>
    </>
  );
}

const ICONS = {
  'cat-beauty': <path d="M12 3c3 4 6 7.6 6 11.2A6 6 0 1 1 6 14.2C6 10.6 9 7 12 3Z" />,
  'cat-living': <><path d="M9 3h6M10 3v3h4V3M8 6h8l1 3H7l1-3Z" /><rect x="6" y="9" width="12" height="12" rx="2" /></>,
  'cat-fashion': <><path d="M12 4a2 2 0 1 1 2 2c-.4.8-1.1 1.3-2 1.3s-1.6-.5-2-1.3a2 2 0 1 1 2-2Z" /><path d="M12 7 3 11l2 2 2-1v8h10v-8l2 1 2-2Z" /></>,
  'cat-travel': <path d="M3 12h18M3 12l5-5M3 12l5 5M21 12l-5-5M21 12l-5 5" />,
  'cat-fnb': <path d="M6 3v7a3 3 0 0 0 3 3v8M9 3v6M12 3v6M17 3c-2 1-2 4-2 6s.6 3 2 3v9" />,
  'cat-artist': <><path d="M3 10v4h4l5 5V5L7 10H3Z" /><path d="M16 8a5 5 0 0 1 0 8" /></>,
  'cat-celebrity': <><path d="M15 12a4 4 0 1 0-4-4M8 21v-2a5 5 0 0 1 5-5h1M18 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="3.2" /></>,
  'cat-health': <path d="M20.8 7.6c0 5-4.4 8-8.8 11.4C7.6 15.6 3.2 12.6 3.2 7.6a4.4 4.4 0 0 1 8-2.6 4.4 4.4 0 0 1 8 0 4.4 4.4 0 0 1 1.6 2.6Z" />,
  'cat-medical': <><path d="M12 3v6M9 6h6" /><rect x="4" y="9" width="16" height="12" rx="1.5" /><path d="M9 14h6M12 11v6" /></>,
  'cat-popup': <path d="M4 9l1-5h14l1 5M4 9v10h16V9M4 9h16M9 19v-6h6v6" />,
};

function SegIcon({ id }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6">
      {ICONS[id] || null}
    </svg>
  );
}
