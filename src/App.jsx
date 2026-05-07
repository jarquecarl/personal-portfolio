import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Background from './components/Background'
import Cursor from './components/Cursor'
import Scanlines from './components/Scanlines'
import CornerDeco from './components/CornerDeco'
import FloatingNav from './components/FloatingNav'
import AriaPanel from './components/AriaPanel'
import AriaSphere from './components/AriaSphere'
import AdminModal from './components/AdminModal'

import Home from './pages/Home'
import About from './pages/About'
import Hub from './pages/Hub'
import Hobbies from './pages/Hobbies'
import Skills from './pages/Skills'
import Projects from './pages/Projects'
import Certifications from './pages/Certifications'
import Contact from './pages/Contact'
import Admin from './pages/Admin'
import Activities from './pages/Activities'
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches

export default function App() {
  return (
    <BrowserRouter>
      <Background />
      {!isTouchDevice && <Cursor />}
      <Scanlines />
      <CornerDeco />
      <FloatingNav />
      <AriaSphere />
      <AriaPanel />
      <AdminModal />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/hub" element={<Hub />} />
        <Route path="/hobbies" element={<Hobbies />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/certifications" element={<Certifications />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/activities" element={<Activities />} />
      </Routes>
    </BrowserRouter>
  )
}
