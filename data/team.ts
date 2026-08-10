export interface Ability {
  name: string;
  description: string;
}

export interface TeamMember {
  id: string;
  isPresident: boolean;
  // Shared Metadata
  position: string;

  // Reality Mode Data (Factual Information from temporaryinfo.txt)
  realName: string;
  realPhoto: string;
  bio: string;
  skills: string[];
  achievements: string[];

  // Classified Mode Data (Thematic UI Presentation Metadata)
  codename: string;
  agentPhoto: string;
  role: string;
  dossier: string;
  abilities: Ability[];
  operations: string[];
  threatAssessment: string;
  specialization: string;
  badge: 'ACTIVE' | 'CLASSIFICATION PENDING' | 'PROFILE INCOMPLETE';
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
    codename: "Nighttide",
    agentPhoto: "/members/agents/nighttide_agent.jpeg",
    role: "Lead Infiltration & Reconnaissance Operative",
    dossier: "A ghost in the digital grid. Nighttide specializes in black-box operations, utilizing electromagnetic pulse (EMP) fields and signal-suppression protocols to disable security firewalls and extract encrypted ATL archives.",
    abilities: [
      { name: "Tidal Disruption", description: "Deploys sub-audible electromagnetic wave pulses to trigger full sensor blackout within a 50m radius." },
      { name: "Grid Override", description: "Injects remote payload into mainframe, gaining complete network camera control." }
    ],
    operations: ["Operation Stormfront (Classified)", "Operation Echo Lock (Classified)", "Project Vanguard Alpha"],
    threatAssessment: "CRITICAL",
    specialization: "Electronic Warfare",
    badge: "ACTIVE"
  },
  {
    id: "member-2",
    isPresident: false,
    position: "Vice President",
    realName: "Aadya Gupta",
    realPhoto: "/members/real/placeholder_real.jpg",
    bio: "Hi, I’m Aadya, a 12th grader and the Vice President of ATL. I’m a creative and people-oriented leader passionate about design, communication, branding, and innovation. Through ATL, MUNs, and student-led initiatives, I’ve developed strong skills in leadership, event management, and creative planning. I enjoy bringing together creativity, people, and technology to turn ideas into engaging and meaningful experiences.",
    skills: ["Leadership", "Event Management", "Creative Planning", "Design", "Communication", "Branding", "Idea Pitching"],
    achievements: [
      "Deputy Director General, ATLAS MUN",
      "Led and coordinated teams across major school-level events and initiatives",
      "Experience in creative projects, event planning, design, and idea pitching"
    ],
    codename: "Vanguard",
    agentPhoto: "/members/agents/agent-missing.png",
    role: "Operations & Strategy Lead",
    dossier: "Tactical coordinator overseeing multi-departmental operations and strategic initiatives across the command network.",
    abilities: [
      { name: "Strategic Coordination", description: "Synchronizes field units and optimizes event deployment protocols in real time." },
      { name: "Creative Outreach", description: "Formulates high-impact messaging for large-scale operations." }
    ],
    operations: ["ATLAS MUN Directives", "Operation Brand Matrix"],
    threatAssessment: "HIGH",
    specialization: "Strategic Management",
    badge: "ACTIVE"
  },
  {
    id: "member-3",
    isPresident: false,
    position: "Technical Head",
    realName: "Chaitanya Rajput",
    realPhoto: "/members/real/placeholder_real.jpg",
    bio: "Hey! I’m Chaitanya Rajput, a Class 11 Commerce student and the Technical Head at ATL TinkEthix. I’m passionate about robotics, technology, AI, entrepreneurship, and the world of commerce and business. I enjoy exploring business strategies and understanding how technology and innovation can create real-world impact. Through my work in robotics, I’ve developed skills in hardware development, electronics, 3D design, and problem-solving. Outside academics and technology, I also enjoy playing volleyball. I’m always eager to learn, take on new challenges, and build innovative solutions.",
    skills: ["Robotics", "Electronics", "3D Design & Printing", "Embedded Systems", "Hardware Integration", "Circuit Design", "Problem Solving"],
    achievements: [
      "Technical Head, ATL TinkEthix",
      "Leading and contributing to innovative robotics and technology projects",
      "Experienced in electronics, 3D design and printing, embedded systems, and robotics",
      "Contributed to technical planning, circuit design, hardware integration, and project development",
      "Member of the CBSE Cluster Volleyball and Athletics Team"
    ],
    codename: "Apex-Tink",
    agentPhoto: "/members/agents/agent-missing.png",
    role: "Hardware Systems & Robotics Operative",
    dossier: "Field technical engineer specializing in physical hardware integration, embedded telemetry, and mechanical prototyping.",
    abilities: [
      { name: "Hardware Forge", description: "Rapid prototyping and assembly of specialized embedded circuits." },
      { name: "System Diagnostic", description: "Analyzes and resolves mechanical hardware faults mid-mission." }
    ],
    operations: ["TinkEthix Hardware Deployment", "CBSE Cluster Protocol"],
    threatAssessment: "HIGH",
    specialization: "Hardware & Systems",
    badge: "ACTIVE"
  },
  {
    id: "member-4",
    isPresident: false,
    position: "Technical Head",
    realName: "Shourya Srivastava",
    realPhoto: "/members/real/placeholder_real.jpg",
    bio: "I am an 11th-grade student and robotics enthusiast with a strong interest in robot control, ROS2, and autonomous systems. I enjoy designing, developing, and experimenting with advanced robotic systems.",
    skills: ["ROS2", "Advanced Robotics", "Robotic System Development", "Robot Control", "Autonomous Systems"],
    achievements: [
      "Technical Head with experience in ROS2, advanced robotics, and robotic system development",
      "Participated in multiple robotics competitions, including Technoxian"
    ],
    codename: "Cybernaut",
    agentPhoto: "/members/agents/agent-missing.png",
    role: "Autonomous Robotics Operative",
    dossier: "Specialist in ROS2 frameworks, vehicle control algorithms, and autonomous robotics platforms.",
    abilities: [
      { name: "ROS Protocol", description: "Deploys autonomous navigation nodes and sensor fusion algorithms." },
      { name: "System Overdrive", description: "Optimizes motor response and control feedback loops." }
    ],
    operations: ["Technoxian Robotics Grid", "Project ROS-Kinematics"],
    threatAssessment: "HIGH",
    specialization: "Autonomous Systems",
    badge: "ACTIVE"
  },
  {
    id: "member-5",
    isPresident: false,
    position: "Creative Head",
    realName: "Ushika Sinha",
    realPhoto: "/members/real/placeholder_real.jpg",
    bio: "Hey! I’m Ushika, a creative and determined individual with a strong passion for graphic design, art, illustration, and visual communication. I enjoy exploring new ideas, experimenting with different creative styles, and turning concepts into meaningful visual experiences. As Creative Head, I love bringing creativity and innovation into everything I take on.",
    skills: ["Graphic Design", "Art", "Illustration", "Visual Communication", "Creative Direction"],
    achievements: [
      "Published author of The Curse of Backwoods",
      "Awarded \"Future Designer\" and First Position in the Design Quiz at a design bootcamp",
      "Actively involved in art, graphic design, and creative projects"
    ],
    codename: "Prism",
    agentPhoto: "/members/agents/agent-missing.png",
    role: "Visual Architecture & Design Specialist",
    dossier: "Creative visual architect responsible for graphic synthesis, brand narratives, and visual asset generation.",
    abilities: [
      { name: "Visual Synthesis", description: "Transforms complex technical ideas into striking graphic concepts." },
      { name: "Creative Blueprint", description: "Engineers comprehensive design frameworks for high-visibility campaigns." }
    ],
    operations: ["Operation Backwoods", "Design Bootcamp Vector"],
    threatAssessment: "MEDIUM",
    specialization: "Visual Communication",
    badge: "ACTIVE"
  },
  {
    id: "member-6",
    isPresident: false,
    position: "Creative Head",
    realName: "Rayna Vishnoi",
    realPhoto: "/members/real/placeholder_real.jpg",
    bio: "Greetings! I am Rayna Vishnoi, the Creative Head at ATL TinkEthix 2026. With a strong interest in design, visual communication, and creative development, I focus on transforming ideas into purposeful and engaging visual concepts. In my role, I contribute to shaping the club’s creative direction while encouraging innovation, collaboration, and a distinct visual identity.",
    skills: ["Design", "Visual Communication", "Creative Development", "Event Planning", "Event Execution"],
    achievements: [
      "Creative Head, ATL TinkEthix",
      "Creative Team Backend Member at ATL, Melange 2025",
      "Contributed to creative planning, design, and event execution",
      "Assisted in organising the Human Library event, engaging and interacting with participants and speakers to facilitate a welcoming experience"
    ],
    codename: "Aether",
    agentPhoto: "/members/agents/agent-missing.png",
    role: "Creative Direction & Experience Specialist",
    dossier: "Creative director focusing on visual communication, experiential events, and identity design.",
    abilities: [
      { name: "Identity Forge", description: "Establishes unified visual themes across media platforms." },
      { name: "Experiential Design", description: "Curates interactive and engaging participant environments." }
    ],
    operations: ["Melange 2025 Creative Grid", "Human Library Operation"],
    threatAssessment: "MEDIUM",
    specialization: "Creative Direction",
    badge: "ACTIVE"
  },
  {
    id: "member-7",
    isPresident: false,
    position: "Marketing Head",
    realName: "Anika Dang",
    realPhoto: "/members/real/placeholder_real.jpg",
    bio: "I’m Anika Dang, a student of Class 11 Humanities. I’m the Marketing Head at ATL TinkEthix, where I’m involved in promoting and managing creative and innovative projects. I’m passionate about music, singing, painting and exploring new ideas. I love taking on new challenges, learning new skills, and expressing my creativity in different ways.",
    skills: ["Marketing", "Event Planning", "Outreach", "Social Media", "Audience & Event Management"],
    achievements: [
      "Marketing Head, ATL TinkEthix",
      "Creative Backend Team Member for 2 years (TinkerFest 2023 and 2024, Melange 2023, and Compufest 2024)",
      "Social Media Head, AUREL MUN",
      "Contributed to event planning, execution, outreach, audience and event management"
    ],
    codename: "Echo",
    agentPhoto: "/members/agents/agent-missing.png",
    role: "Campaign Operations & Outreach Lead",
    dossier: "Strategic marketer overseeing event promotion, audience engagement, and media communications.",
    abilities: [
      { name: "Resonance Sweep", description: "Amplifies event engagement across multiple outreach channels." },
      { name: "Audience Sync", description: "Coordinates crowd flow and audience engagement protocols." }
    ],
    operations: ["TinkerFest 2023/2024", "AUREL MUN Outreach"],
    threatAssessment: "MEDIUM",
    specialization: "Media & Marketing",
    badge: "ACTIVE"
  },
  {
    id: "member-8",
    isPresident: false,
    position: "Marketing Head",
    realName: "Bhavya Anand",
    realPhoto: "/members/real/placeholder_real.jpg",
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
    codename: "Nexus",
    agentPhoto: "/members/agents/agent-missing.png",
    role: "Operations & Marketing Strategist",
    dossier: "Operations lead experienced in high-capacity event logistics, anchoring, and cross-organization campaigns.",
    abilities: [
      { name: "Command Relay", description: "Directs live event logistics and stage operations with high precision." },
      { name: "Strategic Amplification", description: "Expands organizational outreach and partnership networks." }
    ],
    operations: ["JMUNC'26 Operations", "EcoBricks NCR Campaign"],
    threatAssessment: "HIGH",
    specialization: "Campaign Operations",
    badge: "ACTIVE"
  },
  {
    id: "member-9",
    isPresident: false,
    position: "Marketing Secretariat",
    realName: "Bishan",
    realPhoto: "/members/real/placeholder_real.jpg",
    bio: "Hey! I'm Bishan, I’m a determined and dedicated individual with a strong passion for leadership, communication, and creative problem-solving. I enjoy taking initiative, bringing people together, and turning ideas into meaningful outcomes. I believe in consistency, teamwork, and giving my best in everything I take on.",
    skills: ["Marketing", "Leadership", "Communication", "Creative Problem Solving", "Teamwork"],
    achievements: [
      "Secretariat - Marketing in Delcor MUN 2025",
      "The Khayaal Magazine's Marketing Department 2025",
      "JMUNC 2025 OC - Marketing",
      "TEDxSAJSYouth'25 OC - Marketing"
    ],
    codename: "Sentinel",
    agentPhoto: "/members/agents/agent-missing.png",
    role: "Marketing & Secretariat Operative",
    dossier: "Communications officer managing external media relations, magazine marketing, and event secretariat logistics.",
    abilities: [
      { name: "Outreach Beacon", description: "Establishes reliable communication channels across participating teams." },
      { name: "Campaign Guard", description: "Ensures consistent messaging and media alignment across initiatives." }
    ],
    operations: ["Delcor MUN 2025", "TEDxSAJSYouth'25 Marketing"],
    threatAssessment: "MEDIUM",
    specialization: "Outreach Logistics",
    badge: "ACTIVE"
  },
  {
    id: "member-10",
    isPresident: false,
    position: "Head of Social Media",
    realName: "Samridhi Agarwal",
    realPhoto: "/members/real/placeholder_real.jpg",
    bio: "Hey! I’m Samridhi Agarwal, the Head of Social Media at ATL TinkEthix. I’m someone who loves creativity, communication, and turning simple ideas into engaging content. I enjoy exploring new concepts, keeping up with trends, and finding unique ways to represent the team and its work. Being part of the social media team gives me the opportunity to combine creativity with strategy and create content that connects with people.",
    skills: ["Social Media Strategy", "Content Creation", "Digital Presence", "Communication", "Trend Analysis"],
    achievements: [
      "Head of Social Media at ATL TinkEthix",
      "Leading the team’s social media strategy, content, and digital presence"
    ],
    codename: "Pulse",
    agentPhoto: "/members/agents/agent-missing.png",
    role: "Digital Media & Trends Operative",
    dossier: "Digital strategist directing real-time social media presence, content distribution, and brand engagement.",
    abilities: [
      { name: "Signal Surge", description: "Drives rapid digital engagement through curated media releases." },
      { name: "Trend Matrix", description: "Analyzes social trends to optimize channel reach and viewer retention." }
    ],
    operations: ["TinkEthix Digital Shift", "Social Grid Launch"],
    threatAssessment: "MEDIUM",
    specialization: "Digital Strategy",
    badge: "ACTIVE"
  },
  {
    id: "member-11",
    isPresident: false,
    position: "IT Head / Media",
    realName: "Shivek Agarwal",
    realPhoto: "/members/real/placeholder_real.jpg",
    bio: "Hello I'm Shivek Agarwal a creative and detail-oriented high school student with a strong passion for graphic design, visual storytelling, and digital media production.",
    skills: ["Graphic Design", "Visual Storytelling", "Digital Media Production", "Photography", "IT Systems"],
    achievements: [
      "IT Head (Interact Club)",
      "HOD Graphics (Aristeia MUN)",
      "HOD Media (Apostles)",
      "Official Photographer & Designer for Thanda"
    ],
    codename: "Aperture",
    agentPhoto: "/members/agents/agent-missing.png",
    role: "Media Production & Graphics Operative",
    dossier: "Visual story officer and IT head handling photography, graphics production, and media system infrastructure.",
    abilities: [
      { name: "Frame Capture", description: "High-resolution media capture and visual storytelling under live conditions." },
      { name: "Graphics Engine", description: "Produces specialized design graphics for large-scale media channels." }
    ],
    operations: ["Aristeia MUN Graphics", "Thanda Media Directive"],
    threatAssessment: "MEDIUM",
    specialization: "Visual Media Production",
    badge: "ACTIVE"
  },
  {
    id: "member-12",
    isPresident: false,
    position: "Hospitality Head",
    realName: "Harshita Khanna",
    realPhoto: "/members/real/placeholder_real.jpg",
    bio: "Hey! I’m Harshita, a self-driven and dedicated individual with a strong passion for leadership, communication, and people management. I enjoy taking initiative, coordinating with people, and ensuring that everything runs smoothly. My experience in hospitality has helped me develop strong organisational, problem-solving, teamwork, and interpersonal skills. I believe in being attentive to details, taking responsibility, and creating a welcoming experience for everyone around me.",
    skills: ["Hospitality Management", "Leadership", "Event Coordination", "Interpersonal Skills", "People Management"],
    achievements: [
      "Hospitality Head - ATL Club",
      "OC - Hospitality, OC MUN",
      "Hospitality Team - Blackened ATL",
      "House Captain",
      "Successfully coordinated and managed hospitality responsibilities across various events"
    ],
    codename: "Haven",
    agentPhoto: "/members/agents/agent-missing.png",
    role: "Hospitality & Protocol Specialist",
    dossier: "Protocol and hospitality head ensuring seamless delegate management, venue coordination, and guest relations.",
    abilities: [
      { name: "Protocol Shield", description: "Maintains smooth guest relations and hospitality logistics in high-pressure events." },
      { name: "Coordination Matrix", description: "Streamlines delegation movements and venue operations." }
    ],
    operations: ["OC MUN Hospitality", "Blackened ATL Directive"],
    threatAssessment: "MEDIUM",
    specialization: "Hospitality & Protocol",
    badge: "ACTIVE"
  },
  {
    id: "member-13",
    isPresident: false,
    position: "Co-Founder / Council Member",
    realName: "Ansh Sharma",
    realPhoto: "/members/real/placeholder_real.jpg",
    bio: "I am a Grade 11 student from Ghaziabad, passionate about debating, music, Indian politics, public speaking, and social impact. I actively participate in MUNs, debates, and youth initiatives, striving to use my skills and voice to create meaningful change.",
    skills: ["Debating", "Public Speaking", "Political Analysis", "Social Impact", "Event Management"],
    achievements: [
      "Co-Founder, Eco Bricks NCR",
      "Best OC, TEDxSajsvyouth & JMUNC 2026",
      "School Council Member",
      "Political Analyst",
      "MUN Awardee"
    ],
    codename: "Aegis",
    agentPhoto: "/members/agents/agent-missing.png",
    role: "Public Advocacy & Strategy Specialist",
    dossier: "Debate and policy strategist focusing on youth initiatives, public advocacy, and social impact campaigns.",
    abilities: [
      { name: "Rhetoric Wave", description: "Delivers persuasive public addresses and structured debate arguments." },
      { name: "Impact Strategy", description: "Formulates social initiatives with measurable community reach." }
    ],
    operations: ["Eco Bricks NCR Launch", "JMUNC 2026 Strategy"],
    threatAssessment: "HIGH",
    specialization: "Advocacy & Strategy",
    badge: "ACTIVE"
  }
];
