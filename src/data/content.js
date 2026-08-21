export const profile = {
  name: "Devansh Maudgil",
  role: "Full-Stack Developer",
  email: "devanshmaudgil18@gmail.com",
  phone: "9817609921",
  phoneHref: "tel:+919817609921",
  github: "https://github.com/devanshmaudgil",
  githubLabel: "github.com/devanshmaudgil",
  location: "India",
  summary:
    "Final-semester BCA (Cloud Technology) student with hands-on experience building complete, end-to-end client projects across web and mobile, including AI-integrated systems. Proven track record delivering production applications independently, from backend architecture and database design to native mobile apps, for both service-based and staffing/recruitment businesses.",
};

export const experience = [
  {
    id: "ats",
    title: "Applicant Tracking System",
    type: "Web App",
    status: "Shipped",
    stack: ["React", "Node.js", "MySQL"],
    description:
      "End-to-end recruitment platform covering candidate sourcing, pipeline management, recruiter documentation, and placement tracking.",
    highlights: [
      "Built from scratch to manage full staffing workflow",
      "Streamlined internal operations and reduced manual tracking overhead",
      "Handles candidate submissions, client outreach, and internal reporting",
    ],
  },
  {
    id: "audit",
    title: "Vehicle Audit System",
    type: "Full-Stack + Mobile",
    status: "Shipped",
    stack: ["React", "Laravel", "MySQL", "Flutter"],
    description:
      "Complete audit platform with a web dashboard and a companion mobile app for field auditors to scan VIN stickers and sync data in real time.",
    highlights: [
      "Built backend from scratch in Laravel, then migrated to React",
      "Flutter app captures audit data on-site with live server sync",
      "Covers audit tracking, management, and organizational reporting",
    ],
  },
];

export const projects = [
  {
    title: "Face Attendance Marker",
    tags: ["Flutter", "Dart", "ML Kit", "TFLite"],
    description:
      "Kiosk-mode attendance app with live camera capture, on-device face recognition, and passive liveness checks.",
    points: [
      "Multi-pose enrollment with per-employee cooldown and an admin dashboard for PDF/CSV export.",
      "Hashed PIN access and native Android Lock Task Mode for locked-down kiosk deployment.",
    ],
  },
  {
    title: "AI F1 Simulation",
    tags: ["Python", "Pygame", "Hugging Face"],
    description:
      "Split-screen racing sim where Gemma-4 and DeepSeek-V4 compete as autonomous drivers on the same track.",
    points: [
      "Learns track turns purely from in-context crash memory, with no fine-tuning involved.",
      "Ghost trails plus a post-race report on finish time, crashes, latency, and learning curve.",
    ],
  },
  {
    title: "Hand Gesture Fruit Ninja",
    tags: ["Python", "OpenCV", "MediaPipe", "Pygame"],
    description:
      "Real-time computer-vision game controlled entirely by index-finger slash gestures over a live camera feed.",
    points: [
      "MediaPipe hand tracking maps fingertip motion to slash detection on every frame.",
      "OpenCV pipeline composites fruit, slices, and score directly onto the video stream.",
    ],
  },
  {
    title: "Movie Ticket Automation",
    tags: ["Python", "Automation"],
    description:
      "Python automation that drives the full movie ticket booking flow end to end without manual intervention.",
    points: [
      "Scripted flow handles show selection, seat picking, and checkout in one pass.",
      "Runs unattended to secure seats the moment a target show opens for booking.",
    ],
  },
  {
    title: "Music Streaming App",
    tags: ["Flutter", "Dart", "Provider", "YouTube API"],
    description:
      "Mobile streaming app with YouTube-powered search and playback, a personal library, and a persistent mini player.",
    points: [
      "Search and category browse via the YouTube Data API with recently played history.",
      "Playlist queue, next/previous controls, and a full-screen player over hidden playback.",
    ],
  },
  {
    title: "Community Hub",
    tags: ["React", "Node.js", "MySQL"],
    description:
      "City community platform where people post requests, discover local activity, and plan meetups with others nearby.",
    points: [
      "Create and join city-wide plans like movie nights, cricket matches, and house parties.",
      "React frontend with a Node.js API and MySQL for users, plans, and activity data.",
    ],
  },
];

export const stackSkills = [
  {
    id: "javascript",
    name: "JavaScript",
    line: "The chaos I somehow make ship every week.",
  },
  {
    id: "react",
    name: "React",
    line: "Components, hooks, and mild existential rerenders.",
  },
  {
    id: "nodejs",
    name: "Node.js",
    line: "Backend that stays up longer than my sleep schedule.",
  },
  {
    id: "php",
    name: "PHP",
    line: "Still paying rent. Still getting the job done.",
  },
  {
    id: "laravel",
    name: "Laravel",
    line: "Eloquent enough to hide my messy SQL sins.",
  },
  {
    id: "html5",
    name: "HTML",
    line: "The skeleton everyone forgets to thank.",
  },
  {
    id: "css",
    name: "CSS",
    line: "Pixels obey me. Eventually. After three media queries.",
  },
  {
    id: "flutter",
    name: "Flutter",
    line: "One codebase, two platforms, zero patience for XML.",
  },
  {
    id: "dart",
    name: "Dart",
    line: "Typed, fast, and weirdly pleasant to argue with.",
  },
  {
    id: "mysql",
    name: "MySQL",
    line: "Where the real relationships live. Foreign keys included.",
  },
  {
    id: "sqlite",
    name: "SQLite",
    line: "Tiny database energy. Huge offline loyalty.",
  },
  {
    id: "wordpress",
    name: "WordPress",
    line: "Elementor by day, custom PHP by night.",
  },
  {
    id: "git",
    name: "Git",
    line: "Commit, push, pray, force-push never again.",
  },
  {
    id: "github",
    name: "GitHub",
    line: "My public diary of half-finished brilliance.",
  },
];

export const aiSkills = [
  "Cursor",
  "Claude Code",
  "Emergent.sh",
  "AI-integrated systems",
];

export const skillGroups = [
  {
    label: "Languages & Frameworks",
    items: ["JavaScript", "React", "Node.js", "PHP", "Laravel", "HTML", "CSS", "Flutter / Dart"],
  },
  {
    label: "Databases",
    items: ["MySQL", "SQLite"],
  },
  {
    label: "Platforms & Tools",
    items: ["WordPress (Elementor)", "Git", "GitHub"],
  },
  {
    label: "AI Integration & Agents",
    items: ["Cursor", "Claude Code", "Emergent.sh", "AI-integrated systems"],
  },
];

export const education = {
  degree: "Bachelor of Computer Applications (BCA)",
  focus: "Cloud Technology",
  school: "Kurukshetra University",
  period: "2023-2026",
};

export const navLinks = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Work" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

export const searchIndex = [
  { label: "About", href: "#about", hint: "Profile and background" },
  { label: "Experience", href: "#experience", hint: "Shipped product work" },
  { label: "Projects", href: "#projects", hint: "Attendance, streaming, community hub" },
  { label: "Face Attendance Marker", href: "#projects", hint: "Flutter, on-device AI" },
  { label: "Music Streaming App", href: "#projects", hint: "Flutter, YouTube API" },
  { label: "Community Hub", href: "#projects", hint: "React, Node.js, MySQL" },
  { label: "AI F1 Simulation", href: "#projects", hint: "LLM comparison" },
  { label: "Skills", href: "#skills", hint: "React, Laravel, Flutter, MySQL" },
  { label: "Education", href: "#skills", hint: "BCA Cloud Technology" },
  { label: "Contact", href: "#contact", hint: "Email, GitHub, resume" },
  { label: "Resume", href: "/Resume.pdf", hint: "Download PDF" },
  { label: "GitHub", href: "https://github.com/devanshmaudgil", hint: "github.com/devanshmaudgil" },
];
