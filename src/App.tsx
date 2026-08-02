/**
 * App.tsx — TinkerThix Root Router
 *
 * State-based navigation: 'booting' → 'landing' → 'team'
 *
 * Layout isolation:
 *  - LandingPage: imports landing.css only. Black monochrome canvas.
 *  - TeamDossier:  imports App.css only.  Valorant-style agent UI.
 *
 * The two views are mutually exclusive. AnimatePresence fully unmounts
 * the inactive view so their DOM elements and CSS never overlap.
 */

import { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, useGLTF, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import BootLoader from './components/BootLoader';
import AgentUI from './components/AgentUI';
import './hub.css';
import './landing.css';
// NOTE: App.css (dossier styles) is imported directly in AgentUI.tsx only.

// ═══════════════════════════════════════════════════════════════════
// LANDING PAGE — AMBIENT BACKGROUND LAYER (pointer-events: none)
// ═══════════════════════════════════════════════════════════════════

const GHOST_SNIPPETS = [
  "void Hexapod::computeInverseKinematics(double x, double y, double z) {",
  "rclcpp::init(argc, argv); auto node = std::make_shared<NavigationNode>();",
  "Eigen::Matrix4d T = Eigen::Matrix4d::Identity();",
  "cv::Ptr<cv::Feature2D> detector = cv::ORB::create();",
  "sys.path.append('/opt/ros/humble/lib/python3.10/site-packages')",
  "pwm.setPWM(SERVO_ID, 0, pulse_width);",
  "Δθ = J⁺ · Δx // damped least-squares IK",
  "ROS_INFO(\"[SLAM] Map updated: %d nodes\", graph.size());",
  "const float Kp = 0.85f, Ki = 0.02f, Kd = 0.14f;",
  "torch.save(model.state_dict(), 'hexapod_policy_v7.pt')",
];

type GhostItem = { id: number; fullText: string; typed: string; x: number; y: number; fading: boolean };

const LandingGhostMatrix = () => {
  const [ghosts, setGhosts] = useState<GhostItem[]>([]);
  const counter = useRef(0);

  useEffect(() => {
    const spawnTick = setInterval(() => {
      if (Math.random() > 0.45) return;
      const id = counter.current++;
      const ghost: GhostItem = {
        id,
        fullText: GHOST_SNIPPETS[Math.floor(Math.random() * GHOST_SNIPPETS.length)],
        typed: "",
        x: Math.random() * 72 + 4,
        y: Math.random() * 82 + 5,
        fading: false
      };
      setGhosts(prev => [...prev.slice(-12), ghost]);

      setTimeout(() => {
        setGhosts(prev => prev.map(g => g.id === id ? { ...g, fading: true } : g));
      }, 3500);

      setTimeout(() => {
        setGhosts(prev => prev.filter(g => g.id !== id));
      }, 4200);
    }, 1100);

    return () => clearInterval(spawnTick);
  }, []);

  useEffect(() => {
    const typeTick = setInterval(() => {
      setGhosts(prev => prev.map(g => {
        if (g.typed.length < g.fullText.length) {
          return { ...g, typed: g.fullText.slice(0, g.typed.length + Math.max(1, Math.floor(Math.random() * 4))) };
        }
        return g;
      }));
    }, 40);
    return () => clearInterval(typeTick);
  }, []);

  return (
    <div className="landing-ghost-layer">
      {ghosts.map(g => (
        <span
          key={g.id}
          className={`landing-ghost-line ${g.fading ? 'landing-ghost-fading' : ''}`}
          style={{ left: `${g.x}%`, top: `${g.y}%` }}
        >
          {g.typed}
          {g.typed.length < g.fullText.length && <span className="landing-ghost-cursor" />}
        </span>
      ))}
    </div>
  );
};

const RoboticsSchematics = () => (
  <div className="landing-bp-layer">
    <div className="landing-bp-grid" />

    {/* Hardcoded Vector Engineering Schematics */}
    <svg className="landing-schematics-svg" viewBox="0 0 1000 1000" preserveAspectRatio="none">
      {/* Crosshairs & Calibration Rings */}
      <circle cx="200" cy="200" r="120" stroke="rgba(255,255,255,0.03)" strokeWidth="1" fill="none" />
      <circle cx="200" cy="200" r="80" stroke="rgba(0, 255, 102, 0.05)" strokeWidth="1" strokeDasharray="4 8" fill="none" />
      <line x1="0" y1="200" x2="400" y2="200" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
      <line x1="200" y1="0" x2="200" y2="400" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />

      {/* Mechanical Robotic Arm Schematic */}
      <g stroke="rgba(0, 255, 102, 0.05)" strokeWidth="1" fill="none">
        <path d="M 700 800 L 780 650 L 900 620" />
        <circle cx="700" cy="800" r="15" />
        <circle cx="780" cy="650" r="10" />
        <circle cx="900" cy="620" r="8" />
        {/* Joint links details */}
        <line x1="770" y1="655" x2="790" y2="645" stroke="rgba(255,255,255,0.03)" />
        <rect x="895" y="615" width="10" height="10" />
      </g>

      {/* Technical framing brackets */}
      <path d="M 50 100 L 50 50 L 100 50" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" />
      <path d="M 950 100 L 950 50 L 900 50" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" />
      <path d="M 50 900 L 50 950 L 100 950" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" />
      <path d="M 950 900 L 950 950 L 900 950" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" />
    </svg>

    <div className="landing-bp-corner landing-bp-tl" />
    <div className="landing-bp-corner landing-bp-tr" />
    <div className="landing-bp-corner landing-bp-bl" />
    <div className="landing-bp-corner landing-bp-br" />
    <div className="landing-bp-ring landing-bp-ring-1" />
    <div className="landing-bp-ring landing-bp-ring-2" />
    <div className="landing-bp-ch-h" />
    <div className="landing-bp-ch-v" />
    <div className="landing-bp-schematic landing-bp-sch-tl">
      <span className="landing-bp-label">FIG 1.0 // CHASSIS</span>
    </div>
    <div className="landing-bp-schematic landing-bp-sch-br">
      <span className="landing-bp-label">KINEMATIC TREE // REV-C</span>
    </div>
  </div>
);

const TerminalHeader = ({ onNavigateTeam }: { onNavigateTeam: () => void }) => {
  const [typed, setTyped] = useState("");
  const targetText = "root@tinkerthix:~# ./initialize_research_portal";

  useEffect(() => {
    let index = 0;
    const tick = setInterval(() => {
      setTyped(targetText.slice(0, index));
      index++;
      if (index > targetText.length) clearInterval(tick);
    }, 45);
    return () => clearInterval(tick);
  }, []);

  return (
    <div className="landing-terminal-header">
      <div className="landing-terminal-topbar">
        <span className="landing-mono-label">SYSTEM // ROOT_ACCESS</span>
        <button className="landing-uplink-btn" onClick={onNavigateTeam}>
          [UPLINK_TEAM_DOSSIER]
        </button>
      </div>
      <div className="landing-terminal-body">
        <span className="landing-terminal-prompt">{typed}</span>
        <span className="landing-ghost-cursor" />
      </div>
    </div>
  );
};

const PHOTOS = [
  '/assets/images/lab_1.jpg',
  '/assets/images/lab_2.jpg',
  '/assets/images/lab_3.jpg',
  '/assets/images/lab_4.jpg'
];

const PhotoGalleryArchive = () => {
  return (
    <div className="landing-gallery-section">
      <div className="landing-gallery-header">
        <span className="landing-mono-label">ATL_RESEARCH_DOCUMENTATION // FIELD_RUN_ARCHIVES</span>
        <h2 className="landing-gallery-title">Laboratory Archives</h2>
      </div>
      <div className="landing-gallery-grid">
        {PHOTOS.map((src, i) => (
          <div key={i} className={`landing-gallery-item landing-gallery-item-${i}`}>
            <div className="landing-gallery-frame">
              <img src={src} alt={`Lab documentation ${i + 1}`} className="landing-gallery-img" />
              <div className="landing-gallery-overlay" />
            </div>
            <div className="landing-gallery-metrics">
              <span>[LOC: GHZ_ATL_MAIN_LAB]</span>
              <span className="landing-gallery-sep">//</span>
              <span>[STATUS: ARCHIVED_RUN_2026]</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// DEPARTMENT NODE MATRIX
// ═══════════════════════════════════════════════════════════════════

const DEPARTMENTS = [
  {
    id: 'tech', label: 'Technical', code: 'DIV-ALPHA', members: 4, angle: -90,
    focus: 'Specializing in ROS 2 node architecture, custom PCB fabrication, multi-terrain kinetic locomotion solvers, and real-time autonomous computer vision tracking using customized OpenCV processing pipelines.',
    stack: ['ROS 2', 'C++', 'IMU', 'PWM Grid']
  },
  {
    id: 'creative', label: 'Creative', code: 'DIV-BETA', members: 2, angle: -30,
    focus: 'Driving industrial structural CAD modeling, chassis topology optimization, structural aesthetics, and advanced multi-material asset synthesis to push team fabrication beyond the benchmark.',
    stack: ['SolidWorks', 'Fusion 360', 'FDM', 'Laser Cut']
  },
  {
    id: 'photo', label: 'Photography', code: 'DIV-GAMMA', members: 1, angle: 30,
    focus: 'Documenting high-speed field-run execution, archiving lab telemetry visual runs, and capturing precise ultra-high shutter speed motion diagnostics of deploying mechanical assets.',
    stack: ['Lightroom', 'OpenCV', 'RAW', 'Color Science']
  },
  {
    id: 'marketing', label: 'Marketing', code: 'DIV-DELTA', members: 2, angle: 90,
    focus: 'Orchestrating strategic institutional positioning vectors, managing external sponsorship matrix channels, and tracking algorithmic outreach analytics to scale our ecosystem\'s reach.',
    stack: ['Canva', 'Notion', 'LaTeX', 'Figma']
  },
  {
    id: 'social', label: 'Social Media', code: 'DIV-EPSILON', members: 2, angle: 150,
    focus: 'Architecting our digital footprint layout, managing rapid micro-content deployment pipelines, and analyzing high-frequency user engagement metrics across active media handles.',
    stack: ['Instagram', 'LinkedIn', 'Reels', 'Analytics']
  },
  {
    id: 'hospitality', label: 'Hospitality', code: 'DIV-ZETA', members: 2, angle: 210,
    focus: 'Synchronizing ground-level logistics, managing critical laboratory resource allocation, and executing cross-department infrastructure operational routing during major milestones.',
    stack: ['Protocol', 'Coordination', 'Events', 'Relations']
  },
];

const DataStreamGeometry = () => {
  const pointsRef = useRef<THREE.Points>(null);

  const particleCount = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.2;
      pointsRef.current.rotation.x += delta * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#00ff66" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
};

const DynamicDepartmentCanvas = ({ departmentId }: { departmentId: string }) => {
  if (departmentId === 'tech') {
    return (
      <Canvas camera={{ position: [0, 2, 8], fov: 45 }} style={{ background: '#050505' }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <ModelRenderer modelType="arm" />
        <gridHelper args={[20, 20, '#00ff66', '#004422']} position={[0, -2, 0]} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2} />
      </Canvas>
    );
  }

  if (departmentId === 'creative') {
    return (
      <Canvas camera={{ position: [0, 2, 8], fov: 45 }} style={{ background: '#050505' }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 5, 5]} intensity={2} color="#00ffff" />
        <directionalLight position={[-5, 5, -5]} intensity={2} color="#ff00ff" />
        <ModelRenderer modelType="robot" />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2} />
      </Canvas>
    );
  }

  if (departmentId === 'photo') {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <Canvas camera={{ position: [0, 2, 8], fov: 45 }} style={{ background: '#050505' }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 10]} intensity={1} />
          <ModelRenderer modelType="robot" />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2} />
        </Canvas>
        <div className="landing-photo-hud">
          <div className="hud-corner hud-tl" />
          <div className="hud-corner hud-tr" />
          <div className="hud-corner hud-bl" />
          <div className="hud-corner hud-br" />
          <div className="hud-crosshair" />
          <div className="hud-telemetry">
            <span>[ISO: 800]</span>
            <span>[F: 1.8]</span>
            <span>[SHUTTER: 1/8000s]</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 45 }} style={{ background: '#050505' }}>
      <ambientLight intensity={0.5} />
      <DataStreamGeometry />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1} />
    </Canvas>
  );
};

const DEG = Math.PI / 180;
const RADIUS = 145, CX = 200, CY = 200;

const DepartmentNodeMatrix = () => {
  const [active, setActive] = useState<string | null>(null);
  const dept = DEPARTMENTS.find(d => d.id === active);

  return (
    <div className="landing-node-section">
      <div className="landing-node-header">
        <span className="landing-mono-label">NETWORK // STRUCTURAL_DIVISIONS</span>
        <h2 className="landing-node-title">Department Node Matrix</h2>
        <p className="landing-node-sub">
          Hover a node to render its research datablock. Active lines trace the
          connection path to the core hub.
        </p>
      </div>

      <div className="landing-node-body">
        {/* SVG Network Graph */}
        <div className="landing-svg-wrapper">
          <svg viewBox="0 0 400 400" className="landing-dept-svg" aria-label="Department network graph">
            {/* Connector lines */}
            {DEPARTMENTS.map(d => {
              const x = CX + RADIUS * Math.cos(d.angle * DEG);
              const y = CY + RADIUS * Math.sin(d.angle * DEG);
              const isActive = active === d.id;
              return (
                <line
                  key={`line-${d.id}`}
                  x1={CX} y1={CY} x2={x} y2={y}
                  stroke={isActive ? '#ffffff' : 'rgba(255,255,255,0.07)'}
                  strokeWidth={isActive ? 1.5 : 0.8}
                  strokeDasharray={isActive ? '4 3' : '0'}
                  className={isActive ? 'landing-node-line-active' : ''}
                />
              );
            })}

            {/* Rings */}
            <circle cx={CX} cy={CY} r={RADIUS} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <circle cx={CX} cy={CY} r={RADIUS * 0.5} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="3 4" />

            {/* Core Hub */}
            <circle cx={CX} cy={CY} r={18} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />
            <circle cx={CX} cy={CY} r={10} fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
            <circle cx={CX} cy={CY} r={4} fill="#ffffff" />

            {/* Department Nodes */}
            {DEPARTMENTS.map(d => {
              const x = CX + RADIUS * Math.cos(d.angle * DEG);
              const y = CY + RADIUS * Math.sin(d.angle * DEG);
              const isActive = active === d.id;
              const lx = CX + (RADIUS + 34) * Math.cos(d.angle * DEG);
              const ly = CY + (RADIUS + 34) * Math.sin(d.angle * DEG);
              const anchor = (d.angle > 90 && d.angle < 270) ? 'end'
                : (d.angle === 90 || d.angle === -90) ? 'middle' : 'start';

              return (
                <g
                  key={d.id}
                  className="landing-node-group"
                  onClick={() => setActive(prev => prev === d.id ? null : d.id)}
                  onMouseEnter={() => setActive(d.id)}
                  role="button"
                  aria-label={`${d.label} department node`}
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setActive(prev => prev === d.id ? null : d.id)}
                >
                  <circle
                    cx={x} cy={y}
                    r={isActive ? 11 : 8}
                    fill={isActive ? '#ffffff' : 'rgba(255,255,255,0.08)'}
                    stroke={isActive ? '#ffffff' : 'rgba(255,255,255,0.25)'}
                    strokeWidth={isActive ? 1.5 : 1}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  />
                  <circle
                    cx={x} cy={y}
                    r={isActive ? 5 : 3}
                    fill={isActive ? '#000' : 'rgba(255,255,255,0.5)'}
                    style={{ transition: 'all 0.2s ease' }}
                  />
                  <text
                    x={lx} y={ly}
                    textAnchor={anchor}
                    dominantBaseline="middle"
                    fontSize="9.5"
                    fontFamily="'JetBrains Mono', monospace"
                    fontWeight={isActive ? 700 : 400}
                    fill={isActive ? '#ffffff' : 'rgba(255,255,255,0.45)'}
                    style={{ cursor: 'pointer', transition: 'fill 0.2s ease', userSelect: 'none' }}
                  >
                    {d.code}
                  </text>
                </g>
              );
            })}

            <text x={CX} y={CY + 30} textAnchor="middle" fontSize="7"
              fontFamily="'JetBrains Mono', monospace" fill="rgba(255,255,255,0.3)">
              CORE HUB
            </text>
          </svg>
        </div>

        {/* Data Block Panel */}
        <div className="landing-datablock-panel">
          <AnimatePresence mode="wait">
            {dept ? (
              <motion.div
                key={dept.id}
                className="landing-datablock"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="landing-db-header">
                  <span className="landing-mono-label">{dept.code} // NODE_ACTIVE</span>
                  <h3 className="landing-db-title">{dept.label}</h3>
                  <div className="landing-db-meta">
                    <span className="landing-db-badge">
                      {dept.members} RESEARCHER{dept.members !== 1 ? 'S' : ''}
                    </span>
                    <span className="landing-db-dot" />
                    <span className="landing-db-online">ONLINE</span>
                  </div>
                </div>

                <div className="landing-db-divider" />

                <div className="landing-db-field">
                  <div className="landing-db-field-label">RESEARCH FOCUS</div>
                  <div className="landing-db-field-value">{dept.focus}</div>
                </div>

                <div className="landing-db-field">
                  <div className="landing-db-field-label">TECH STACK</div>
                  <div className="landing-db-stack">
                    {dept.stack.map(s => <span key={s} className="landing-db-chip">{s}</span>)}
                  </div>
                </div> {/* <-- FIX: Kept this open so the elements below stay inside the motion card! */}

                <div className="landing-db-canvas-wrapper">
                  <DynamicDepartmentCanvas departmentId={dept.id} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                className="landing-datablock landing-datablock-idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="landing-idle-icon">
                  <svg viewBox="0 0 40 40" width="40" height="40" fill="none">
                    <circle cx="20" cy="20" r="18" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                    <circle cx="20" cy="20" r="10" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 3" />
                    <circle cx="20" cy="20" r="3" fill="rgba(255,255,255,0.2)" />
                  </svg>
                </div>
                <div className="landing-idle-label">AWAITING NODE SELECTION</div>
                <div className="landing-idle-sub">
                  Hover a department node to render its research datablock.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// R3F SPACE SHOOTER — SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════

const globalTrauma = { current: 0 };
const addTrauma = (amount: number) => {
  globalTrauma.current = Math.min(globalTrauma.current + amount, 1);
};

const ScrollingCanyon = () => {
  const gridRef1 = useRef<THREE.Mesh>(null);
  const gridRef2 = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const speed = 25 * delta;
    if (gridRef1.current) {
      gridRef1.current.position.z += speed;
      if (gridRef1.current.position.z > 20) gridRef1.current.position.z -= 80;
    }
    if (gridRef2.current) {
      gridRef2.current.position.z += speed;
      if (gridRef2.current.position.z > 20) gridRef2.current.position.z -= 80;
    }
  });

  return (
    <group position={[0, -3, 0]}>
      <mesh ref={gridRef1} position={[0, 0, -20]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 40, 24, 16]} />
        <meshBasicMaterial color="#003322" wireframe opacity={0.15} transparent />
      </mesh>
      <mesh ref={gridRef2} position={[0, 0, -60]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 40, 24, 16]} />
        <meshBasicMaterial color="#003322" wireframe opacity={0.15} transparent />
      </mesh>
    </group>
  );
};

interface ProbeProps {
  mouse: React.MutableRefObject<{ x: number; y: number }>;
  keys: React.MutableRefObject<Set<string>>;
  probeRef: React.RefObject<THREE.Group>;
}

const ProbeModule = ({ mouse, keys, probeRef }: ProbeProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, delta) => {
    if (!probeRef.current || !meshRef.current) return;

    const tx = mouse.current.x * viewport.width * 0.45;
    const ty = mouse.current.y * viewport.height * 0.45;
    target.current.set(tx, ty, 0);

    const speed = 15 * delta;
    if (keys.current.has('w') || keys.current.has('ArrowUp')) target.current.y += speed;
    if (keys.current.has('s') || keys.current.has('ArrowDown')) target.current.y -= speed;
    if (keys.current.has('a') || keys.current.has('ArrowLeft')) target.current.x -= speed;
    if (keys.current.has('d') || keys.current.has('ArrowRight')) target.current.x += speed;

    target.current.x = Math.max(Math.min(target.current.x, 10), -10);
    target.current.y = Math.max(Math.min(target.current.y, 6), -3);

    probeRef.current.position.lerp(target.current, 8 * delta);

    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -target.current.y * 0.1, 10 * delta);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, target.current.x * 0.1, 10 * delta);
    meshRef.current.rotation.z += 2 * delta;

    if (ringRef.current) {
      ringRef.current.rotation.z -= 3 * delta;
    }
  });

  return (
    <group ref={probeRef as any}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshBasicMaterial wireframe color="#00ff88" />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.8, 0.02, 4, 24]} />
        <meshBasicMaterial color="#00ff88" opacity={0.2} transparent wireframe />
      </mesh>
    </group>
  );
};

type ParticleBurst = { id: number; x: number; y: number; z: number; createdAt: number };

const Explosions = ({ bursts }: { bursts: ParticleBurst[] }) => {
  return (
    <>
      {bursts.map(b => (
        <Explosion key={b.id} x={b.x} y={b.y} z={b.z} />
      ))}
    </>
  );
};

const Explosion = ({ x, y, z }: { x: number; y: number; z: number }) => {
  const groupRef = useRef<THREE.Group>(null);

  const particles = useMemo(() => {
    return Array.from({ length: 12 }).map(() => ({
      vx: (Math.random() - 0.5) * 30,
      vy: (Math.random() - 0.5) * 30,
      vz: (Math.random() - 0.5) * 30,
    }));
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      child.position.x += p.vx * delta;
      child.position.y += p.vy * delta;
      child.position.z += p.vz * delta;
      (child as THREE.Mesh).scale.multiplyScalar(Math.pow(0.05, delta));
    });
  });

  return (
    <group ref={groupRef} position={[x, y, z]}>
      {particles.map((_, i) => (
        <mesh key={i}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshBasicMaterial color="#00ff88" />
        </mesh>
      ))}
    </group>
  );
};

const ObstacleMeshes = ({ obstacles }: { obstacles: any[] }) => {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((_, delta) => {
    for (let i = 0; i < obstacles.length; i++) {
      const mesh = meshRefs.current[i];
      const obs = obstacles[i];
      if (mesh && obs.active) {
        mesh.position.set(obs.x, obs.y, obs.z);
        mesh.rotation.x += obs.rx * delta;
        mesh.rotation.y += obs.ry * delta;
      }
    }
  });

  return (
    <>
      {obstacles.map((obs, i) => (
        <mesh key={i} ref={el => meshRefs.current[i] = el}>
          <icosahedronGeometry args={[obs.size, 0]} />
          <meshBasicMaterial color={obs.color} wireframe opacity={0.4} transparent />
        </mesh>
      ))}
    </>
  );
};

const GameEngine = ({ probeRef }: { probeRef: React.RefObject<THREE.Group> }) => {
  const { camera } = useThree();

  const lasersRef = useRef<{ id: number; x: number; y: number; z: number }[]>([]);
  const [, setLaserRender] = useState(0);
  const [bursts, setBursts] = useState<ParticleBurst[]>([]);
  const laserIdCounter = useRef(0);

  const obstaclesRef = useRef<any[]>([]);
  const laserRefs = useRef<{ [key: number]: THREE.Mesh | null }>({});

  useEffect(() => {
    obstaclesRef.current = Array.from({ length: 30 }).map(() => ({
      x: (Math.random() - 0.5) * 30,
      y: (Math.random() - 0.5) * 15,
      z: -40 - Math.random() * 120,
      size: 0.8 + Math.random() * 2,
      rx: (Math.random() - 0.5) * 2,
      ry: (Math.random() - 0.5) * 2,
      color: Math.random() > 0.8 ? '#00ff88' : '#ffffff',
      active: true,
    }));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!probeRef.current) return;
        const px = probeRef.current.position.x;
        const py = probeRef.current.position.y;
        const pz = probeRef.current.position.z;

        lasersRef.current.push({ id: laserIdCounter.current++, x: px, y: py, z: pz });
        setLaserRender(t => t + 1);
        addTrauma(0.15);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [probeRef]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setBursts(prev => prev.filter(b => now - b.createdAt < 500));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);

    const obstacles = obstaclesRef.current;
    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];
      if (!obs.active) continue;

      obs.z += 60 * dt;
      if (obs.z > 5) {
        obs.z = -120 - Math.random() * 40;
        obs.x = (Math.random() - 0.5) * 30;
        obs.y = (Math.random() - 0.5) * 15;
      }
    }

    let stateChanged = false;
    for (let j = lasersRef.current.length - 1; j >= 0; j--) {
      const laser = lasersRef.current[j];
      const mesh = laserRefs.current[laser.id];
      if (mesh) {
        mesh.position.z -= 120 * dt;
        let hit = false;

        for (let i = 0; i < obstacles.length; i++) {
          const obs = obstacles[i];
          if (obs.active && Math.abs(mesh.position.z - obs.z) < (obs.size + 1.5)) {
            if (Math.abs(mesh.position.x - obs.x) < obs.size + 0.8 && Math.abs(mesh.position.y - obs.y) < obs.size + 0.8) {
              hit = true;
              setBursts(b => [...b, { id: Math.random(), x: obs.x, y: obs.y, z: obs.z, createdAt: Date.now() }]);
              addTrauma(0.4);

              obs.z = -120 - Math.random() * 40;
              obs.x = (Math.random() - 0.5) * 30;
              obs.y = (Math.random() - 0.5) * 15;
              break;
            }
          }
        }

        if (hit || mesh.position.z < -200) {
          lasersRef.current.splice(j, 1);
          delete laserRefs.current[laser.id];
          stateChanged = true;
        }
      }
    }

    if (stateChanged) setLaserRender(t => t + 1);

    if (probeRef.current) {
      const targetCamX = probeRef.current.position.x * 0.3;
      const targetCamY = probeRef.current.position.y * 0.3;

      globalTrauma.current = Math.max(0, globalTrauma.current - dt * 1.5);
      const shakeAmt = globalTrauma.current * globalTrauma.current;
      const shakeX = (Math.random() - 0.5) * shakeAmt * 1.5;
      const shakeY = (Math.random() - 0.5) * shakeAmt * 1.5;

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 4 * dt) + shakeX;
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 4 * dt) + shakeY;
      camera.lookAt(0, 0, -40);
    }
  });

  return (
    <>
      <ObstacleMeshes obstacles={obstaclesRef.current} />

      {lasersRef.current.map(laser => (
        <mesh
          key={laser.id}
          ref={(el) => { laserRefs.current[laser.id] = el; }}
          position={[laser.x, laser.y, laser.z]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.06, 0.06, 6, 8]} />
          <meshBasicMaterial color="#00ff88" />
        </mesh>
      ))}

      <Explosions bursts={bursts} />
    </>
  );
};

interface TelemetryProps {
  posRef: React.MutableRefObject<{ x: number; y: number; z: number }>;
  probeRef: React.RefObject<THREE.Group>;
}

const TelemetryUpdater = ({ posRef, probeRef }: TelemetryProps) => {
  useFrame(() => {
    if (probeRef.current) {
      posRef.current.x = probeRef.current.position.x;
      posRef.current.y = probeRef.current.position.y;
      posRef.current.z = probeRef.current.position.z;
    }
  });
  return null;
};

const SpaceSimulator = () => {
  const mouse = useRef({ x: 0, y: 0 });
  const keys = useRef<Set<string>>(new Set());
  const posRef = useRef({ x: 0, y: 0, z: 0 });
  const probeRef = useRef<THREE.Group>(null);
  const [telemetry, setTelemetry] = useState({ x: '0.00', y: '0.00', z: '0.00' });

  useEffect(() => {
    const id = setInterval(() => {
      setTelemetry({
        x: posRef.current.x.toFixed(2),
        y: posRef.current.y.toFixed(2),
        z: posRef.current.z.toFixed(2),
      });
    }, 66);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => keys.current.add(e.key);
    const up = (e: KeyboardEvent) => keys.current.delete(e.key);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  };

  return (
    <div className="sim-section">
      <div className="sim-header">
        <span className="landing-mono-label">SHOWCASE // SIM_MODE_01</span>
        <h2 className="sim-title">Tactical Flight Simulator</h2>
        <p className="sim-sub">
          Live orbital intercept prototype. WASD / arrow keys to steer, cursor to aim.
          Press SPACEBAR to engage kinetic lasers.
        </p>
      </div>

      <div className="sim-body">
        <div
          className="sim-canvas-wrapper"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { mouse.current = { x: 0, y: 0 }; }}
        >
          <div className="sim-corner sim-corner-tl" />
          <div className="sim-corner sim-corner-tr" />
          <div className="sim-corner sim-corner-bl" />
          <div className="sim-corner sim-corner-br" />

          <div className="sim-badge-tl">ORBITAL_TELEMETRY // COMBAT_MODE</div>
          <div className="sim-badge-br">
            X:{telemetry.x} Y:{telemetry.y} Z:{telemetry.z}
          </div>

          <Canvas
            camera={{ position: [0, 0, 5], fov: 75 }}
            style={{ background: '#000000' }}
            dpr={[1, 1.5]}
          >
            <Suspense fallback={null}>
              <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={2} />
              <ScrollingCanyon />
              <ProbeModule mouse={mouse} keys={keys} probeRef={probeRef} />
              <GameEngine probeRef={probeRef} />
              <TelemetryUpdater posRef={posRef} probeRef={probeRef} />
            </Suspense>
          </Canvas>
        </div>

        <div className="sim-panel">
          <div className="sim-panel-label">PROBE TELEMETRY</div>
          <div className="sim-data-grid">
            {[
              ['DESIGNATION', 'ATL-PROBE-01'],
              ['STATUS', 'ENGAGED'],
              ['ORBIT', 'INTERCEPT'],
              ['WEAPON', 'LASER KINETIC'],
              ['SIGNAL', '97.3 dB'],
              ['NODES', 'ACTIVE'],
            ].map(([k, v]) => (
              <div key={k} className="sim-data-row">
                <span className="sim-data-key">{k}</span>
                <span className="sim-data-val">{v}</span>
              </div>
            ))}
          </div>

          <div className="sim-panel-label" style={{ marginTop: 24 }}>CONTROL INPUTS</div>
          <div className="sim-keybind-list">
            <div className="sim-keybind"><kbd>W A S D</kbd><span>Lateral thrust</span></div>
            <div className="sim-keybind"><kbd>Cursor</kbd><span>Pitch / Yaw</span></div>
            <div className="sim-keybind"><kbd>Space</kbd><span>Fire Laser</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// NEW COMPONENTS FOR V2 EXPANSION
// ═══════════════════════════════════════════════════════════════════

const HeroIntro = ({ onNavigateTeam }: { onNavigateTeam: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const fontSize = 14;
    let columns = Math.floor(width / fontSize);
    const drops: number[] = [];
    for (let x = 0; x < columns; x++) {
      drops[x] = Math.random() * -100; // stagger initial drops
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#00ff66';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        if (drops[i] > 0) {
          const text = chars[Math.floor(Math.random() * chars.length)];
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        }

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      columns = Math.floor(width / fontSize);
      while (drops.length < columns) drops.push(Math.random() * -100);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="landing-hero-section">
      <canvas ref={canvasRef} className="landing-hero-canvas" />

      <div className="landing-hero-glitch-layer">
        <div className="landing-hero-grid-overlay" />
      </div>

      <div className="landing-hero-content">
        <div className="landing-hero-top-labels">
          <span className="landing-hero-label">[ORG: TINKERTHIX]</span>
          <span className="landing-hero-label">[LOC: SETH_ANANDRAM_JAIPURIA]</span>
        </div>

        <div className="landing-hero-center">
          <div className="landing-hero-phase1">// MISSION MANIFESTO // GATEWAY BEYOND THE IMPOSSIBLE</div>
          <h1 className="landing-hero-phase2">TINK ETHIX</h1>
          <div className="landing-hero-phase3">Advanced Robotics &amp; Mechanical Engineering Division<br />Seth Anandram Jaipuria School</div>
          <button className="landing-hero-uplink-btn" onClick={onNavigateTeam}>
            [ACCESS_PERSONNEL_DOSSIERS]
          </button>
        </div>

        <div className="landing-hero-telemetry-strip">
          <div className="telemetry-item">[LOC: GHZ_ATL_MAIN_LAB]</div>
          <div className="telemetry-item">[SYS_INTEGRITY: 98.4%]</div>
          <div className="telemetry-item">[NETWORK_NODE: ACTIVE]</div>
          <div className="telemetry-item">[SYS_CLK: RUNNING]</div>
        </div>

        <div className="landing-hero-bottom-prompt">
          Scroll to Reveal <span className="landing-hero-cursor">_</span>
        </div>
      </div>
    </div>
  );
};

const ModelRenderer = ({ modelType }: { modelType: 'arm' | 'robot' }) => {
  const { scene } = useGLTF(modelType === 'arm' ? '/models/robot_arm.glb' : '/models/robot.glb');
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += 0.5 * delta;
    }
  });

  return (
    <group ref={group}>
      <primitive object={scene} scale={2} />
    </group>
  );
};

const ChroniclesAndCadShowcase = () => {
  const [activeModel, setActiveModel] = useState<'arm' | 'robot'>('arm');

  return (
    <div className="landing-showcase-section">
      <div className="landing-showcase-grid">

        {/* Left Column: Chronicles */}
        <div className="landing-showcase-col-left">
          <div className="landing-exhibition-header">
            <span className="landing-mono-label">RESEARCH_EXHIBITIONS // MAJOR_BENCHMARKS</span>
          </div>
          <div className="landing-exhibition-cards">
            <div className="landing-exhibition-card">
              <h3 className="landing-exhibition-title">[SECTION A: COMPUFEST_2024]</h3>
              <p className="landing-exhibition-text">
                COMPUFEST 2024 celebrated technology and innovation, where students showcased their creative projects and technical expertise. The event was graced by Chief Guest Srikanth Bolla, inspiring young minds to dream beyond limits.
              </p>
              <div className="landing-exhibition-tags">
                <span className="landing-exhibition-tag">[HONORED_GUEST: SRIKANTH_BOLLA]</span>
              </div>
            </div>
            <div className="landing-exhibition-card">
              <h3 className="landing-exhibition-title">[SECTION B: TINKERFEST_2024]</h3>
              <p className="landing-exhibition-text">
                TINKERFEST 2024 celebrated innovation through thrilling drone challenges and an intense hackathon. Students showcased their technical brilliance, creativity, and problem-solving skills, making it a true festival of technology and innovation.
              </p>
              <div className="landing-exhibition-tags">
                <span className="landing-exhibition-tag">[SECTOR: DRONE_KINETICS]</span>
                <span className="landing-exhibition-tag">[CORE_LOGIC: HACKATHON_V2]</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: CAD Viewer */}
        <div className="landing-showcase-col-right">
          <div className="landing-cad-header">
            <span className="landing-mono-label">SHOWCASE // SIM_MODE_02</span>
            <h2 className="landing-cad-title">Dual-Model CAD Viewer</h2>
          </div>
          <div className="landing-cad-box">
            <div className="landing-cad-controls-top">
              <button
                className={`landing-cad-toggle ${activeModel === 'arm' ? 'active' : ''}`}
                onClick={() => setActiveModel('arm')}
              >
                [SYS_01: ROBOT_ARM]
              </button>
              <button
                className={`landing-cad-toggle ${activeModel === 'robot' ? 'active' : ''}`}
                onClick={() => setActiveModel('robot')}
              >
                [SYS_02: MAIN_ROBOT]
              </button>
            </div>

            <Canvas camera={{ position: [0, 2, 8], fov: 45 }} style={{ background: '#0a0a0a' }}>
              <Suspense fallback={null}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 10]} intensity={1} />
                <ModelRenderer modelType={activeModel} />
                <OrbitControls enableZoom={false} enablePan={false} />
              </Suspense>
            </Canvas>

            <div className="landing-cad-ch landing-cad-ch-tl"><div className="landing-ch-h" /><div className="landing-ch-v" /></div>
            <div className="landing-cad-ch landing-cad-ch-tr"><div className="landing-ch-h" /><div className="landing-ch-v" /></div>
            <div className="landing-cad-ch landing-cad-ch-bl"><div className="landing-ch-h" /><div className="landing-ch-v" /></div>
            <div className="landing-cad-ch landing-cad-ch-br"><div className="landing-ch-h" /><div className="landing-ch-v" /></div>

            <div className="landing-cad-telemetry">
              <span>ROTATION_SYNC: ACTIVE</span>
              <span>POLYGONS: OPTIMIZED</span>
              <span>SCALE: 1:1</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const MediaCenterUplink = () => (
  <div className="landing-media-section">
    <div className="landing-media-header">
      <span className="landing-mono-label">MEDIA_CENTER // SOCIAL_TELEMETRY_UPLINK</span>
    </div>
    <div className="landing-media-grid">
      <div className="landing-media-col">
        <div className="landing-media-video-wrapper">
          <iframe
            src="https://www.youtube.com/embed/videoseries?list=UUYOURCHANNELID"
            title="YouTube Channel"
            className="landing-media-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
      <div className="landing-media-col">
        <a href="https://www.instagram.com/tink.ethix/" target="_blank" rel="noopener noreferrer" className="landing-ig-card">
          <div className="landing-ig-header">
            <span className="landing-ig-title">INSTAGRAM GATEWAY</span>
            <span className="landing-ig-status">LIVE_LINK</span>
          </div>
          <div className="landing-ig-body">
            <div className="landing-ig-grid">
              <div className="landing-ig-placeholder" />
              <div className="landing-ig-placeholder" />
              <div className="landing-ig-placeholder" />
              <div className="landing-ig-placeholder" />
            </div>
            <p className="landing-ig-desc">Access official feed mapping recent activity, behind-the-scenes footage, and technical logs.</p>
          </div>
          <div className="landing-ig-footer">
            <span>[UPLINK_TO_INSTAGRAM]</span>
          </div>
        </a>
      </div>
    </div>
  </div>
);
// ═══════════════════════════════════════════════════════════════════
// LANDING PAGE COMPONENT (self-contained, no dossier styles)
// ═══════════════════════════════════════════════════════════════════

interface LandingPageProps {
  onNavigateTeam: () => void;
}

const LandingPage = ({ onNavigateTeam }: LandingPageProps) => (
  <div className="landing-root">
    {/* Fixed ambient background — pointer-events: none */}
    <div className="landing-ambient" aria-hidden="true">
      <RoboticsSchematics />
      <LandingGhostMatrix />
    </div>

    {/* Foreground: UI Flow */}
    <div className="landing-fg">
      <HeroIntro onNavigateTeam={onNavigateTeam} />
      <div className="landing-extra">
        <ChroniclesAndCadShowcase />
        <SpaceSimulator />
        <DepartmentNodeMatrix />
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// TEAM DOSSIER WRAPPER (fully self-contained, no landing styles)
// ═══════════════════════════════════════════════════════════════════

interface TeamDossierProps {
  onBack: () => void;
}

const TeamDossier = ({ onBack }: TeamDossierProps) => (
  // AgentUI is the full dossier system. It imports App.css internally.
  // This wrapper adds no DOM of its own — it is purely a routing boundary.
  <AgentUI onBack={onBack} />
);

// ═══════════════════════════════════════════════════════════════════
// ROOT ROUTER
// ═══════════════════════════════════════════════════════════════════

type AppView = 'booting' | 'landing' | 'team';

export default function App() {
  const [view, setView] = useState<AppView>('booting');

  return (
    // Bare fragment — no wrapper div so neither page's CSS bleeds upward
    <AnimatePresence mode="wait">
      {view === 'booting' && (
        <motion.div
          key="boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 9999 }}
        >
          <BootLoader onComplete={() => setView('landing')} />
        </motion.div>
      )}

      {view === 'landing' && (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <LandingPage onNavigateTeam={() => setView('team')} />
        </motion.div>
      )}

      {view === 'team' && (
        <motion.div
          key="team"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <TeamDossier onBack={() => setView('landing')} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
