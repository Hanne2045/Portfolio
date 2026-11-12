/* ==================================================================
   CONTENT — every text, photo and the accent colour of the site live in this file.
   Change a photo: put the new file in img/ and change the path here.
   Any size or orientation works; the site crops or blurs the edges itself.
   ================================================================== */

window.SITE = {

  /* ---------- accent colour (progress bar, hover, footer glow) ---------- */
  theme: {
    accent: '#d9632c'
  },

  /* ---------- texts ---------- */
  text: {
    pageTitle: 'Hanne Vaartjes Portfolio',
    logo: 'hv',
    logoImage: '',   /* optional: path to a logo image, e.g. 'img/logo.svg'; leave empty to use the text above */
    firstName: 'Hanne',
    lastName: 'Vaartjes.',
    roles: ['HCI student', 'Product owner', 'UI designer', 'UX designer'],
    year: '2026',

    nav: { work: 'Work', about: 'About', next: 'Next', home: 'Home', top: 'Back to top' },

    aboutLabel: 'About me',
    aboutStatement: 'I aim to design thoughtful, human-centered products that turn complex needs into clear, intuitive experiences.',
    aboutCopy: 'I aim to design thoughtful, human-centered products that turn complex needs into clear, intuitive experiences. By combining UX/UI craft, HCI research, and product ownership, I connect user insight with business goals—shaping ideas, aligning teams, and guiding products from discovery to delivery.',

    workTitle: 'Featured Work',
    workLabel: 'Work',
    workBar: 'Selected work',
    viewCase: 'View case',
    scroll: 'Scroll',

    educationTitle: 'My Education',
    education: [
      { level: 'Bachelor', years: '2022-2025', degree: 'Information Sciences' },
      { level: 'Master', years: '2026-2028', degree: 'Human Computer Interaction' }
    ],

    skillsTitle: 'Skills',
    skillsCopy: 'I aim to design thoughtful, human-centered products that turn complex needs into clear, intuitive experiences. By combining UX/UI craft, HCI research, and product ownership, I connect user insight with business goals—shaping ideas, aligning teams, and guiding products from discovery to delivery.',

    footerNote: 'I aim to design thoughtful, human-centered products that turn complex needs into clear, intuitive experiences.',
    footerName: 'Vaartjes',
    footerMeta: ['© 2026 Hanne Vaartjes', 'Portfolio 2026'],

    /* labels on the case pages */
    case: {
      prefix: 'Case',
      overview: 'Overview',
      role: 'Role', year: 'Year', team: 'Team', duration: 'Duration', tools: 'Tools',
      challenge: 'Challenge', approach: 'Approach', outcome: 'Outcome',
      gallery: 'Gallery', photos: 'photos',
      nextProject: 'Next project',
      backToWork: 'Back to all work'
    }
  },

  /* ---------- homepage photos ---------- */
  photos: {
    hero:      'img/hero.jpg',
    workIntro: 'img/citizen_clean.jpg',
    workIntroAlt: 'A hand holding a phone showing the Citizen app',
    education: 'img/laptop.jpg',
    educationAlt: 'A laptop and an open book on a desk by a radiator'
  },

  /* ---------- floating photos in the Featured Work field ----------
     every photo links to its project (project = slug below)
     x / y: centre in % of the screen, w: width in vw, ar: width / height, d: depth */
  tiles: [
    { img: 'img/card1.jpg', project: 'app-sciences',       x: 13, y: 40, w: 12.5, ar: 0.75, d: 1.25 },
    { img: 'img/card2.jpg', project: 'data-insights',      x: 28, y: 76, w: 11,   ar: 0.75, d: 0.7 },
    { img: 'img/card5.jpg', project: 'ai-solutions',       x: 66, y: 79, w: 10,   ar: 0.62, d: 1.5 },
    { img: 'img/card3.jpg', project: 'tech-innovations',   x: 87, y: 27, w: 13,   ar: 0.75, d: 1.0 },
    { img: 'img/card4.jpg', project: 'technology-archive', x: 86, y: 72, w: 14,   ar: 0.75, d: 1.35 }
  ],

  /* ---------- skill icons ---------- */
  icons: [
    { img: 'img/icon0.png', alt: 'Figma' },
    { img: 'img/icon1.png', alt: 'Illustrator' },
    { img: 'img/icon2.png', alt: 'After Effects' },
    { img: 'img/icon3.png', alt: 'Motion curves' },
    { img: 'img/icon4.png', alt: 'Claude' }
  ]
};

/* ==================================================================
   PROJECTS — one entry is one project page (file name = slug + .html).
   Photos per project:
     img      cover photo (homepage carousel + top of the project page)
     wide     large photo halfway down the project page
     gallery  photos in the sliding strip; add or remove as many as you like
   ================================================================== */

const TODO = 'Write this part of the case study.';

window.PROJECTS = [
  {
    slug: 'app-sciences',
    year: '2025',
    name: 'App Sciences',
    img: 'img/card1.jpg',
    wide: 'img/citizen_clean.jpg',
    gallery: [
      { img: 'img/card1.jpg', caption: 'Caption for this photo' },
      { img: 'img/citizen_clean.jpg', caption: 'Caption for this photo' }
    ],
    text: 'Add a short description of this case study here: the problem, your role and the outcome.',
    role: 'Your role', team: 'Team size', duration: 'Duration', tools: 'Figma, After Effects',
    summary: 'One or two sentences that say what this project is and why it matters.',
    challenge: TODO, approach: TODO, outcome: TODO
  },
  {
    slug: 'data-insights',
    year: '2026',
    name: 'Data Insights',
    img: 'img/card2.jpg',
    wide: 'img/card2.jpg',
    gallery: [
      { img: 'img/card2.jpg', caption: 'Caption for this photo' }
    ],
    text: 'Add a short description of this case study here: the problem, your role and the outcome.',
    role: 'Your role', team: 'Team size', duration: 'Duration', tools: 'Figma',
    summary: 'One or two sentences that say what this project is and why it matters.',
    challenge: TODO, approach: TODO, outcome: TODO
  },
  {
    slug: 'tech-innovations',
    year: '2027',
    name: 'Tech Innovations',
    img: 'img/card3.jpg',
    wide: 'img/card3.jpg',
    gallery: [
      { img: 'img/card3.jpg', caption: 'Caption for this photo' }
    ],
    text: 'Add a short description of this case study here: the problem, your role and the outcome.',
    role: 'Your role', team: 'Team size', duration: 'Duration', tools: 'Figma',
    summary: 'One or two sentences that say what this project is and why it matters.',
    challenge: TODO, approach: TODO, outcome: TODO
  },
  {
    slug: 'technology-archive',
    year: '2026',
    name: 'Technology Archive',
    img: 'img/card4.jpg',
    wide: 'img/card4.jpg',
    gallery: [
      { img: 'img/card4.jpg', caption: 'Caption for this photo' }
    ],
    text: 'Add a short description of this case study here: the problem, your role and the outcome.',
    role: 'Your role', team: 'Team size', duration: 'Duration', tools: 'Figma',
    summary: 'One or two sentences that say what this project is and why it matters.',
    challenge: TODO, approach: TODO, outcome: TODO
  },
  {
    slug: 'ai-solutions',
    year: '2029',
    name: 'AI Solutions',
    img: 'img/card5.jpg',
    wide: 'img/card5.jpg',
    gallery: [
      { img: 'img/card5.jpg', caption: 'Caption for this photo' }
    ],
    text: 'Add a short description of this case study here: the problem, your role and the outcome.',
    role: 'Your role', team: 'Team size', duration: 'Duration', tools: 'Figma, Claude',
    summary: 'One or two sentences that say what this project is and why it matters.',
    challenge: TODO, approach: TODO, outcome: TODO
  }
];
