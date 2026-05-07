/**
 * Branded full-screen loader for in-app data fetches. Renders the same brand
 * visuals as the splash but skips the timed reveal — content appears instantly
 * and only the continuous cues (rotating gold hand, scent wisps, dots) animate.
 *
 * Use on pages that gate their entire UI on a single fetch (PDP, set detail,
 * order confirmation). Don't use for component-level skeletons or modal opens.
 */

const LOADER_CSS = `
.brand-loader {
  --cream: #efece6;
  --ink: #1a1814;
  --ink-soft: #1a181499;
  --gold: #b08a4a;
  position: fixed;
  inset: 0;
  background: var(--cream);
  color: var(--ink);
  font-family: 'DM Sans', system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overscroll-behavior: contain;
}
.brand-loader::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 30%, rgba(176, 138, 74, 0.06), transparent 60%),
    radial-gradient(circle at 20% 80%, rgba(0,0,0,0.025), transparent 50%);
  pointer-events: none;
}
.brand-loader .ms-ornament {
  position: absolute; width: 80px; height: 80px;
  color: var(--ink-soft); opacity: 1;
}
.brand-loader .ms-ornament.tl { top: max(32px, env(safe-area-inset-top, 32px)); left: max(32px, env(safe-area-inset-left, 32px)); }
.brand-loader .ms-ornament.tr { top: max(32px, env(safe-area-inset-top, 32px)); right: max(32px, env(safe-area-inset-right, 32px)); transform: scaleX(-1); }
.brand-loader .ms-ornament.bl { bottom: max(32px, env(safe-area-inset-bottom, 32px)); left: max(32px, env(safe-area-inset-left, 32px)); transform: scaleY(-1); }
.brand-loader .ms-ornament.br { bottom: max(32px, env(safe-area-inset-bottom, 32px)); right: max(32px, env(safe-area-inset-right, 32px)); transform: scale(-1, -1); }
.brand-loader .ms-icon { width: 220px; height: 280px; color: var(--ink); overflow: visible; }
.brand-loader .ms-icon .ms-stroke {
  stroke: currentColor; fill: none; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round;
}
.brand-loader .ms-icon .ms-marker { fill: var(--ink); opacity: 1; }
.brand-loader .ms-wm-modest, .brand-loader .ms-wm-shop {
  fill: var(--ink); font-family: 'DM Sans', sans-serif; text-anchor: middle; opacity: 1;
}
.brand-loader .ms-wm-modest { font-weight: 900; font-size: 28px; letter-spacing: 1px; }
.brand-loader .ms-wm-shop { font-weight: 500; font-size: 11px; letter-spacing: 6px; fill: var(--ink-soft); }
.brand-loader .ms-hand {
  stroke: var(--gold); stroke-width: 2; stroke-linecap: round;
  transform-origin: 110px 175px;
  animation: bl-tick 2.4s cubic-bezier(0.55, 0.1, 0.4, 1) infinite;
}
@keyframes bl-tick { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.brand-loader .ms-pivot { fill: var(--gold); }
.brand-loader .ms-wisp {
  fill: none; stroke: var(--gold); stroke-width: 1.4; stroke-linecap: round;
  opacity: 0; transform-origin: center;
  animation: bl-rise 3.4s ease-out infinite;
}
.brand-loader .ms-wisp.w1 { animation-delay: 0s; }
.brand-loader .ms-wisp.w2 { animation-delay: 0.8s; }
.brand-loader .ms-wisp.w3 { animation-delay: 1.6s; }
.brand-loader .ms-wisp.w4 { animation-delay: 0.4s; }
@keyframes bl-rise {
  0% { opacity: 0; transform: translateY(0) scale(0.8); }
  20% { opacity: 0.7; }
  60% { opacity: 0.4; }
  100% { opacity: 0; transform: translateY(-60px) scale(1.4); }
}
.brand-loader .ms-caption {
  margin-top: 28px; display: flex; align-items: center; gap: 16px;
  padding: 0 24px;
}
.brand-loader .ms-rule { width: 60px; height: 1px; background: var(--ink-soft); flex-shrink: 0; }
.brand-loader .ms-label {
  font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 300;
  font-size: 0.95rem; letter-spacing: 0.18em; color: var(--ink); white-space: nowrap;
}
.brand-loader .ms-meta {
  margin-top: 14px; font-size: 0.65rem; font-weight: 500; color: var(--ink-soft);
  letter-spacing: 0.4em; text-transform: uppercase;
}
.brand-loader .ms-status {
  position: absolute; bottom: calc(56px + env(safe-area-inset-bottom, 0px));
  left: 50%; transform: translateX(-50%);
  font-size: 0.65rem; font-weight: 500; color: var(--ink-soft);
  letter-spacing: 0.4em; text-transform: uppercase; white-space: nowrap;
}
.brand-loader .ms-dots { display: inline-block; width: 1.4em; text-align: left; }
.brand-loader .ms-dots span { opacity: 0; animation: bl-dot 1.6s ease-in-out infinite; }
.brand-loader .ms-dots span:nth-child(1) { animation-delay: 0.0s; }
.brand-loader .ms-dots span:nth-child(2) { animation-delay: 0.2s; }
.brand-loader .ms-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes bl-dot { 0%, 80%, 100% { opacity: 0; } 40% { opacity: 1; } }
@media (max-width: 640px) {
  .brand-loader .ms-ornament { width: 48px; height: 48px; }
  .brand-loader .ms-ornament.tl { top: max(20px, env(safe-area-inset-top, 20px)); left: max(20px, env(safe-area-inset-left, 20px)); }
  .brand-loader .ms-ornament.tr { top: max(20px, env(safe-area-inset-top, 20px)); right: max(20px, env(safe-area-inset-right, 20px)); }
  .brand-loader .ms-ornament.bl { bottom: max(20px, env(safe-area-inset-bottom, 20px)); left: max(20px, env(safe-area-inset-left, 20px)); }
  .brand-loader .ms-ornament.br { bottom: max(20px, env(safe-area-inset-bottom, 20px)); right: max(20px, env(safe-area-inset-right, 20px)); }
  .brand-loader .ms-icon { width: 168px; height: 214px; }
  .brand-loader .ms-rule { width: 36px; }
  .brand-loader .ms-label { font-size: 0.85rem; letter-spacing: 0.16em; }
  .brand-loader .ms-meta { font-size: 0.58rem; letter-spacing: 0.32em; }
  .brand-loader .ms-status { bottom: calc(36px + env(safe-area-inset-bottom, 0px)); font-size: 0.58rem; letter-spacing: 0.32em; }
}
@media (max-width: 380px) {
  .brand-loader .ms-icon { width: 144px; height: 184px; }
  .brand-loader .ms-rule { width: 28px; }
  .brand-loader .ms-caption { gap: 12px; margin-top: 22px; }
  .brand-loader .ms-label { font-size: 0.78rem; }
}
@media (max-height: 500px) {
  .brand-loader .ms-ornament { display: none; }
  .brand-loader .ms-icon { width: 140px; height: 178px; }
  .brand-loader .ms-caption { margin-top: 18px; }
  .brand-loader .ms-meta { margin-top: 10px; }
  .brand-loader .ms-status { bottom: calc(20px + env(safe-area-inset-bottom, 0px)); }
}
@media (prefers-reduced-motion: reduce) {
  .brand-loader *, .brand-loader *::before, .brand-loader *::after { animation: none !important; transition: none !important; }
}
`;

interface BrandLoaderProps {
  show?: boolean;
}

export function BrandLoader({ show = true }: BrandLoaderProps) {
  if (!show) return null;
  return (
    <>
      <style>{LOADER_CSS}</style>
      <div className="brand-loader" role="status" aria-live="polite" aria-label="Loading">
        <svg className="ms-ornament tl" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="0.8" aria-hidden="true">
          <path d="M2 30 L2 2 L30 2"/><path d="M2 16 L16 16 L16 2" opacity="0.5"/><circle cx="2" cy="2" r="1.5" fill="currentColor"/>
        </svg>
        <svg className="ms-ornament tr" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="0.8" aria-hidden="true">
          <path d="M2 30 L2 2 L30 2"/><path d="M2 16 L16 16 L16 2" opacity="0.5"/><circle cx="2" cy="2" r="1.5" fill="currentColor"/>
        </svg>
        <svg className="ms-ornament bl" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="0.8" aria-hidden="true">
          <path d="M2 30 L2 2 L30 2"/><path d="M2 16 L16 16 L16 2" opacity="0.5"/><circle cx="2" cy="2" r="1.5" fill="currentColor"/>
        </svg>
        <svg className="ms-ornament br" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="0.8" aria-hidden="true">
          <path d="M2 30 L2 2 L30 2"/><path d="M2 16 L16 16 L16 2" opacity="0.5"/><circle cx="2" cy="2" r="1.5" fill="currentColor"/>
        </svg>

        <svg className="ms-icon" viewBox="0 0 220 280" aria-hidden="true">
          <g transform="translate(110, 50)">
            <path className="ms-wisp w1" d="M-14 0 q -6 -8 0 -16 q 6 -8 0 -16"/>
            <path className="ms-wisp w2" d="M0 0 q 6 -10 0 -20 q -6 -10 0 -20"/>
            <path className="ms-wisp w3" d="M14 0 q -6 -8 0 -16 q 6 -8 0 -16"/>
            <path className="ms-wisp w4" d="M-6 -4 q 8 -10 0 -22"/>
          </g>
          <g className="ms-stroke">
            <rect x="92" y="68" width="36" height="14" rx="2"/>
            <line x1="110" y1="82" x2="110" y2="98"/>
            <circle cx="110" cy="175" r="68"/>
          </g>
          <circle className="ms-marker" cx="110" cy="115" r="1.6"/>
          <circle className="ms-marker" cx="170" cy="175" r="1.6"/>
          <circle className="ms-marker" cx="110" cy="235" r="1.6"/>
          <circle className="ms-marker" cx="50" cy="175" r="1.6"/>
          <text className="ms-wm-modest" x="110" y="178">MODEST</text>
          <text className="ms-wm-shop" x="110" y="200">S H O P</text>
          <line className="ms-hand" x1="110" y1="175" x2="110" y2="120"/>
          <circle className="ms-pivot" cx="110" cy="175" r="2.5"/>
        </svg>

        <div className="ms-caption">
          <span className="ms-rule" />
          <span className="ms-label">Atelier de Parfum</span>
          <span className="ms-rule" />
        </div>
        <div className="ms-meta">Fragrance Boutique</div>
        <div className="ms-status">
          Composing your visit<span className="ms-dots"><span>.</span><span>.</span><span>.</span></span>
        </div>
      </div>
    </>
  );
}

export default BrandLoader;
