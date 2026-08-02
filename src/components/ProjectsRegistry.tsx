import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { projectsData } from '../data/hub-data';
import type { Project } from '../data/hub-data';

const statusClass = (s: Project['status']) =>
  s === 'ACTIVE' ? 'proj-status-active' :
  s === 'STAGING' ? 'proj-status-staging' : 'proj-status-archived';

const statusLabel = (s: Project['status']) =>
  s === 'ACTIVE' ? 'Active' : s === 'STAGING' ? 'Testing Phase' : 'Archived';

export default function ProjectsRegistry() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <>
      <div className="hub-section-header">
        <div>
          <div className="hub-section-label">Research Portfolio</div>
          <h2 className="hub-section-title">Active Projects</h2>
        </div>
        <span className="hub-section-count">{projectsData.length} projects registered</span>
      </div>

      <div className="proj-grid">
        {projectsData.map((proj, i) => (
          <motion.div
            key={proj.id}
            className="proj-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35, ease: 'easeOut' }}
            onClick={() => setExpanded(expanded === proj.id ? null : proj.id)}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter') setExpanded(expanded === proj.id ? null : proj.id); }}
            aria-expanded={expanded === proj.id}
          >
            {/* Card top */}
            <div className="proj-card-top">
              <div>
                <div className="proj-card-name">{proj.codename}</div>
                <div className="proj-card-framework">{proj.framework}</div>
              </div>
              <span className={`proj-status ${statusClass(proj.status)}`}>
                {statusLabel(proj.status)}
              </span>
            </div>

            {/* Description */}
            <p className="proj-card-desc">{proj.description}</p>

            {/* Footer */}
            <div className="proj-card-footer">
              <div className="proj-tags">
                {proj.tags.map(t => (
                  <span key={t} className="proj-tag">{t}</span>
                ))}
              </div>
              <div className="proj-progress-row">
                <div className="proj-progress-track">
                  <div
                    className="proj-progress-fill"
                    style={{ width: `${proj.buildPct}%` }}
                  />
                </div>
                <span className="proj-progress-pct">{proj.buildPct}%</span>
              </div>
            </div>

            {/* Expanded details */}
            <AnimatePresence>
              {expanded === proj.id && (
                <motion.div
                  className="proj-expanded-detail"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="proj-subsystem-row">
                    <div className="proj-subsystem-item">
                      <span className="proj-subsystem-key">Subsystem</span>
                      <span className="proj-subsystem-val">{proj.subsystem}</span>
                    </div>
                    <div className="proj-subsystem-item">
                      <span className="proj-subsystem-key">Stability</span>
                      <span className="proj-subsystem-val">{proj.stability}</span>
                    </div>
                    <div className="proj-subsystem-item">
                      <span className="proj-subsystem-key">Telemetry</span>
                      <span className="proj-subsystem-val">{proj.telemetry}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </>
  );
}
