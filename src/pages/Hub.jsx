import { Link } from 'react-router-dom'
import NavBreadcrumb from '../components/NavBreadcrumb'
import BackBtn from '../components/BackBtn'
import './Hub.css'

export default function Hub() {
  return (
    <div className="page hub-page">
      <NavBreadcrumb section="Divergence" />
      <BackBtn to="/" />

      <div className="hub-content">
        <div className="hub-label">-- SELECT OPERATION MODE --</div>

        <div className="hub-cards">
          <Link to="/contact" className="hub-card">
            <div className="hub-card-num">
              <span>OPERATION I</span>
              <div className="hub-card-num-line" />
              <span className="hub-card-tag">OPEN CHANNEL</span>
            </div>
            <div className="hub-card-icon">
              <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            </div>
            <div className="hub-card-title">Get in Touch</div>
            <div className="hub-card-desc">Open a communication channel and connect with Carl directly.</div>
            <div className="hub-card-cta">
              <span>INITIATE</span>
              <svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
            </div>
          </Link>

          <Link to="/skills" className="hub-card">
            <div className="hub-card-num">
              <span>OPERATION II</span>
              <div className="hub-card-num-line" />
              <span className="hub-card-tag">SCAN MATRIX</span>
            </div>
            <div className="hub-card-icon">
              <svg viewBox="0 0 24 24"><path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.92c.04-.34.07-.68.07-1.08s-.03-.73-.07-1.08l2.32-1.84c.21-.16.27-.46.13-.71l-2.2-3.82c-.13-.25-.42-.34-.68-.25l-2.74 1.1c-.57-.44-1.18-.8-1.86-1.07L14.9 2.44C14.85 2.18 14.62 2 14.36 2H9.64c-.26 0-.49.18-.54.44L8.74 5.33C8.06 5.6 7.45 5.96 6.88 6.4L4.14 5.3c-.26-.09-.55 0-.68.25L1.26 9.37c-.14.25-.08.55.13.71l2.32 1.84C3.67 12.27 3.64 12.62 3.64 13s.03.73.07 1.08L1.39 15.92c-.21.16-.27.46-.13.71l2.2 3.82c.13.25.42.34.68.25l2.74-1.1c.57.44 1.18.8 1.86 1.07l.36 2.89c.05.26.28.44.54.44h4.72c.26 0 .49-.18.54-.44l.36-2.89c.68-.27 1.29-.63 1.86-1.07l2.74 1.1c.26.09.55 0 .68-.25l2.2-3.82c.14-.25.08-.55-.13-.71l-2.32-1.84z"/></svg>
            </div>
            <div className="hub-card-title">Abilities</div>
            <div className="hub-card-desc">Scan the capability matrix and explore Carl's technical skill set.</div>
            <div className="hub-card-cta">
              <span>INITIATE</span>
              <svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
            </div>
          </Link>
        </div>

        <div className="hub-status">
          <div className="hub-status-dot" />
          <span>SYSTEM ONLINE</span>
          <div className="hub-status-sep" />
          <span>2 OPERATIONS AVAILABLE</span>
          <div className="hub-status-sep" />
          <span>SELECT TO PROCEED</span>
        </div>
      </div>
    </div>
  )
}
