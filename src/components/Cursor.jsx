import { useEffect, useRef } from 'react'

export default function Cursor() {
  const cursorRef = useRef(null)
  const ringRef = useRef(null)
  let ringX = 0, ringY = 0
  let mouseX = 0, mouseY = 0

  useEffect(() => {
    const cursor = cursorRef.current
    const ring = ringRef.current

    const onMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
      cursor.style.left = mouseX + 'px'
      cursor.style.top = mouseY + 'px'
    }

    const onEnter = () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(1.8)'
      ring.style.transform = 'translate(-50%,-50%) scale(0.8)'
    }

    const onLeave = () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(1)'
      ring.style.transform = 'translate(-50%,-50%) scale(1)'
    }

    let animId
    const animRing = () => {
      ringX += (mouseX - ringX) * 0.12
      ringY += (mouseY - ringY) * 0.12
      ring.style.left = ringX + 'px'
      ring.style.top = ringY + 'px'
      animId = requestAnimationFrame(animRing)
    }

    document.addEventListener('mousemove', onMove)
    document.querySelectorAll('a, button, [data-hover]').forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })
    animRing()

    return () => {
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <>
      <div className="cursor" ref={cursorRef} />
      <div className="cursor-ring" ref={ringRef} />
    </>
  )
}
