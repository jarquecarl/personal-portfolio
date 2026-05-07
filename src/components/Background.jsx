import { useEffect, useRef } from 'react'
import './Background.css'

export default function Background() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    let t = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // ── INNER CIRCUIT NETWORK ─────────────────────────────────────────────
    // Define circuit branches that grow inward from the border edges.
    // Each branch: start near an edge, extend inward with right-angle turns.
    // Format: array of [rx, ry] relative points (0–1 of W/H)
    const buildCircuitBranches = (W, H) => {
      const pad = 28 // matches cornerCut
      const branches = [
        // ── TOP-LEFT QUADRANT ──
        // From top edge inward
        { pts: [[0.08, 0], [0.08, 0.08], [0.18, 0.08], [0.18, 0.14]] },
        { pts: [[0.15, 0], [0.15, 0.05], [0.28, 0.05], [0.28, 0.12], [0.22, 0.12]] },
        { pts: [[0.22, 0], [0.22, 0.1], [0.14, 0.1], [0.14, 0.2]] },
        // From left edge inward
        { pts: [[0, 0.15], [0.06, 0.15], [0.06, 0.25], [0.14, 0.25]] },
        { pts: [[0, 0.22], [0.1, 0.22], [0.1, 0.3], [0.05, 0.3]] },
        { pts: [[0, 0.32], [0.08, 0.32], [0.08, 0.22], [0.18, 0.22]] },

        // ── TOP-RIGHT QUADRANT ──
        // From top edge inward
        { pts: [[0.78, 0], [0.78, 0.08], [0.68, 0.08], [0.68, 0.14]] },
        { pts: [[0.85, 0], [0.85, 0.05], [0.72, 0.05], [0.72, 0.12], [0.78, 0.12]] },
        { pts: [[0.65, 0], [0.65, 0.1], [0.76, 0.1], [0.76, 0.2]] },
        // From right edge inward
        { pts: [[1, 0.15], [0.94, 0.15], [0.94, 0.25], [0.86, 0.25]] },
        { pts: [[1, 0.22], [0.9, 0.22], [0.9, 0.3], [0.95, 0.3]] },
        { pts: [[1, 0.32], [0.92, 0.32], [0.92, 0.22], [0.82, 0.22]] },

        // ── BOTTOM-LEFT QUADRANT ──
        // From bottom edge inward
        { pts: [[0.08, 1], [0.08, 0.92], [0.18, 0.92], [0.18, 0.86]] },
        { pts: [[0.15, 1], [0.15, 0.95], [0.28, 0.95], [0.28, 0.88], [0.22, 0.88]] },
        { pts: [[0.22, 1], [0.22, 0.9], [0.14, 0.9], [0.14, 0.8]] },
        // From left edge inward
        { pts: [[0, 0.85], [0.06, 0.85], [0.06, 0.75], [0.14, 0.75]] },
        { pts: [[0, 0.78], [0.1, 0.78], [0.1, 0.7], [0.05, 0.7]] },
        { pts: [[0, 0.68], [0.08, 0.68], [0.08, 0.78], [0.18, 0.78]] },

        // ── BOTTOM-RIGHT QUADRANT ──
        // From bottom edge inward
        { pts: [[0.78, 1], [0.78, 0.92], [0.68, 0.92], [0.68, 0.86]] },
        { pts: [[0.85, 1], [0.85, 0.95], [0.72, 0.95], [0.72, 0.88], [0.78, 0.88]] },
        { pts: [[0.65, 1], [0.65, 0.9], [0.76, 0.9], [0.76, 0.8]] },
        // From right edge inward
        { pts: [[1, 0.85], [0.94, 0.85], [0.94, 0.75], [0.86, 0.75]] },
        { pts: [[1, 0.78], [0.9, 0.78], [0.9, 0.7], [0.95, 0.7]] },
        { pts: [[1, 0.68], [0.92, 0.68], [0.92, 0.78], [0.82, 0.78]] },
      ]

      // Convert relative coords to absolute
      return branches.map((b, i) => ({
        pts: b.pts.map(([rx, ry]) => [rx * W, ry * H]),
        speed: 0.18 + (i % 5) * 0.04,
        delay: (i * 0.37) % 1,
        trailFrac: 0.3 + (i % 3) * 0.08,
      }))
    }

    // Calculate total length of a polyline
    const polylineLength = (pts) => {
      let len = 0
      for (let i = 1; i < pts.length; i++) {
        const dx = pts[i][0] - pts[i-1][0]
        const dy = pts[i][1] - pts[i-1][1]
        len += Math.sqrt(dx*dx + dy*dy)
      }
      return len
    }

    // Get point at distance `d` along a polyline
    const pointAtDist = (pts, d) => {
      let remaining = d
      for (let i = 1; i < pts.length; i++) {
        const dx = pts[i][0] - pts[i-1][0]
        const dy = pts[i][1] - pts[i-1][1]
        const segLen = Math.sqrt(dx*dx + dy*dy)
        if (remaining <= segLen) {
          const frac = remaining / segLen
          return [pts[i-1][0] + dx * frac, pts[i-1][1] + dy * frac]
        }
        remaining -= segLen
      }
      return pts[pts.length - 1]
    }

    const animate = () => {
      animId = requestAnimationFrame(animate)
      t += 0.008

      const W = canvas.width
      const H = canvas.height
      const cx = W / 2
      const cy = H / 2

      ctx.clearRect(0, 0, W, H)

      // ── DEEP BACKGROUND ──────────────────────────────────────────────────
      const bgGrd = ctx.createRadialGradient(cx, cy * 0.8, 0, cx, cy, Math.max(W, H) * 0.85)
      bgGrd.addColorStop(0,   '#071a2e')
      bgGrd.addColorStop(0.4, '#040e1e')
      bgGrd.addColorStop(1,   '#020810')
      ctx.fillStyle = bgGrd
      ctx.fillRect(0, 0, W, H)

      // ── SUBTLE GRID ──────────────────────────────────────────────────────
      const gridSize = 48
      ctx.strokeStyle = 'rgba(0,140,220,0.04)'
      ctx.lineWidth = 0.5
      for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
      }

      // ── INNER CONTENT GLOW (center ambient) ──────────────────────────────
      const glowPulse = 0.9 + 0.1 * Math.sin(t * 1.2)
      const innerGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.45)
      innerGrd.addColorStop(0,   `rgba(0,120,200,${0.12 * glowPulse})`)
      innerGrd.addColorStop(0.5, `rgba(0,80,160,${0.06 * glowPulse})`)
      innerGrd.addColorStop(1,   'rgba(0,0,0,0)')
      ctx.fillStyle = innerGrd
      ctx.fillRect(0, 0, W, H)

      // ── ANIMATED CIRCUIT TRACES (background layer) ────────────────────────
      const traces = [
        { x1: 0.08, y1: 0.06, x2: 0.35, y2: 0.06, axis: 'h', speed: 0.4, delay: 0 },
        { x1: 0.42, y1: 0.06, x2: 0.58, y2: 0.06, axis: 'h', speed: 0.3, delay: 0.3 },
        { x1: 0.65, y1: 0.06, x2: 0.92, y2: 0.06, axis: 'h', speed: 0.4, delay: 0.6 },
        { x1: 0.08, y1: 0.94, x2: 0.35, y2: 0.94, axis: 'h', speed: 0.35, delay: 0.2 },
        { x1: 0.42, y1: 0.94, x2: 0.58, y2: 0.94, axis: 'h', speed: 0.25, delay: 0.5 },
        { x1: 0.65, y1: 0.94, x2: 0.92, y2: 0.94, axis: 'h', speed: 0.35, delay: 0.8 },
        { x1: 0.04, y1: 0.12, x2: 0.04, y2: 0.45, axis: 'v', speed: 0.3, delay: 0.1 },
        { x1: 0.04, y1: 0.55, x2: 0.04, y2: 0.88, axis: 'v', speed: 0.3, delay: 0.5 },
        { x1: 0.96, y1: 0.12, x2: 0.96, y2: 0.45, axis: 'v', speed: 0.3, delay: 0.4 },
        { x1: 0.96, y1: 0.55, x2: 0.96, y2: 0.88, axis: 'v', speed: 0.3, delay: 0.7 },
      ]

      traces.forEach(tr => {
        const phase = (t * tr.speed + tr.delay) % 1
        const x1 = tr.x1 * W, y1 = tr.y1 * H
        const x2 = tr.x2 * W, y2 = tr.y2 * H
        const len = Math.sqrt((x2-x1)**2 + (y2-y1)**2)
        const trailLen = len * 0.25
        const pos = phase * (len + trailLen) - trailLen
        const dir = tr.axis === 'h' ? (x2 > x1 ? 1 : -1) : (y2 > y1 ? 1 : -1)

        ctx.beginPath()
        ctx.moveTo(x1, y1); ctx.lineTo(x2, y2)
        ctx.strokeStyle = 'rgba(0,150,220,0.12)'
        ctx.lineWidth = 0.8; ctx.stroke()

        const pulseStart = Math.max(0, pos)
        const pulseEnd = Math.min(len, pos + trailLen)
        if (pulseEnd > 0 && pulseStart < len) {
          let px1, py1, px2, py2
          if (tr.axis === 'h') {
            px1 = x1 + pulseStart * dir; py1 = y1
            px2 = x1 + pulseEnd * dir;   py2 = y2
          } else {
            px1 = x1; py1 = y1 + pulseStart * dir
            px2 = x2; py2 = y1 + pulseEnd * dir
          }
          const pulseGrd = ctx.createLinearGradient(px1, py1, px2, py2)
          pulseGrd.addColorStop(0, 'rgba(0,200,255,0)')
          pulseGrd.addColorStop(0.5, 'rgba(0,217,255,0.8)')
          pulseGrd.addColorStop(1, 'rgba(0,200,255,0)')
          ctx.beginPath()
          ctx.moveTo(px1, py1); ctx.lineTo(px2, py2)
          ctx.strokeStyle = pulseGrd
          ctx.lineWidth = 1.5; ctx.stroke()
        }
      })

      // ── INNER CIRCUIT BRANCHES (Image 2 style) ────────────────────────────
      const branches = buildCircuitBranches(W, H)

      branches.forEach((branch, idx) => {
        const { pts, speed, delay, trailFrac } = branch
        const totalLen = polylineLength(pts)
        const trailLen = totalLen * trailFrac
        const phase = (t * speed + delay) % 1
        const headDist = phase * (totalLen + trailLen) - trailLen

        // Draw base dim line (the "trace" sitting on the board)
        ctx.beginPath()
        ctx.moveTo(pts[0][0], pts[0][1])
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i][0], pts[i][1])
        }
        ctx.strokeStyle = 'rgba(0,160,230,0.10)'
        ctx.lineWidth = 0.7
        ctx.lineJoin = 'miter'
        ctx.stroke()

        // Draw junction dots at bends
        for (let i = 1; i < pts.length - 1; i++) {
          ctx.beginPath()
          ctx.arc(pts[i][0], pts[i][1], 1.5, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(0,180,240,0.18)'
          ctx.fill()
        }

        // Animated pulse segment
        const pStart = Math.max(0, headDist)
        const pEnd = Math.min(totalLen, headDist + trailLen)
        if (pEnd > 0 && pStart < totalLen) {
          // Sample the pulse along the polyline
          const steps = 20
          const stepSize = (pEnd - pStart) / steps
          ctx.beginPath()
          let started = false
          for (let s = 0; s <= steps; s++) {
            const d = pStart + s * stepSize
            if (d < 0 || d > totalLen) continue
            const [px, py] = pointAtDist(pts, d)
            if (!started) { ctx.moveTo(px, py); started = true }
            else ctx.lineTo(px, py)
          }

          // Gradient along the head direction
          const startPt = pointAtDist(pts, pStart)
          const endPt = pointAtDist(pts, Math.min(totalLen, pEnd))
          const pulseGrd = ctx.createLinearGradient(startPt[0], startPt[1], endPt[0], endPt[1])
          pulseGrd.addColorStop(0, 'rgba(0,200,255,0)')
          pulseGrd.addColorStop(0.4, 'rgba(0,217,255,0.55)')
          pulseGrd.addColorStop(0.8, 'rgba(80,230,255,0.9)')
          pulseGrd.addColorStop(1, 'rgba(180,245,255,0.95)')
          ctx.strokeStyle = pulseGrd
          ctx.lineWidth = 1.4
          ctx.lineJoin = 'miter'
          ctx.shadowColor = 'rgba(0,217,255,0.7)'
          ctx.shadowBlur = 6
          ctx.stroke()
          ctx.shadowBlur = 0

          // Bright leading dot
          const headPt = pointAtDist(pts, Math.min(totalLen, headDist + trailLen))
          ctx.beginPath()
          ctx.arc(headPt[0], headPt[1], 2, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(180,245,255,0.95)'
          ctx.shadowColor = 'rgba(0,230,255,1)'
          ctx.shadowBlur = 10
          ctx.fill()
          ctx.shadowBlur = 0
        }

        // Terminal node dot at branch end
        const endPt = pts[pts.length - 1]
        const nodePulse = 0.4 + 0.3 * Math.sin(t * 2.2 + idx * 0.6)
        ctx.beginPath()
        ctx.arc(endPt[0], endPt[1], 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,200,240,${nodePulse})`
        ctx.fill()
      })

      // ── EDGE GLOW LINES (inner border glow like Image 2) ──────────────────
      const edgePulse = 0.7 + 0.3 * Math.sin(t * 0.8)
      const pad = { x: 0, y: 0 }
      const cornerCut = 28

      const framePath = () => {
        ctx.beginPath()
        ctx.moveTo(pad.x + cornerCut, pad.y)
        ctx.lineTo(W - pad.x - cornerCut, pad.y)
        ctx.lineTo(W - pad.x, pad.y + cornerCut)
        ctx.lineTo(W - pad.x, H - pad.y - cornerCut)
        ctx.lineTo(W - pad.x - cornerCut, H - pad.y)
        ctx.lineTo(pad.x + cornerCut, H - pad.y)
        ctx.lineTo(pad.x, H - pad.y - cornerCut)
        ctx.lineTo(pad.x, pad.y + cornerCut)
        ctx.closePath()
      }

      framePath()
      ctx.strokeStyle = `rgba(0,180,255,${0.15 * edgePulse})`
      ctx.lineWidth = 12
      ctx.shadowColor = 'rgba(0,200,255,0.5)'
      ctx.shadowBlur = 20
      ctx.stroke()
      ctx.shadowBlur = 0

      framePath()
      ctx.strokeStyle = `rgba(0,200,255,${0.35 * edgePulse})`
      ctx.lineWidth = 3
      ctx.shadowColor = 'rgba(0,217,255,0.7)'
      ctx.shadowBlur = 12
      ctx.stroke()
      ctx.shadowBlur = 0

      framePath()
      ctx.strokeStyle = `rgba(100,230,255,${0.6 * edgePulse})`
      ctx.lineWidth = 1
      ctx.stroke()

      // ── CORNER GOLD ACCENTS (Image 1 style) ───────────────────────────────
      const goldPulse = 0.8 + 0.2 * Math.sin(t * 1.5 + 1)
      const corners = [
        { x: pad.x, y: pad.y, dx: 1, dy: 1 },
        { x: W - pad.x, y: pad.y, dx: -1, dy: 1 },
        { x: pad.x, y: H - pad.y, dx: 1, dy: -1 },
        { x: W - pad.x, y: H - pad.y, dx: -1, dy: -1 },
      ]
      const cLen = 60

      corners.forEach(({ x, y, dx, dy }) => {
        ctx.beginPath()
        ctx.moveTo(x, y + dy * cornerCut)
        ctx.lineTo(x, y + dy * (cornerCut + cLen))
        ctx.strokeStyle = `rgba(201,168,76,${0.7 * goldPulse})`
        ctx.lineWidth = 2
        ctx.shadowColor = `rgba(201,168,76,0.6)`
        ctx.shadowBlur = 8
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(x + dx * cornerCut, y)
        ctx.lineTo(x + dx * (cornerCut + cLen), y)
        ctx.strokeStyle = `rgba(201,168,76,${0.7 * goldPulse})`
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.shadowBlur = 0

        ctx.beginPath()
        ctx.arc(x + dx * cornerCut, y + dy * cornerCut, 3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201,168,76,${goldPulse})`
        ctx.shadowColor = 'rgba(201,168,76,0.9)'
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.shadowBlur = 0

        ctx.beginPath()
        ctx.moveTo(x + dx * (cornerCut + 8), y + dy * (cornerCut + 8))
        ctx.lineTo(x + dx * (cornerCut + 8), y + dy * (cornerCut + 30))
        ctx.moveTo(x + dx * (cornerCut + 8), y + dy * (cornerCut + 8))
        ctx.lineTo(x + dx * (cornerCut + 30), y + dy * (cornerCut + 8))
        ctx.strokeStyle = `rgba(201,168,76,${0.35 * goldPulse})`
        ctx.lineWidth = 1
        ctx.stroke()
      })

      // ── TOP / BOTTOM CENTER SEGMENTS ──────────────────────────────────────
      const topY = pad.y
      const segPulse = 0.6 + 0.4 * Math.sin(t * 2)
      ctx.beginPath()
      ctx.moveTo(cx - 80, topY)
      ctx.lineTo(cx - 20, topY)
      ctx.strokeStyle = `rgba(0,217,255,${0.5 * segPulse})`
      ctx.lineWidth = 1.5; ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx + 20, topY)
      ctx.lineTo(cx + 80, topY)
      ctx.strokeStyle = `rgba(0,217,255,${0.5 * segPulse})`
      ctx.lineWidth = 1.5; ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(cx, topY - 5)
      ctx.lineTo(cx + 6, topY)
      ctx.lineTo(cx, topY + 5)
      ctx.lineTo(cx - 6, topY)
      ctx.closePath()
      ctx.fillStyle = `rgba(0,217,255,${0.7 * segPulse})`
      ctx.shadowColor = 'rgba(0,217,255,0.8)'
      ctx.shadowBlur = 8
      ctx.fill()
      ctx.shadowBlur = 0

      const botY = H - pad.y
      ctx.beginPath()
      ctx.moveTo(cx - 100, botY)
      ctx.lineTo(cx + 100, botY)
      ctx.strokeStyle = `rgba(0,180,255,${0.25 * segPulse})`
      ctx.lineWidth = 1; ctx.stroke()

      // ── SIDE CIRCUIT NODES ────────────────────────────────────────────────
      const nodeAlpha = 0.5 + 0.3 * Math.sin(t * 1.8)
      const sideNodes = [
        { x: pad.x, y: H * 0.3 }, { x: pad.x, y: H * 0.5 }, { x: pad.x, y: H * 0.7 },
        { x: W - pad.x, y: H * 0.3 }, { x: W - pad.x, y: H * 0.5 }, { x: W - pad.x, y: H * 0.7 },
      ]
      sideNodes.forEach((n, i) => {
        const pulse = 0.5 + 0.5 * Math.sin(t * 2 + i * 0.8)
        ctx.beginPath()
        ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = i % 3 === 1
          ? `rgba(201,168,76,${nodeAlpha * pulse})`
          : `rgba(0,217,255,${nodeAlpha * pulse})`
        ctx.shadowColor = i % 3 === 1 ? 'rgba(201,168,76,0.8)' : 'rgba(0,217,255,0.8)'
        ctx.shadowBlur = 6
        ctx.fill()
        ctx.shadowBlur = 0

        const dir = n.x < W / 2 ? 1 : -1
        ctx.beginPath()
        ctx.moveTo(n.x + dir * 4, n.y)
        ctx.lineTo(n.x + dir * 14, n.y)
        ctx.strokeStyle = `rgba(0,180,255,${0.3 * pulse})`
        ctx.lineWidth = 0.8; ctx.stroke()
      })
    }

    animate()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="hud-root">
      <canvas ref={canvasRef} className="hud-canvas" />
      <div className="hud-frame">
        <div className="hud-scan" />
        <div className="hud-top-bar">
          <span className="hud-chevrons">{'» » » » » » »'}</span>
          <span className="hud-bar-label">DIVERGENT · UNIVERSE</span>
          <span className="hud-chevrons">{'« « « « « « «'}</span>
        </div>
        <div className="hud-bottom-bar">
          <span className="hud-bar-sub">SYS · ONLINE</span>
          <div className="hud-bottom-dot" />
          <span className="hud-bar-sub">JARQUE · CCJ</span>
        </div>
        <div className="hud-corner-pulse tl" />
        <div className="hud-corner-pulse tr" />
        <div className="hud-corner-pulse bl" />
        <div className="hud-corner-pulse br" />
      </div>
    </div>
  )
}