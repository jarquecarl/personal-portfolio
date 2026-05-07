import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, uploadToCloudinary } from '../firebase'
import { doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc, updateDoc } from 'firebase/firestore'
import './Admin.css'
import AdminProjects from './AdminProjectsSection'  

const ADMIN_PASS = 'carl2024admin'

const defaultAboutCards = [
  { label: 'NAME', title: 'Carl Christian Jarque', desc: 'The one behind the code, the designs, and the curiosity that drives it all.' },
  { label: 'ORIGIN', title: 'Cavite, Philippines', desc: 'Born and raised in the Pearl of the Orient — shaped by culture, driven by ambition.' },
  { label: 'CLASS', title: 'Computer Engineer', desc: 'Bridging hardware and software — where logic meets creativity.' },
  { label: 'INSTITUTE', title: 'San Sebastian College Recoletos De Cavite', desc: 'Forged through years of engineering challenges, projects, and sleepless nights.' },
  { label: 'DIRECTIVE', title: 'Create Meaningful Experiences', desc: 'To create meaningful experiences through curiosity and exploration.' },
  { label: 'SYNC', title: 'Be Adventurous', desc: 'Every step into the unknown shapes who you become.' },
]

// ✅ NO useState calls here — this is outside the component

function Toast({ msg, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])
  return <div className={`admin-toast ${type}`}>{msg}</div>
}

export default function Admin() {
  const navigate = useNavigate()
  const [authed, setAuthed] = useState(false)
  const [pass, setPass] = useState('')
  const [passErr, setPassErr] = useState(false)
  const [section, setSection] = useState('profile')
  const [toast, setToast] = useState(null)

  // ✅ All state lives here, inside Admin()
  const [profilePhoto, setProfilePhoto] = useState('')
  const [careers, setCareers] = useState(['Frontend Developer', 'Prompt Engineer', 'Computer Engineer'])
  const [aboutCards, setAboutCards] = useState(defaultAboutCards)
  const [skills, setSkills] = useState([])
  const [newSkill, setNewSkill] = useState({ name: '', category: 'frontend', level: 75 })
  const [showSkillForm, setShowSkillForm] = useState(false)

  // ✅ Moved inside — these were the broken ones
  const [hobbyNames, setHobbyNames] = useState(['Baking', 'Cosplay', 'Coffee', 'Food Exploring', 'Merch Collecting'])
  const [newHobbyName, setNewHobbyName] = useState('')
  const [editingProj, setEditingProj] = useState(null)
  const [editProjData, setEditProjData] = useState(null)

  const [hobbyTab, setHobbyTab] = useState(0)
  const [hobbyData, setHobbyData] = useState({})
  const [projects, setProjects] = useState([])
  const [showProjForm, setShowProjForm] = useState(false)
  const [newProj, setNewProj] = useState({ title: '', type: '', year: '', desc: '', stack: '', images: [] })
  const [certs, setCerts] = useState([])
  const [showCertForm, setShowCertForm] = useState(false)
  const [newCert, setNewCert] = useState({ title: '', issuer: '', year: '', type: 'technical', imageUrl: '', fileUrl: '' })
  const [contactItems, setContactItems] = useState([])
  const [showContactForm, setShowContactForm] = useState(false)
  const [newContact, setNewContact] = useState({ label: '', value: '', href: '', linkText: '', icon: 'github' })

  const showToast = (msg, type = 'success') => setToast({ msg, type })

  // ... rest of component unchanged

  // Auth
  const login = () => {
    if (pass === ADMIN_PASS) { setAuthed(true) }
    else { setPassErr(true); setPass(''); setTimeout(() => setPassErr(false), 1000) }
  }

  // Load all data
   const loadAll = async () => {
  try {
    const prof = await getDoc(doc(db, 'cms', 'profile'))
    if (prof.exists()) {
      const d = prof.data()
      if (d.photoUrl) setProfilePhoto(d.photoUrl)
      if (d.careers)  setCareers(d.careers)
    }
  } catch(e) { console.error('Profile:', e) }

  try {
    const about = await getDoc(doc(db, 'cms', 'about'))
    if (about.exists() && about.data().cards) setAboutCards(about.data().cards)
  } catch(e) { console.error('About:', e) }

  try {
    const skillsSnap = await getDocs(collection(db, 'skills'))
    setSkills(skillsSnap.docs.map(d => ({ id: d.id, ...d.data() })))
  } catch(e) { console.error('Skills:', e) }

  try {
    const hd = {}
    for (const name of hobbyNames) {
      const snap = await getDoc(doc(db, 'hobbies', name))
      hd[name] = snap.exists() ? (snap.data().images || []) : []
    }
    setHobbyData(hd)
  } catch(e) { console.error('Hobbies:', e) }

  try {
    const projSnap = await getDocs(collection(db, 'projects'))
    const loaded = projSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    console.log('Projects fetched:', loaded)  // ← watch this in console
    setProjects(loaded)
  } catch(e) { console.error('Projects:', e) }

  try {
    const certSnap = await getDocs(collection(db, 'certifications'))
    setCerts(certSnap.docs.map(d => ({ id: d.id, ...d.data() })))
  } catch(e) { console.error('Certs:', e) }

  try {
    const cont = await getDoc(doc(db, 'cms', 'contact'))
    if (cont.exists() && cont.data().items) setContactItems(cont.data().items)
  } catch(e) { console.error('Contact:', e) }
}

    useEffect(() => {
      if (authed) loadAll()
    }, [authed])

  if (!authed) return (
    <div className="admin-login">
      <div className="admin-login-box">
        <div className="admin-login-title">ADMIN ACCESS</div>
        <div className="admin-login-sub">Enter your credentials to continue</div>
        <input
          className={`admin-login-input${passErr ? ' error' : ''}`}
          type="password"
          value={pass}
          onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          placeholder="Enter password..."
          autoFocus
        />
        <button className="admin-login-btn" onClick={login}>AUTHENTICATE</button>
        <button className="admin-login-back" onClick={() => navigate('/')}>← BACK TO PORTFOLIO</button>
      </div>
    </div>
  )

  return (
    <div className="admin-wrap">
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      {/* SIDEBAR */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-title">ADMIN CMS</div>
          <div className="admin-sidebar-sub">CARL'S PORTFOLIO</div>
          <div className="admin-online"><div className="admin-online-dot" /><span>AUTHENTICATED</span></div>
        </div>
        <nav className="admin-nav">
          {[
            ['profile', '👤', 'PROFILE & PHOTO'],
            ['about', '🔮', 'ABOUT CARDS'],
            ['skills', '⚡', 'SKILLS'],
            ['hobbies', '🎨', 'HOBBIES'],
            ['projects', '🚀', 'PROJECTS'],
            ['certifications', '🏆', 'CERTIFICATIONS'],
            ['contact', '📡', 'CONTACT INFO'],
          ].map(([key, icon, label]) => (
            <div key={key} className={`admin-nav-item${section === key ? ' active' : ''}`} onClick={() => setSection(key)}>
              <span className="admin-nav-icon">{icon}</span>
              <span className="admin-nav-label">{label}</span>
            </div>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button className="admin-exit-btn" onClick={() => navigate('/')}>← EXIT TO PORTFOLIO</button>
        </div>
      </div>

      {/* MAIN */}
      <div className="admin-main">

        {/* ── PROFILE ── */}
        {section === 'profile' && (
  <div className="admin-section">
    <div className="admin-section-title">Profile & Photo</div>
    <div className="admin-section-desc">Update your profile photo and career path titles.</div>

    {profilePhoto && (
      <img src={profilePhoto} className="admin-photo-preview" alt="Profile" />
    )}

    <div className="admin-upload-area">
      <input
        type="file"
        accept="image/*"
        onChange={async e => {
          const file = e.target.files[0]
          if (!file) return
          showToast('Uploading photo...', 'info')
          try {
            const url = await uploadToCloudinary(file)
            setProfilePhoto(url)
            // Save immediately with the fresh url — avoids stale state closure
            await setDoc(
              doc(db, 'cms', 'profile'),
              { photoUrl: url, careers },
              { merge: true }
            )
            showToast('Photo uploaded & saved!')
          } catch (err) {
            showToast(err.message || 'Upload failed', 'error')
          }
        }}
      />
      <div className="admin-upload-text">📷 CLICK TO UPLOAD PHOTO</div>
    </div>

    <div className="admin-divider" />

    {careers.map((c, i) => (
      <div className="admin-form-group" key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label className="admin-form-label">Career Path {i + 1}</label>
          <input
            className="admin-input"
            value={c}
            onChange={e => {
              const n = [...careers]
              n[i] = e.target.value
              setCareers(n)
            }}
          />
        </div>
        {/* Don't allow deleting if only 1 career remains */}
        {careers.length > 1 && (
          <button
            className="admin-btn admin-btn-red"
            style={{ marginTop: 0, marginBottom: '2px', padding: '8px 12px' }}
            onClick={() => setCareers(careers.filter((_, idx) => idx !== i))}
          >
            ✕
          </button>
        )}
      </div>
    ))}

    <button
      className="admin-btn admin-btn-cyan"
      onClick={() => setCareers([...careers, ''])}
    >
      + ADD CAREER PATH
    </button>

    <div style={{ marginTop: '16px' }}>
      <button
        className="admin-btn admin-btn-gold"
        onClick={async () => {
          try {
            await setDoc(
              doc(db, 'cms', 'profile'),
              { photoUrl: profilePhoto, careers },
              { merge: true }
            )
            showToast('Profile saved!')
          } catch {
            showToast('Save failed', 'error')
          }
        }}
      >
        SAVE PROFILE
      </button>
    </div>
  </div>
)}

        {/* ── ABOUT CARDS ── */}
        {section === 'about' && (
          <div className="admin-section">
            <div className="admin-section-title">About Me — Node Cards</div>
            <div className="admin-section-desc">Edit the content of each node card shown on the Who Am I page.</div>

            {aboutCards.map((card, i) => (
              <div key={i} className="admin-card-editor">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
                  <div className="admin-card-editor-label">NODE {String(i+1).padStart(2,'0')} — {card.label}</div>
                  <button
                    className="admin-btn admin-btn-red"
                    style={{ marginTop:0 }}
                    onClick={() => setAboutCards(aboutCards.filter((_,idx) => idx !== i))}
                  >✕ REMOVE</button>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Label</label>
                  <input className="admin-input" value={card.label}
                    onChange={e => { const n=[...aboutCards]; n[i]={...n[i], label:e.target.value}; setAboutCards(n) }} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Title</label>
                  <input className="admin-input" value={card.title}
                    onChange={e => { const n=[...aboutCards]; n[i]={...n[i], title:e.target.value}; setAboutCards(n) }} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Description</label>
                  <textarea className="admin-textarea" value={card.desc}
                    onChange={e => { const n=[...aboutCards]; n[i]={...n[i], desc:e.target.value}; setAboutCards(n) }} />
                </div>
              </div>
            ))}

            <div style={{ display:'flex', gap:'10px', marginTop:'8px' }}>
              <button className="admin-btn admin-btn-cyan"
                onClick={() => setAboutCards([...aboutCards, { label:'NEW', title:'', desc:'' }])}>
                + ADD CARD
              </button>
              <button className="admin-btn admin-btn-gold" onClick={async () => {
                try { await setDoc(doc(db,'cms','about'), { cards: aboutCards }); showToast('Cards saved!') }
                catch { showToast('Save failed','error') }
              }}>SAVE CARDS</button>
            </div>
          </div>
        )}

        {/* ── SKILLS ── */}
        {section === 'skills' && (
          <div className="admin-section">
            <div className="admin-section-title">Skills & Abilities</div>
            <div className="admin-section-desc">Manage your technical and soft skills. Edit the gold bar proficiency level directly.</div>
            {skills.length === 0 && (
              <button className="admin-btn admin-btn-cyan" style={{marginBottom:'16px'}} onClick={async () => {
                const defaultSkills = [
                  { name: 'HTML / CSS', category: 'frontend', tag: 'MARKUP', level: 88 },
                  { name: 'JavaScript', category: 'frontend', tag: 'LANGUAGE', level: 80 },
                  { name: 'React', category: 'frontend', tag: 'FRAMEWORK', level: 75 },
                  { name: 'Python', category: 'languages', tag: 'SCRIPTING', level: 70 },
                  { name: 'Java', category: 'languages', tag: 'OOP', level: 65 },
                  { name: 'C#', category: 'languages', tag: 'OOP', level: 60 },
                  { name: 'RESPONSIVE DESIGN', category: 'web', tag: 'WEB', level: 0 },
                  { name: 'UI/UX IMPLEMENTATION', category: 'web', tag: 'WEB', level: 0 },
                  { name: 'FIREBASE', category: 'web', tag: 'WEB', level: 0 },
                  { name: 'REST APIs', category: 'web', tag: 'WEB', level: 0 },
                  { name: 'GIT / GITHUB', category: 'web', tag: 'WEB', level: 0 },
                  { name: 'PROMPT ENGINEERING', category: 'web', tag: 'WEB', level: 0 },
                  { name: 'ADAPTABILITY', category: 'soft', tag: 'SOFT', level: 0 },
                  { name: 'TEAMWORK', category: 'soft', tag: 'SOFT', level: 0 },
                  { name: 'COMMUNICATION', category: 'soft', tag: 'SOFT', level: 0 },
                  { name: 'VOICE IMPRESSION', category: 'soft', tag: 'SOFT', level: 0 },
                  { name: 'PROBLEM SOLVING', category: 'soft', tag: 'SOFT', level: 0 },
                  { name: 'CREATIVE THINKING', category: 'soft', tag: 'SOFT', level: 0 },
                ]
                showToast('Seeding default skills...', 'info')
                const newSkills = []
                for (const s of defaultSkills) {
                  const ref = await addDoc(collection(db, 'skills'), s)
                  newSkills.push({ id: ref.id, ...s })
                }
                setSkills(newSkills)
                showToast('Default skills loaded!', 'success')
              }}>⚡ LOAD DEFAULT SKILLS</button>
            )}
            <div className="admin-items-grid">
              {skills.map(s => (
                <div key={s.id} className="admin-item-card">
                  <div className="admin-item-name">{s.name}</div>
                  <div className="admin-item-sub">{s.category?.toUpperCase()} {s.level > 0 ? `· ${s.level}%` : '· TAG'}</div>
                  {s.level > 0 && (
                    <div style={{marginBottom:'8px'}}>
                      <div className="admin-skill-bar"><div style={{ width: s.level + '%' }} /></div>
                      <input
                        type="range" min="0" max="100"
                        value={s.level}
                        className="admin-skill-slider"
                        onChange={e => {
                          const val = parseInt(e.target.value)
                          setSkills(prev => prev.map(x => x.id === s.id ? {...x, level: val} : x))
                        }}
                      />
                      <div style={{display:'flex',justifyContent:'space-between'}}>
                        <span className="admin-form-label" style={{marginBottom:0}}>PROFICIENCY</span>
                        <span className="admin-form-label" style={{marginBottom:0,color:'var(--gold)'}}>{s.level}%</span>
                      </div>
                    </div>
                  )}
                  <div style={{display:'flex',gap:'8px'}}>
                    <button className="admin-btn admin-btn-gold" style={{flex:1}} onClick={async () => {
                      try {
                        await updateDoc(doc(db, 'skills', s.id), { level: s.level })
                        showToast('Skill updated!')
                      } catch(e) { showToast('Update failed', 'error') }
                    }}>SAVE</button>
                    <button className="admin-btn admin-btn-red" onClick={async () => {
                      await deleteDoc(doc(db, 'skills', s.id))
                      setSkills(prev => prev.filter(x => x.id !== s.id))
                      showToast('Deleted')
                    }}>DELETE</button>
                  </div>
                </div>
              ))}
            </div>
            <button className="admin-btn admin-btn-cyan" onClick={() => setShowSkillForm(true)}>+ ADD SKILL</button>
            {showSkillForm && (
              <div className="admin-form-panel">
                <div className="admin-form-group">
                  <label className="admin-form-label">Skill Name</label>
                  <input className="admin-input" value={newSkill.name} onChange={e => setNewSkill({...newSkill, name: e.target.value})} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Category</label>
                  <select className="admin-select" value={newSkill.category} onChange={e => setNewSkill({...newSkill, category: e.target.value})}>
                    <option value="frontend">Frontend Development</option>
                    <option value="languages">Programming Languages</option>
                    <option value="web">Web Technologies</option>
                    <option value="soft">Soft Skills</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Proficiency Level (0 = tag style)</label>
                  <input type="range" min="0" max="100" value={newSkill.level} className="admin-skill-slider" onChange={e => setNewSkill({...newSkill, level: parseInt(e.target.value)||0})} />
                  <div style={{display:'flex',justifyContent:'space-between'}}>
                    <span className="admin-form-label" style={{marginBottom:0}}>0%</span>
                    <span className="admin-form-label" style={{marginBottom:0,color:'var(--gold)'}}>{newSkill.level}%</span>
                    <span className="admin-form-label" style={{marginBottom:0}}>100%</span>
                  </div>
                  <div className="admin-skill-bar" style={{marginTop:'6px'}}><div style={{width: newSkill.level + '%'}} /></div>
                </div>
                <div style={{display:'flex',gap:'10px'}}>
                  <button className="admin-btn admin-btn-gold" onClick={async () => {
                    if (!newSkill.name) return
                    const ref = await addDoc(collection(db, 'skills'), newSkill)
                    setSkills(prev => [...prev, { id: ref.id, ...newSkill }])
                    setNewSkill({ name: '', category: 'frontend', level: 75 })
                    setShowSkillForm(false)
                    showToast('Skill added!')
                  }}>SAVE</button>
                  <button className="admin-btn admin-btn-red" onClick={() => setShowSkillForm(false)}>CANCEL</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── HOBBIES ── */}
        {section === 'hobbies' && (
            <div className="admin-section">
              <div className="admin-section-title">Hobbies — Gallery Photos</div>
              <div className="admin-section-desc">Manage hobby categories and upload photos for each gallery.</div>

              {/* ADD NEW HOBBY */}
              <div style={{ display:'flex', gap:'8px', marginBottom:'20px', alignItems:'flex-end' }}>
                <div style={{ flex:1 }}>
                  <label className="admin-form-label">NEW HOBBY NAME</label>
                  <input className="admin-input" placeholder="e.g. Gaming"
                    value={newHobbyName} onChange={e => setNewHobbyName(e.target.value)} />
                </div>
                <button className="admin-btn admin-btn-cyan" style={{ marginTop:0, marginBottom:'2px' }}
                  onClick={() => {
                    const name = newHobbyName.trim()
                    if (!name || hobbyNames.includes(name)) return
                    setHobbyNames(prev => [...prev, name])
                    setHobbyData(prev => ({ ...prev, [name]: [] }))
                    setHobbyTab(hobbyNames.length)
                    setNewHobbyName('')
                  }}>+ ADD</button>
              </div>

              {/* TABS */}
              <div className="admin-hobby-tabs">
                {hobbyNames.map((name,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                    <button
                      className={`admin-tab${hobbyTab === i ? ' active' : ''}`}
                      onClick={() => setHobbyTab(i)}
                    >{name}</button>
                    <button
                      style={{
                        background:'transparent', border:'1px solid rgba(224,60,60,0.3)',
                        color:'var(--red)', fontSize:'0.6rem', cursor:'pointer',
                        padding:'3px 7px', fontFamily:"'Share Tech Mono',sans-serif",
                        transition:'all 0.2s'
                      }}
                      onClick={async () => {
                        if (!window.confirm(`Delete hobby "${name}" and all its photos?`)) return
                        await setDoc(doc(db,'hobbies',name), { images:[] })
                        const updated = hobbyNames.filter((_,idx) => idx !== i)
                        setHobbyNames(updated)
                        setHobbyData(prev => { const n={...prev}; delete n[name]; return n })
                        setHobbyTab(Math.max(0, hobbyTab - 1))
                        showToast(`"${name}" removed`)
                      }}
                    >✕</button>
                  </div>
                ))}
              </div>

              {hobbyNames.length > 0 && (
                <div className="admin-hobby-content">
                  <div className="admin-upload-area">
                    <input type="file" accept="image/*" multiple onChange={async e => {
                      const files = Array.from(e.target.files); if (!files.length) return
                      showToast(`Uploading ${files.length} photo(s)...`,'info')
                      const name = hobbyNames[hobbyTab]
                      try {
                        const urls = await Promise.all(files.map(f => uploadToCloudinary(f)))
                        const updated = [...(hobbyData[name]||[]), ...urls]
                        await setDoc(doc(db,'hobbies',name), { images: updated })
                        setHobbyData(prev => ({ ...prev, [name]: updated }))
                        showToast(`${files.length} photo(s) uploaded!`)
                      } catch(err) { showToast(err.message||'Upload failed','error') }
                    }} />
                    <div className="admin-upload-text">
                      📸 UPLOAD PHOTOS FOR {hobbyNames[hobbyTab]?.toUpperCase()}
                    </div>
                  </div>

                  <div className="admin-img-grid">
                    {(hobbyData[hobbyNames[hobbyTab]]||[]).map((url,i) => (
                      <div key={i} className="admin-img-item">
                        <img src={url} alt="" />
                        <button className="admin-img-delete" onClick={async () => {
                          const name = hobbyNames[hobbyTab]
                          const updated = hobbyData[name].filter((_,idx) => idx !== i)
                          await setDoc(doc(db,'hobbies',name), { images: updated })
                          setHobbyData(prev => ({ ...prev, [name]: updated }))
                          showToast('Photo deleted')
                        }}>✕</button>
                      </div>
                    ))}
                  </div>

                  {(hobbyData[hobbyNames[hobbyTab]]||[]).length === 0 && (
                    <div style={{ fontFamily:"'Share Tech Mono',sans-serif", fontSize:'0.55rem',
                      color:'var(--text-dim)', letterSpacing:'2px', marginTop:'12px', opacity:0.5 }}>
                      NO PHOTOS YET — UPLOAD ABOVE
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        {/* ── PROJECTS ── */}
        {section === 'projects' && <AdminProjects showToast={showToast} />}

        {/* ── CERTIFICATIONS ── */}
        {section === 'certifications' && (
          <div className="admin-section">
            <div className="admin-section-title">Certifications</div>
            <div className="admin-section-desc">Add or remove your certifications. Assign each one as Technical or Non-Technical.</div>
            <div className="admin-items-grid">
              {certs.map(c => (
                <div key={c.id} className="admin-item-card">
                  {c.imageUrl && <img src={c.imageUrl} alt={c.title} style={{width:'100%',height:'70px',objectFit:'cover',marginBottom:'8px',opacity:0.7}} />}
                  <div className="admin-item-name">{c.title}</div>
                  <div className="admin-item-sub">{c.issuer} · {c.year}</div>
                  <div className="admin-item-sub" style={{color: c.type === 'technical' ? 'var(--gold)' : 'var(--cyan)'}}>
                    {c.type === 'technical' ? '⚡ TECHNICAL' : '🎓 NON-TECHNICAL'}
                  </div>
                  <button className="admin-btn admin-btn-red" onClick={async () => {
                    await deleteDoc(doc(db, 'certifications', c.id))
                    setCerts(prev => prev.filter(x => x.id !== c.id))
                    showToast('Deleted')
                  }}>DELETE</button>
                </div>
              ))}
            </div>

            <button className="admin-btn admin-btn-cyan" onClick={() => setShowCertForm(true)}>+ ADD CERTIFICATION</button>

            {showCertForm && (
              <div className="admin-form-panel">

                {/* Title, Issuer, Year */}
                {[['Certificate Title','title'],['Issuing Organization','issuer'],['Year','year']].map(([label, key]) => (
                  <div key={key} className="admin-form-group">
                    <label className="admin-form-label">{label}</label>
                    <input className="admin-input" value={newCert[key]} onChange={e => setNewCert({...newCert, [key]: e.target.value})} />
                  </div>
                ))}

                {/* Type Switch */}
                <div className="admin-form-group">
                  <label className="admin-form-label">CERTIFICATION TYPE</label>
                  <div style={{display:'flex', gap:'0'}}>
                    <button
                      className="admin-btn"
                      style={{
                        flex:1, marginTop:0,
                        borderColor: newCert.type === 'technical' ? 'var(--gold)' : 'var(--border)',
                        color: newCert.type === 'technical' ? 'var(--gold)' : 'var(--text-dim)',
                        background: newCert.type === 'technical' ? 'rgba(201,168,76,0.1)' : 'transparent',
                      }}
                      onClick={() => setNewCert({...newCert, type: 'technical'})}
                    >⚡ TECHNICAL</button>
                    <button
                      className="admin-btn"
                      style={{
                        flex:1, marginTop:0,
                        borderColor: newCert.type === 'non-technical' ? 'var(--cyan)' : 'var(--border)',
                        color: newCert.type === 'non-technical' ? 'var(--cyan)' : 'var(--text-dim)',
                        background: newCert.type === 'non-technical' ? 'rgba(0,217,255,0.08)' : 'transparent',
                      }}
                      onClick={() => setNewCert({...newCert, type: 'non-technical'})}
                    >🎓 NON-TECHNICAL</button>
                  </div>
                </div>

                {/* Dropzone 1 — Image */}
                <div className="admin-form-group">
                  <label className="admin-form-label">CERTIFICATE IMAGE (PNG / JPG)</label>
                  <div className="admin-upload-area">
                    <input type="file" accept="image/*" onChange={async e => {
                      const file = e.target.files[0]; if (!file) return
                      showToast('Uploading image...', 'info')
                      try {
                        const url = await uploadToCloudinary(file)
                        setNewCert(prev => ({...prev, imageUrl: url}))
                        showToast('Image uploaded!')
                      } catch { showToast('Upload failed', 'error') }
                    }} />
                    <div className="admin-upload-text">
                      {newCert.imageUrl ? '✓ IMAGE READY — CLICK TO REPLACE' : '🖼 DROP IMAGE HERE OR CLICK TO BROWSE'}
                    </div>
                  </div>
                  {newCert.imageUrl && (
                    <img src={newCert.imageUrl} alt="preview" style={{width:'100%',maxHeight:'120px',objectFit:'contain',marginTop:'8px',border:'1px solid var(--border)'}} />
                  )}
                </div>

                {/* Dropzone 2 — PDF */}
                <div className="admin-form-group">
                  <label className="admin-form-label">CERTIFICATE FILE (PDF)</label>
                  <div className="admin-upload-area">
                    <input type="file" accept="application/pdf" onChange={async e => {
                      const file = e.target.files[0]; if (!file) return
                      showToast('Uploading PDF...', 'info')
                      try {
                        const url = await uploadToCloudinary(file)
                        setNewCert(prev => ({...prev, fileUrl: url}))
                        showToast('PDF uploaded!')
                      } catch { showToast('Upload failed', 'error') }
                    }} />
                    <div className="admin-upload-text">
                      {newCert.fileUrl ? '✓ PDF READY — CLICK TO REPLACE' : '📄 DROP PDF HERE OR CLICK TO BROWSE'}
                    </div>
                  </div>
                  {newCert.fileUrl && (
                    <div style={{marginTop:'8px', padding:'10px 14px', border:'1px solid var(--border)', background:'rgba(0,217,255,0.04)'}}>
                      <span style={{fontFamily:"'Share Tech Mono',sans-serif", fontSize:'0.55rem', color:'var(--cyan)', letterSpacing:'2px'}}>
                        ✓ PDF ATTACHED
                      </span>
                    </div>
                  )}
                </div>

                <div style={{display:'flex',gap:'10px'}}>
                  <button className="admin-btn admin-btn-gold" onClick={async () => {
                    if (!newCert.title) return
                    const ref = await addDoc(collection(db, 'certifications'), newCert)
                    setCerts(prev => [...prev, { id: ref.id, ...newCert }])
                    setNewCert({ title: '', issuer: '', year: '', type: 'technical', imageUrl: '', fileUrl: '' })
                    setShowCertForm(false)
                    showToast('Certification saved!')
                  }}>SAVE</button>
                  <button className="admin-btn admin-btn-red" onClick={() => setShowCertForm(false)}>CANCEL</button>
                </div>

              </div>
            )}
          </div>
        )}

        {/* ── CONTACT ── */}
        {section === 'contact' && (
          <div className="admin-section">
            <div className="admin-section-title">Contact Information</div>
            <div className="admin-section-desc">Add, remove, or reorder your contact channels. Changes reflect live on the portfolio.</div>

            <div className="admin-items-grid">
              {contactItems.map((c, i) => (
                <div key={i} className="admin-item-card">
                  <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px'}}>
                    <span style={{fontSize:'1rem'}}>
                      {c.icon === 'github' ? '🐙' : c.icon === 'email' ? '📧' : c.icon === 'phone' ? '📞' : c.icon === 'facebook' ? '📘' : c.icon === 'linkedin' ? '💼' : '🔗'}
                    </span>
                    <div className="admin-item-name">{c.label}</div>
                  </div>
                  <div className="admin-item-sub">{c.value}</div>
                  <div className="admin-item-sub" style={{color:'var(--cyan)', marginBottom:'8px'}}>{c.href}</div>
                  <button className="admin-btn admin-btn-red" onClick={async () => {
                    const updated = contactItems.filter((_, idx) => idx !== i)
                    await setDoc(doc(db, 'cms', 'contact'), { items: updated })
                    setContactItems(updated)
                    showToast('Contact removed')
                  }}>DELETE</button>
                </div>
              ))}
            </div>

            <button className="admin-btn admin-btn-cyan" onClick={() => setShowContactForm(true)}>+ ADD CONTACT</button>

            {showContactForm && (
              <div className="admin-form-panel">
                <div className="admin-form-group">
                  <label className="admin-form-label">ICON</label>
                  <select className="admin-select" value={newContact.icon} onChange={e => setNewContact({...newContact, icon: e.target.value})}>
                    <option value="github">GitHub</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="facebook">Facebook</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </div>
                {[['Label (e.g. LINKEDIN)','label'],['Display Value (e.g. /in/yourname)','value'],['Full URL or href','href'],['Button Text (e.g. OPEN LINKEDIN)','linkText']].map(([lbl, key]) => (
                  <div key={key} className="admin-form-group">
                    <label className="admin-form-label">{lbl}</label>
                    <input className="admin-input" value={newContact[key]} onChange={e => setNewContact({...newContact, [key]: e.target.value})} />
                  </div>
                ))}
                <div style={{display:'flex', gap:'10px'}}>
                  <button className="admin-btn admin-btn-gold" onClick={async () => {
                    if (!newContact.label || !newContact.value) return
                    const updated = [...contactItems, newContact]
                    await setDoc(doc(db, 'cms', 'contact'), { items: updated })
                    setContactItems(updated)
                    setNewContact({ label: '', value: '', href: '', linkText: '', icon: 'github' })
                    setShowContactForm(false)
                    showToast('Contact added!')
                  }}>SAVE</button>
                  <button className="admin-btn admin-btn-red" onClick={() => setShowContactForm(false)}>CANCEL</button>
                </div>
              </div>
            )}

            {contactItems.length === 0 && (
              <div style={{marginTop:'16px'}}>
                <button className="admin-btn admin-btn-cyan" onClick={async () => {
                  const defaults = [
                    { label: 'GITHUB',   value: 'jarquecarl-debug',       href: 'https://github.com/jarquecarl-debug',          linkText: 'OPEN GITHUB',    icon: 'github'   },
                    { label: 'EMAIL',    value: 'jarquecarl@gmail.com',    href: 'mailto:jarquecarl@gmail.com',                  linkText: 'SEND EMAIL',     icon: 'email'    },
                    { label: 'PHONE',    value: '+63 954 545 7518',        href: 'tel:+639545457518',                            linkText: 'CALL NOW',       icon: 'phone'    },
                    { label: 'FACEBOOK', value: 'carlchristian.jarque.7',  href: 'https://facebook.com/carlchristian.jarque.7',  linkText: 'OPEN FACEBOOK',  icon: 'facebook' },
                    { label: 'LINKEDIN', value: 'your-linkedin',           href: 'https://linkedin.com/in/your-linkedin',        linkText: 'OPEN LINKEDIN',  icon: 'linkedin' },
                  ]
                  await setDoc(doc(db, 'cms', 'contact'), { items: defaults })
                  setContactItems(defaults)
                  showToast('Default contacts loaded!')
                }}>⚡ LOAD DEFAULTS + LINKEDIN</button>
              </div>
          )}
        </div>
      )}
       </div>  
    </div>    
  )
}

