import NavBreadcrumb from '../components/NavBreadcrumb'
import BackBtn from '../components/BackBtn'
import { useEffect, useRef, useState } from 'react'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import './Skills.css'

// Default skills shown if Firestore is empty
const defaultSkills = [
  { name: 'HTML / CSS', category: 'frontend', tag: 'MARKUP', level: 88 },
  { name: 'JavaScript', category: 'frontend', tag: 'LANGUAGE', level: 80 },
  { name: 'React', category: 'frontend', tag: 'FRAMEWORK', level: 75 },
  { name: 'Python', category: 'languages', tag: 'SCRIPTING', level: 70 },
  { name: 'Java', category: 'languages', tag: 'OOP', level: 65 },
  { name: 'C#', category: 'languages', tag: 'OOP', level: 60 },
  { name: 'RESPONSIVE DESIGN', category: 'web', level: 0 },
  { name: 'UI/UX IMPLEMENTATION', category: 'web', level: 0 },
  { name: 'FIREBASE', category: 'web', level: 0 },
  { name: 'REST APIs', category: 'web', level: 0 },
  { name: 'GIT / GITHUB', category: 'web', level: 0 },
  { name: 'PROMPT ENGINEERING', category: 'web', level: 0 },
  { name: 'ADAPTABILITY', category: 'soft', level: 0 },
  { name: 'TEAMWORK', category: 'soft', level: 0 },
  { name: 'COMMUNICATION', category: 'soft', level: 0 },
  { name: 'VOICE IMPRESSION', category: 'soft', level: 0 },
  { name: 'PROBLEM SOLVING', category: 'soft', level: 0 },
  { name: 'CREATIVE THINKING', category: 'soft', level: 0 },
]

const catLabels = {
  frontend: 'Frontend Development',
  languages: 'Programming Languages',
  web: 'Web Technologies',
  soft: 'Soft Skills',
}

function SkillBar({ name, tag, level }) {
  const fillRef = useRef(null)
  useEffect(() => {
    const t = setTimeout(() => {
      if (fillRef.current) fillRef.current.style.width = level + '%'
    }, 300)
    return () => clearTimeout(t)
  }, [level])
  return (
    <div className="skill-bar-item">
      <div className="skill-bar-header">
        <span className="skill-bar-name">{name}</span>
        <span className="skill-bar-tag">{tag}</span>
      </div>
      <div className="skill-bar-track">
        <div className="skill-bar-fill" ref={fillRef} />
      </div>
    </div>
  )
}

export default function Skills() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, 'skills'))
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setSkills(data.length > 0 ? data : defaultSkills)
      } catch {
        setSkills(defaultSkills)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Group by category
  const grouped = {}
  skills.forEach(s => {
    if (!grouped[s.category]) grouped[s.category] = []
    grouped[s.category].push(s)
  })

  const barCats = ['frontend', 'languages']

  return (
    <div className="page skills-page">
      <NavBreadcrumb section="Abilities" />
      <BackBtn to="/hub" />

      {/* CHARACTER — leans against the skills panel */}
      <div className="skills-char-area">
        <div className="skills-char-glow" />
        <img
          src="/skills-pose.png"
          alt="Carl Christian Jarque"
          className="skills-char-img"
        />
      </div>

      <div className="skills-panel">
        <div className="skills-panel-inner">
          <div className="section-tag">Capability Matrix</div>
          <h1 className="section-title">Abilities</h1>
          {loading ? (
            <div style={{color:'var(--text-dim)',fontFamily:'Share Tech Mono,sans-serif',fontSize:'0.6rem',letterSpacing:'3px'}}>LOADING...</div>
          ) : (
            <>
              <div className="skills-divider" />
              {barCats.map(cat => grouped[cat]?.length > 0 && (
                <div key={cat} className="skill-group">
                  <div className="skill-cat-title">{catLabels[cat]}</div>
                  {grouped[cat].map((s, i) => (
                    <SkillBar key={i} name={s.name} tag={s.tag || s.category?.toUpperCase()} level={s.level} />
                  ))}
                </div>
              ))}
              {grouped['web']?.length > 0 && (
                <div className="skill-group">
                  <div className="skill-cat-title">{catLabels['web']}</div>
                  <div className="tech-tags-wrap">
                    {grouped['web'].map((s, i) => <div key={i} className="tech-tag">{s.name}</div>)}
                  </div>
                </div>
              )}
              <div className="skills-divider" />
              {grouped['soft']?.length > 0 && (
                <div className="skill-group">
                  <div className="skill-cat-title">{catLabels['soft']}</div>
                  <div className="soft-skills-wrap">
                    {grouped['soft'].map((s, i) => <div key={i} className="soft-skill-chip">{s.name}</div>)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}