import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import NavBreadcrumb from '../components/NavBreadcrumb'
import BackBtn from '../components/BackBtn'
import './Certifications.css'

export default function Certifications() {
  const [viewer, setViewer]   = useState(null)
  const [certs, setCerts]     = useState([])
  const [tab, setTab]         = useState('technical')  // 'technical' | 'non-technical'

  // ── Fetch from Firestore ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'certifications'))
        const data = []
        snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }))
        setCerts(data)
      } catch (err) {
        console.error('Failed to fetch certifications:', err)
      }
    }
    fetchCerts()
  }, [])

  const filtered   = certs.filter(c => (c.type || 'technical') === tab)
  const totalShown = filtered.length

  const openViewer = (cert) => {
    setViewer(cert)
  }

  return (
    <div className="page certs-page">
      <NavBreadcrumb section="Certifications" />
      <BackBtn to="/" />

      <div className="certs-content">

        {/* HEADER */}
        <div className="certs-header-row">
          <div>
            <div className="section-tag">Achievements &amp; Credentials</div>
            <h1 className="section-title" style={{ marginBottom: 0 }}>Certifications</h1>
          </div>

          <div className="certs-stats">
            {/* SWITCH */}
            <div className="certs-tab-switch">
              <button
                className={`certs-tab-btn${tab === 'technical' ? ' active' : ''}`}
                onClick={() => setTab('technical')}
              >
                TECHNICAL
              </button>
              <button
                className={`certs-tab-btn${tab === 'non-technical' ? ' active' : ''}`}
                onClick={() => setTab('non-technical')}
              >
                NON-TECHNICAL
              </button>
            </div>

            <div className="certs-stat-sep" />

            <div className="certs-stat">
              <span className="certs-stat-num">{totalShown}</span>
              <span className="certs-stat-label">TOTAL CERTS</span>
            </div>
            <div className="certs-stat-sep" />
            <div className="certs-stat">
              <span className="certs-stat-num" style={{ color: '#00ff88' }}>✓</span>
              <span className="certs-stat-label">ALL CLAIMED</span>
            </div>
          </div>
        </div>

        {/* TIMELINE */}
        <div className="certs-timeline">
          <div className="certs-timeline-fill" style={{ width: totalShown > 0 ? '100%' : '0%' }} />
          <div className="certs-timeline-dot" style={{ left: '0%' }} />
        </div>

        {/* GRID */}
        <div className="certs-grid">
          {filtered.length === 0 ? (
            <div className="certs-empty">
              <div className="certs-empty-icon">🏆</div>
              <div className="certs-empty-text">
                NO {tab.toUpperCase()} CERTIFICATIONS YET<br />ADD THEM VIA ADMIN CMS
              </div>
            </div>
          ) : (
            filtered.map((cert, i) => (
              <div key={i} className="cert-card">
                <div className="cert-preview">
                  {cert.imageUrl
                    ? <img src={cert.imageUrl} alt={cert.title} />
                    : <div className="cert-preview-placeholder">
                        <span>📜</span><span>CERTIFICATE</span>
                      </div>
                  }
                  <div className="cert-check">✓</div>
                </div>
                <div className="cert-info">
                  <div className="cert-title">{cert.title}</div>
                  <div className="cert-issuer">{cert.issuer}</div>
                  <div className="cert-year">{cert.year}</div>
                </div>
                {cert.imageUrl || cert.fileUrl
                  ? <div className="cert-view-btn" onClick={() => openViewer(cert)}>VIEW CERTIFICATE</div>
                  : <div className="cert-view-btn" style={{ opacity: 0.3, cursor: 'default' }}>NO FILE ATTACHED</div>
                }
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div className="certs-footer">
          <span className="certs-footer-text">CREDENTIALS VERIFIED · CONTINUOUSLY UPDATED</span>
          <Link to="/projects" className="certs-projects-btn">
            <svg viewBox="0 0 24 24"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>
            VIEW PROJECTS
          </Link>
        </div>
      </div>

      {/* VIEWER — handles both image and PDF */}
      {viewer && (
        <div className="cert-viewer-overlay" onClick={() => setViewer(null)}>
          <div className="cert-viewer-inner" onClick={e => e.stopPropagation()}>
            <div className="cert-viewer-header">
              <div className="cert-viewer-title">{viewer.title}</div>
              <div className="cert-viewer-close" onClick={() => setViewer(null)}>✕ CLOSE</div>
            </div>
            <div className="cert-viewer-img">
              {viewer.fileUrl
                ? <iframe
                    src={viewer.fileUrl}
                    title={viewer.title}
                    className="cert-viewer-pdf"
                    frameBorder="0"
                  />
                : <img src={viewer.imageUrl} alt={viewer.title} />
              }
            </div>
          </div>
        </div>
      )}
    </div>
  )
}