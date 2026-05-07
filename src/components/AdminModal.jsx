import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminModal() {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [log, setLog] = useState(['> SYSTEM READY', '> AWAITING CREDENTIALS...'])
  const navigate = useNavigate()

  useEffect(() => {
    window.openAdminModal = () => setOpen(true)
    return () => { delete window.openAdminModal }
  }, [])

  const attempt = () => {
    if (password === 'carl2024admin') {
      setLog(prev => [...prev, '> ACCESS GRANTED — WELCOME CARL'])
      setTimeout(() => {
        setOpen(false)
        setPassword('')
        setLog(['> SYSTEM READY', '> AWAITING CREDENTIALS...'])
        navigate('/admin')
      }, 800)
    } else {
      setLog(prev => [...prev, '> ACCESS DENIED — INVALID CREDENTIALS'])
      setPassword('')
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') attempt()
    if (e.key === 'Escape') setOpen(false)
  }

  if (!open) return null

  return (
    <div className="admin-modal-overlay" onClick={() => setOpen(false)}>
      <div className="admin-terminal" onClick={e => e.stopPropagation()}>
        <div className="terminal-dots">
          <div className="terminal-dot red" />
          <div className="terminal-dot amber" />
          <div className="terminal-dot green" />
          <span className="terminal-label">ADMIN TERMINAL v1.0</span>
        </div>
        <div className="terminal-log">
          {log.map((line, i) => (
            <div key={i} style={{ color: line.includes('DENIED') ? '#e03c3c' : line.includes('GRANTED') ? '#00ff88' : 'var(--cyan)' }}>
              {line}
            </div>
          ))}
        </div>
        <div className="terminal-input-row">
          <span className="terminal-prompt">PASS://</span>
          <input
            className="terminal-input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKey}
            placeholder="enter access key..."
            autoFocus
          />
        </div>
        <div className="terminal-buttons">
          <button className="terminal-btn" onClick={attempt}>AUTHENTICATE</button>
          <button className="terminal-btn close" onClick={() => setOpen(false)}>✕</button>
        </div>
      </div>
    </div>
  )
}
