import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import NavBreadcrumb from '../components/NavBreadcrumb'
import BackBtn from '../components/BackBtn'
import './Hobbies.css'

const hobbies = [
  { name: 'Baking',          icon: '🍞', desc: 'Creating delicious treats and experimenting with flavors.',          height: 200 },
  { name: 'Cosplay',         icon: '🎭', desc: 'Bringing characters to life through costume design.',               height: 220 },
  { name: 'Coffee',          icon: '☕', desc: 'Exploring beans, brewing methods and café cultures.',               height: 210 },
  { name: 'Food Exploring',  icon: '🍜', desc: 'Discovering new cuisines and flavors from around the world.',       height: 200 },
  { name: 'Merch Collecting',icon: '🎁', desc: 'Building a collection of memorabilia from favorite series.',        height: 215 },
]

export default function Hobbies() {
  const [activeFrame, setActiveFrame]   = useState(0)
  const [carouselOpen, setCarouselOpen] = useState(false)
  const [carouselIdx, setCarouselIdx]   = useState(0)
  const [carouselHobby, setCarouselHobby] = useState(null)
  const [hobbyImages, setHobbyImages]   = useState({})   // { Baking: [...urls], ... }

  // ── Fetch images from Firestore on mount ──────────────────────────────────
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'hobbies'))
        const data = {}
        snapshot.forEach(doc => {
          data[doc.id] = doc.data().images || []
        })
        setHobbyImages(data)
      } catch (err) {
        console.error('Failed to fetch hobby images:', err)
      }
    }
    fetchImages()
  }, [])

  const openCarousel = (hobby) => {
    // Merge fetched images into the hobby object before opening
    const enriched = { ...hobby, images: hobbyImages[hobby.name] || [] }
    setCarouselHobby(enriched)
    setCarouselIdx(0)
    setCarouselOpen(true)
  }

  const closeCarousel = () => setCarouselOpen(false)

  const prev = () => {
    if (!carouselHobby?.images?.length) return
    setCarouselIdx(i => (i - 1 + carouselHobby.images.length) % carouselHobby.images.length)
  }
  const next = () => {
    if (!carouselHobby?.images?.length) return
    setCarouselIdx(i => (i + 1) % carouselHobby.images.length)
  }

  return (
    <div className="page hobbies-page">
      <NavBreadcrumb section="Gallery of Possibilities" />
      <BackBtn to="/" />

      <div className="hobbies-content">
        <div className="hobbies-header">
          <div className="section-tag">Interests &amp; Passions</div>
          <h1 className="section-title">Gallery of Possibilities</h1>
          <div className="hobbies-progress">
            <div className="progress-bar"><div className="progress-fill" /></div>
            <span className="progress-text">5 / 5 ALL CLAIMED</span>
            <div className="progress-bar"><div className="progress-fill" /></div>
          </div>
        </div>

        <div className="frames-gallery">
          {hobbies.map((hobby, i) => {
            const hasImages = (hobbyImages[hobby.name]?.length ?? 0) > 0
            return (
              <div
                key={i}
                className={`hobby-frame${activeFrame === i ? ' active' : ''}`}
                onClick={() => { setActiveFrame(i); openCarousel(hobby) }}
              >
                <div className="frame-border" style={{ height: hobby.height }}>
                  <div className="frame-inner">
                    {hasImages ? (
                      // Show first image as frame preview
                      <img
                        src={hobbyImages[hobby.name][0]}
                        alt={hobby.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="frame-placeholder">
                        <span className="frame-icon">{hobby.icon}</span>
                        <span className="frame-placeholder-text">ADD PHOTOS VIA ADMIN</span>
                      </div>
                    )}
                    <div className="frame-overlay">
                      <span className="frame-overlay-text">VIEW GALLERY</span>
                    </div>
                  </div>
                </div>
                <div className="frame-info">
                  <div className="frame-name">{hobby.name}</div>
                  <div className="frame-desc">{hobby.desc}</div>
                  <div className="frame-dot" />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* CAROUSEL OVERLAY */}
      {carouselOpen && carouselHobby && (
        <div className="carousel-overlay" onClick={closeCarousel}>
          <div className="carousel-inner" onClick={e => e.stopPropagation()}>
            <div className="carousel-header">
              <div className="carousel-title">{carouselHobby.name.toUpperCase()}</div>
              <div className="carousel-close" onClick={closeCarousel}>✕ CLOSE GALLERY</div>
            </div>
            <div className="carousel-main">
              {carouselHobby.images?.length ? (
                <>
                  <img src={carouselHobby.images[carouselIdx]} alt={carouselHobby.name} className="carousel-img" />
                  <button className="carousel-nav left" onClick={prev}>‹</button>
                  <button className="carousel-nav right" onClick={next}>›</button>
                  <div className="carousel-counter">{carouselIdx + 1} / {carouselHobby.images.length}</div>
                </>
              ) : (
                <div className="carousel-empty">
                  <span className="carousel-empty-icon">{carouselHobby.icon}</span>
                  <div className="carousel-empty-text">NO PHOTOS YET</div>
                  <div className="carousel-empty-sub">Add photos through the Admin CMS</div>
                </div>
              )}
            </div>
            {carouselHobby.images?.length > 0 && (
              <div className="carousel-thumbs">
                {carouselHobby.images.map((src, i) => (
                  <div key={i} className={`carousel-thumb${i === carouselIdx ? ' active' : ''}`} onClick={() => setCarouselIdx(i)}>
                    <img src={src} alt="" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}