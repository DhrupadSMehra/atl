import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { departmentsData } from '../data/hub-data';

interface DivisionalMatrixProps {
  onClose: () => void;
}

export default function DivisionalMatrix({ onClose }: DivisionalMatrixProps) {
  const [active, setActive] = useState(departmentsData[0].id);
  const dept = departmentsData.find(d => d.id === active)!;

  return (
    <motion.div
      className="matrix-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        className="matrix-modal"
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ duration: 0.26, ease: 'easeOut' }}
      >
        {/* Modal header */}
        <div className="matrix-modal-header">
          <div>
            <div className="matrix-modal-label">Structural Overview</div>
            <h2 className="matrix-modal-title">TinkerThix Departments</h2>
            <p className="matrix-modal-sub">
              {departmentsData.length} specialized divisions ·{' '}
              {departmentsData.reduce((a, d) => a + d.activeNodes, 0)} active researchers
            </p>
          </div>
          <button className="matrix-close" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="matrix-modal-body">
          {/* Sidebar */}
          <div className="matrix-sidebar">
            {departmentsData.map(d => (
              <button
                key={d.id}
                className={`matrix-sidebar-btn ${active === d.id ? 'active' : ''}`}
                onClick={() => setActive(d.id)}
              >
                <div className="matrix-sidebar-desig">{d.designation}</div>
                <div className="matrix-sidebar-name">{d.codename}</div>
                <div className="matrix-sidebar-nodes">
                  <div className="matrix-node-dot" />
                  {d.activeNodes} engineers
                </div>
              </button>
            ))}
          </div>

          {/* Detail */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              className="matrix-detail"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <div className="matrix-detail-header">
                <div className="matrix-detail-icon">{dept.icon}</div>
                <div>
                  <div className="matrix-detail-desig">{dept.designation}</div>
                  <h3 className="matrix-detail-name">{dept.codename}</h3>
                </div>
              </div>

              <div className="matrix-detail-stats">
                <div className="matrix-stat-card">
                  <div className="matrix-stat-label">Division Lead</div>
                  <div className="matrix-stat-value">{dept.lead}</div>
                </div>
                <div className="matrix-stat-card">
                  <div className="matrix-stat-label">Active Engineers</div>
                  <div className="matrix-stat-value"
                    style={{ color: '#2563eb' }}>
                    {dept.activeNodes} members
                  </div>
                </div>
              </div>

              <p className="matrix-detail-desc">{dept.description}</p>

              <div className="matrix-systems-label">Core Technical Systems</div>
              <div className="matrix-systems-grid">
                {dept.systems.map(s => (
                  <div key={s} className="matrix-sys-chip">
                    <div className="matrix-sys-icon" />
                    {s}
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
