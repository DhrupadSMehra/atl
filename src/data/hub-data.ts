// hub-data.ts — TinkerThix Hub Static Data Layer

export interface Project {
  id: string;
  codename: string;
  subsystem: string;
  stability: 'OPTIMAL' | 'NOMINAL' | 'DEGRADED' | 'EXPERIMENTAL';
  framework: string;
  telemetry: string;
  status: 'ACTIVE' | 'STAGING' | 'ARCHIVED';
  description: string;
  tags: string[];
  buildPct: number;
}

export interface Event {
  id: string;
  date: string;
  epoch: string;
  title: string;
  type: 'HACKATHON' | 'SUMMIT' | 'COMPETITION' | 'BENCHMARK' | 'DEPLOYMENT';
  location: string;
  outcome: string;
  isPast: boolean;
}

export interface Department {
  id: string;
  designation: string;
  codename: string;
  lead: string;
  systems: string[];
  activeNodes: number;
  description: string;
  detailedDescription?: string;
  icon: string;
}

export const projectsData: Project[] = [
  {
    id: 'proj-001',
    codename: 'HEXAPOD-ALPHA',
    subsystem: 'KINETICS',
    stability: 'OPTIMAL',
    framework: 'ROS 2 Humble + OpenCV 4.8',
    telemetry: 'TORQUE: 4.7Nm | FREQ: 120Hz',
    status: 'ACTIVE',
    description: 'Six-legged terrain-adaptive locomotion platform using inverse kinematics and dynamic gait switching for unstructured environments.',
    tags: ['IK Solver', 'Servo Grid', 'IMU Fusion'],
    buildPct: 87,
  },
  {
    id: 'proj-002',
    codename: 'NEURAL-NAV-v3',
    subsystem: 'AUTONOMY',
    stability: 'NOMINAL',
    framework: 'PyTorch 2.1 + SLAM',
    telemetry: 'LOSS: 0.024 | ACC: 97.6%',
    status: 'ACTIVE',
    description: 'Deep reinforcement learning navigation stack. Trains autonomous agents on sparse reward signals using A* hybrid path planning.',
    tags: ['SLAM', 'RL Agent', 'LiDAR-RGB Fusion'],
    buildPct: 73,
  },
  {
    id: 'proj-003',
    codename: 'SPECTRA-VISION',
    subsystem: 'PERCEPTION',
    stability: 'OPTIMAL',
    framework: 'YOLOv9 + TensorRT',
    telemetry: 'mAP@50: 93.4 | FPS: 88',
    status: 'ACTIVE',
    description: 'Real-time multi-spectral object detection pipeline with embedded inference on NVIDIA Jetson Orin for field robotics.',
    tags: ['Object Det.', 'Edge AI', 'HSV Masking'],
    buildPct: 94,
  },
  {
    id: 'proj-004',
    codename: 'TITAN-ARM-MK2',
    subsystem: 'MANIPULATION',
    stability: 'EXPERIMENTAL',
    framework: 'MoveIt 2 + Gazebo',
    telemetry: 'DOF: 6 | REACH: 850mm',
    status: 'STAGING',
    description: 'Precision 6-DOF robotic arm with force-torque feedback. Target: < 0.2mm positional error for micro-assembly tasks.',
    tags: ['Force Ctrl', 'Trajectory Plan', 'CAN Bus'],
    buildPct: 41,
  },
  {
    id: 'proj-005',
    codename: 'MESH-SWARM-01',
    subsystem: 'SWARM SYS',
    stability: 'EXPERIMENTAL',
    framework: 'MAVLink + PX4',
    telemetry: 'NODES: 5 | SYNC_LAT: 12ms',
    status: 'STAGING',
    description: 'Distributed UAV swarm coordination using consensus algorithms. Each agent maintains a shared world model via mesh RF comms.',
    tags: ['Mesh RF', 'Consensus Algo', 'MAVSDK'],
    buildPct: 28,
  },
  {
    id: 'proj-006',
    codename: 'FLUX-COMPILER',
    subsystem: 'SOFTWARE',
    stability: 'NOMINAL',
    framework: 'LLVM + Rust',
    telemetry: 'BUILD: 2.4s | ERR_RATE: 0%',
    status: 'ACTIVE',
    description: 'Custom embedded systems compiler toolchain targeting bare-metal ARM microcontrollers. Zero-allocation runtime design.',
    tags: ['Compiler IR', 'LLVM Backend', 'No-std Rust'],
    buildPct: 61,
  },
];

export const eventsData: Event[] = [
  {
    id: 'evt-001',
    date: '2024 AUG 14',
    epoch: 'T-0324',
    title: 'ATL National Innovation Conclave',
    type: 'SUMMIT',
    location: 'New Delhi Science Hub',
    outcome: '1st Place — Robotics Track',
    isPast: true,
  },
  {
    id: 'evt-002',
    date: '2024 NOV 03',
    epoch: 'T-0241',
    title: 'Smart India Hackathon 2024',
    type: 'HACKATHON',
    location: 'IIT Bombay Campus',
    outcome: 'Grand Finalist — Problem Code HW284',
    isPast: true,
  },
  {
    id: 'evt-003',
    date: '2025 JAN 19',
    epoch: 'T-0166',
    title: 'WRO India Nationals Qualifier',
    type: 'COMPETITION',
    location: 'Ahmedabad Innovation District',
    outcome: 'Qualified — Top 8 Nationally',
    isPast: true,
  },
  {
    id: 'evt-004',
    date: '2025 MAR 07',
    epoch: 'T-0119',
    title: 'TinkerThix Internal Research Benchmark v1',
    type: 'BENCHMARK',
    location: 'Jaipuria ATL Lab',
    outcome: 'HEXAPOD-ALPHA: 87% Gait Efficiency',
    isPast: true,
  },
  {
    id: 'evt-005',
    date: '2025 MAY 22',
    epoch: 'T-0044',
    title: 'Youth AI & Robotics Summit — YAIRS-2025',
    type: 'SUMMIT',
    location: 'IIIT Hyderabad',
    outcome: 'Keynote Delivered — Swarm Intelligence',
    isPast: true,
  },
  {
    id: 'evt-006',
    date: '2025 JUL 18',
    epoch: 'T+033',
    title: 'TinkerThix v2.0 System Deployment',
    type: 'DEPLOYMENT',
    location: 'ATL Command Lab — Internal',
    outcome: 'SCHEDULED — MAINFRAME UPGRADE',
    isPast: false,
  },
  {
    id: 'evt-007',
    date: '2025 SEP 05',
    epoch: 'T+082',
    title: 'Robocon India 2025',
    type: 'COMPETITION',
    location: 'IIT Delhi — Sports Complex',
    outcome: 'REGISTERED — TEAM DELTA-7',
    isPast: false,
  },
  {
    id: 'evt-008',
    date: '2025 NOV 28',
    epoch: 'T+166',
    title: 'National Science Olympiad — Robotics Div.',
    type: 'COMPETITION',
    location: 'TBD — National Level',
    outcome: 'PIPELINE ACTIVE — PREP PHASE',
    isPast: false,
  },
];

export const departmentsData: Department[] = [
  {
    id: 'dept-001',
    designation: 'DIVISION-ALPHA',
    codename: 'Kinetics & Locomotion',
    lead: 'Shourya Sharma',
    systems: ['Servo Control', 'Gait Algorithms', 'IK Solvers', 'IMU Integration'],
    activeNodes: 4,
    description: 'Designs and validates all ground-contact robotic architectures. Specializes in terrain-adaptive locomotion, multi-legged systems, and precision actuator control.',
    detailedDescription: 'The Kinetics & Locomotion division is responsible for the mechanical design, kinematics simulation, and physical fabrication of mobile robotic systems. They work heavily with CAD software, finite element analysis (FEA), and advanced materials to build robust chassis. From multi-legged walkers to wheeled platforms, this team ensures hardware durability and precise physical control using custom inverse kinematics and gait generation algorithms.',
    icon: '⬡',
  },
  {
    id: 'dept-002',
    designation: 'DIVISION-BETA',
    codename: 'Autonomy & Navigation',
    lead: 'TBD',
    systems: ['ROS 2 Stack', 'SLAM Pipelines', 'Path Planning', 'Sensor Fusion'],
    activeNodes: 3,
    description: 'Develops the autonomous decision-making frameworks that enable robots to perceive and navigate complex, dynamic environments without human input.',
    detailedDescription: 'This division focuses on enabling robots to operate independently in dynamic environments. They integrate LiDAR, depth cameras, and IMUs into comprehensive SLAM (Simultaneous Localization and Mapping) pipelines. Their software stack handles real-time obstacle avoidance, path planning, and spatial reasoning, ensuring that agents can reliably traverse unknown terrains without human intervention.',
    icon: '◈',
  },
  {
    id: 'dept-003',
    designation: 'DIVISION-GAMMA',
    codename: 'Machine Intelligence',
    lead: 'TBD',
    systems: ['Deep Learning', 'Reinforcement Learning', 'NLP', 'Model Compression'],
    activeNodes: 5,
    description: 'Architects neural network models for real-world deployment. Focused on edge AI inference, low-latency inference pipelines, and autonomous learning systems.',
    detailedDescription: 'Focused on high-level cognitive functions, the Machine Intelligence division deploys state-of-the-art machine learning models directly onto edge devices. They optimize deep neural networks for visual recognition, train reinforcement learning agents for complex control tasks, and implement computer vision pipelines that allow our robots to semantically understand their surroundings.',
    icon: '⬟',
  },
  {
    id: 'dept-004',
    designation: 'DIVISION-DELTA',
    codename: 'Embedded Systems',
    lead: 'TBD',
    systems: ['Firmware Dev', 'PCB Design', 'CAN Bus', 'RTOS'],
    activeNodes: 3,
    description: 'Builds the electronic nervous system of every TinkerThix machine. From custom PCBs to bare-metal firmware, this division runs the hardware layer.',
    detailedDescription: 'The Embedded Systems team bridges the gap between software algorithms and physical hardware. They design custom printed circuit boards (PCBs), develop low-latency real-time operating system (RTOS) firmware, and implement robust communication protocols like CAN bus and SPI. Their work ensures that sensor data and actuator commands are processed with microsecond precision.',
    icon: '⬢',
  },
  {
    id: 'dept-005',
    designation: 'DIVISION-EPSILON',
    codename: 'Software Architecture',
    lead: 'TBD',
    systems: ['Systems Design', 'API Infrastructure', 'DevOps', 'Toolchains'],
    activeNodes: 2,
    description: 'Maintains the software backbone of TinkerThix operations — internal tooling, simulation environments, compilers, and the digital infrastructure layer.',
    detailedDescription: 'Responsible for the overarching digital infrastructure, this division builds and maintains the core software systems that power TinkerThix. They develop custom simulation environments, continuous integration/continuous deployment (CI/CD) pipelines for robotic code, and internal telemetry dashboards. They ensure all codebases are scalable, secure, and maintainable.',
    icon: '◇',
  },
  {
    id: 'dept-006',
    designation: 'DIVISION-ZETA',
    codename: 'Research & Documentation',
    lead: 'TBD',
    systems: ['Technical Writing', 'Research Papers', 'IP Management', 'Benchmarking'],
    activeNodes: 2,
    description: 'Converts engineering breakthroughs into publishable research, patent filings, and competitive documentation. The institutional knowledge archive of TinkerThix.',
    detailedDescription: 'The Research & Documentation division is the intellectual hub of TinkerThix. They translate engineering successes into comprehensive technical reports, white papers, and presentation materials. This team manages our institutional knowledge, oversees competitive benchmarking, and ensures our methodologies are meticulously documented for future reference and external publication.',
    icon: '▣',
  },
];
