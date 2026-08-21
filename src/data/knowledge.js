import {
  aiSkills,
  education,
  experience,
  profile,
  projects,
  stackSkills,
} from "./content.js";

/** Chunked corpus the RAG layer retrieves from. */
export const knowledgeChunks = [
  {
    id: "profile",
    title: "About Devansh",
    href: "#about",
    tags: ["about", "profile", "who", "bio", "introduction", "background"],
    text: `${profile.name} is a ${profile.role} based in ${profile.location}. ${profile.summary} He is proficient in AI integration and building with AI agents, using tools such as Cursor, Claude Code, and Emergent.sh.`,
  },
  {
    id: "contact",
    title: "Contact",
    href: "#contact",
    tags: ["contact", "email", "phone", "hire", "reach", "github", "resume"],
    text: `Public contact details for ${profile.name}: email ${profile.email}, phone/mobile number ${profile.phone} (${profile.phoneHref}), GitHub ${profile.github}. Resume PDF: /Resume.pdf. These details are published on his portfolio and may be shared when visitors ask for his number, phone, email, or how to reach him.`,
  },
  {
    id: "education",
    title: "Education",
    href: "#skills",
    tags: ["education", "college", "university", "degree", "bca", "study", "student"],
    text: `${profile.name} is pursuing a ${education.degree} with a focus on ${education.focus} at ${education.school} (${education.period}). He is in his final semester.`,
  },
  ...experience.map((item) => ({
    id: `exp-${item.id}`,
    title: item.title,
    href: "#experience",
    tags: [
      "experience",
      "work",
      "shipped",
      item.type.toLowerCase(),
      ...item.stack.map((s) => s.toLowerCase()),
      ...item.title.toLowerCase().split(/\s+/),
    ],
    text: `${item.title} (${item.type}, status: ${item.status}). Tech stack: ${item.stack.join(", ")}. ${item.description} Highlights: ${item.highlights.join(" ")}`,
  })),
  ...projects.map((project, i) => ({
    id: `project-${i}`,
    title: project.title,
    href: "#projects",
    tags: [
      "project",
      "portfolio",
      "built",
      ...project.tags.map((t) => t.toLowerCase()),
      ...project.title.toLowerCase().split(/\s+/),
    ],
    text: `${project.title}. ${project.description} Built with ${project.tags.join(", ")}. ${project.points.join(" ")}`,
  })),
  {
    id: "skills-stack",
    title: "Tech stack",
    href: "#skills",
    tags: ["skills", "stack", "technologies", "tools", "languages", "frameworks"],
    text: `${profile.name}'s core tech stack includes ${stackSkills
      .map((s) => s.name)
      .join(", ")}. Each skill he ships with regularly on client and personal work.`,
  },
  ...stackSkills.map((skill) => ({
    id: `skill-${skill.id}`,
    title: skill.name,
    href: "#skills",
    tags: ["skill", skill.name.toLowerCase(), skill.id],
    text: `${profile.name} works with ${skill.name}. ${skill.line}`,
  })),
  {
    id: "ai-tools",
    title: "AI tools and agents",
    href: "#skills",
    tags: ["ai", "agents", "cursor", "claude", "llm", "automation"],
    text: `For AI-assisted development, ${profile.name} uses ${aiSkills.join(", ")}. He builds AI-integrated systems and works with AI agents as part of his delivery workflow.`,
  },
  {
    id: "availability",
    title: "Work style",
    href: "#about",
    tags: ["freelance", "available", "hire", "independent", "client", "delivery"],
    text: `${profile.name} delivers production applications independently end to end, from backend architecture and database design to native mobile apps, for service-based and staffing/recruitment businesses.`,
  },
];

export const suggestedAsks = [
  "Who is Devansh?",
  "What projects has he built?",
  "Does he know React and Flutter?",
  "How can I contact him?",
  "Tell me about the ATS system",
  "What is he studying?",
];
