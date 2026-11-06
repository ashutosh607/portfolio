// Dialogue and Character Configuration for Konoha Portfolio
// Portfolio Owner: Ashutosh

export const CHARACTERS_DATA = [
  {
    id: 'sasuke',
    name: 'Sasuke Uchiha',
    japaneseName: 'うちはサスケ',
    title: 'Uchiha Prodigy • Team 7 Shinobi',
    locationLabel: 'Mission Gate — Konoha Plaza',
    modelPath: '/models/sasuke_uchiha.glb',
    // Standing on the LEFT of the Mission Gate at [-2.26, 0.56, -7.92], turned slightly towards center
    position: [-3.66, 0.556, -7.85],
    rotation: [0, 0.25, 0],
    scale: 0.96, // Calibrated height: ~1.75m
    modelRotation: [0, 0, 0],
    modelOffset: [0, 0, 0],
    feetOffset: 0.01,
    interactionDistance: 3.5,
    themeColor: '#34495e',
    accentColor: '#9b59b6',
    clan: 'Uchiha Clan',
    dialogueSequence: [
      {
        speaker: 'Sasuke Uchiha',
        text: "You're finally here, Ashutosh. The Hokage posted new high-rank missions on the Mission Gate.",
      },
      {
        speaker: 'Ashutosh',
        text: "Ready whenever you are, Sasuke. Hackathons, full-stack architectures, or AI challenges—we conquer them as a team.",
      },
      {
        speaker: 'Sasuke Uchiha',
        text: "Hmph. Don't slow me down. Let's inspect the mission dossiers and show everyone what Team 7 is capable of.",
      },
    ],
    choices: [
      {
        id: 'achievements',
        text: 'Check our missions (Hackathons & Experience)',
        action: 'open_achievements',
      },
      {
        id: 'projects',
        text: 'Review team projects',
        action: 'open_projects',
      },
      {
        id: 'skills',
        text: 'Verify technical skills',
        action: 'open_skills',
      },
    ],
  },
  {
    id: 'sakura',
    name: 'Sakura Haruno',
    japaneseName: '春野サクラ',
    title: 'Medical Ninja • Team 7 Shinobi',
    locationLabel: 'Mission Gate — Konoha Plaza',
    modelPath: '/models/sakura.glb',
    // Standing on the RIGHT of the Mission Gate at [-2.26, 0.56, -7.92], turned slightly towards center
    position: [-0.86, 0.556, -7.85],
    rotation: [0, -0.25, 0],
    scale: 0.276, // Calibrated height: ~1.62m
    modelRotation: [0, 0, 0],
    modelOffset: [0, 0, 0],
    feetOffset: 0.01,
    interactionDistance: 3.2,
    themeColor: '#e84393',
    accentColor: '#00b894',
    clan: 'Haruno',
    dialogueSequence: [
      {
        speaker: 'Sakura Haruno',
        text: "Ashutosh! Sasuke! Team 7 is fully assembled at the Mission Gate! Are we ready for our next big deployment?",
      },
      {
        speaker: 'Ashutosh',
        text: "All systems verified, Sakura. Code is tested, algorithms are tuned, and the architecture is rock solid.",
      },
      {
        speaker: 'Sakura Haruno',
        text: "Perfect! We balance each other out—frontend, backend, intelligence, and execution. Let's pick our next mission!",
      },
    ],
    choices: [
      {
        id: 'achievements',
        text: 'Inspect mission dossiers (Hackathons & Experience)',
        action: 'open_achievements',
      },
      {
        id: 'projects',
        text: "See what we've built",
        action: 'open_projects',
      },
      {
        id: 'resume',
        text: 'View shinobi credentials (Resume)',
        action: 'open_resume',
      },
    ],
  },
  {
    id: 'tsunade',
    name: 'Tsunade Senju',
    japaneseName: '綱手',
    title: 'Fifth Hokage • Legendary Sannin',
    locationLabel: "Hokage's Office Gate",
    modelPath: '/models/tsunade/source/Tsunade.glb',
    // Standing beside the Hokage Office Gate at [-20.40, -0.02, -34.50], properly standing straight facing visitors
    position: [-18.80, -0.02, -34.50],
    rotation: [0, -0.4, 0],
    scale: 0.0915, // Calibrated height: ~1.65m
    modelRotation: [0, 0, 0],
    modelOffset: [0, 0, 0],
    feetOffset: 0.01,
    interactionDistance: 3.5,
    themeColor: '#27ae60',
    accentColor: '#d35400',
    clan: 'Senju Clan',
    dialogueSequence: [
      {
        speaker: 'Tsunade',
        text: "So, you're Ashutosh. What have you accomplished so far?",
      },
      {
        speaker: 'Ashutosh',
        text: "I've been building projects, exploring AI and machine learning, and learning how to turn ideas into working products.",
      },
      {
        speaker: 'Tsunade',
        text: "Potential is good. Execution matters more. Show me the results, explain your decisions, and be honest about what you've learned.",
      },
      {
        speaker: 'Ashutosh',
        text: "That's what I'm working toward.",
      },
      {
        speaker: 'Tsunade',
        text: "Good. A shinobi who understands their strengths and weaknesses has room to grow.",
      },
    ],
    choices: [
      {
        id: 'projects',
        text: 'Review my projects',
        action: 'open_projects',
      },
      {
        id: 'resume',
        text: 'View my resume',
        action: 'open_resume',
      },
      {
        id: 'achievements',
        text: 'View my achievements',
        action: 'open_achievements',
      },
    ],
  },
  {
    id: 'jiraiya',
    name: 'Jiraiya',
    japaneseName: '自来也',
    title: 'Toad Sage • Legendary Sannin & Mentor',
    locationLabel: 'Training Grounds',
    modelPath: '/models/jiraiya_free_fire_skin_original_rig.glb',
    // Standing beside his Training Grounds Board at [44.84, 0.00, 46.89], standing straight facing visitors
    position: [44.84, 0.00, 46.89],
    rotation: [0, Math.PI, 0],
    scale: 1.76, // Calibrated height: ~1.85m tall
    modelRotation: [0, 0, 0],
    modelOffset: [0, 0, 0],
    feetOffset: 0.01,
    interactionDistance: 3.5,
    themeColor: '#c0392b',
    accentColor: '#f39c12',
    clan: 'Toad Hermit',
    dialogueSequence: [
      {
        speaker: 'Jiraiya',
        text: "Gwahaha! Welcome to the training grounds, Ashutosh! A true shinobi never stops sharpening their techniques!",
      },
      {
        speaker: 'Ashutosh',
        text: "Always ready, Master Jiraiya. I'm training across full-stack systems, machine learning, and algorithms.",
      },
      {
        speaker: 'Jiraiya',
        text: "That's the spirit! Ambition is good, but real mastery comes from relentless practice and learning from every failure. Let's see your technical scrolls!",
      },
    ],
    choices: [
      {
        id: 'skills',
        text: 'Train my skills (Technical Scrolls)',
        action: 'open_skills',
      },
      {
        id: 'projects',
        text: 'Review my projects',
        action: 'open_projects',
      },
      {
        id: 'about',
        text: 'Hear about my journey',
        action: 'open_about',
      },
    ],
  },
  {
    id: 'orochimaru',
    name: 'Orochimaru',
    japaneseName: '大蛇丸',
    title: 'Snake Sage • Legendary Sannin',
    locationLabel: 'Shadowed Outer Forest Boundary',
    modelPath: '/models/freefire_new_3d_character_orochimaru_model..glb',
    // Far Northwest Outer Forest Boundary (~63m northwest of spawn)
    position: [-36.0, 0.01, -54.0],
    rotation: [0, Math.PI * 0.2, 0],
    scale: 2.58, // Calibrated height: ~1.75m
    modelRotation: [0, 0, 0],
    modelOffset: [0, 0, 0],
    interactionDistance: 3.4,
    themeColor: '#8e44ad',
    accentColor: '#2c3e50',
    clan: 'Snake Den',
    dialogueSequence: [
      {
        speaker: 'Orochimaru',
        text: 'Ashutosh... such an interesting collection of experiments.',
      },
      {
        speaker: 'Ashutosh',
        text: "They're projects. Some are still evolving.",
      },
      {
        speaker: 'Orochimaru',
        text: "Naturally. The most interesting question isn't whether an experiment works today. It's what you discover when it doesn't.",
      },
      {
        speaker: 'Ashutosh',
        text: 'Every bug teaches me something.',
      },
      {
        speaker: 'Orochimaru',
        text: 'Excellent. Failure is only wasted when you learn nothing from it.',
      },
    ],
    choices: [
      {
        id: 'projects',
        text: 'Explore my technical work',
        action: 'open_projects',
      },
      {
        id: 'skills',
        text: 'Inspect my technical skills',
        action: 'open_skills',
      },
    ],
  },
];
