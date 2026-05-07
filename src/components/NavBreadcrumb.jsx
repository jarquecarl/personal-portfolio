export default function NavBreadcrumb({ section }) {
  return (
    <div className="nav-breadcrumb">
      <div className="nav-logo" onClick={() => window.openAdminModal?.()}>
        <svg viewBox="0 0 24 24">
          <path d="M12 2L22 8.5V15.5L12 22L2 15.5V8.5L12 2Z" />
        </svg>
      </div>
      <span className="nav-section-name">{section}</span>
    </div>
  )
}
