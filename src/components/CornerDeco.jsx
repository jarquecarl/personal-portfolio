export default function CornerDeco() {
  const svg = (
    <svg viewBox="0 0 40 40" fill="none" stroke="#c9a84c" strokeWidth="1.5">
      <path d="M0 20 L0 0 L20 0"/>
      <path d="M8 20 L8 8 L20 8"/>
    </svg>
  )
  return (
    <>
      <div className="corner-deco tl">{svg}</div>
      <div className="corner-deco tr">{svg}</div>
      <div className="corner-deco bl">{svg}</div>
      <div className="corner-deco br">{svg}</div>
    </>
  )
}
