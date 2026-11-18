/* Content source of truth. Everything here is drawn from Bharat's public GitHub
   repositories and READMEs, or from details he supplied directly. */
window.BP = {
  email: 'bharatp0316@gmail.com',
  github: 'https://github.com/bharat-poojari',

  skills: [
    { id: 'frontend', label: 'Frontend', items: ['React', 'TypeScript', 'JavaScript', 'HTML & CSS', 'Tailwind CSS', 'Vite', 'Framer Motion', 'Three.js / R3F', 'Zustand'] },
    { id: 'backend',  label: 'Backend',  items: ['Node.js', 'PHP', 'MySQL', 'REST APIs', 'Vercel Functions'] },
    { id: 'ai',       label: 'AI',       items: ['AI integration', 'Prompt engineering', 'Local model tooling'] },
    { id: 'tools',    label: 'Tooling',  items: ['Git & GitHub', 'Vercel', 'VS Code extensions', 'Developer tools'] }
  ],

  projects: [
    {
      id: 'offyai', name: 'OffyAI', flagship: true, kind: 'Flagship · Windows desktop AI',
      tag: 'Private. Fast. Local. Yours.',
      lead: 'A local-first AI desktop application for Windows, built on a simple idea: AI should be useful without forcing every interaction through the cloud.',
      caps: [
        'Discover compatible local AI models',
        'Download and manage models from one place',
        'Configure local inference',
        'Converse with locally available AI systems',
        'Local-first and privacy-led by design',
        'Companion website presenting the product and its releases'
      ],
      stack: ['Windows desktop', 'Local inference', 'llama.cpp', 'Hugging Face', 'GitHub Releases API', 'Vercel'],
      source: 'Topics and architecture as documented in the OffyAI repositories.',
      arch: [
        ['Discover', 'Find models compatible with your machine'],
        ['Manage', 'Download, store and organise local models'],
        ['Runtime', 'Configure and run inference locally'],
        ['Chat', 'Converse with the model on-device'],
        ['Website', 'Product site on Vercel reads release data through the GitHub API']
      ],
      links: [
        ['Website', 'https://offyai.vercel.app/'],
        ['Application repo', 'https://github.com/bharat-poojari/offyai'],
        ['Latest release', 'https://github.com/bharat-poojari/offyai/releases/latest'],
        ['Website repo', 'https://github.com/bharat-poojari/offyai-website']
      ],
      art: 'offy'
    },
    {
      id: 'furniqo', name: 'Furniqo', flagship: true, kind: 'Flagship · 3D e-commerce',
      tag: 'Transform your space. Digitally.',
      lead: 'A premium furniture e-commerce platform that redefines online shopping through immersive 3D product visualization, so you can examine a piece from every angle before you buy.',
      caps: [
        'Interactive 3D product viewer with zoom, rotate and pan',
        'Cart management with persistent storage, plus a wishlist',
        'Algolia-powered instant search with filters',
        'Razorpay and Stripe checkout integrations',
        'Order tracking, reviews and ratings',
        'System-aware dark mode, responsive from mobile to 4K',
        'Route-based code splitting and lazy loading'
      ],
      stack: ['React 19', 'Vite', 'Tailwind CSS', 'Three.js', 'React Three Fiber', 'drei', 'Zustand', 'Framer Motion', 'React Router', 'Axios', 'Razorpay', 'Stripe', 'Algolia', 'Sentry', 'Vercel'],
      source: 'Capabilities and stack as documented in the Furniqo README.',
      arch: [
        ['Interface', 'React 19 + Vite, Tailwind CSS, Framer Motion route transitions'],
        ['3D layer', 'Three.js through React Three Fiber and drei — a model viewer component'],
        ['State', 'Zustand stores for cart, wishlist, auth and UI, persisted to localStorage'],
        ['Services', 'Axios API layer calling a REST backend (separate backend folder in the repo)'],
        ['Integrations', 'Razorpay and Stripe payments, Algolia search, Sentry and Google Analytics'],
        ['Delivery', 'Deployed on Vercel with automatic deployments from main']
      ],
      links: [
        ['Live site', 'https://the-furniqo.vercel.app'],
        ['Repository', 'https://github.com/bharat-poojari/Furniqo']
      ],
      art: 'furn'
    },
    {
      id: 'primenews', name: 'PrimeNews', kind: 'Real-time news aggregator',
      tag: 'Headlines, searched and saved.',
      lead: 'A real-time news aggregator with multiple API support, built as a fast, modern news portal.',
      caps: [
        'Category filtering and advanced search',
        'Breaking-news ticker and a video news section',
        'Dark and light themes',
        'Persistent bookmarks',
        'Live headlines and search through Google News RSS'
      ],
      stack: ['React 18', 'Vite', 'Tailwind CSS', 'Framer Motion', 'Google News RSS', 'Vercel'],
      source: 'As documented in the PrimeNews README.',
      arch: [
        ['Sources', 'Multiple news APIs plus Google News RSS'],
        ['Client', 'React 18 + Vite single-page app'],
        ['Experience', 'Category filter, search, ticker, video section, themes'],
        ['Persistence', 'Bookmarks kept between visits'],
        ['Delivery', 'Vercel']
      ],
      links: [
        ['Live site', 'https://the-prime-news.vercel.app'],
        ['Repository', 'https://github.com/bharat-poojari/PrimeNews']
      ],
      art: 'news'
    },
    {
      id: 'codepolish', name: 'CodePolish', kind: 'VS Code extension',
      tag: 'Clean code.',
      lead: 'A Visual Studio Code extension that beautifies and minifies code in the editor, with language-aware formatting logic.',
      caps: [
        'Beautify with Alt + Shift + B',
        'Minify from the editor context menu',
        'Both available from the command palette',
        'Per-language formatting, including line-by-line JSONL handling',
        'Published on the VS Code Marketplace, MIT licensed'
      ],
      stack: ['TypeScript', 'VS Code Extension API', 'Node.js'],
      source: 'As documented on the Marketplace listing and repository.',
      arch: [
        ['Entry', 'extension.ts registers the commands with VS Code'],
        ['Commands', 'codepolish.beautify and codepolish.minify'],
        ['Formatter', 'formatter.ts applies format logic per language'],
        ['Distribution', 'VS Code Marketplace, or from source with F5']
      ],
      links: [
        ['Marketplace', 'https://marketplace.visualstudio.com/items?itemName=b1c836b5-b2e9-67df-b783-53ff04f83ff0.codepolish'],
        ['Repository', 'https://github.com/bharat0316-a/codepolish']
      ],
      art: 'code'
    },
    {
      id: 'tracker', name: 'Daily Accountability Tracker', kind: 'Serverless web app',
      tag: 'No framework. No database.',
      lead: 'A no-framework HTML, CSS and JavaScript tracker for a daily routine and study schedule. Each update is stored as JSON in a GitHub repository through a Vercel serverless function.',
      caps: [
        'Daily routine and study schedule tracking',
        'Updates written to data/data.json in a GitHub repository',
        'Works across devices from the same URL',
        'GitHub token kept server-side, never sent to the browser'
      ],
      stack: ['HTML', 'CSS', 'JavaScript', 'Vercel Functions', 'GitHub Contents API'],
      source: 'As documented in the repository README.',
      arch: [
        ['Browser', 'Vanilla HTML, CSS and JavaScript'],
        ['Function', 'api/data.js on Vercel holds the secret and performs the write'],
        ['Storage', 'data/data.json committed to a GitHub repository']
      ],
      links: [['Repository', 'https://github.com/bharat-poojari/tt']],
      art: 'track'
    },
    {
      id: 'portfolio', name: 'First portfolio', kind: 'Vanilla JS · terminal UI',
      tag: 'Where the terminal started.',
      lead: 'My earlier portfolio, built in pure HTML, CSS and JavaScript with an interactive terminal, a filterable project gallery, a certificate viewer and an SEO-focused setup.',
      caps: [
        'Interactive terminal with a full command set',
        'Filterable project gallery with detail modals',
        'Certificate viewer with category filters',
        'Dark and light themes'
      ],
      stack: ['HTML', 'CSS', 'JavaScript', 'Vercel'],
      source: 'As documented in the repository README.',
      arch: [
        ['Content', 'Projects and certificates driven from a script data file'],
        ['Interface', 'Gallery, modals, skills dashboard and timeline'],
        ['Terminal', 'Command interpreter inside the page'],
        ['Delivery', 'Vercel']
      ],
      links: [
        ['Live site', 'https://bharat-poojari.vercel.app/'],
        ['Repository', 'https://github.com/bharat-poojari/Bharat-Portfolio']
      ],
      art: 'term'
    }
  ]
};
