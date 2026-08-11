import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { teamData } from '../../data/team';
import '../App.css';

// SVG SILHOUETTES FOR PLACEHOLDERS OR LOADING FALLBACKS
const RealityPlaceholder = () => (
  <div className="character-silhouette-fallback">
    <svg viewBox="0 0 100 120" className="w-full h-full" fill="none" stroke="currentColor">
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.2"/>
      <path d="M50 24 C41 24 36 30 36 40 C36 50 43 53 50 53 C57 53 64 50 64 40 C64 30 59 24 50 24 Z" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
      <path d="M24 76 C24 63 35 59 50 59 C65 59 76 63 76 76" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
      <circle cx="50" cy="40" r="1" fill="currentColor" opacity="0.3"/>
    </svg>
  </div>
);

const ClassifiedPlaceholder = () => (
  <div className="character-silhouette-fallback">
    <svg viewBox="0 0 100 120" className="w-full h-full" fill="none" stroke="currentColor">
      <rect width="100%" height="100%" fill="#060606" opacity="0.2"/>
      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.2" strokeDasharray="3 3"/>
      <circle cx="50" cy="50" r="26" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      <circle cx="50" cy="50" r="5" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
      <line x1="50" y1="2" x2="50" y2="118" stroke="currentColor" strokeWidth="0.8" opacity="0.15"/>
      <line x1="2" y1="50" x2="98" y2="50" stroke="currentColor" strokeWidth="0.8" opacity="0.15"/>
      <path d="M32 72 Q50 62 68 72 M27 79 Q50 69 73 79" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      <path d="M8 20 L8 8 L20 8" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
      <path d="M92 20 L92 8 L80 8" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
      <path d="M8 80 L8 92 L20 92" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
      <path d="M92 80 L92 92 L80 92" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
    </svg>
  </div>
);

// FAIL-SAFE GRAPHICS LOADER FOR CORRUPTED PATHS
const CharacterImage = ({ src, alt, isClassified }: { src: string, alt: string, isClassified: boolean }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (hasError || !src || src.includes("placeholder") || src.includes("missing")) {
    return isClassified ? <ClassifiedPlaceholder /> : <RealityPlaceholder />;
  }

  return (
    <img
      src={src}
      alt={alt}
      decoding="async"
      fetchPriority="high"
      className="character-graphic"
      onError={() => setHasError(true)}
    />
  );
};

const RosterThumbnail = ({ src, name, isClassified }: { src: string, name: string, isClassified: boolean }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (hasError || !src || src.includes("placeholder") || src.includes("missing")) {
    const initials = name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
    return (
      <div className={`roster-thumb-fallback ${isClassified ? 'classified' : ''}`}>
        <span>{initials || 'A'}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      width={60}
      height={75}
      decoding="async"
      loading="lazy"
      className="roster-thumbnail"
      onError={() => setHasError(true)}
    />
  );
};

interface AgentUIProps {
  onBack: () => void;
}

export default function AgentUI({ onBack }: AgentUIProps) {
  const [mode, setMode] = useState<'reality' | 'classified'>('reality');
  const [activeIndex, setActiveIndex] = useState(0);
  const [decrypting, setDecrypting] = useState(false);
  const [hasSeenTransition, setHasSeenTransition] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [mobileDrawerExpanded, setMobileDrawerExpanded] = useState(false);

  const rosterRef = useRef<HTMLDivElement>(null);
  const currentMember = teamData[activeIndex];

  // KEYBOARD NAVIGATION
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (decrypting) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + teamData.length) % teamData.length);
        setMobileDrawerExpanded(false);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % teamData.length);
        setMobileDrawerExpanded(false);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const nextMode = mode === 'reality' ? 'classified' : 'reality';
        triggerTransition(nextMode);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (mode === 'classified') {
          triggerTransition('reality');
        } else {
          onBack();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [decrypting, mode, hasSeenTransition, onBack]);

  // AUTO SCROLL ACTIVE ROSTER THUMBNAIL TO CENTER
  useEffect(() => {
    if (rosterRef.current) {
      const container = rosterRef.current;
      const activeElement = container.children[activeIndex] as HTMLElement;
      if (activeElement) {
        container.scrollTo({
          left: activeElement.offsetLeft - container.offsetWidth / 2 + activeElement.offsetWidth / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [activeIndex]);

  // PRE-DECODE ADJACENT MEMBER PHOTOS IN BACKGROUND TO PREVENT RENDER LAG
  useEffect(() => {
    const nextIdx = (activeIndex + 1) % teamData.length;
    const prevIdx = (activeIndex - 1 + teamData.length) % teamData.length;

    [teamData[nextIdx], teamData[prevIdx]].forEach(m => {
      const imgPath = mode === 'reality' ? m.realPhoto : m.agentPhoto;
      if (imgPath && !imgPath.includes('missing') && !imgPath.includes('placeholder')) {
        const img = new Image();
        img.decoding = 'async';
        img.src = imgPath;
      }
    });
  }, [activeIndex, mode]);

  // DYNAMIC SYSTEM TOGGLE CINEMATIC
  const triggerTransition = (targetMode: 'reality' | 'classified') => {
    if (decrypting) return;
    setDecrypting(true);
    setTerminalLines([]);

    const lines = targetMode === 'classified' ? [
      "ACCESSING CLASSIFIED DATABASE...",
      "AUTHENTICATING USER...",
      "DECRYPTING ATL ARCHIVES...",
      "IDENTIFYING OPERATIVES...",
      "13 AGENTS DETECTED",
      "DATABASE ACCESS GRANTED"
    ] : [
      "TERMINATING ENCRYPTED UPLINK...",
      "CLEARING CACHED DOSSIERS...",
      "RE-ESTABLISHING FIREWALL...",
      "RESTORING PUBLIC REGISTRY...",
      "PORTAL SECURITY RESTORED"
    ];

    const delay = hasSeenTransition ? 75 : 200;
    let idx = 0;

    const printNext = () => {
      if (idx < lines.length) {
        setTerminalLines(prev => [...prev, lines[idx]]);
        idx++;
        setTimeout(printNext, delay);
      } else {
        setTimeout(() => {
          setMode(targetMode);
          setHasSeenTransition(true);
          setTimeout(() => {
            setDecrypting(false);
          }, 300);
        }, delay * 2);
      }
    };

    printNext();
  };

  const handleRosterWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (rosterRef.current) {
      rosterRef.current.scrollLeft += e.deltaY;
    }
  };

  const currentPhoto = mode === 'reality' ? currentMember.realPhoto : currentMember.agentPhoto;
  const displayName = mode === 'reality' ? currentMember.realName : currentMember.codename;

  return (
    <div className={`app-viewport ${mode}`}>
      {/* Immersive Background Layer */}
      <div className="app-background-layer" />

      {/* Scanline CRT simulation */}
      <div className="viewport-scanlines" />
      <div className="viewport-grid" />

      {/* --- SYSTEM DECRYPT TRANSITION OVERLAY --- */}
      <AnimatePresence>
        {decrypting && (
          <motion.div
            className="transition-lockout-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            style={{ '--accent': mode === 'reality' ? 'var(--classified-accent)' : 'var(--reality-accent)' } as any}
          >
            <div className="transition-crt-grid" />
            <div className="transition-laser-beam" />

            <div className="transition-hud-terminal">
              <div className="terminal-box">
                <div className="terminal-top">
                  <span className="dot r"></span>
                  <span className="dot y"></span>
                  <span className="dot g"></span>
                  <span className="terminal-top-title">ATL_GATEWAY_DECRYPTOR.SH</span>
                </div>
                <div className="terminal-log-content">
                  {terminalLines.map((line, idx) => (
                    <div className="log-line" key={idx}>
                      <span className="log-prompt">&gt;</span>
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.1 }}
                      >
                        {line}
                      </motion.span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BACK TO HUB button */}
      <button className="agent-back-btn" onClick={onBack} aria-label="Return to Hub">
        &lt;- RETURN_TO_HUB
      </button>

      {/* HEADER BAR */}
      <header className="game-header">
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.65rem',
          color: '#666666',
          letterSpacing: '0.1em',
          fontWeight: 700,
          zIndex: 200
        }}>
          [SYSTEM_NODES // {mode === 'reality' ? '13_ACTIVE_UNITS' : '13_AGENTS_DETECTED'}]
        </div>

        {/* Toggle Segmented Switch */}
        <div className="toggle-switch-wrapper">
          <div className="toggle-active-bg" />
          <button
            className={`toggle-button ${mode === 'reality' ? 'active' : ''}`}
            onClick={() => triggerTransition('reality')}
            aria-label="Switch to Reality Mode"
          >
            REALITY
          </button>
          <button
            className={`toggle-button ${mode === 'classified' ? 'active' : ''}`}
            onClick={() => triggerTransition('classified')}
            aria-label="Switch to Classified Mode"
          >
            CLASSIFIED
          </button>
        </div>
      </header>

      {/* MAIN STAGE VIEW */}
      <div className="game-viewport-main">
        {/* Rotating ambient ring & floating code particles in background */}
        <div className="hud-rotating-ring" />
        <div className="ambient-particles">
          <div className="particle p1" />
          <div className="particle p2" />
          <div className="particle p3" />
          <div className="particle p4" />
          <div className="particle p5" />
        </div>

        {/* CENTER CHARACTER ARTWORK (VISUAL FOCUS) */}
        <div className="center-character-region">
          {/* Floating AAA HUD markers around the character */}
          <div className="hud-floating-marker left-top-marker">
            <span className="hud-marker-label">DESIGNATION</span>
            <span className="hud-marker-value">
              {currentMember.isPresident ? "ATL-01" : `ATL-${String(activeIndex + 1).padStart(2, '0')}`}
            </span>
          </div>

          <div className="hud-floating-marker left-bottom-marker">
            <span className="hud-marker-label">TACTICAL CLASS</span>
            <span className="hud-marker-value">
              {mode === 'reality' ? currentMember.position.toUpperCase() : "OPERATIVE"}
            </span>
          </div>

          <div className="hud-floating-marker right-top-marker">
            <span className="hud-marker-label">CLEARANCE STATUS</span>
            <span className="hud-marker-value">
              {mode === 'reality' ? "PUBLIC / VERIFIED" : "LEVEL ATL-7 // SECURE"}
            </span>
          </div>

          <div className="hud-floating-marker right-bottom-marker">
            <span className="hud-marker-label">INTEL PROFILE</span>
            <span className="hud-marker-value text-accent">
              {mode === 'reality' ? "SYS_VERIFIED" : "COGNITIVE_ACTIVE"}
            </span>
          </div>

          <div className="character-artwork-wrapper">
            <div className="hologram-hud-overlay">
              <div className="hologram-scan-line" />
              <div className="hologram-reticle" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeIndex}-${mode}`}
                className="w-full h-full flex justify-center items-center relative"
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.96 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <CharacterImage
                  src={currentPhoto}
                  alt={displayName}
                  isClassified={mode === 'classified'}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* LEFT INFORMATION PANEL (NARRATIVE BIOGRAPHY & SYSTEM SKILLS / OPERATIONAL PROFILE) */}
        <aside className="left-info-panel-region">
          {/* HUD corner borders */}
          <div className="hud-glow-corner top-left"></div>
          <div className="hud-glow-corner top-right"></div>
          <div className="hud-glow-corner bottom-left"></div>
          <div className="hud-glow-corner bottom-right"></div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeIndex}-${mode}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="info-body-scroll"
            >
              <div className="info-header">
                <span className="character-title-role">
                  {mode === 'reality' ? '// ARCHIVE INTEGRITY RAW' : '// CLASSIFIED AI PROFILE'}
                </span>
                <h2 className="character-main-name" style={{ fontSize: '1.8rem' }}>
                  {mode === 'reality' ? 'Dossier Log' : 'System Intel'}
                </h2>
              </div>

              {mode === 'reality' ? (
                <>
                  <div className="info-section">
                    <span className="section-title">// Biography</span>
                    <p className="section-text">{currentMember.bio}</p>
                  </div>

                  <div className="info-section">
                    <span className="section-title">// Core Skills</span>
                    <div className="skills-container">
                      {currentMember.skills.map((skill, index) => (
                        <span className="skill-tag" key={index}>{skill}</span>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="info-section">
                    <span className="section-title">// System Introduction</span>
                    <p className="section-text" style={{ fontStyle: 'italic', borderLeft: '2px solid var(--accent)', paddingLeft: '10px' }}>
                      "{currentMember.dossier}"
                    </p>
                  </div>

                  {currentMember.operationalProfile && currentMember.operationalProfile.length > 0 && (
                    <div className="info-section">
                      <span className="section-title">// Operational Profile</span>
                      <ul className="bullets-list">
                        {currentMember.operationalProfile.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentMember.secondaryCapabilities && currentMember.secondaryCapabilities.length > 0 && (
                    <div className="info-section">
                      <span className="section-title">// Secondary Capabilities</span>
                      <div className="skills-container">
                        {currentMember.secondaryCapabilities.map((cap, index) => (
                          <span className="skill-tag" key={index}>{cap}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </aside>

        {/* RIGHT INFORMATION PANEL (DESKTOP TACTICAL HUD FIELDS) */}
        <aside className="right-info-panel-region">
          {/* HUD corner borders */}
          <div className="hud-glow-corner top-left"></div>
          <div className="hud-glow-corner top-right"></div>
          <div className="hud-glow-corner bottom-left"></div>
          <div className="hud-glow-corner bottom-right"></div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeIndex}-${mode}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="info-body-scroll"
            >
              <div className="info-header">
                <span className="character-title-role">
                  {mode === 'reality' ? currentMember.position : currentMember.designation}
                </span>
                <h2 className="character-main-name">
                  {displayName}
                </h2>

                {/* Add Warning labels for Classified mode */}
                {mode === 'classified' && (
                  <div className="info-badge-row">
                    <span className={`threat-badge ${
                      currentMember.threatAssessment.toLowerCase().includes('critical')
                        ? 'threat-critical'
                        : 'threat-pending'
                    }`}>
                      THREAT: {currentMember.threatAssessment.toUpperCase()}
                    </span>

                    {currentMember.badge !== 'ACTIVE' && (
                      <span className="threat-badge threat-critical">
                        {currentMember.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {mode === 'reality' ? (
                <>
                  <div className="info-section grid-section-hud">
                    <div className="hud-data-item">
                      <span className="hud-data-label">Role / Position</span>
                      <span className="hud-data-value">{currentMember.position}</span>
                    </div>
                    <div className="hud-data-item">
                      <span className="hud-data-label">Clearance Level</span>
                      <span className="hud-data-value text-accent">PUBLIC / UNRESTRICTED</span>
                    </div>
                  </div>

                  <div className="info-section">
                    <span className="section-title">// Certified Key Achievements</span>
                    <ul className="bullets-list">
                      {currentMember.achievements.map((ach, index) => (
                        <li key={index}>{ach}</li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <div className="info-section grid-section-hud">
                    <div className="hud-data-item" style={{ gridColumn: 'span 2' }}>
                      <span className="hud-data-label">Primary Specialization</span>
                      <span className="hud-data-value text-accent" style={{ fontSize: '0.75rem', lineHeight: '1.3' }}>
                        {currentMember.specialization}
                      </span>
                    </div>
                  </div>

                  {currentMember.systemStats && currentMember.systemStats.length > 0 && (
                    <div className="info-section">
                      <span className="section-title">// System Attributes</span>
                      <div className="grid-section-hud">
                        {currentMember.systemStats.map((stat, index) => (
                          <div className="hud-data-item" key={index}>
                            <span className="hud-data-label">{stat.label}</span>
                            <span className="hud-data-value text-accent">{stat.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="info-section">
                    <span className="section-title">// Fictional Operational Record</span>
                    <ul className="bullets-list">
                      {currentMember.operations.map((op, index) => (
                        <li key={index}>{op}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </aside>

        {/* MOBILE SYSTEM DRAWER FOR PROFILE DOSSIER */}
        <div className={`mobile-dossier-drawer ${mobileDrawerExpanded ? 'expanded' : ''}`}>
          <div
            className="drawer-handle-tab"
            onClick={() => setMobileDrawerExpanded(!mobileDrawerExpanded)}
          >
            <span>{mobileDrawerExpanded ? 'HIDE RECORDS' : 'VIEW DOSSIER / STATS'}</span>
            {mobileDrawerExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </div>

          <div className="drawer-body-content">
            <div className="info-header">
              <span className="character-title-role">
                {mode === 'reality' ? currentMember.position : currentMember.designation}
              </span>
              <h2 className="character-main-name" style={{ fontSize: '1.8rem' }}>
                {displayName}
              </h2>
              {mode === 'classified' && (
                <div className="info-badge-row">
                  <span className={`threat-badge ${
                    currentMember.threatAssessment.toLowerCase().includes('critical')
                      ? 'threat-critical'
                      : 'threat-pending'
                  }`}>
                    THREAT: {currentMember.threatAssessment.toUpperCase()}
                  </span>
                  {currentMember.badge !== 'ACTIVE' && (
                    <span className="threat-badge threat-critical">
                      {currentMember.badge}
                    </span>
                  )}
                </div>
              )}
            </div>

            {mode === 'reality' ? (
              <>
                <div className="info-section">
                  <span className="section-title">Biography</span>
                  <p className="section-text">{currentMember.bio}</p>
                </div>
                <div className="info-section">
                  <span className="section-title">Core Skills</span>
                  <div className="skills-container">
                    {currentMember.skills.map((skill, index) => (
                      <span className="skill-tag" key={index}>{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="info-section">
                  <span className="section-title">Key Achievements</span>
                  <ul className="bullets-list">
                    {currentMember.achievements.map((ach, index) => (
                      <li key={index}>{ach}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <>
                <div className="info-section">
                  <span className="section-title">System Introduction</span>
                  <p className="section-text">"{currentMember.dossier}"</p>
                </div>
                <div className="info-section">
                  <span className="section-title">Primary Specialization</span>
                  <p className="section-text" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>
                    {currentMember.specialization}
                  </p>
                </div>
                {currentMember.systemStats && currentMember.systemStats.length > 0 && (
                  <div className="info-section">
                    <span className="section-title">System Attributes</span>
                    <div className="grid-section-hud">
                      {currentMember.systemStats.map((stat, index) => (
                        <div className="hud-data-item" key={index}>
                          <span className="hud-data-label">{stat.label}</span>
                          <span className="hud-data-value text-accent">{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {currentMember.operationalProfile && currentMember.operationalProfile.length > 0 && (
                  <div className="info-section">
                    <span className="section-title">Operational Profile</span>
                    <ul className="bullets-list">
                      {currentMember.operationalProfile.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {currentMember.secondaryCapabilities && currentMember.secondaryCapabilities.length > 0 && (
                  <div className="info-section">
                    <span className="section-title">Secondary Capabilities</span>
                    <div className="skills-container">
                      {currentMember.secondaryCapabilities.map((cap, index) => (
                        <span className="skill-tag" key={index}>{cap}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="info-section">
                  <span className="section-title">Fictional Operational Record</span>
                  <ul className="bullets-list">
                    {currentMember.operations.map((op, index) => (
                      <li key={index}>{op}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM FIXED ROSTER PANEL */}
      <footer className="bottom-roster-region">
        <div
          className="roster-container"
          ref={rosterRef}
          onWheel={handleRosterWheel}
          role="listbox"
          aria-label="Character Selection Grid"
        >
          {teamData.map((member, index) => {
            const isActive = index === activeIndex;
            const mPhoto = mode === 'reality' ? member.realPhoto : member.agentPhoto;
            const mName = mode === 'reality' ? member.realName : member.codename;

            return (
              <div
                key={member.id}
                className={`roster-card ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveIndex(index);
                  setMobileDrawerExpanded(false);
                }}
                role="option"
                aria-selected={isActive}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setActiveIndex(index);
                  }
                }}
              >
                <span className="roster-card-index">{String(index + 1).padStart(2, '0')}</span>

                <div className="roster-thumb-wrapper">
                  <RosterThumbnail
                    src={mPhoto}
                    name={mName}
                    isClassified={mode === 'classified'}
                  />
                </div>

                {/* Active highlighted badge text */}
                {isActive && (
                  <div className="roster-card-badge">
                    {mode === 'reality' ? 'SELECT' : 'ACTIVE'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </footer>
    </div>
  );
}
