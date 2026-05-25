// Next.js re-mounts this component on every client-side navigation,
// which makes it the correct place for page-enter CSS animations.
// Uses no JS — the animation runs entirely via a CSS keyframe defined in globals.css.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div style={{ animation: 'page-enter 0.18s ease-out' }}>{children}</div>
}
