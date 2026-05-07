import { NavLink, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/', label: 'HOME' },
  { path: '/about', label: 'WHO AM I' },
  { path: '/hobbies', label: 'HOBBIES' },
  { path: '/activities', label: 'ACTIVITIES' },
  { path: '/hub', label: 'EXPLORE' },
  { path: '/skills', label: 'ABILITIES' },
  { path: '/certifications', label: 'CERTS' },
  { path: '/projects', label: 'PROJECTS' },
  { path: '/contact', label: 'CONTACT' },
]

export default function FloatingNav() {
  const location = useLocation()
  if (location.pathname === '/admin') return null

  return (
    <nav className="floating-nav">
      {navItems.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          end={item.path === '/'}
        >
          <span className="nav-item-label">{item.label}</span>
          <div className="nav-dot" />
        </NavLink>
      ))}
    </nav>
  )
}
