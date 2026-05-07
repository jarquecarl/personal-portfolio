import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import NavBreadcrumb from '../components/NavBreadcrumb'
import BackBtn from '../components/BackBtn'
import './Projects.css'

// Detect mobile
const isMobile = () => window.innerWidth <= 768

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(0)
  const [expanded, setExpanded] = useState(null) // mobile accordion
  const [imgIdx, setImgIdx] = useState(0)
  const [mobile, setMobile] = useState(isMobile())

  useEffect(() => {
    const onResize = () => setMobile(isMobile())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const snap = await getDocs(collection(db, 'projects'))
        const loaded = snap.docs.map((d, i) => ({
          id: d.id,
          num: `PROJECT ${toRoman(i + 1)}`,
          ...d.data(),
          stack: Array.isArray(d.data().stack)
            ? d.data().stack.map(s => s.toUpperCase())
            : (d.data().stack || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean),
          tags: d.data().tags || (
            Array.isArray(d.data().stack)
              ? d.data().stack.slice(0, 4).map(s => s.toUpperCase())
              : []
          ),
          images: d.data().images || [],
        }))
        setProjects(loaded)
      } catch (e) {
        console.error('Failed to load projects:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  const project = projects[active]

  if (loading) return (
    <div className="page projects-page">
      <NavBreadcrumb section="Projects" />
      <BackBtn to="/" />
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flex: 1, fontFamily: 'Share Tech Mono, sans-serif',
        fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '3px'
      }}>
        LOADING PROJECTS...
      </div>
    </div>
  )

  if (!loading && projects.length === 0) return (
    <div className="page projects-page">
      <NavBreadcrumb section="Projects" />
      <BackBtn to="/" />
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flex: 1, fontFamily: 'Share Tech Mono, sans-serif',
        fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '3px'
      }}>
        NO PROJECTS YET
      </div>
    </div>
  )

  // ── Detail panel content (shared between desktop and mobile accordion) ──
  const DetailContent = ({ p, imgIndex, setImgIndex }) => (
    <div className="project-detail-content">
      <div className="detail-badge">
        {p.badge || `${(p.type || '').toUpperCase()} · ${p.year || ''}`}
      </div>
      <div className="detail-title">{p.title || p.name}</div>
      <div className="detail-divider" />
      <div className="detail-grid">
        <div className="detail-field">
          <span className="detail-field-label">PLATFORM</span>
          <span className="detail-field-value">{p.platform || '—'}</span>
        </div>
        <div className="detail-field">
          <span className="detail-field-label">CATEGORY</span>
          <span className="detail-field-value">{p.category || '—'}</span>
        </div>
        <div className="detail-field">
          <span className="detail-field-label">STATUS</span>
          <span
            className="detail-field-value"
            style={{ color: p.statusColor || (p.status?.toLowerCase().includes('complet') ? '#00ff88' : 'var(--gold)') }}
          >
            {p.status || '—'}
          </span>
        </div>
        <div className="detail-field">
          <span className="detail-field-label">ROLE</span>
          <span className="detail-field-value">{p.role || '—'}</span>
        </div>
      </div>
      <p className="detail-desc">{p.desc || p.description || ''}</p>
      <div className="detail-stack-label">TECHNOLOGY STACK</div>
      <div className="detail-stack">
        {(p.stack || []).map((s, i) => (
          <span key={i} className="stack-tag">{s}</span>
        ))}
      </div>
      <div className="detail-img-area">
        {p.images.length > 0 ? (
          <>
            <img src={p.images[imgIndex]} alt={p.title || p.name} className="detail-img" />
            {p.images.length > 1 && (
              <>
                <button
                  className="detail-img-nav left"
                  onClick={e => { e.stopPropagation(); setImgIndex(i => (i - 1 + p.images.length) % p.images.length) }}
                >‹</button>
                <button
                  className="detail-img-nav right"
                  onClick={e => { e.stopPropagation(); setImgIndex(i => (i + 1) % p.images.length) }}
                >›</button>
                <div className="detail-img-counter">{imgIndex + 1} / {p.images.length}</div>
              </>
            )}
          </>
        ) : (
          <div className="detail-img-placeholder">
            <div style={{
              fontFamily: 'Share Tech Mono, sans-serif', fontSize: '0.6rem',
              color: 'var(--text-dim)', letterSpacing: '3px'
            }}>NO IMAGES YET</div>
            <div style={{
              fontFamily: 'Rajdhani, sans-serif', fontSize: '0.75rem',
              color: 'var(--text-dim)', marginTop: '4px'
            }}>Add project images via Admin CMS</div>
          </div>
        )}
      </div>
    </div>
  )

  // ── MOBILE: accordion layout ───────────────────────────────────
  if (mobile) {
    return (
      <div className="page projects-page projects-page--mobile">
        <NavBreadcrumb section="Projects" />
        <BackBtn to="/" />

        <div className="projects-accordion">
          <div className="projects-list-header" style={{ padding: '72px 20px 12px' }}>
            <div className="section-tag">Selected Works</div>
            <h1 className="section-title" style={{ fontSize: '1.4rem' }}>Projects</h1>
          </div>

          {projects.map((p, i) => {
            const isOpen = expanded === i
            return (
              <div key={p.id} className={`accordion-item${isOpen ? ' open' : ''}`}>
                {/* Accordion header — always visible */}
                <div
                  className="accordion-header"
                  onClick={() => setExpanded(isOpen ? null : i)}
                >
                  <div className="accordion-header-left">
                    <div className="project-card-num">{p.num}</div>
                    <div className="project-card-name">{p.title || p.name}</div>
                    <div className="project-card-type">{(p.type || '').toUpperCase()}</div>
                    <div className="project-card-tags">
                      {(p.tags || []).slice(0, 4).map((t, ti) => (
                        <span key={ti} className="project-tag">{t}</span>
                      ))}
                    </div>
                  </div>
                  <span className={`accordion-chevron${isOpen ? ' open' : ''}`}>›</span>
                </div>

                {/* Accordion body — slides open */}
                <div className="accordion-body">
                  <DetailContent
                    p={p}
                    imgIndex={active === i ? imgIdx : 0}
                    setImgIndex={setImgIdx}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── DESKTOP: original side-by-side layout ─────────────────────
  return (
    <div className="page projects-page">
      <NavBreadcrumb section="Projects" />
      <BackBtn to="/" />

      <div className="projects-list">
        <div className="projects-list-header">
          <div className="section-tag">Selected Works</div>
          <h1 className="section-title" style={{ fontSize: '1.6rem' }}>Projects</h1>
        </div>

        {projects.map((p, i) => (
          <div
            key={p.id}
            className={`project-card${active === i ? ' active' : ''}`}
            onClick={() => { setActive(i); setImgIdx(0) }}
          >
            <div className="project-card-num">{p.num}</div>
            <div className="project-card-name">{p.title || p.name}</div>
            <div className="project-card-type">{(p.type || '').toUpperCase()}</div>
            <div className="project-card-tags">
              {(p.tags || []).slice(0, 4).map((t, ti) => (
                <span key={ti} className="project-tag">{t}</span>
              ))}
            </div>
            <span className="project-card-arrow">›</span>
          </div>
        ))}
      </div>

      <div className="project-detail">
        <DetailContent p={project} imgIndex={imgIdx} setImgIndex={setImgIdx} />
      </div>
    </div>
  )
}

function toRoman(n) {
  const map = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],
               [50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']]
  let result = ''
  for (const [val, sym] of map) { while (n >= val) { result += sym; n -= val } }
  return result
}