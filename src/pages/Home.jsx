import { Link } from 'react-router-dom'
import NavBreadcrumb from '../components/NavBreadcrumb'
import './Home.css'

export default function Home() {
  return (
    <div className="page home-page">
      <NavBreadcrumb section="Portfolio" />

      <div className="home-char-area">
        <div className="home-char-wrap">
          <div className="home-char-glow" />
          <img
            src="/home-pose.png"
            alt="Carl Christian Jarque"
            className="home-char-img"
          />
        </div>
      </div>

      <div className="home-panel">
        <div className="section-tag">Portfolio</div>
        <h1 className="section-title home-title">Carl Christian<br />Jarque</h1>

        <Link to="/about" className="home-banner banner-primary">
          <div className="banner-icon">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
          </div>
          <div className="banner-text">
            <span className="banner-name">Who Am I?</span>
            <span className="banner-sub">IDENTITY PROTOCOL</span>
          </div>
          <span className="banner-arrow">›</span>
        </Link>

        <Link to="/hobbies" className="home-banner banner-secondary">
          <div className="banner-icon">
            <svg viewBox="0 0 24 24"><path d="M21 3H3C2 3 1 4 1 5v14c0 1.1.9 2 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2zM5 17l3.5-4.5 2.5 3.01L14.5 11l4.5 6H5z"/></svg>
          </div>
          <div className="banner-text">
            <span className="banner-name">Gallery of Possibilities</span>
            <span className="banner-sub">HOBBIES · INTERESTS</span>
          </div>
          <span className="banner-arrow">›</span>
        </Link>

        <div className="home-cards-row">
          <Link to="/activities" className="home-mini-card">
            <div className="mini-icon">
              <svg viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V6h5.17l2 2H20v10z"/></svg>
            </div>
            <span className="mini-name">Activities</span>
            <span className="mini-sub">ACADEMIC · LOG</span>
          </Link>
          <Link to="/projects" className="home-mini-card">
            <div className="mini-icon"><svg viewBox="0 0 24 24"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg></div>
            <span className="mini-name">Projects</span>
            <span className="mini-sub">2 / ACTIVE</span>
          </Link>
        </div>

        <div className="home-alert">
          <div className="alert-dot" />
          <span>Currently open for opportunities — Let's build something together.</span>
        </div>

        <Link to="/hub" className="home-gold-btn">
          <span>▷</span><span>Enter the Divergence</span><span>◁</span>
        </Link>

        <Link to="/certifications" className="home-cert-link">
          <div className="cert-link-icon">
            <svg viewBox="0 0 24 24" fill="#c9a84c"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
          </div>
          <span>Certifications</span>
        </Link>
      </div>
    </div>
  )
}