export function MindBillDocsBrand() {
  return (
    <>
      <span className="brand-lockup" aria-hidden="true">
        <svg className="brand-symbol" viewBox="0 0 100 100" fill="none">
          <g stroke="currentColor" strokeWidth="9" strokeLinecap="square">
            <path d="M18 78 Q 18 22 50 22" />
            <path d="M82 78 Q 82 22 50 22" />
            <line x1="50" y1="40" x2="50" y2="78" />
          </g>
          <circle className="brand-symbol-dot" cx="50" cy="22" r="6" />
        </svg>
        <span className="brand-name">Mind<span>Bill</span></span>
      </span>
      <span className="brand-context" aria-hidden="true">Developer docs</span>
    </>
  );
}
