export interface Ability {
  name: string;
  description: string;
}

export interface TeamMember {
  id: string;
  isPresident: boolean;
  // Shared Metadata
  position: string;

  // Reality Mode Data
  realName: string;
  realPhoto: string;
  bio: string;
  skills: string[];
  achievements: string[];

  // Classified Mode Data
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
    bio: "Pioneering robotic systems and artificial intelligence integration at the ATL Command Center. Driven to build sustainable technology solutions and mentor young minds in hands-on physics and electronics.",
    skills: ["Robotics Engineering", "AI Integration", "Embedded Systems", "Aerodynamics"],
    achievements: [
      "National Innovation Award Recipient (AI & Robotics)",
      "Developed a multi-terrain search-and-rescue drone system",
      "Keynote speaker at the National Youth STEM Summit 2025"
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
    realName: "Aarav Sharma",
    realPhoto: "/members/real/placeholder_real.jpg",
    bio: "Information Pending",
    skills: ["Profile Under Construction"],
    achievements: ["Information Pending"],
    codename: "TBD",
    agentPhoto: "/members/agents/agent-missing.png",
    role: "Unknown",
    dossier: "Profile Under Construction",
    abilities: [
      { name: "Classification Pending", description: "Agent profile not yet classified." }
    ],
    operations: ["Classification Pending"],
    threatAssessment: "Classification Pending",
    specialization: "Classification Pending",
    badge: "PROFILE INCOMPLETE"
  },
  {
    id: "member-3",
    isPresident: false,
    position: "Head 1",
    realName: "Riya Patel",
    realPhoto: "/members/real/placeholder_real.jpg",
    bio: "Profile Under Construction",
    skills: ["Information Pending"],
    achievements: ["Profile Under Construction"],
    codename: "TBD",
    agentPhoto: "/members/agents/agent-missing.png",
    role: "Unknown",
    dossier: "Classification Pending",
    abilities: [
      { name: "Classification Pending", description: "Agent profile not yet classified." }
    ],
    operations: ["Classification Pending"],
    threatAssessment: "Classification Pending",
    specialization: "Classification Pending",
    badge: "CLASSIFICATION PENDING"
  },
  {
    id: "member-4",
    isPresident: false,
    position: "Head 2",
    realName: "Arjun Mehta",
    realPhoto: "/members/real/placeholder_real.jpg",
    bio: "Information Pending",
    skills: ["Profile Under Construction"],
    achievements: ["Information Pending"],
    codename: "TBD",
    agentPhoto: "/members/agents/agent-missing.png",
    role: "Unknown",
    dossier: "Profile Under Construction",
    abilities: [
      { name: "Classification Pending", description: "Agent profile not yet classified." }
    ],
    operations: ["Classification Pending"],
    threatAssessment: "Classification Pending",
    specialization: "Classification Pending",
    badge: "PROFILE INCOMPLETE"
  },
  {
    id: "member-5",
    isPresident: false,
    position: "Head 3",
    realName: "Ishita Kapoor",
    realPhoto: "/members/real/placeholder_real.jpg",
    bio: "Profile Under Construction",
    skills: ["Information Pending"],
    achievements: ["Profile Under Construction"],
    codename: "TBD",
    agentPhoto: "/members/agents/agent-missing.png",
    role: "Unknown",
    dossier: "Classification Pending",
    abilities: [
      { name: "Classification Pending", description: "Agent profile not yet classified." }
    ],
    operations: ["Classification Pending"],
    threatAssessment: "Classification Pending",
    specialization: "Classification Pending",
    badge: "CLASSIFICATION PENDING"
  },
  {
    id: "member-6",
    isPresident: false,
    position: "Head 4",
    realName: "Vivaan Singh",
    realPhoto: "/members/real/placeholder_real.jpg",
    bio: "Information Pending",
    skills: ["Profile Under Construction"],
    achievements: ["Information Pending"],
    codename: "TBD",
    agentPhoto: "/members/agents/agent-missing.png",
    role: "Unknown",
    dossier: "Profile Under Construction",
    abilities: [
      { name: "Classification Pending", description: "Agent profile not yet classified." }
    ],
    operations: ["Classification Pending"],
    threatAssessment: "Classification Pending",
    specialization: "Classification Pending",
    badge: "PROFILE INCOMPLETE"
  },
  {
    id: "member-7",
    isPresident: false,
    position: "Head 5",
    realName: "Anika Verma",
    realPhoto: "/members/real/placeholder_real.jpg",
    bio: "Profile Under Construction",
    skills: ["Information Pending"],
    achievements: ["Profile Under Construction"],
    codename: "TBD",
    agentPhoto: "/members/agents/agent-missing.png",
    role: "Unknown",
    dossier: "Classification Pending",
    abilities: [
      { name: "Classification Pending", description: "Agent profile not yet classified." }
    ],
    operations: ["Classification Pending"],
    threatAssessment: "Classification Pending",
    specialization: "Classification Pending",
    badge: "CLASSIFICATION PENDING"
  },
  {
    id: "member-8",
    isPresident: false,
    position: "Head 6",
    realName: "Krish Malhotra",
    realPhoto: "/members/real/placeholder_real.jpg",
    bio: "Information Pending",
    skills: ["Profile Under Construction"],
    achievements: ["Information Pending"],
    codename: "TBD",
    agentPhoto: "/members/agents/agent-missing.png",
    role: "Unknown",
    dossier: "Profile Under Construction",
    abilities: [
      { name: "Classification Pending", description: "Agent profile not yet classified." }
    ],
    operations: ["Classification Pending"],
    threatAssessment: "Classification Pending",
    specialization: "Classification Pending",
    badge: "PROFILE INCOMPLETE"
  },
  {
    id: "member-9",
    isPresident: false,
    position: "Head 7",
    realName: "Aditi Rao",
    realPhoto: "/members/real/placeholder_real.jpg",
    bio: "Profile Under Construction",
    skills: ["Information Pending"],
    achievements: ["Profile Under Construction"],
    codename: "TBD",
    agentPhoto: "/members/agents/agent-missing.png",
    role: "Unknown",
    dossier: "Classification Pending",
    abilities: [
      { name: "Classification Pending", description: "Agent profile not yet classified." }
    ],
    operations: ["Classification Pending"],
    threatAssessment: "Classification Pending",
    specialization: "Classification Pending",
    badge: "CLASSIFICATION PENDING"
  },
  {
    id: "member-10",
    isPresident: false,
    position: "Head 8",
    realName: "Reyansh Gupta",
    realPhoto: "/members/real/placeholder_real.jpg",
    bio: "Information Pending",
    skills: ["Profile Under Construction"],
    achievements: ["Information Pending"],
    codename: "TBD",
    agentPhoto: "/members/agents/agent-missing.png",
    role: "Unknown",
    dossier: "Profile Under Construction",
    abilities: [
      { name: "Classification Pending", description: "Agent profile not yet classified." }
    ],
    operations: ["Classification Pending"],
    threatAssessment: "Classification Pending",
    specialization: "Classification Pending",
    badge: "PROFILE INCOMPLETE"
  },
  {
    id: "member-11",
    isPresident: false,
    position: "Head 9",
    realName: "Myra Khanna",
    realPhoto: "/members/real/placeholder_real.jpg",
    bio: "Profile Under Construction",
    skills: ["Information Pending"],
    achievements: ["Profile Under Construction"],
    codename: "TBD",
    agentPhoto: "/members/agents/agent-missing.png",
    role: "Unknown",
    dossier: "Classification Pending",
    abilities: [
      { name: "Classification Pending", description: "Agent profile not yet classified." }
    ],
    operations: ["Classification Pending"],
    threatAssessment: "Classification Pending",
    specialization: "Classification Pending",
    badge: "CLASSIFICATION PENDING"
  },
  {
    id: "member-12",
    isPresident: false,
    position: "Head 10",
    realName: "Kabir Mehra",
    realPhoto: "/members/real/placeholder_real.jpg",
    bio: "Information Pending",
    skills: ["Profile Under Construction"],
    achievements: ["Information Pending"],
    codename: "TBD",
    agentPhoto: "/members/agents/agent-missing.png",
    role: "Unknown",
    dossier: "Profile Under Construction",
    abilities: [
      { name: "Classification Pending", description: "Agent profile not yet classified." }
    ],
    operations: ["Classification Pending"],
    threatAssessment: "Classification Pending",
    specialization: "Classification Pending",
    badge: "PROFILE INCOMPLETE"
  },
  {
    id: "member-13",
    isPresident: false,
    position: "Head 11",
    realName: "Divya Teja",
    realPhoto: "/members/real/placeholder_real.jpg",
    bio: "Profile Under Construction",
    skills: ["Information Pending"],
    achievements: ["Profile Under Construction"],
    codename: "TBD",
    agentPhoto: "/members/agents/agent-missing.png",
    role: "Unknown",
    dossier: "Classification Pending",
    abilities: [
      { name: "Classification Pending", description: "Agent profile not yet classified." }
    ],
    operations: ["Classification Pending"],
    threatAssessment: "Classification Pending",
    specialization: "Classification Pending",
    badge: "CLASSIFICATION PENDING"
  }
];
