import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectsRegistry from './ProjectsRegistry';
import EventsTimeline from './EventsTimeline';
import DivisionalMatrix from './DivisionalMatrix';

type NavTab = 'overview' | 'projects' | 'events';

interface HubProps {
  onNavigate: (view: 'agents') => void;
}

export default function Hub({ onNavigate }: HubProps) {
  const [showMatrix, setShowMatrix] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>('overview');

  const heroRef    = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLElement>(null);
  const eventsRef   = useRef<HTMLElement>(null);

  const scrollToTab = (tab: NavTab) => {
    setActiveTab(tab);
    const map: Record<NavTab, React.RefObject<HTMLElement | HTMLDivElement | null>> = {
      overview: heroRef,
      projects: projectsRef,
      events:   eventsRef,
    };
    map[tab].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Update active tab on scroll
  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY + 100;
      if (eventsRef.current && scrollY >= eventsRef.current.offsetTop) {
        setActiveTab('events');
      } else if (projectsRef.current && scrollY >= projectsRef.current.offsetTop) {
        setActiveTab('projects');
      } else {
        setActiveTab('overview');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.div
      className="hub-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── STICKY HEADER ── */}
      <header className="hub-header">
        <div className="hub-header-inner">
          {/* Logo */}
          <div className="hub-logo-block">
            <div className="hub-logo-icon">
              <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
                <polygon
                  points="16,2 29,9 29,23 16,30 3,23 3,9"
                  stroke="#2563eb"
                  strokeWidth="1.5"
                  fill="none"
                />
                <circle cx="16" cy="16" r="4" fill="#2563eb" />
              </svg>
            </div>
            <div>
              <div className="hub-logo-name">tinkEthix</div>
              <div className="hub-logo-sub">
                Advanced Robotics &amp; Engineering Research Collective
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="hub-nav" aria-label="Main navigation">
            {(['overview', 'projects', 'events'] as NavTab[]).map(tab => (
              <button
                key={tab}
                className={`hub-nav-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => scrollToTab(tab)}
                aria-current={activeTab === tab ? 'page' : undefined}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="hub-header-actions">
            <button
              className="hub-btn hub-btn-ghost"
              onClick={() => setShowMatrix(true)}
              id="btn-departments"
              aria-label="Explore Structural Departments"
            >
              Departments
            </button>
            <button
              className="hub-btn hub-btn-primary"
              onClick={() => onNavigate('agents')}
              id="btn-personnel"
              aria-label="Review Personnel Dossiers"
            >
              Meet the Team
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="hub-main">

        {/* ── HERO ── */}
        <div ref={heroRef}>
          <section className="hub-hero" aria-labelledby="hero-title">
            <div className="hub-hero-eyebrow">
              <div className="hub-hero-dot" aria-hidden="true" />
              Seth Anandram Jaipuria School · ATL Lab
            </div>

            <h1 id="hero-title" className="hub-hero-title">
              Where Brilliant Minds Build the{' '}
              <span>Future of Robotics</span>
            </h1>

            <p className="hub-hero-body">
              tinkEthix is an elite research collective of young engineers and scientists
              pushing the frontiers of autonomous systems, machine intelligence, and
              embedded robotics at the secondary school level.
            </p>

            {/* Stats */}
            <div className="hub-stats" role="list" aria-label="Key statistics">
              {[
                { num: '6',   label: 'Active Research Projects' },
                { num: '13',  label: 'Team Members' },
                { num: '5+',  label: 'Competition Wins' },
                { num: '6',   label: 'Specialized Divisions' },
              ].map(s => (
                <div key={s.label} className="hub-stat" role="listitem">
                  <div className="hub-stat-num">{s.num}</div>
                  <div className="hub-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── PROJECTS ── */}
        <section
          ref={projectsRef}
          className="hub-section"
          id="projects"
          aria-labelledby="projects-heading"
        >
          <ProjectsRegistry />
        </section>

        {/* ── EVENTS ── */}
        <section
          ref={eventsRef}
          className="hub-section"
          id="events"
          aria-labelledby="events-heading"
        >
          <EventsTimeline />
        </section>

        {/* ── GATEWAY CTA ── */}
        <section className="hub-gateway-section" aria-labelledby="gateway-heading">
          <div className="hub-gateway-eyebrow">Portal Access</div>
          <h2 id="gateway-heading" className="hub-gateway-title">
            Explore the tinkEthix Network
          </h2>
          <p className="hub-gateway-sub">
            Access detailed personnel profiles or navigate the full
            structural breakdown of our research divisions.
          </p>

          <div className="hub-gateway-cards">
            {/* PRIMARY — Personnel */}
            <button
              className="hub-gateway-card hub-gateway-card-primary"
              onClick={() => onNavigate('agents')}
              id="gateway-personnel"
              aria-label="Review Personnel and Dossiers"
            >
              <div className="hub-gateway-card-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </div>
              <div className="hub-gateway-card-title">Review Personnel &amp; Dossiers</div>
              <div className="hub-gateway-card-desc">
                Browse detailed profiles of all 13 team members — their roles,
                achievements, and technical specializations.
              </div>
              <div className="hub-gateway-card-arrow">
                View profiles
                <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <line x1="4" y1="10" x2="16" y2="10" />
                  <polyline points="11 5 16 10 11 15" />
                </svg>
              </div>
            </button>

            {/* SECONDARY — Departments */}
            <button
              className="hub-gateway-card"
              onClick={() => setShowMatrix(true)}
              id="gateway-departments"
              aria-label="Explore Structural Departments"
            >
              <div className="hub-gateway-card-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#2563eb" strokeWidth="1.8">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </div>
              <div className="hub-gateway-card-title">Explore Structural Departments</div>
              <div className="hub-gateway-card-desc">
                Discover our six specialized divisions — from Kinetics &amp; Locomotion
                to Machine Intelligence and Embedded Systems.
              </div>
              <div className="hub-gateway-card-arrow">
                View divisions
                <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="#2563eb" strokeWidth="1.8">
                  <line x1="4" y1="10" x2="16" y2="10" />
                  <polyline points="11 5 16 10 11 15" />
                </svg>
              </div>
            </button>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="hub-footer">
        <div className="hub-footer-inner">
          <div className="hub-footer-brand">tinkEthix</div>
          <div className="hub-footer-info">
            Seth Anandram Jaipuria School, Ghaziabad · Atal Tinkering Lab
          </div>
          <div className="hub-footer-status">
            <div className="hub-footer-status-dot" aria-hidden="true" />
            Research Portal Active
          </div>
        </div>
      </footer>

      {/* ── DIVISIONAL MATRIX OVERLAY ── */}
      <AnimatePresence>
        {showMatrix && (
          <DivisionalMatrix onClose={() => setShowMatrix(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
