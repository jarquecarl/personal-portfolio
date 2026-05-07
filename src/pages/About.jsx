import { useState, useEffect, useRef } from 'react'
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import NavBreadcrumb from '../components/NavBreadcrumb'
import BackBtn from '../components/BackBtn'
import './About.css'

const defaultCards = [
  { label: 'NAME',      title: 'Carl Christian Jarque',                   desc: 'The one behind the code, the designs, and the curiosity that drives it all.' },
  { label: 'ORIGIN',    title: 'Cavite, Philippines',                      desc: 'Born and raised in the Pearl of the Orient — shaped by culture, driven by ambition.' },
  { label: 'CLASS',     title: 'Computer Engineer',                        desc: 'Bridging hardware and software — where logic meets creativity.' },
  { label: 'INSTITUTE', title: 'San Sebastian College Recoletos De Cavite', desc: 'Forged through years of engineering challenges, projects, and sleepless nights.' },
  { label: 'DIRECTIVE', title: 'Create Meaningful Experiences',            desc: 'To create meaningful experiences through curiosity and exploration.' },
  { label: 'SYNC',      title: 'Be Adventurous',                          desc: 'Every step into the unknown shapes who you become.' },
]

const defaultCareers = ['Frontend Developer', 'Prompt Engineer', 'Computer Engineer']

function HologramCube() {
  const canvasRef = useRef(null)
  const angleRef  = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    let animId

    const verts = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]]
    const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]]

    const draw = () => {
      ctx.clearRect(0, 0, 120, 120)
      angleRef.current += 0.02
      const a    = angleRef.current
      const cos  = Math.cos(a), sin  = Math.sin(a)
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
  }, [])

  return <canvas ref={canvasRef} width={120} height={120} className="holo-cube-canvas" />
}

export default function About() {
  const [careerIdx,    setCareerIdx]    = useState(0)
  const [selected,     setSelected]     = useState(null)
  const [profilePhoto, setProfilePhoto] = useState('')
  const [careers,      setCareers]      = useState(defaultCareers)
  const [cards,        setCards]        = useState(defaultCards)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prof = await getDoc(doc(db, 'cms', 'profile'))
        if (prof.exists()) {
          const d = prof.data()
          if (d.photoUrl)         setProfilePhoto(d.photoUrl)
          if (d.careers?.length)  setCareers(d.careers)
        }
        const about = await getDoc(doc(db, 'cms', 'about'))
        if (about.exists() && about.data().cards?.length) setCards(about.data().cards)
      } catch (err) {
        console.error('Failed to fetch about data:', err)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const t = setInterval(() => setCareerIdx(i => (i + 1) % careers.length), 2000)
    return () => clearInterval(t)
  }, [careers])

  const selectedCard = selected !== null ? cards[selected] : null

  return (
    <div className="page about-page">
      <NavBreadcrumb section="Who Am I?" />
      <BackBtn to="/" />

      {/* CHARACTER — centered, fullscreen */}
      <div className="about-char-wrap">
        <img
          src="/who-am-i-pose.png"
          alt="Carl Christian Jarque"
          className="about-char-img"
        />

        {/* Profile photo + career — overlaid on chest */}
        <div className="about-chest-overlay">
          {/* Photo circle */}
          <div className="about-photo-wrap">
            <div className="about-photo-rings">
              <div className="photo-ring ring-1" />
              <div className="photo-ring ring-2" />
              <div className="photo-ring ring-3" />
            </div>
            <div className="about-photo-circle">
              {profilePhoto
                ? <img src={profilePhoto} alt="Carl" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} />
                : (
                  <svg viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="35" r="22" fill="#1a2035"/>
                    <path d="M15 85 C15 65 85 65 85 85" fill="#1a2035"/>
                    <circle cx="50" cy="35" r="14" fill="#253050"/>
                    <circle cx="50" cy="28" r="6" fill="#3a4a6a"/>
                    <path d="M36 44 C36 38 64 38 64 44 L64 50 C64 56 36 56 36 50 Z" fill="#3a4a6a"/>
                  </svg>
                )
              }
            </div>
            <div className="about-scan-line" />
          </div>

          {/* Career slider — sits just below the photo circle */}
          <div className="about-career-slider">
            <div className="career-tag">CAREER PATH</div>
            <div className="career-title">{careers[careerIdx]}</div>
            <div className="career-dots">
              {careers.map((_, i) => (
                <div key={i} className={`career-dot${i === careerIdx ? ' active' : ''}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* NODE CARDS — bottom bar */}
      <div className="about-cards-section">
        <div className="about-cards-line" />
        <div className="about-cards-row">
          {cards.map((card, i) => (
            <div
              key={i}
              className={`node-card-item${selected === i ? ' selected' : ''}`}
              onClick={() => setSelected(selected === i ? null : i)}
            >
              <div className="node-card-label">{card.label}</div>
              <div className="node-card-diamond">✦</div>
            </div>
          ))}
        </div>
        <div className="about-hint">
          <div className="hint-dot" />
          <span>SELECT A NODE</span>
        </div>
      </div>

      {/* HOLOGRAM OVERLAY */}
      {selectedCard && (
        <div className="holo-overlay" onClick={() => setSelected(null)}>
          <div className="holo-panel" onClick={e => e.stopPropagation()}>
            <HologramCube />
            <div className="holo-content">
              <div className="holo-label">{selectedCard.label}</div>
              <div className="holo-title">{selectedCard.title}</div>
              <div className="holo-desc">{selectedCard.desc}</div>
            </div>
            <div className="holo-close" onClick={() => setSelected(null)}>✕ CLOSE NODE</div>
          </div>
        </div>
      )}
    </div>
  )
}