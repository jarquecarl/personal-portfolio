import { useState, useEffect, useRef } from 'react'
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import NavBreadcrumb from '../components/NavBreadcrumb'
import BackBtn from '../components/BackBtn'
import './Contact.css'

const ICON_PATHS = {
  github:   <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>,
  email:    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>,
  phone:    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>,
  facebook: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>,
  linkedin: <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>,
}

const NUMERALS = ['I','II','III','IV','V','VI','VII','VIII','IX','X']

function ContactCube({ active }) {
  const canvasRef = useRef(null)
  const angleRef = useRef(0)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId

    const verts = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]]
    const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]]

    const draw = () => {
      ctx.clearRect(0, 0, 120, 120)
      angleRef.current += 0.018
      const a = angleRef.current
      const cos = Math.cos(a), sin = Math.sin(a)
      const cos2 = Math.cos(a * 0.7), sin2 = Math.sin(a * 0.7)

      const projected = verts.map(([x, y, z]) => {
        const x2 = x * cos - z * sin
        const z2 = x * sin + z * cos
        const y2 = y * cos2 - z2 * sin2
        const z3 = y * sin2 + z2 * cos2
        const scale = 40 / (3 - z3 * 0.4)
        return [60 + x2 * scale, 60 + y2 * scale, z3]
      })

      edges.forEach(([a, b]) => {
        const alpha = ((projected[a][2] + projected[b][2]) / 2 + 1) / 2 * 0.7 + 0.2
        ctx.beginPath()
        ctx.moveTo(projected[a][0], projected[a][1])
        ctx.lineTo(projected[b][0], projected[b][1])
        ctx.strokeStyle = `rgba(0,217,255,${alpha})`
        ctx.lineWidth = 1.5
        ctx.stroke()
      })

      projected.forEach(([px, py, pz]) => {
        const alpha = (pz + 1) / 2 * 0.9 + 0.1
        ctx.beginPath()
        ctx.arc(px, py, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,217,255,${alpha})`
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animId)
  }, [active])

  if (!active) return null
  return <canvas ref={canvasRef} width={120} height={120} className="contact-cube-canvas" />
}

export default function Contact() {
  const [active, setActive]   = useState(null)
  const [contacts, setContacts] = useState([])

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const snap = await getDoc(doc(db, 'cms', 'contact'))
        if (snap.exists() && snap.data().items?.length) {
          setContacts(snap.data().items)
        } else {
          setContacts([
            { label: 'GITHUB',   value: 'jarquecarl-debug',        href: 'https://github.com/jarquecarl-debug',             linkText: 'OPEN GITHUB',    icon: 'github'   },
            { label: 'EMAIL',    value: 'jarquecarl@gmail.com',     href: 'mailto:jarquecarl@gmail.com',                     linkText: 'SEND EMAIL',     icon: 'email'    },
            { label: 'PHONE',    value: '+63 954 545 7518',         href: 'tel:+639568955133',                               linkText: 'CALL NOW',       icon: 'phone'    },
            { label: 'FACEBOOK', value: 'carlchristian.jarque.7',   href: 'https://facebook.com/carlchristian.jarque.7',     linkText: 'OPEN FACEBOOK',  icon: 'facebook' },
          ])
        }
      } catch (err) {
        console.error('Failed to fetch contacts:', err)
      }
    }
    fetchContacts()
  }, [])

  const selected = active !== null ? contacts[active] : null

  return (
    <div className="page contact-page">
      <NavBreadcrumb section="Get in Touch" />
      <BackBtn to="/hub" />

      {/* LEFT — contact list */}
      <div className="contact-left">
        <div className="contact-header">
          <div className="section-tag">Communication Channels</div>
          <h1 className="section-title">Get in Touch</h1>
        </div>

        {contacts.map((c, i) => (
          <div
            key={i}
            className={`contact-item${active === i ? ' active' : ''}`}
            onClick={() => setActive(active === i ? null : i)}
          >
            <span className="contact-numeral">{NUMERALS[i]}</span>
            <div className="contact-icon-wrap">
              <svg viewBox="0 0 24 24">{ICON_PATHS[c.icon] || ICON_PATHS.email}</svg>
            </div>
            <div className="contact-text">
              <div className="contact-label">{c.label}</div>
            </div>
            <span className="contact-arrow">›</span>
          </div>
        ))}
      </div>

      {/* RIGHT — full-height character with hologram overlay */}
      <div className="contact-right">

        {/* Character fills the entire right panel */}
        <div className="contact-char-wrap">
          <div className="contact-char-glow" />
          <img src="/contact-pose.png" alt="Carl Christian Jarque" className="contact-char-img" />
        </div>

        {/* Hologram panel overlaid on top of character, centered in right panel */}
        {selected && (
          <div className="cube-hologram-wrap" key={active}>
            <div className="cube-data-panel">
              <div className="cube-data-label">CHANNEL {NUMERALS[active]} — {selected.label}</div>
              <div className="cube-data-value">{selected.value}</div>
              <a className="cube-data-link" href={selected.href} target="_blank" rel="noreferrer">
                {selected.linkText}
              </a>
            </div>
            <ContactCube active={true} />
          </div>
        )}

        {!selected && (
          <div className="contact-hint">
            <div className="contact-hint-dot" />
            <span className="contact-hint-text">SELECT A CHANNEL</span>
          </div>
        )}
      </div>
    </div>
  )
}