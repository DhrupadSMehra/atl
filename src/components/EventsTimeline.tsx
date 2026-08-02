import { motion } from 'framer-motion';
import { eventsData } from '../data/hub-data';
import type { Event } from '../data/hub-data';

const chipClass = (t: Event['type']) => `evt-type-chip evt-chip-${t.toLowerCase()}`;

const dotColor = (t: Event['type']) => {
  const map: Record<Event['type'], string> = {
    HACKATHON: '#60a5fa',
    SUMMIT: '#4ade80',
    COMPETITION: '#a78bfa',
    BENCHMARK: '#fbbf24',
    DEPLOYMENT: '#38bdf8',
  };
  return map[t];
};

export default function EventsTimeline() {
  const past = eventsData.filter(e => e.isPast);
  const upcoming = eventsData.filter(e => !e.isPast);

  return (
    <>
      <div className="hub-section-header">
        <div>
          <div className="hub-section-label">Academic Record</div>
          <h2 className="hub-section-title">Research Milestones</h2>
        </div>
        <span className="hub-section-count">{eventsData.length} events logged</span>
      </div>

      <div className="events-layout">
        {/* LEFT: Completed */}
        <div>
          <div className="events-col-label">Completed &amp; Achieved</div>
          <div className="events-list">
            {past.map((evt, i) => (
              <motion.div
                key={evt.id}
                className="evt-row"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.32 }}
              >
                <div className="evt-date-col">
                  <div className="evt-date">{evt.date}</div>
                  <div
                    className="evt-type-dot"
                    style={{ background: dotColor(evt.type) }}
                  />
                </div>
                <div className="evt-body">
                  <span className={chipClass(evt.type)}>
                    {evt.type.charAt(0) + evt.type.slice(1).toLowerCase()}
                  </span>
                  <div className="evt-title">{evt.title}</div>
                  <div className="evt-outcome">{evt.outcome}</div>
                  <div className="evt-location">{evt.location}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* RIGHT: Upcoming */}
        <div>
          <div className="events-col-label">Scheduled &amp; Pipeline</div>
          <div className="events-list">
            {upcoming.map((evt, i) => (
              <motion.div
                key={evt.id}
                className="evt-row evt-upcoming"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07, duration: 0.32 }}
              >
                <div className="evt-date-col">
                  <div className="evt-date">{evt.date}</div>
                  <div
                    className="evt-type-dot"
                    style={{ background: dotColor(evt.type), opacity: 0.5 }}
                  />
                </div>
                <div className="evt-body">
                  <span className={chipClass(evt.type)}>
                    {evt.type.charAt(0) + evt.type.slice(1).toLowerCase()}
                  </span>
                  <div className="evt-title">{evt.title}</div>
                  <div className="evt-outcome">{evt.outcome}</div>
                  <div className="evt-location">{evt.location}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
