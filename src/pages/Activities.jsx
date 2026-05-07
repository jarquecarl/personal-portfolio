import { useState, useEffect } from 'react'
import NavBreadcrumb from '../components/NavBreadcrumb'
import BackBtn from '../components/BackBtn'
import './Activities.css'

const GITHUB_USER = 'jarquecarl-debug'
const GITHUB_REPO = 'CPE302-Activities'

function getFileIcon(name) {
  const ext = name.split('.').pop().toLowerCase()
  const map = { html:'🌐', css:'🎨', js:'⚡', jsx:'⚛️', py:'🐍', java:'☕', md:'📝', txt:'📄', json:'📋', pdf:'📕', png:'🖼️', jpg:'🖼️', jpeg:'🖼️' }
  return map[ext] || '📄'
}

function getFileType(name) {
  const ext = name.split('.').pop().toLowerCase()
  const map = { html:'HTML File', css:'CSS File', js:'JavaScript', py:'Python', java:'Java', md:'Markdown' }
  return map[ext] || 'File'
}

export default function Activities() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [path, setPath] = useState('')
  const [history, setHistory] = useState([])
  const [openingFile, setOpeningFile] = useState(null)

  useEffect(() => {
    loadContents(path)
  }, [path])

  const loadContents = async (p) => {
    setLoading(true)
    setError(null)
    try {
      const url = p
        ? `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${p}`
        : `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      // Filter out images folder and static assets
      const filtered = data.filter(f => !['git-images','b&w.png','gingineer.png','index.html'].includes(f.name))
      // Sort: folders first, then files
      filtered.sort((a,b) => {
        if (a.type === 'dir' && b.type !== 'dir') return -1
        if (a.type !== 'dir' && b.type === 'dir') return 1
        return a.name.localeCompare(b.name)
      })
      setItems(filtered)
    } catch(e) {
      setError('Failed to load activities: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClick = async (item) => {
    if (item.type === 'dir') {
      setHistory(h => [...h, path])
      setPath(item.path)
    } else if (item.name.toLowerCase().endsWith('.html')) {
      setOpeningFile(item.name)
      try {
        const urls = [
          `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/${item.path}`,
          `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/master/${item.path}`,
          item.download_url
        ]
        let html = null
        for (const u of urls) {
          const r = await fetch(u)
          if (r.ok) { html = await r.text(); break }
        }
        if (html) {
          const dir = item.path.split('/').slice(0,-1).join('/')
          const base = dir
            ? `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/${dir}/`
            : `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/`
          if (!html.includes('<base')) html = html.replace(/<head>/i, `<head>\n<base href="${base}">`)
          const w = window.open('', '_blank')
          w.document.open(); w.document.write(html); w.document.close()
          w.document.title = item.name
        } else {
          window.open(item.html_url, '_blank')
        }
      } catch { window.open(item.html_url, '_blank') }
      setOpeningFile(null)
    } else {
      window.open(item.html_url, '_blank')
    }
  }

  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1]
      setHistory(h => h.slice(0,-1))
      setPath(prev)
    }
  }

  const goRoot = () => { setHistory([]); setPath('') }

  // Build breadcrumb parts
  const breadParts = path ? path.split('/') : []

  return (
    <div className="page activities-page">
      <NavBreadcrumb section="Academic Records" />
      <BackBtn to="/" />

      <div className="activities-content">
        {/* HEADER */}
        <div className="activities-header">
          <div className="section-tag">Field Activities</div>
          <h1 className="section-title" style={{marginBottom:'8px'}}>Academic Records</h1>
          <div className="activities-repo-badge">
            <svg viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
            {GITHUB_USER}/{GITHUB_REPO}
          </div>
        </div>

        {/* BREADCRUMB */}
        {path && (
          <div className="activities-breadcrumb">
            <span className="bread-item" onClick={goRoot}>ROOT</span>
            {breadParts.map((part, i) => {
              const partPath = breadParts.slice(0, i+1).join('/')
              return (
                <span key={i}>
                  <span className="bread-sep">›</span>
                  <span className="bread-item" onClick={() => { setHistory(h => [...h, path]); setPath(partPath) }}>{part}</span>
                </span>
              )
            })}
            <button className="activities-back-btn" onClick={goBack}>← BACK</button>
          </div>
        )}

        {/* CONTENT */}
        {loading && (
          <div className="activities-loading">
            <div className="loading-spinner" />
            <span>LOADING ACTIVITIES...</span>
          </div>
        )}

        {error && <div className="activities-error">{error}</div>}

        {!loading && !error && (
          <div className="activities-grid">
            {items.length === 0 && (
              <div className="activities-empty">No items found in this folder.</div>
            )}
            {items.map((item, i) => (
              <div
                key={i}
                className={`activity-card${item.type === 'dir' ? ' folder' : ' file'}`}
                onClick={() => handleClick(item)}
              >
                <div className="activity-card-icon">
                  {item.type === 'dir'
                    ? <svg viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
                    : <span>{getFileIcon(item.name)}</span>
                  }
                </div>
                <div className="activity-card-name">{item.name}</div>
                <div className="activity-card-type">{item.type === 'dir' ? 'FOLDER' : getFileType(item.name)}</div>
                {openingFile === item.name && <div className="activity-card-opening">OPENING...</div>}
                <div className="activity-card-corner" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
