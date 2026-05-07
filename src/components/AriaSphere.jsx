import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import './AriaSphere.css'

const pageIntros = {
  '/': "Welcome to Carl's Universe. I'm ARIA, your guide through this divergence. Where would you like to begin?",
  '/about': "You've entered Carl's identity matrix. Here you'll find the core data that defines who he is — his origins, directive, and what drives him forward.",
  '/activities': "Carl would want you to know... these are the academic records. Every folder holds work completed during his engineering journey at San Sebastian.",
  '/hobbies': "You've entered the Gallery of Possibilities. These frames hold the things that restore Carl — the worlds he returns to outside of code.",
  '/hub': "Two operations available. Carl built this as a gateway — choose your path carefully, Visitor.",
  '/skills': "Capability matrix loaded. Carl's arsenal spans hardware and software — forged through thesis work, internships, and relentless curiosity.",
  '/projects': "These are Carl's deployments — real systems he built and shipped. PhiNex runs on actual FPGA hardware. The MRF system is live in production.",
  '/certifications': "Credentials verified. Each certification here represents a skill Carl chose to formalize — continuous learning is part of his directive.",
  '/contact': "You're one step away from reaching Carl directly. Select a channel and I'll bridge the connection.",
}

const pagePositions = {
  '/':             { top: '36%', right: '55%' },
  '/about':        { top: '120px', right: '80px' },
  '/activities':   { top: '100px', right: '200px' },
  '/hobbies':      { top: '120px', right: '60px' },
  '/hub':          { top: '50%', right: '80px' },
  '/skills':       { top: '140px', right: '60px' },
  '/projects':     { top: '120px', left: '50%', transform: 'translateX(-50%)' },
  '/certifications': { top: '100px', left: '50%', transform: 'translateX(-50%)' },
  '/contact':      { top: '180px', left: '40%' },
}

// ── Geodesic geometry (built once, shared) ────────────────────────────────────

const PHI = (1 + Math.sqrt(5)) / 2

function norm(v) {
  const l = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2)
  return [v[0] / l, v[1] / l, v[2] / l]
}

function buildSphere() {
  // 12 original icosahedron vertices
  const base = [
    [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
    [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
    [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
  ].map(norm)

  const faces = [
    [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
    [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
    [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
    [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1],
  ]

  const pts = [...base]
  const outerSet = new Set(Array.from({ length: 12 }, (_, i) => i))
  const cache = {}

  const getMid = (a, b) => {
    const key = Math.min(a, b) + '_' + Math.max(a, b)
    if (cache[key] !== undefined) return cache[key]
    cache[key] = pts.length
    pts.push(norm([(pts[a][0] + pts[b][0]) / 2, (pts[a][1] + pts[b][1]) / 2, (pts[a][2] + pts[b][2]) / 2]))
    return cache[key]
  }

  const subFaces = []
  for (const [a, b, c] of faces) {
    const ab = getMid(a, b), bc = getMid(b, c), ca = getMid(c, a)
    subFaces.push([a, ab, ca], [ab, b, bc], [ca, bc, c], [ab, bc, ca])
  }

  // Build unique edges, tracking whether each edge is "outer" (both endpoints original)
  const edgeSet = new Set()
  const edges = []
  for (const [a, b, c] of subFaces) {
    for (const [i, j] of [[a, b], [b, c], [c, a]]) {
      const key = Math.min(i, j) + '_' + Math.max(i, j)
      if (!edgeSet.has(key)) {
        edgeSet.add(key)
        edges.push({ a: i, b: j, outer: outerSet.has(i) && outerSet.has(j) })
      }
    }
  }

  return { pts, edges, outerSet }
}

const SPHERE = buildSphere()

// ── Canvas component ──────────────────────────────────────────────────────────

function GeodesicCanvas({ size = 64 }) {
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)
  const angleRef  = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { pts, edges, outerSet } = SPHERE

    // DPR-aware sizing for crisp rendering
    const dpr = window.devicePixelRatio || 1
    canvas.width  = size * dpr
    canvas.height = size * dpr
    canvas.style.width  = size + 'px'
    canvas.style.height = size + 'px'
    ctx.scale(dpr, dpr)

    const cx = size / 2
    const cy = size / 2
    const R  = size * 0.41

    const rotY = ([x, y, z], a) => [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)]
    const rotX = ([x, y, z], a) => [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)]

    const draw = () => {
      ctx.clearRect(0, 0, size, size)
      angleRef.current += 0.006

      const project = (p) => {
        let v = rotX(p, 0.4)            // fixed tilt so it looks like the reference
        v = rotY(v, angleRef.current)
        const [px, py, pz] = v
        const s = R / (1.7 - pz * 0.3) // mild perspective
        return { x: cx + px * s, y: cy - py * s, z: pz }
      }

      const proj = pts.map(project)

      // ── Edges — sorted back-to-front ──────────────────────────────────────
      const sortedEdges = edges
        .map(e => ({ ...e, z: (proj[e.a].z + proj[e.b].z) / 2 }))
        .sort((a, b) => a.z - b.z)

      for (const { a, b, z, outer } of sortedEdges) {
        const depth = (z + 1) / 2          // 0 = back, 1 = front
        const alpha = 0.06 + depth * 0.65

        ctx.beginPath()
        ctx.moveTo(proj[a].x, proj[a].y)
        ctx.lineTo(proj[b].x, proj[b].y)

        if (outer) {
          // Bold outer-frame edges (original icosahedron boundary)
          ctx.strokeStyle = `rgba(0,217,255,${alpha * 0.95})`
          ctx.lineWidth   = 0.5 + depth * 0.9
        } else {
          // Finer inner mesh edges
          ctx.strokeStyle = `rgba(0,180,255,${alpha * 0.6})`
          ctx.lineWidth   = 0.3 + depth * 0.45
        }
        ctx.stroke()
      }

      // ── Nodes — sorted back-to-front ─────────────────────────────────────
      const sortedPts = proj
        .map((p, i) => ({ ...p, i }))
        .sort((a, b) => a.z - b.z)

      for (const { x, y, z, i } of sortedPts) {
        const depth  = (z + 1) / 2
        const alpha  = 0.12 + depth * 0.88
        const isOuter = outerSet.has(i)

        if (isOuter) {
          // ── Hollow ring node (matching reference image) ────────────────
          const r = 1.6 + depth * 3.2

          // White filled center dot
          ctx.beginPath()
          ctx.arc(x, y, r * 0.38, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(0,217,255,${alpha})`
          ctx.fill()

          // Outer ring
          ctx.beginPath()
          ctx.arc(x, y, r, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(0,217,255,${alpha})`
          ctx.lineWidth   = depth > 0.55 ? 1.1 : 0.6
          ctx.stroke()
        } else {
          // ── Solid filled dot ───────────────────────────────────────────
          const r = 0.8 + depth * 1.8

          ctx.beginPath()
          ctx.arc(x, y, r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(0,200,255,${alpha})`
          ctx.fill()
        }
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [size])

  return <canvas ref={canvasRef} />
}

// ── ARIA sphere root ──────────────────────────────────────────────────────────

export default function AriaSphere() {
  const location = useLocation()
  const [bubbleOpen, setBubbleOpen] = useState(false)
  const [dismissed,  setDismissed]  = useState(false)
  const shownRef = useRef(new Set())

  const path     = location.pathname
  const intro    = pageIntros[path]
  const position = pagePositions[path]

  useEffect(() => {
    if (!intro || path === '/admin') return
    setBubbleOpen(false)
    setDismissed(false)
    const t = setTimeout(() => {
      if (!shownRef.current.has(path)) {
        shownRef.current.add(path)
        setBubbleOpen(true)
      }
    }, 900)
    return () => clearTimeout(t)
  }, [path])

  const dismiss  = () => { setBubbleOpen(false); setDismissed(true) }
  const toggle   = () => setBubbleOpen(o => !o)
  const openChat = () => { setBubbleOpen(false); window.toggleAria?.() }

  if (!intro || path === '/admin') return null

  const bubbleTopRight = path === '/';
  const bubbleLeft = !bubbleTopRight && position?.right !== undefined;


  return (
    <div className="aria-sphere-root" style={position}>
      <div className={`aria-speech-bubble${bubbleOpen ? ' visible' : ''}${bubbleTopRight ? ' top-right' : bubbleLeft ? ' left' : ' right'}`}>
        <div className="aria-bubble-header">
          <div className="aria-bubble-dot" />
          <span className="aria-bubble-name">ARIA</span>
          <div className="aria-bubble-wave">
            <span /><span /><span /><span /><span />
          </div>
        </div>
        <div className="aria-bubble-msg">{intro}</div>
        <div className="aria-bubble-actions">
          <button className="aria-bubble-btn primary"   onClick={openChat}>CHAT WITH ARIA</button>
          <button className="aria-bubble-btn secondary" onClick={dismiss}>DISMISS</button>
        </div>
      </div>

      <div
        className={`aria-sphere-btn${bubbleOpen ? ' active' : ''}`}
        onClick={toggle}
        title="Talk to ARIA"
      >
        <GeodesicCanvas size={64} />
        <div className="aria-sphere-ping" />
      </div>
    </div>
  )
}