import { useState, useEffect } from 'react'
import { db, uploadToCloudinary } from '../firebase'
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore'

function emptyProj() {
  return { title: '', type: '', year: '', platform: '', category: '', role: '', status: '', desc: '', stack: '', images: [] }
}

function normalise(id, data) {
  return {
    ...data,
    id,
    title: data.title || data.name || '',
    stack: Array.isArray(data.stack)
      ? data.stack
      : (data.stack || '').split(',').map(s => s.trim()).filter(Boolean),
    images: data.images || [],
  }
}

function toFirestore(data) {
  return {
    ...data,
    stack: Array.isArray(data.stack)
      ? data.stack
      : (data.stack || '').split(',').map(s => s.trim()).filter(Boolean),
  }
}

function ImageGrid({ images, onRemove }) {
  if (!images.length) return null
  return (
    <div className="admin-img-grid">
      {images.map((url, i) => (
        <div key={i} className="admin-img-item">
          <img src={url} alt="" />
          <button className="admin-img-delete" onClick={() => onRemove(i)}>✕</button>
        </div>
      ))}
    </div>
  )
}

function ProjFields({ data, setData }) {
  const set = (key, val) => setData(prev => ({ ...prev, [key]: val }))
  return (
    <>
      {[
        ['TITLE',           'title'],
        ['TYPE / CATEGORY', 'type'],
        ['YEAR',            'year'],
        ['PLATFORM',        'platform'],
        ['CATEGORY',        'category'],
        ['ROLE',            'role'],
      ].map(([label, key]) => (
        <div key={key} className="admin-form-group">
          <label className="admin-form-label">{label}</label>
          <input
            className="admin-input"
            value={data[key] || ''}
            onChange={e => set(key, e.target.value)}
          />
        </div>
      ))}

      <div className="admin-form-group">
        <label className="admin-form-label">STATUS</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
          {[
            ['Completed ✓',    '#00ff88'],
            ['In Progress ⚡', 'var(--gold)'],
            ['Planned 🔭',     'var(--cyan)'],
          ].map(([label, color]) => (
            <button
              key={label}
              className="admin-btn"
              style={{
                marginTop: 0, padding: '4px 10px',
                borderColor: data.status === label ? color : 'var(--border)',
                color:       data.status === label ? color : 'var(--text-dim)',
              }}
              onClick={() => setData(prev => ({ ...prev, status: label, statusColor: color }))}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          className="admin-input"
          value={data.status || ''}
          onChange={e => set('status', e.target.value)}
          placeholder="Or type a custom status..."
        />
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">DESCRIPTION</label>
        <textarea
          className="admin-textarea"
          rows={4}
          value={data.desc || ''}
          onChange={e => set('desc', e.target.value)}
        />
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">TECH STACK (comma-separated)</label>
        <input
          className="admin-input"
          value={Array.isArray(data.stack) ? data.stack.join(', ') : (data.stack || '')}
          onChange={e => set('stack', e.target.value)}
          placeholder="React, Firebase, Python..."
        />
      </div>
    </>
  )
}

export default function AdminProjects({ showToast }) {
  const [projects,    setProjects]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [editingId,   setEditingId]   = useState(null)
  const [editData,    setEditData]    = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProj,     setNewProj]     = useState(emptyProj())

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const snap = await getDocs(collection(db, 'projects'))
        if (!cancelled) setProjects(snap.docs.map(d => normalise(d.id, d.data())))
      } catch (e) {
        console.error('Projects load error:', e)
        if (!cancelled) showToast('Failed to load projects', 'error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const seedDefaults = async () => {
    const defaults = [
      {
        title: 'PhiNex', type: 'Thesis · Security System', year: '2025',
        badge: 'THESIS PROJECT · 2025', platform: 'PYNQ-Z2 ARM-FPGA Board',
        category: 'Cybersecurity Gateway', status: 'Completed ✓', statusColor: '#00ff88',
        role: 'Frontend Developer',
        desc: 'PhiNex is a phishing detection security gateway built on the PYNQ-Z2 ARM-FPGA development board. It leverages edge inference with a scikit-learn MLPClassifier converted to TensorFlow Lite to detect phishing URLs in real time. The system features multi-modal alerts including WebSocket push notifications, Telegram integration, and audio/LED indicators — all managed through a responsive web dashboard.',
        stack: ['PYNQ-Z2','Python','TensorFlow Lite','Scikit-Learn','WebSocket','Flask','JavaScript','Telegram API','FPGA'],
        images: [],
      },
      {
        title: 'MRF Digitalization', type: 'Internship · Web App', year: '2026',
        badge: 'INTERNSHIP PROJECT · 2026', platform: 'Web Application',
        category: 'QA Dashboard System', status: 'In Progress ⚡', statusColor: 'var(--gold)',
        role: 'Frontend Developer',
        desc: "A web-based dashboard designed to digitalize the Modification Request Form (MRF) process for a manufacturing company's QA department. Features role-based access control, a two-part digital MRF form, defect tracking, and a real-time QA dashboard for management visibility.",
        stack: ['React','JavaScript','Firebase','Firestore','HTML / CSS','Role-Based Access','QA Workflow'],
        images: [],
      },
    ]
    showToast('Seeding default projects...', 'info')
    try {
      const seeded = []
      for (const p of defaults) {
        const ref = await addDoc(collection(db, 'projects'), p)
        seeded.push(normalise(ref.id, p))
      }
      setProjects(seeded)
      showToast('Default projects loaded!')
    } catch (e) {
      console.error(e)
      showToast('Seed failed', 'error')
    }
  }

  const deleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return
    try {
      await deleteDoc(doc(db, 'projects', id))
      setProjects(prev => prev.filter(p => p.id !== id))
      if (editingId === id) { setEditingId(null); setEditData(null) }
      showToast('Project deleted')
    } catch { showToast('Delete failed', 'error') }
  }

  const saveEdit = async () => {
    if (!editData?.title) return
    try {
      const data = toFirestore(editData)
      await updateDoc(doc(db, 'projects', editingId), data)
      setProjects(prev => prev.map(p => p.id === editingId ? normalise(editingId, data) : p))
      setEditingId(null); setEditData(null)
      showToast('Project updated!')
    } catch (e) { console.error(e); showToast('Update failed', 'error') }
  }

  const saveNew = async () => {
    if (!newProj.title) return
    try {
      const data = toFirestore(newProj)
      const ref  = await addDoc(collection(db, 'projects'), data)
      setProjects(prev => [...prev, normalise(ref.id, data)])
      setNewProj(emptyProj()); setShowAddForm(false)
      showToast('Project saved!')
    } catch (e) { console.error(e); showToast('Save failed', 'error') }
  }

  const handleImageUpload = async (files, setter) => {
    if (!files.length) return
    showToast(`Uploading ${files.length} image(s)...`, 'info')
    try {
      const urls = await Promise.all(files.map(f => uploadToCloudinary(f)))
      setter(prev => ({ ...prev, images: [...(prev.images || []), ...urls] }))
      showToast('Images uploaded!')
    } catch (err) { showToast(err.message || 'Upload failed', 'error') }
  }

  const removeImage = (setter, idx) =>
    setter(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))

  return (
    <div className="admin-section">
      <div className="admin-section-title">Projects</div>
      <div className="admin-section-desc">Manage your project entries and screenshots.</div>

      {loading && (
        <div style={{ fontFamily: "'Share Tech Mono',sans-serif", fontSize: '0.55rem', color: 'var(--text-dim)', letterSpacing: '3px', marginBottom: '16px' }}>
          LOADING PROJECTS...
        </div>
      )}

      {!loading && projects.length === 0 && (
        <button className="admin-btn admin-btn-cyan" style={{ marginBottom: '20px' }} onClick={seedDefaults}>
          🚀 LOAD DEFAULT PROJECTS
        </button>
      )}

      {projects.length > 0 && (
        <div className="admin-items-grid">
          {projects.map(p => (
            <div key={p.id} className="admin-item-card">
              {p.images?.[0] && (
                <img src={p.images[0]} alt={p.title}
                  style={{ width: '100%', height: '70px', objectFit: 'cover', marginBottom: '8px', opacity: 0.75 }} />
              )}
              <div className="admin-item-name">{p.title}</div>
              <div className="admin-item-sub">{p.type}{p.year ? ` · ${p.year}` : ''}</div>
              <div style={{ fontFamily: "'Share Tech Mono',sans-serif", fontSize: '0.48rem', letterSpacing: '2px', marginBottom: '6px',
                color: p.images?.length ? 'var(--cyan)' : 'var(--text-dim)' }}>
                {p.images?.length ? `${p.images.length} IMAGE${p.images.length > 1 ? 'S' : ''}` : 'NO IMAGES'}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button className="admin-btn admin-btn-gold" style={{ flex: 1 }}
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingId(p.id)
                    setEditData({ ...p, stack: Array.isArray(p.stack) ? p.stack.join(', ') : p.stack })
                  }}>
                  EDIT
                </button>
                <button className="admin-btn admin-btn-red" onClick={() => deleteProject(p.id)}>
                  DELETE
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit form */}
      {editingId && editData && (
        <div className="admin-form-panel" style={{ marginTop: '16px' }}>
          <div className="admin-card-editor-label" style={{ marginBottom: '16px' }}>
            EDITING — {editData.title || 'Untitled'}
          </div>
          <ProjFields data={editData} setData={setEditData} />
          <div className="admin-form-group">
            <label className="admin-form-label">PROJECT IMAGES</label>
            <div className="admin-upload-area">
              <input type="file" accept="image/*" multiple
                onChange={e => handleImageUpload(Array.from(e.target.files), setEditData)} />
              <div className="admin-upload-text">📁 CLICK TO ADD IMAGES</div>
            </div>
            <ImageGrid images={editData.images || []} onRemove={idx => removeImage(setEditData, idx)} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="admin-btn admin-btn-gold" onClick={saveEdit}>SAVE CHANGES</button>
            <button className="admin-btn admin-btn-red" onClick={() => { setEditingId(null); setEditData(null) }}>CANCEL</button>
          </div>
        </div>
      )}

      {/* Add button */}
      <div style={{ marginTop: '20px' }}>
        <button className="admin-btn admin-btn-cyan"
          onClick={() => { setEditingId(null); setEditData(null); setShowAddForm(v => !v) }}>
          {showAddForm ? '✕ CANCEL' : '+ ADD PROJECT'}
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="admin-form-panel">
          <div className="admin-card-editor-label" style={{ marginBottom: '16px' }}>NEW PROJECT</div>
          <ProjFields data={newProj} setData={setNewProj} />
          <div className="admin-form-group">
            <label className="admin-form-label">PROJECT IMAGES</label>
            <div className="admin-upload-area">
              <input type="file" accept="image/*" multiple
                onChange={e => handleImageUpload(Array.from(e.target.files), setNewProj)} />
              <div className="admin-upload-text">📁 CLICK TO SELECT IMAGES</div>
            </div>
            <ImageGrid images={newProj.images || []} onRemove={idx => removeImage(setNewProj, idx)} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="admin-btn admin-btn-gold" onClick={saveNew}>SAVE PROJECT</button>
            <button className="admin-btn admin-btn-red" onClick={() => { setShowAddForm(false); setNewProj(emptyProj()) }}>CANCEL</button>
          </div>
        </div>
      )}
    </div>
  )
}       