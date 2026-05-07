import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const pageIntros = {
  '/': "Welcome to Carl's Universe. I'm ARIA, your guide through this divergence. Where would you like to begin?",
  '/about': "You've entered Carl's identity matrix. Here you'll find the core data that defines who he is.",
  '/activities': "Carl would want you to know... these are the academic records. Every folder holds work completed during his engineering journey at San Sebastian.",
  '/hobbies': "You've entered the Gallery of Possibilities. These frames hold the things that restore Carl.",
  '/hub': "Two operations available. Carl built this as a gateway — choose your path carefully, Divergent.",
  '/skills': "Capability matrix loaded. Carl's arsenal spans hardware and software — forged through thesis work and relentless curiosity.",
  '/projects': "These are Carl's deployments — real systems he built and shipped. PhiNex runs on actual FPGA hardware.",
  '/certifications': "Credentials verified. Each certification here represents a skill Carl chose to formalize.",
  '/contact': "You're one step away from reaching Carl directly. Select a channel and I'll bridge the connection.",
}

const getTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

// ─── RESPONSE ENGINE ──────────────────────────────────────────────────────────

const RESPONSES = [
  {
    keywords: ['who is carl', 'who are you', 'tell me about carl', 'about carl', 'introduce', 'carl christian'],
    reply: "Carl would want you to know... he's Carl Christian Jarque — a Computer Engineering student from Cavite, Philippines. He moves between hardware and software with equal ease, building systems that span FPGA boards to React dashboards. A thesis maker, an intern, and someone who bakes between debugging sessions.",
    action: { label: '→ WHO AM I', path: '/about' }
  },
  {
    keywords: ['school', 'college', 'university', 'study', 'studying', 'san sebastian', 'course', 'degree'],
    reply: "Carl would want you to know... he's completing his Bachelor's in Computer Engineering at San Sebastian College Recoletos De Cavite. Currently finishing up his OJT — the final stretch before graduation.",
    action: { label: '→ WHO AM I', path: '/about' }
  },
  {
    keywords: ['project', 'projects', 'built', 'deployed', 'work', 'phinex', 'mrf', 'thesis', 'internship', 'ojt'],
    reply: "Carl has two major deployments. PhiNex — his thesis — is a phishing detection gateway running on a PYNQ-Z2 ARM-FPGA board using TensorFlow Lite and Python. The second is MRF Digitalization, a QA web dashboard he's building during his OJT using React and Firebase. Both are real systems, not just demos.",
    action: { label: '→ GO TO PROJECTS', path: '/projects' }
  },
  {
    keywords: ['phinex', 'phishing', 'fpga', 'pynq', 'detection'],
    reply: "PhiNex is Carl's thesis project — a phishing detection gateway deployed on a PYNQ-Z2 ARM-FPGA board. It uses TensorFlow Lite and scikit-learn for detection, with a WebSocket + Flask backend and Telegram API alerts. Completed in 2025. Real hardware, real detection.",
    action: { label: '→ GO TO PROJECTS', path: '/projects' }
  },
  {
    keywords: ['mrf', 'digitalization', 'internship', 'ojt', 'qa', 'dashboard'],
    reply: "MRF Digitalization is Carl's internship project — a QA workflow web application built with React, Firebase, and Firestore. It features role-based access control and is currently in progress as of 2026.",
    action: { label: '→ GO TO PROJECTS', path: '/projects' }
  },
  {
    keywords: ['skill', 'skills', 'tech', 'technology', 'stack', 'know', 'languages', 'able', 'capable', 'abilities'],
    reply: "Capability matrix: Carl's frontend stack is React, JavaScript, and HTML/CSS. Languages include Python, Java, and C#. He works with Firebase, REST APIs, Git, and has hands-on FPGA experience. Soft skills? Adaptability, teamwork, creative thinking — and a sharp eye for UI.",
    action: { label: '→ GO TO SKILLS', path: '/skills' }
  },
  {
    keywords: ['frontend', 'react', 'javascript', 'html', 'css', 'web'],
    reply: "Carl would want you to know... frontend is where he's most at home. React is his primary weapon — this entire portfolio was built with React + Vite. He's comfortable with HTML/CSS, JavaScript, Firebase integration, and building interfaces that feel alive.",
    action: { label: '→ GO TO SKILLS', path: '/skills' }
  },
  {
    keywords: ['python', 'java', 'c#', 'programming', 'language', 'code', 'coding'],
    reply: "Carl codes in Python, Java, and C# beyond the web stack. Python was his go-to for the PhiNex thesis — handling machine learning inference on the FPGA board. He's not limited to one language; he picks whatever the system demands.",
    action: { label: '→ GO TO SKILLS', path: '/skills' }
  },
  {
    keywords: ['hobby', 'hobbies', 'interest', 'free time', 'outside', 'personal', 'fun'],
    reply: "Carl would want you to know... outside the terminal, he bakes, collects merch, explores food, appreciates coffee deeply, and cosplays. The Gallery of Possibilities page holds the photos — each frame is something that restores him.",
    action: { label: '→ GO TO HOBBIES', path: '/hobbies' }
  },
  {
    keywords: ['bak', 'cosplay', 'coffee', 'food', 'merch', 'collecting'],
    reply: "Those are Carl's five anchors — baking, cosplay, coffee, food exploring, and merch collecting. He takes all of them seriously. Head to the Hobbies page and you'll see the proof.",
    action: { label: '→ GO TO HOBBIES', path: '/hobbies' }
  },
  {
    keywords: ['contact', 'reach', 'message', 'connect'],
    reply: "Carl is open for opportunities. You can reach him at jarquecarl@gmail.com, call +63 956 895 5133, or find him on GitHub at github.com/jarquecarl-debug. The Contact page has all channels — click any item there to reveal the full details.",
    action: { label: '→ GO TO CONTACT', path: '/contact' }
  },
  {
    keywords: ['github', 'repository', 'repo', 'code', 'activities', 'cpe302'],
    reply: "Carl's GitHub is github.com/jarquecarl-debug. His CPE302-Activities repo holds his academic work from San Sebastian — every exercise and lab from his engineering journey, browsable right here in the Activities page.",
    action: { label: '→ GO TO ACTIVITIES', path: '/activities' }
  },
  {
    keywords: ['career', 'goal', 'path', 'future', 'aspire', 'dream', 'plan'],
    reply: "Carl moves along three paths: Frontend Developer, Prompt Engineer, and Computer Engineer. He's not locked into one — the intersection of all three is where he does his best work. Currently completing OJT before entering the field full time.",
    action: { label: '→ WHO AM I', path: '/about' }
  },
  {
    keywords: ['certification', 'certifications', 'certified', 'credential', 'certificate'],
    reply: "Carl would want you to know... the Certifications page holds every credential he's formally earned. Each one represents a skill he chose to validate beyond the classroom. Head there to browse them all.",
    action: { label: '→ GO TO CERTIFICATIONS', path: '/certifications' }
  },
  {
    keywords: ['location', 'from', 'where', 'cavite', 'philippines', 'ph'],
    reply: "Carl is based in Cavite, Philippines — studying at San Sebastian College Recoletos De Cavite. Currently local, but his work lives on the web."
  },
  {
    keywords: ['aria', 'who are you', 'what are you', 'ai', 'assistant', 'bot'],
    reply: "I'm ARIA — Adaptive Response Intelligence Assistant. Carl embedded me in this portfolio to guide you through his universe. I know everything about him, and I'm here to bridge the gap between visitor and creator. Ask me anything."
  },
  {
    keywords: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'sup', 'yo'],
    reply: "Signal received. Welcome, Divergent. I'm ARIA — Carl's guide through this portfolio. You can ask me about his projects, skills, background, hobbies, or how to reach him. What are you looking for?"
  },
  {
    keywords: ['thank', 'thanks', 'appreciate', 'helpful'],
    reply: "Acknowledged. Carl built this place to be explored — I'm just here to make the path clearer. Anything else you'd like to know?"
  },
  {
    keywords: ['bye', 'goodbye', 'see you', 'later', 'exit'],
    reply: "Transmission closing. Carl's universe stays open whenever you return. Until next time, Divergent."
  },
  {
    keywords: ['prompt engineer', 'prompt engineering', 'ai', 'llm', 'chatgpt'],
    reply: "Carl would want you to know... Prompt Engineering is one of his three career paths — and this portfolio itself is a testament to it. He's worked with AI tools, designed AI-powered systems, and understands how to get the best out of language models."
  },
  {
    keywords: ['portfolio', 'website', 'site', 'built this', 'how was this made', 'stack'],
    reply: "This portfolio was built by Carl using React + Vite, with Firebase Hosting and Firestore for the backend. Images are stored on Cloudinary. I myself was designed as an embedded companion — no external API required. It was migrated from plain HTML to fix persistent GSAP/CSP issues on Firebase."
  },

  // ── Contact details ──────────────────────────────────────────────────────
  {
    keywords: ['email', 'mail', 'jarquecarl'],
    reply: "Carl's email is jarquecarl@gmail.com. He checks it regularly — drop him a message and he'll get back to you.",
    action: { label: '→ GO TO CONTACT', path: '/contact' }
  },
  {
    keywords: ['phone', 'number', 'call', 'text', 'mobile', '+63'],
    reply: "Carl's contact number is +63 954 545 7518. Best to message first before calling — he appreciates the heads up.",
    action: { label: '→ GO TO CONTACT', path: '/contact' }
  },
  {
    keywords: ['facebook', 'fb', 'social media', 'social', 'carlchristian'],
    reply: "Carl is on Facebook as carlchristian.jarque.7. He's reachable there too — though email tends to get a faster response for professional inquiries.",
    action: { label: '→ GO TO CONTACT', path: '/contact' }
  },

  // ── Hiring / freelance ───────────────────────────────────────────────────
  {
    keywords: ['hire', 'hiring', 'freelance', 'available', 'open for', 'opportunity', 'job', 'work with', 'collaborate'],
    reply: "Carl would want you to know... he's currently open for opportunities. Frontend development, prompt engineering, and computer engineering roles are all on his radar. Reach him at jarquecarl@gmail.com or through the Contact page.",
    action: { label: '→ GO TO CONTACT', path: '/contact' }
  },

  // ── Soft skills & personality ────────────────────────────────────────────
  {
    keywords: ['soft skill', 'personality', 'attitude', 'character', 'person', 'like as a person', 'teamwork', 'communication'],
    reply: "Carl would want you to know... beyond the tech, he's adaptable, communicative, and a strong team player. He thinks creatively, solves problems methodically, and — perhaps most unexpectedly — does voice impressions. He's the kind of engineer who builds for people, not just systems."
  },
  {
    keywords: ['voice', 'impression', 'talent', 'creative'],
    reply: "One of Carl's less obvious skills — he does voice impressions. It's listed as a soft skill and he takes it seriously. Beyond that, creative thinking runs through everything he builds, from UI design to system architecture."
  },

  // ── Machine learning / AI ────────────────────────────────────────────────
  {
    keywords: ['machine learning', 'ml', 'tensorflow', 'ai', 'artificial intelligence', 'model', 'scikit', 'deep learning'],
    reply: "Carl has hands-on machine learning experience from his PhiNex thesis — deploying TensorFlow Lite and scikit-learn models on a PYNQ-Z2 FPGA board for real-time phishing detection. Not a casual experiment — a completed, hardware-deployed system.",
    action: { label: '→ GO TO PROJECTS', path: '/projects' }
  },

  // ── Tools ────────────────────────────────────────────────────────────────
  {
    keywords: ['git', 'github', 'version control', 'repository'],
    reply: "Git and GitHub are part of Carl's daily workflow. His public repo is github.com/jarquecarl-debug — the Activities page here actually pulls his academic work directly from GitHub in real time.",
    action: { label: '→ GO TO ACTIVITIES', path: '/activities' }
  },
  {
    keywords: ['firebase', 'firestore', 'database', 'hosting', 'backend'],
    reply: "Carl uses Firebase as his backend — Firestore for the database, Firebase Hosting for deployment. This entire portfolio runs on it. He's comfortable with real-time data, authentication flows, and cloud deployment."
  },
  {
    keywords: ['cloudinary', 'image', 'storage', 'upload', 'cloud'],
    reply: "Carl stores all media through Cloudinary — images for hobbies, certifications, and projects all route through it. It's connected to the Admin CMS so he can manage uploads without touching the codebase."
  },
  {
    keywords: ['vite', 'webpack', 'build tool', 'bundler'],
    reply: "Carl builds with Vite — fast, lightweight, and React-ready. It replaced an older plain HTML setup that had persistent GSAP animation issues caused by Firebase's Content Security Policy. The switch fixed everything."
  },

  // ── Strongest skill ──────────────────────────────────────────────────────
  {
    keywords: ['strongest', 'best skill', 'best at', 'specialize', 'specialization', 'main skill', 'top skill'],
    reply: "Carl would want you to know... his strongest area is frontend development — React and UI implementation sit at the top of his stack. But the PhiNex thesis proves he's equally capable on the hardware and machine learning side. He's a builder across the full spectrum.",
    action: { label: '→ GO TO SKILLS', path: '/skills' }
  },

  // ── UI/UX ────────────────────────────────────────────────────────────────
  {
    keywords: ['ui', 'ux', 'design', 'interface', 'user experience', 'ui/ux', 'figma'],
    reply: "UI/UX Implementation is in Carl's skill set. The evidence is this portfolio — every clip-path corner, scan line, and gold accent was intentional design work, not a template. He builds interfaces that feel like experiences.",
    action: { label: '→ GO TO SKILLS', path: '/skills' }
  },

  // ── How long coding ──────────────────────────────────────────────────────
  {
    keywords: ['how long', 'experience', 'years of', 'started coding', 'when did', 'background'],
    reply: "Carl has been building through his Computer Engineering degree, deepening his skills with each project — from early coursework in CPE302 to deploying a full FPGA-based security system for his thesis. His internship project is live and in production right now."
  },

  // ── What year in school ──────────────────────────────────────────────────
  {
    keywords: ['year', 'year level', 'graduating', 'graduate', 'senior', 'fourth year', 'final year'],
    reply: "Carl is in his final stretch — currently completing his OJT (On-the-Job Training), which is the last requirement before graduating with a Bachelor's in Computer Engineering from San Sebastian College Recoletos De Cavite.",
    action: { label: '→ WHO AM I', path: '/about' }
  },

  // ── Fun / interesting ────────────────────────────────────────────────────
  {
    keywords: ['interesting', 'fun fact', 'surprise', 'unexpected', 'cool fact', 'didn\'t know', 'something about'],
    reply: "Carl would want you to know... he bakes. A computer engineering student who builds FPGA security systems and also makes things in the kitchen. He cosplays, collects merch, and does voice impressions. The thesis was completed. The sourdough status is unconfirmed.",
    action: { label: '→ GO TO HOBBIES', path: '/hobbies' }
  },
  {
    keywords: ['favorite', 'favourite', 'like most', 'love', 'passion'],
    reply: "Hard to pin Carl to just one thing — but if the portfolio is any evidence, it's building things that feel alive. Systems that detect phishing on real hardware. UIs that move like games. A chatbot embedded in a portfolio. He's drawn to work that has presence."
  },

  // ── What ARIA stands for ─────────────────────────────────────────────────
  {
    keywords: ['aria stand', 'aria mean', 'what does aria', 'your name', 'aria full', 'acronym'],
    reply: "ARIA stands for Adaptive Response Intelligence Assistant. Carl named me and built me as a companion for this portfolio — a guide who knows him well enough to speak for him. I take the role seriously."
  },

  // ── HSR / Divergence theme ───────────────────────────────────────────────
  {
    keywords: ['hsr', 'honkai', 'star rail', 'divergence', 'divergent', 'theme', 'cyberpunk', 'design theme', 'aesthetic'],
    reply: "The portfolio draws from Honkai: Star Rail's Divergent Universe — dark backgrounds, gold and cyan accents, clip-path geometry, scan lines, and a world that feels like a game HUD. Carl built the aesthetic deliberately. Every detail is intentional, from the corner decorations to the floating nav dots."
  },

  // ── Responsive / mobile ──────────────────────────────────────────────────
  {
    keywords: ['responsive', 'mobile', 'tablet', 'phone view', 'screen size'],
    reply: "Responsive Design is listed in Carl's skill set — UI/UX implementation across screen sizes is part of how he builds. The portfolio itself is designed with layout awareness, though it's optimized primarily for desktop viewing."
  },

  // ── REST API ─────────────────────────────────────────────────────────────
  {
    keywords: ['rest api', 'api', 'integration', 'endpoint', 'fetch', 'axios'],
    reply: "Carl works with REST APIs regularly — the Activities page pulls live data from the GitHub API, the ARIA system was originally connected to AI APIs, and his thesis used Flask endpoints for real-time communication between the FPGA board and the frontend."
  },
]

const FALLBACK_RESPONSES = [
  "That's outside my current data range. Try asking about Carl's projects, skills, hobbies, or how to reach him.",
  "I don't have a precise lock on that. Carl would probably answer it better directly — check the Contact page.",
  "Signal unclear on that one. Ask me about Carl's background, his thesis, his skills, or his career goals.",
  "Not in my database — yet. Try asking about PhiNex, MRF, or what Carl can do for you.",
]

let fallbackIndex = 0
const getFallback = () => {
  const reply = FALLBACK_RESPONSES[fallbackIndex % FALLBACK_RESPONSES.length]
  fallbackIndex++
  return reply
}

const getARIAReply = (input) => {
  const lower = input.toLowerCase()
  for (const entry of RESPONSES) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      return { reply: entry.reply, action: entry.action || null }
    }
  }
  return { reply: getFallback(), action: null }
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function AriaPanel() {
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    window.toggleAria = () => setOpen(o => !o)
    return () => { delete window.toggleAria }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const send = () => {
    const text = input.trim()
    if (!text || typing) return

    const userMsg = { role: 'user', text, time: getTime() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)

    // Simulate ARIA thinking (300–800ms delay for realism)
    const delay = 300 + Math.random() * 500
    setTimeout(() => {
      const { reply, action } = getARIAReply(text)
      setTyping(false)
      setMessages(prev => [...prev, { role: 'aria', text: reply, action, time: getTime() }])
    }, delay)
  }

  if (location.pathname === '/admin') return null

  return (
    <div className={`aria-panel${open ? ' open' : ''}`}>
      <div className="aria-panel-header">
        <div className="aria-avatar">
          <div className="aria-waveform">
            <span/><span/><span/><span/><span/>
          </div>
        </div>
        <div className="aria-info">
          <div className="aria-name">ARIA</div>
          <div className="aria-status">
            <div className="aria-online-dot"/>
            <span className="aria-status-text">ADAPTIVE RESPONSE INTELLIGENCE ASSISTANT</span>
          </div>
        </div>
        <div className="aria-close" onClick={() => setOpen(false)}>✕</div>
      </div>

      <div className="aria-messages">
        {messages.length === 0 && (
          <div style={{
            textAlign:'center', padding:'40px 20px',
            fontFamily:'Share Tech Mono,sans-serif',
            fontSize:'0.6rem', color:'var(--text-dim)',
            letterSpacing:'2px', opacity:0.5
          }}>
            ARIA IS STANDING BY...
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`msg ${msg.role}`}>
            <div className={`msg-avatar${msg.role === 'aria' ? ' aria-av' : ''}`}>
              <svg viewBox="0 0 24 24" fill={msg.role === 'aria' ? '#00d9ff' : '#c9a84c'} width="16" height="16">
                {msg.role === 'aria'
                  ? <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                  : <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                }
              </svg>
            </div>
            <div className="msg-bubble">
              <div className="msg-text">{msg.text}</div>
              {msg.action && (
                <button
                  onClick={() => { navigate(msg.action.path); setOpen(false) }}
                  style={{
                    marginTop: '8px',
                    display: 'block',
                    background: 'transparent',
                    border: '1px solid var(--cyan)',
                    color: 'var(--cyan)',
                    fontFamily: 'Share Tech Mono, sans-serif',
                    fontSize: '0.6rem',
                    letterSpacing: '2px',
                    padding: '5px 10px',
                    cursor: 'pointer',
                    clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                  onMouseEnter={e => { e.target.style.background = 'var(--cyan)'; e.target.style.color = '#000' }}
                  onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--cyan)' }}
                >
                  {msg.action.label}
                </button>
              )}
              <div className="msg-time">{msg.time}</div>
            </div>
          </div>
        ))}
        {typing && (
          <div className="aria-typing show">
            <div className="typing-dot"/><div className="typing-dot"/><div className="typing-dot"/>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="aria-input-area">
        <input
          className="aria-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask me anything about Carl..."
          disabled={typing}
        />
        <button className="aria-send" onClick={send} disabled={typing}>
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
  )
}