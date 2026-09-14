/** A short strip of film frames: the badge on score plaques. Decorative. */
export function FilmStripIcon({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 26" className={className}>
      <rect x="1.5" y="1.5" width="61" height="23" rx="2" fill="#0d0c0b" stroke="#efe7d6" strokeWidth="2.5" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={7 + i * 13.5} y="7.5" width="10" height="11" rx="1" fill="#efe7d6" />
      ))}
    </svg>
  );
}
