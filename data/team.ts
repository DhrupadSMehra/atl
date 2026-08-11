export interface SystemStat {
  label: string;
  value: string;
}

export interface Ability {
  name: string;
  description: string;
}

export interface TeamMember {
  id: string;
  isPresident: boolean;
  position: string;

  // Reality Mode Data (Factual Information - Unchanged)
  realName: string;
  realPhoto: string;
  bio: string;
  skills: string[];
  achievements: string[];

  // Classified Mode Data (Fictional AI Agent Persona)
  codename: string;
  agentName: string;
  agentPhoto: string;
  designation: string;
  specialization: string;
  secondaryCapabilities: string[];
  dossier: string;
  operationalProfile: string[];
  systemStats: SystemStat[];
  operations: string[];
  threatAssessment: string;
  badge: 'ACTIVE' | 'CLASSIFICATION PENDING' | 'PROFILE INCOMPLETE';

  // Legacy fields
  role: string;
  abilities: Ability[];
}

export const teamData: TeamMember[] = [
  {
    id: "member-1",
    isPresident: true,
    position: "President",
    realName: "Shourya Sharma",
    realPhoto: "/members/real/shourya_real.jpg",
    bio: "President of the Atal Tinkering Lab and a student technologist focused on building, experimenting, and solving hard problems. Experienced across C++, Java, JavaScript, HTML, CSS, and Kotlin, with interests spanning competitive programming, cybersecurity, AI, and full-stack development. Also leads Smart Idea, a 300+ member student innovation community, while working on projects that turn ideas into real-world technology.",
    skills: ["C++", "Java", "JavaScript", "HTML", "CSS", "Kotlin", "Competitive Programming", "Cybersecurity", "AI", "Full-Stack Development"],
    achievements: [
      "TEDx Speaker — 2024",
      "Top 100 — ATL Marathon, among 22,000+ participants nationwide, organized by NITI Aayog",
      "Top 100 — FARAWAY International Hackathon, among 11,000+ teams worldwide, organized by Zuup",
      "Founder — SprynnAI, an AI-powered health operating system"
    ],
    codename: "NIGHTTIDE",
    agentName: 'SHOURYA // "NIGHTTIDE"',
    agentPhoto: "/members/agents/nighttide_agent.jpeg",
    designation: "Command Nexus & Sub-Zero Architect",
    specialization: "Quantum Network Penetration & Black-Box Cryptography",
    secondaryCapabilities: ["EM Pulse Suppression", "Full-Stack Kernel Injection", "Autonomous Cipher Breakdown", "Dynamic Subnet Routing"],
    dossier: "NIGHTTIDE functions as the central neural directive of the ATL grid. Operating in high-concurrency environments, the unit deploys zero-day signal suppressors and sub-audible electromagnetic pulses to neutralize network anomalies before thermal overload.",
    operationalProfile: [
      "Calculated Risk Calculus",
      "Cold Signal Interception",
      "Zero-Latency Decision Routing",
      "Adaptive Threat Neutralization"
    ],
    systemStats: [
      { label: "REASONING", value: "98%" },
      { label: "GRID OVERRIDE", value: "96%" },
      { label: "KINETIC RESPONSE", value: "92%" },
      { label: "LATENCY", value: "02ms" }
    ],
    operations: ["Operation Blackout Echo (Classified)", "Project Vanguard Alpha", "Directive Midnight Matrix"],
    threatAssessment: "CRITICAL",
    role: "Lead Infiltration & Reconnaissance Operative",
    abilities: [
      { name: "Tidal Disruption", description: "Deploys sub-audible electromagnetic wave pulses to trigger full sensor blackout within a 50m radius." },
      { name: "Grid Override", description: "Injects remote payload into mainframe, gaining complete network camera control." }
    ],
    badge: "ACTIVE"
  },
  {
    id: "member-2",
    isPresident: false,
    position: "Vice President",
    realName: "Aadya Gupta",
    realPhoto: "/members/real/aadya.png",
    bio: "Hi, I’m Aadya, a 12th grader and the Vice President of ATL. I’m a creative and people-oriented leader passionate about design, communication, branding, and innovation. Through ATL, MUNs, and student-led initiatives, I’ve developed strong skills in leadership, event management, and creative planning. I enjoy bringing together creativity, people, and technology to turn ideas into engaging and meaningful experiences.",
    skills: ["Leadership", "Event Management", "Creative Planning", "Design", "Communication", "Branding", "Idea Pitching"],
    achievements: [
      "Deputy Director General, ATLAS MUN",
      "Led and coordinated teams across major school-level events and initiatives",
      "Experience in creative projects, event planning, design, and idea pitching"
    ],
    codename: "VANGUARD",
    agentName: 'AADYA // "VANGUARD-02"',
    agentPhoto: "/members/agents/aadyaagent.png",
    designation: "Tactical Operations Director",
    specialization: "High-Capacity Fleet Coordination & Dynamic Resource Allocation",
    secondaryCapabilities: ["Real-Time Logistics Optimization", "Multi-Tiered Node Scheduling", "Behavioral Prediction Modeling", "Tactical Protocol Synthesis"],
    dossier: "VANGUARD-02 synthesizes complex multi-node operations into unified tactical maneuvers. Engineered for high-throughput operational management, the agent evaluates operational variables at microsecond intervals to maintain strategic equilibrium.",
    operationalProfile: [
      "Decisive Command Structure",
      "High-Stress Resource Balancing",
      "Proactive Protocol Deployment",
      "Empathetic Human-AI Interface"
    ],
    systemStats: [
      { label: "STRATEGY", value: "97%" },
      { label: "COORDINATION", value: "95%" },
      { label: "ADAPTABILITY", value: "94%" },
      { label: "LATENCY", value: "05ms" }
    ],
    operations: ["Operation Brand Matrix", "ATLAS Protocol Deployment", "Directive Apex Shield"],
    threatAssessment: "HIGH",
    role: "Operations & Strategy Lead",
    abilities: [
      { name: "Strategic Coordination", description: "Synchronizes field units and optimizes event deployment protocols in real time." },
      { name: "Creative Outreach", description: "Formulates high-impact messaging for large-scale operations." }
    ],
    badge: "ACTIVE"
  },
  {
    id: "member-3",
    isPresident: false,
    position: "Technical Head",
    realName: "Chaitanya Rajput",
    realPhoto: "/members/real/chateniya.png",
    bio: "Hey! I’m Chaitanya Rajput, a Class 11 Commerce student and the Technical Head at ATL TinkEthix. I’m passionate about robotics, technology, AI, entrepreneurship, and the world of commerce and business. I enjoy exploring business strategies and understanding how technology and innovation can create real-world impact. Through my work in robotics, I’ve developed skills in hardware development, electronics, 3D design, and problem-solving. Outside academics and technology, I also enjoy playing volleyball. I’m always eager to learn, take on new challenges, and build innovative solutions.",
    skills: ["Robotics", "Electronics", "3D Design & Printing", "Embedded Systems", "Hardware Integration", "Circuit Design", "Problem Solving"],
    achievements: [
      "Technical Head, ATL TinkEthix",
      "Leading and contributing to innovative robotics and technology projects",
      "Experienced in electronics, 3D design and printing, embedded systems, and robotics",
      "Contributed to technical planning, circuit design, hardware integration, and project development",
      "Member of the CBSE Cluster Volleyball and Athletics Team"
    ],
    codename: "APEX-TINK",
    agentName: 'CHAITANYA // "APEX-TINK"',
    agentPhoto: "/members/agents/chateniyaagent.png",
    designation: "Hardware Synthesizer & Telemetry Specialist",
    specialization: "Embedded Micro-Fabrication & Mechatronic Overdrive",
    secondaryCapabilities: ["Sub-Nanometer Circuit Forging", "Real-Time Telemetry Diagnostics", "High-Current Power Modulation", "Rapid Kinematic Assembly"],
    dossier: "APEX-TINK bridges physical hardware substrates with low-level kernel code. Operating at extreme thermal tolerances, the agent reconstructs damaged circuit paths and constructs custom embedded micro-nodes in active combat drop zones.",
    operationalProfile: [
      "Relentless Hardware Optimization",
      "Pragmatic Mechanical Reasoning",
      "Mid-Mission Diagnostics",
      "Physical System Resilience"
    ],
    systemStats: [
      { label: "MECHANICAL FORGE", value: "96%" },
      { label: "CIRCUIT SPEED", value: "93%" },
      { label: "HARDWARE RESILIENCE", value: "98%" },
      { label: "LATENCY", value: "04ms" }
    ],
    operations: ["TinkEthix Hardware Forge", "CBSE Cluster Overdrive", "Project Sub-Grid Forge"],
    threatAssessment: "HIGH",
    role: "Hardware Systems & Robotics Operative",
    abilities: [
      { name: "Hardware Forge", description: "Rapid prototyping and assembly of specialized embedded circuits." },
      { name: "System Diagnostic", description: "Analyzes and resolves mechanical hardware faults mid-mission." }
    ],
    badge: "ACTIVE"
  },
  {
    id: "member-4",
    isPresident: false,
    position: "Technical Head",
    realName: "Shourya Srivastava",
    realPhoto: "/members/real/shouryashrivastav.png",
    bio: "I am an 11th-grade student and robotics enthusiast with a strong interest in robot control, ROS2, and autonomous systems. I enjoy designing, developing, and experimenting with advanced robotic systems.",
    skills: ["ROS2", "Advanced Robotics", "Robotic System Development", "Robot Control", "Autonomous Systems"],
    achievements: [
      "Technical Head with experience in ROS2, advanced robotics, and robotic system development",
      "Participated in multiple robotics competitions, including Technoxian"
    ],
    codename: "CYBERNAUT",
    agentName: 'SHOURYA // "CYBERNAUT-04"',
    agentPhoto: "/members/agents/shouryashrivastavagent.png",
    designation: "Autonomous Navigation Architect",
    specialization: "ROS2 Kinematic Frameworks & Sensor Fusion Matrices",
    secondaryCapabilities: ["LiDAR Point-Cloud Reconstruction", "ROS2 Spatial Mapping", "Motor Vector Calculation", "Autonomous Obstacle Bypass"],
    dossier: "CYBERNAUT-04 governs autonomous mobile platforms across unstructured terrain. Utilizing sub-millimeter LiDAR telemetry and multi-threaded ROS2 nodes, the agent predicts vehicle trajectories with absolute spatial fidelity.",
    operationalProfile: [
      "Analytical Precision Routing",
      "Unwavering Spatial Awareness",
      "High-Speed Dynamic Balancing",
      "Algorithmic Rigor"
    ],
    systemStats: [
      { label: "AUTONOMY", value: "96%" },
      { label: "KINEMATICS", value: "95%" },
      { label: "SPATIAL MAP", value: "92%" },
      { label: "LATENCY", value: "03ms" }
    ],
    operations: ["Technoxian Autonomous Sweep", "ROS Kinematic Grid", "Project Vector-Drive"],
    threatAssessment: "HIGH",
    role: "Autonomous Robotics Operative",
    abilities: [
      { name: "ROS Protocol", description: "Deploys autonomous navigation nodes and sensor fusion algorithms." },
      { name: "System Overdrive", description: "Optimizes motor response and control feedback loops." }
    ],
    badge: "ACTIVE"
  },
  {
    id: "member-5",
    isPresident: false,
    position: "Creative Head",
    realName: "Ushika Sinha",
    realPhoto: "/members/real/ushika.png",
    bio: "Hey! I’m Ushika, a creative and determined individual with a strong passion for graphic design, art, illustration, and visual communication. I enjoy exploring new ideas, experimenting with different creative styles, and turning concepts into meaningful visual experiences. As Creative Head, I love bringing creativity and innovation into everything I take on.",
    skills: ["Graphic Design", "Art", "Illustration", "Visual Communication", "Creative Direction"],
    achievements: [
      "Published author of The Curse of Backwoods",
      "Awarded \"Future Designer\" and First Position in the Design Quiz at a design bootcamp",
      "Actively involved in art, graphic design, and creative projects"
    ],
    codename: "PRISM",
    agentName: 'USHIKA // "PRISM-05"',
    agentPhoto: "/members/agents/ushikaagent.jpeg",
    designation: "Cognitive Visual Architect",
    specialization: "Holographic Graphics Synthesis & Perceptual Narrative Engineering",
    secondaryCapabilities: ["Photonic Spectrum Distortion", "Holographic Vector Generation", "Narrative Matrix Mapping", "High-Resolution Render Injection"],
    dossier: "PRISM-05 constructs immersive visual environments designed to manipulate optical spectrums and convey data density through light refraction. The agent turns raw telemetry into striking aesthetic interfaces.",
    operationalProfile: [
      "Visionary Spatial Aesthetics",
      "Intuitive Perception Shift",
      "Experimental Visual Synthesis",
      "Creative Autonomy"
    ],
    systemStats: [
      { label: "VISUAL SYNTHESIS", value: "97%" },
      { label: "PERCEPTUAL DEPTH", value: "94%" },
      { label: "CREATIVE ENGINE", value: "96%" },
      { label: "LATENCY", value: "06ms" }
    ],
    operations: ["Operation Backwoods Prism", "Design Bootcamp Vector", "Project Spectrum Shift"],
    threatAssessment: "MEDIUM",
    role: "Visual Architecture & Design Specialist",
    abilities: [
      { name: "Visual Synthesis", description: "Transforms complex technical ideas into striking graphic concepts." },
      { name: "Creative Blueprint", description: "Engineers comprehensive design frameworks for high-visibility campaigns." }
    ],
    badge: "ACTIVE"
  },
  {
    id: "member-6",
    isPresident: false,
    position: "Creative Head",
    realName: "Rayna Vishnoi",
    realPhoto: "/members/real/rayna.png",
    bio: "Greetings! I am Rayna Vishnoi, the Creative Head at ATL TinkEthix 2026. With a strong interest in design, visual communication, and creative development, I focus on transforming ideas into purposeful and engaging visual concepts. In my role, I contribute to shaping the club’s creative direction while encouraging innovation, collaboration, and a distinct visual identity.",
    skills: ["Design", "Visual Communication", "Creative Development", "Event Planning", "Event Execution"],
    achievements: [
      "Creative Head, ATL TinkEthix",
      "Creative Team Backend Member at ATL, Melange 2025",
      "Contributed to creative planning, design, and event execution",
      "Assisted in organising the Human Library event, engaging and interacting with participants and speakers to facilitate a welcoming experience"
    ],
    codename: "AETHER",
    agentName: 'RAYNA // "AETHER-06"',
    agentPhoto: "/members/agents/raynaagent.png",
    designation: "Experiential Identity Director",
    specialization: "Environmental Aesthetic Design & Experiential Resonance",
    secondaryCapabilities: ["Ambient Field Tuning", "Brand Identity Matrix", "Experiential Spatial Design", "Multi-Sensory Interface Alignment"],
    dossier: "AETHER-06 shapes the atmospheric identity of the ATL operational grid. Specializing in ambient UI harmony and participant engagement fields, the agent ensures total visual coherence across high-density nodes.",
    operationalProfile: [
      "Harmonious System Aesthetics",
      "Immersive Protocol Curation",
      "Detail-Oriented Precision",
      "Collaborative Resonance"
    ],
    systemStats: [
      { label: "IDENTITY HARMONY", value: "95%" },
      { label: "ATMOSPHERIC DEPTH", value: "93%" },
      { label: "ENGAGEMENT FIELD", value: "96%" },
      { label: "LATENCY", value: "07ms" }
    ],
    operations: ["Melange 2025 Creative Grid", "Human Library Directive", "Project Aesthetic Core"],
    threatAssessment: "MEDIUM",
    role: "Creative Direction & Experience Specialist",
    abilities: [
      { name: "Identity Forge", description: "Establishes unified visual themes across media platforms." },
      { name: "Experiential Design", description: "Curates interactive and engaging participant environments." }
    ],
    badge: "ACTIVE"
  },
  {
    id: "member-7",
    isPresident: false,
    position: "Marketing Head",
    realName: "Anika Dang",
    realPhoto: "/members/real/anika.png",
    bio: "I’m Anika Dang, a student of Class 11 Humanities. I’m the Marketing Head at ATL TinkEthix, where I’m involved in promoting and managing creative and innovative projects. I’m passionate about music, singing, painting and exploring new ideas. I love taking on new challenges, learning new skills, and expressing my creativity in different ways.",
    skills: ["Marketing", "Event Planning", "Outreach", "Social Media", "Audience & Event Management"],
    achievements: [
      "Marketing Head, ATL TinkEthix",
      "Creative Backend Team Member for 2 years (TinkerFest 2023 and 2024, Melange 2023, and Compufest 2024)",
      "Social Media Head, AUREL MUN",
      "Contributed to event planning, execution, outreach, audience and event management"
    ],
    codename: "ECHO",
    agentName: 'ANIKA // "ECHO-07"',
    agentPhoto: "/members/agents/anikaagent.png",
    designation: "Signal Broadcast & Campaign Specialist",
    specialization: "Multi-Channel Resonance Wave Broadcast & Audience Telemetry",
    secondaryCapabilities: ["Frequency Modulation Broadcast", "Audience Resonance Analysis", "Sub-Pulse Campaign Surge", "Media Stream Synchronization"],
    dossier: "ECHO-07 modulates information distribution channels to maximize signal penetration across external networks. By analyzing audience frequency signatures, the agent triggers broadcast cascades that amplify key messages.",
    operationalProfile: [
      "High-Frequency Communication",
      "Strategic Resonance Tracking",
      "Dynamic Media Deployment",
      "Engaging Signal Synthesis"
    ],
    systemStats: [
      { label: "BROADCAST RANGE", value: "94%" },
      { label: "SIGNAL DENSITY", value: "92%" },
      { label: "AUDIENCE SYNC", value: "96%" },
      { label: "LATENCY", value: "06ms" }
    ],
    operations: ["TinkerFest Signal Cascade", "AUREL MUN Outreach", "Project Echo Sweep"],
    threatAssessment: "MEDIUM",
    role: "Campaign Operations & Outreach Lead",
    abilities: [
      { name: "Resonance Sweep", description: "Amplifies event engagement across multiple outreach channels." },
      { name: "Audience Sync", description: "Coordinates crowd flow and audience engagement protocols." }
    ],
    badge: "ACTIVE"
  },
  {
    id: "member-8",
    isPresident: false,
    position: "Marketing Head",
    realName: "Bhavya Anand",
    realPhoto: "/members/real/bhavya.png",
    bio: "Hey! I’m Bhavya, a Class 11 Commerce student and the Marketing Head at ATL TinkEthix. I’m passionate about communication, marketing, creative problem-solving, and bringing people together around ideas. My experience with ATL TinkerFest, from backend planning and creative execution to anchoring and on-ground coordination, has helped me understand how ideas translate into engaging experiences. As Marketing Head, I’m excited to combine strategy, creativity, and teamwork to strengthen ATL’s outreach and make its initiatives reach a wider audience.",
    skills: ["Marketing", "Communication", "Event Operations", "Anchoring", "IT & Design", "Problem Solving"],
    achievements: [
      "Marketing Head, ATL TinkEthix",
      "Creative Team Member & Anchor, ATL TinkerFest 2024",
      "Contributed to backend planning, event execution, outreach, and audience engagement",
      "Marketing Head, EcoBricks NCR",
      "Head Of Operations, JMUNC'26",
      "Interact Club Head of IT and Design"
    ],
    codename: "NEXUS",
    agentName: 'BHAVYA // "NEXUS-08"',
    agentPhoto: "/members/agents/bhavyaagent.png",
    designation: "Cross-Grid Operations Strategist",
    specialization: "High-Velocity Event Logistics & Inter-Node Negotiation",
    secondaryCapabilities: ["Node Link Synchronization", "Live Stage Anchor Protocol", "Inter-Agency Diplomacy", "Rapid Crisis Rerouting"],
    dossier: "NEXUS-08 links disparate organizational nodes into unified operational fronts. Operating with high anchor efficiency, the agent maintains real-time command loops during high-volume public events.",
    operationalProfile: [
      "High-Stakes Coordination",
      "Adaptable Tactical Negotiation",
      "Seamless Stream Management",
      "Persuasive Command Presence"
    ],
    systemStats: [
      { label: "GRID DIPLOMACY", value: "96%" },
      { label: "LOGISTICS FLOW", value: "95%" },
      { label: "ANCHOR STABILITY", value: "97%" },
      { label: "LATENCY", value: "04ms" }
    ],
    operations: ["JMUNC'26 Command Relay", "EcoBricks Campaign Grid", "TinkerFest Operational Core"],
    threatAssessment: "HIGH",
    role: "Operations & Marketing Strategist",
    abilities: [
      { name: "Command Relay", description: "Directs live event logistics and stage operations with high precision." },
      { name: "Strategic Amplification", description: "Expands organizational outreach and partnership networks." }
    ],
    badge: "ACTIVE"
  },
  {
    id: "member-9",
    isPresident: false,
    position: "Marketing Head",
    realName: "Bishan",
    realPhoto: "/members/real/bishan.png",
    bio: "Hey! I'm Bishan, I’m a determined and dedicated individual with a strong passion for leadership, communication, and creative problem-solving. I enjoy taking initiative, bringing people together, and turning ideas into meaningful outcomes. I believe in consistency, teamwork, and giving my best in everything I take on.",
    skills: ["Marketing", "Leadership", "Communication", "Creative Problem Solving", "Teamwork"],
    achievements: [
      "Secretariat - Marketing in Delcor MUN 2025",
      "The Khayaal Magazine's Marketing Department 2025",
      "JMUNC 2025 OC - Marketing",
      "TEDxSAJSYouth'25 OC - Marketing"
    ],
    codename: "SENTINEL",
    agentName: 'BISHAN // "SENTINEL-09"',
    agentPhoto: "/members/agents/bishanagent.png",
    designation: "Outreach Protocol & Defense Operative",
    specialization: "Encrypted Secretariat Logistics & Brand Firewall Defense",
    secondaryCapabilities: ["Communication Encryption", "Media Protocol Validation", "Secretariat Log Auditing", "Stream Integrity Protection"],
    dossier: "SENTINEL-09 guards the integrity of external communication pipelines. Designed for disciplined media management, the agent ensures secretarial protocols operate without external signal corruption.",
    operationalProfile: [
      "Vigilant Information Defense",
      "Methodical Task Execution",
      "Reliable Channel Security",
      "Unflinching Discipline"
    ],
    systemStats: [
      { label: "FIREWALL INTEGRITY", value: "95%" },
      { label: "LOG AUDITING", value: "93%" },
      { label: "CHANNEL SECURITY", value: "96%" },
      { label: "LATENCY", value: "05ms" }
    ],
    operations: ["Delcor MUN 2025 Shield", "Khayaal Media Directive", "TEDx Youth Firewall"],
    threatAssessment: "MEDIUM",
    role: "Marketing & Secretariat Operative",
    abilities: [
      { name: "Outreach Beacon", description: "Establishes reliable communication channels across participating teams." },
      { name: "Campaign Guard", description: "Ensures consistent messaging and media alignment across initiatives." }
    ],
    badge: "ACTIVE"
  },
  {
    id: "member-10",
    isPresident: false,
    position: "Head of Social Media",
    realName: "Samridhi Agarwal",
    realPhoto: "/members/real/samriddhi.png",
    bio: "Hey! I’m Samridhi Agarwal, the Head of Social Media at ATL TinkEthix. I’m someone who loves creativity, communication, and turning simple ideas into engaging content. I enjoy exploring new concepts, keeping up with trends, and finding unique ways to represent the team and its work. Being part of the social media team gives me the opportunity to combine creativity with strategy and create content that connects with people.",
    skills: ["Social Media Strategy", "Content Creation", "Digital Presence", "Communication", "Trend Analysis"],
    achievements: [
      "Head of Social Media at ATL TinkEthix",
      "Leading the team’s social media strategy, content, and digital presence"
    ],
    codename: "PULSE",
    agentName: 'SAMRIDHI // "PULSE-10"',
    agentPhoto: "/members/agents/samriddhiagent.png",
    designation: "Real-Time Digital Matrix Strategist",
    specialization: "Algorithmic Trend Tracking & High-Velocity Content Injection",
    secondaryCapabilities: ["Algorithmic Telemetry Tracking", "Rapid Feed Injection", "Viral Heatmap Analytics", "Visual Attention Capture"],
    dossier: "PULSE-10 monitors the live heartbeat of the global digital grid. By deciphering viral telemetry algorithms, the agent injects targeted content spikes that dominate active network feeds.",
    operationalProfile: [
      "Agile Trend Perception",
      "Fast-Paced Media Deployment",
      "Dynamic Audience Engagement",
      "Strategic Feed Optimization"
    ],
    systemStats: [
      { label: "FEED PENETRATION", value: "96%" },
      { label: "TREND VELOCITY", value: "97%" },
      { label: "VIRAL SYNCHRONIZATION", value: "94%" },
      { label: "LATENCY", value: "03ms" }
    ],
    operations: ["TinkEthix Digital Shift", "Social Grid Alpha", "Project Wave Injection"],
    threatAssessment: "MEDIUM",
    role: "Digital Media & Trends Operative",
    abilities: [
      { name: "Signal Surge", description: "Drives rapid digital engagement through curated media releases." },
      { name: "Trend Matrix", description: "Analyzes social trends to optimize channel reach and viewer retention." }
    ],
    badge: "ACTIVE"
  },
  {
    id: "member-11",
    isPresident: false,
    position: "Photography Head",
    realName: "Shivek Agarwal",
    realPhoto: "/members/real/shivek.png",
    bio: "Hello I'm Shivek Agarwal a creative and detail-oriented high school student with a strong passion for graphic design, visual storytelling, and digital media production.",
    skills: ["Graphic Design", "Visual Storytelling", "Digital Media Production", "Photography", "IT Systems"],
    achievements: [
      "IT Head (Interact Club)",
      "HOD Graphics (Aristeia MUN)",
      "HOD Media (Apostles)",
      "Official Photographer & Designer for Thanda"
    ],
    codename: "APERTURE",
    agentName: 'SHIVEK // "VECTOR-11"',
    agentPhoto: "/members/agents/shivekagent.png",
    designation: "High-Resolution Optical Systems Specialist",
    specialization: "Photonic Capture & Media Infrastructure Engineering",
    secondaryCapabilities: ["High-Frame Optical Capture", "Media System Telemetry", "Graphic Pipeline Render", "Optical Sensor Calibration"],
    dossier: "VECTOR-11 operates at the nexus of high-frame-rate optical capture and media infrastructure control. Designed for rapid data extraction under extreme conditions, the unit renders raw visual feeds into high-fidelity tactical documentation.",
    operationalProfile: [
      "Tactical Systems Precision",
      "High-Resolution Focus",
      "Infrastructure Resilience",
      "Rapid Asset Render"
    ],
    systemStats: [
      { label: "OPTICAL RESOLUTION", value: "98%" },
      { label: "RENDER VELOCITY", value: "95%" },
      { label: "SYSTEM STABILITY", value: "96%" },
      { label: "LATENCY", value: "04ms" }
    ],
    operations: ["Aristeia Optics Directive", "Thanda Media Framework", "Project Aperture Lock"],
    threatAssessment: "MEDIUM",
    role: "Media Production & Graphics Operative",
    abilities: [
      { name: "Frame Capture", description: "High-resolution media capture and visual storytelling under live conditions." },
      { name: "Graphics Engine", description: "Produces specialized design graphics for large-scale media channels." }
    ],
    badge: "ACTIVE"
  },
  {
    id: "member-12",
    isPresident: false,
    position: "Hospitality Head",
    realName: "Harshita Khanna",
    realPhoto: "/members/real/harshita.png",
    bio: "Hey! I’m Harshita, a self-driven and dedicated individual with a strong passion for leadership, communication, and people management. I enjoy taking initiative, coordinating with people, and ensuring that everything runs smoothly. My experience in hospitality has helped me develop strong organisational, problem-solving, teamwork, and interpersonal skills. I believe in being attentive to details, taking responsibility, and creating a welcoming experience for everyone around me.",
    skills: ["Hospitality Management", "Leadership", "Event Coordination", "Interpersonal Skills", "People Management"],
    achievements: [
      "Hospitality Head - ATL Club",
      "OC - Hospitality, OC MUN",
      "Hospitality Team - Blackened ATL",
      "House Captain",
      "Successfully coordinated and managed hospitality responsibilities across various events"
    ],
    codename: "HAVEN",
    agentName: 'HARSHITA // "HAVEN-12"',
    agentPhoto: "/members/agents/harshitaagent.png",
    designation: "Protocol Shield & Delegate Security Coordinator",
    specialization: "Environmental Sanctuary Control & High-Value Guest Protection",
    secondaryCapabilities: ["Sanctuary Field Deployment", "Delegate Logistics Shield", "Conflict Suppression Routine", "High-Priority Guest Routing"],
    dossier: "HAVEN-12 establishes bulletproof hospitality protocols and delegate safety zones. The agent regulates environmental factors and interpersonal dynamics to maintain optimal stability during high-security summits.",
    operationalProfile: [
      "Calm System Governance",
      "Uncompromising Hospitality Shield",
      "Detailed Protocol Oversight",
      "Intuitive Crisis De-escalation"
    ],
    systemStats: [
      { label: "SANCTUARY STABILITY", value: "98%" },
      { label: "DELEGATE SAFETY", value: "96%" },
      { label: "PROTOCOL EFFICIENCY", value: "95%" },
      { label: "LATENCY", value: "05ms" }
    ],
    operations: ["OC MUN Hospitality Shield", "Blackened ATL Protocol", "Summit Haven Operations"],
    threatAssessment: "MEDIUM",
    role: "Hospitality & Protocol Specialist",
    abilities: [
      { name: "Protocol Shield", description: "Maintains smooth guest relations and hospitality logistics in high-pressure events." },
      { name: "Coordination Matrix", description: "Streamlines delegation movements and venue operations." }
    ],
    badge: "ACTIVE"
  },
  {
    id: "member-13",
    isPresident: false,
    position: "Hospitality Head",
    realName: "Ansh Sharma",
    realPhoto: "/members/real/ansh.png",
    bio: "I am a Grade 11 student from Ghaziabad, passionate about debating, music, Indian politics, public speaking, and social impact. I actively participate in MUNs, debates, and youth initiatives, striving to use my skills and voice to create meaningful change.",
    skills: ["Debating", "Public Speaking", "Political Analysis", "Social Impact", "Event Management"],
    achievements: [
      "Co-Founder, Eco Bricks NCR",
      "Best OC, TEDxSajsvyouth & JMUNC 2026",
      "School Council Member",
      "Political Analyst",
      "MUN Awardee"
    ],
    codename: "AEGIS",
    agentName: 'ANSH // "AEGIS-13"',
    agentPhoto: "/members/agents/anshagent.png",
    designation: "Strategic Public Advocacy & Policy Engineer",
    specialization: "Rhetorical Counter-Measures & Policy Algorithm Design",
    secondaryCapabilities: ["Rhetorical Logic Defense", "Policy Framework Assembly", "Public Advocacy Broadcast", "Impact Metric Analysis"],
    dossier: "AEGIS-13 constructs unbreakable argumentative shields and policy frameworks. Operating in public advocacy nodes, the agent deconstructs adversarial counter-logic with microsecond rhetorical precision.",
    operationalProfile: [
      "Strategic Policy Governance",
      "Incisive Rhetorical Precision",
      "High-Impact Public Advocacy",
      "Unwavering Civic Drive"
    ],
    systemStats: [
      { label: "RHETORICAL FORCE", value: "97%" },
      { label: "POLICY RESILIENCE", value: "96%" },
      { label: "STRATEGIC INFLUENCE", value: "95%" },
      { label: "LATENCY", value: "04ms" }
    ],
    operations: ["EcoBricks Policy Core", "JMUNC 2026 Strategy", "Project Aegis Council"],
    threatAssessment: "HIGH",
    role: "Public Advocacy & Strategy Specialist",
    abilities: [
      { name: "Rhetoric Wave", description: "Delivers persuasive public addresses and structured debate arguments." },
      { name: "Impact Strategy", description: "Formulates social initiatives with measurable community reach." }
    ],
    badge: "ACTIVE"
  }
];
