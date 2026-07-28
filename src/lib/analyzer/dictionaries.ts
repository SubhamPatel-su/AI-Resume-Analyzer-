// Dictionaries for the offline resume analysis engine.
// All static data lives here: action verbs, weak phrases, keyword catalog.

// --- Strong action verbs (grouped) ---
export const ACTION_VERBS: string[] = [
  "developed", "built", "designed", "engineered", "implemented", "created",
  "launched", "delivered", "optimized", "improved", "reduced", "increased",
  "accelerated", "automated", "architected", "deployed", "scaled", "migrated",
  "refactored", "rewrote", "spearheaded", "led", "directed", "managed",
  "coordinated", "orchestrated", "drove", "established", "founded", "initiated",
  "pioneered", "introduced", "rolled out", "shipped", "released", "produced",
  "generated", "achieved", "attained", "exceeded", "surpassed", "maximized",
  "minimized", "streamlined", "consolidated", "centralized", "standardized",
  "formalized", "overhauled", "revamped", "modernized", "transformed",
  "converted", "integrated", "configured", "customized", "configured",
  "analyzed", "researched", "investigated", "evaluated", "assessed", "audited",
  "measured", "tracked", "monitored", "forecasted", "modeled", "simulated",
  "validated", "verified", "tested", "debugged", "troubleshot", "resolved",
  "fixed", "patched", "maintained", "supported", "administered", "operated",
  "negotiated", "partnered", "collaborated", "facilitated", "presented",
  "pitched", "proposed", "recommended", "advised", "mentored", "trained",
  "taught", "instructed", "coached", "guided", "empowered", "enabled",
  "championed", "advocated", "promoted", "marketed", "branded", "positioned",
  "authored", "wrote", "drafted", "edited", "published", "documented",
  "cataloged", "indexed", "archived", "restored", "recovered", "backed up",
  "secured", "hardened", "encrypted", "protected", "defended", "mitigated",
  "eliminated", "removed", "pruned", "trimmed", "cut", "saved", "conserved",
  "awarded", "earned", "won", "secured", "obtained", "acquired", "procured",
  "budgeted", "allocated", "appropriated", "controlled", "reconciled",
  "invented", "innovated", "conceived", "ideated", "prototyped", "piloted",
  "experimented", "benchmarked", "profiled", "tuned", "calibrated", "tweaked",
  "expanded", "grew", "boosted", "lifted", "raised", "amplified", "amplified",
  "simplified", "clarified", "explained", "translated", "localized",
  "sourced", "recruited", "hired", "onboarded", "retained", "engaged",
  "negotiated", "closed", "converted", "qualified", "prospected",
  "restored", "renewed", "revitalized", "rejuvenated", "reorganized",
  "restructured", "realigned", "rebalanced", "reallocated",
];

// --- Weak phrase → strong rewrite suggestions ---
export interface WeakPhraseRule {
  pattern: RegExp;
  type: "weak" | "passive" | "generic" | "vague";
  issue: string;
  suggestion: string;
  improve: (sentence: string) => string;
}

const cap = (s: string) =>
  s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;

export const WEAK_PHRASE_RULES: WeakPhraseRule[] = [
  {
    pattern: /\bresponsible for\b/gi,
    type: "weak",
    issue: '"Responsible for" is passive and duty-focused rather than achievement-focused.',
    suggestion: "Start with a strong action verb that shows what you actually did and the outcome.",
    improve: (s) =>
      cap(s.replace(/\bresponsible for\b/gi, "Owned and delivered")),
  },
  {
    pattern: /\bworked on\b/gi,
    type: "vague",
    issue: '"Worked on" tells the recruiter nothing about your contribution or impact.',
    suggestion: "Replace with a precise verb (built, developed, engineered) plus a measurable result.",
    improve: (s) => cap(s.replace(/\bworked on\b/gi, "Engineered")),
  },
  {
    pattern: /\bhelped (the )?team\b/gi,
    type: "weak",
    issue: '"Helped the team" dilutes your individual contribution.',
    suggestion: "State your specific role and the metric that improved.",
    improve: (s) => cap(s.replace(/\bhelped (the )?team\b/gi, "Collaborated with the team to deliver")),
  },
  {
    pattern: /\bhelped\b/gi,
    type: "weak",
    issue: '"Helped" is vague and downplays your contribution.',
    suggestion: "Use a precise verb and quantify the result.",
    improve: (s) => cap(s.replace(/\bhelped\b/gi, "enabled")),
  },
  {
    pattern: /\bdid (some )?coding\b/gi,
    type: "generic",
    issue: '"Did coding" is too generic for a technical resume.',
    suggestion: "Name the technology and the feature you built.",
    improve: (s) =>
      cap(s.replace(/\bdid (some )?coding\b/gi, "Developed production features")),
  },
  {
    pattern: /\bparticipated in\b/gi,
    type: "passive",
    issue: '"Participated in" suggests presence, not impact.',
    suggestion: "Describe what you contributed and the outcome.",
    improve: (s) => cap(s.replace(/\bparticipated in\b/gi, "Contributed to")),
  },
  {
    pattern: /\bin charge of\b/gi,
    type: "weak",
    issue: '"In charge of" describes a duty, not an achievement.',
    suggestion: "Reframe as an action with a result.",
    improve: (s) => cap(s.replace(/\bin charge of\b/gi, "Led")),
  },
  {
    pattern: /\bduties included\b/gi,
    type: "weak",
    issue: '"Duties included" reads like a job description, not accomplishments.',
    suggestion: "Convert duties into achievement bullets with metrics.",
    improve: (s) => cap(s.replace(/\bduties included\b/gi, "Delivered")),
  },
  {
    pattern: /\btasked with\b/gi,
    type: "passive",
    issue: '"Tasked with" is passive — someone assigned you work.',
    suggestion: "Use an active verb that shows ownership.",
    improve: (s) => cap(s.replace(/\btasked with\b/gi, "Took ownership of")),
  },
  {
    pattern: /\bassisted with\b/gi,
    type: "weak",
    issue: '"Assisted with" minimizes your contribution.',
    suggestion: "State the concrete thing you built or improved.",
    improve: (s) => cap(s.replace(/\bassisted with\b/gi, "Supported and delivered")),
  },
  {
    pattern: /\binvolved in\b/gi,
    type: "passive",
    issue: '"Involved in" is vague about your actual role.',
    suggestion: "Describe your specific contribution and impact.",
    improve: (s) => cap(s.replace(/\binvolved in\b/gi, "Drove")),
  },
  {
    pattern: /\bwas (a |an )?\w+ (for|at)\b/gi,
    type: "passive",
    issue: "Passive role description instead of an achievement.",
    suggestion: "Lead with an action verb and a measurable outcome.",
    improve: (s) =>
      s.replace(/\bwas (a |an )?(\w+) (for|at)\b/gi, (_m, _a, role, prep) =>
        cap(`Served as ${role} ${prep}`),
      ),
  },
  {
    pattern: /\bmade\b/gi,
    type: "vague",
    issue: '"Made" is too generic to convey impact.',
    suggestion: "Use a precise verb (built, designed, created) with a result.",
    improve: (s) => cap(s.replace(/\bmade\b/gi, "built")),
  },
  {
    pattern: /\butilized?\b/gi,
    type: "generic",
    issue: '"Utilized" is a wordy synonym for "used".',
    suggestion: 'Prefer the simpler "used" — or better, name what you built with it.',
    improve: (s) => s.replace(/\butilized?\b/gi, "used"),
  },
  {
    pattern: /\bvarious\b/gi,
    type: "vague",
    issue: '"Various" is non-specific and ATS-unfriendly.',
    suggestion: "List the actual items so ATS can match keywords.",
    improve: (s) => s.replace(/\bvarious\b/gi, "several"),
  },
];

// --- Keyword catalog by category (ATS-friendly) ---
export interface KeywordEntry {
  keyword: string;
  category: string;
  aliases?: string[];
}

export const KEYWORD_CATALOG: KeywordEntry[] = [
  // Programming languages
  { keyword: "Python", category: "Programming", aliases: ["python"] },
  { keyword: "Java", category: "Programming", aliases: ["java"] },
  { keyword: "JavaScript", category: "Programming", aliases: ["javascript", "js"] },
  { keyword: "TypeScript", category: "Programming", aliases: ["typescript", "ts"] },
  { keyword: "C++", category: "Programming", aliases: ["c++", "cpp"] },
  { keyword: "C", category: "Programming", aliases: ["c language"] },
  { keyword: "C#", category: "Programming", aliases: ["c#", "csharp"] },
  { keyword: "Go", category: "Programming", aliases: ["golang"] },
  { keyword: "Rust", category: "Programming", aliases: ["rust"] },
  { keyword: "Kotlin", category: "Programming", aliases: ["kotlin"] },
  { keyword: "Swift", category: "Programming", aliases: ["swift"] },
  { keyword: "PHP", category: "Programming", aliases: ["php"] },
  { keyword: "Ruby", category: "Programming", aliases: ["ruby"] },
  { keyword: "SQL", category: "Programming", aliases: ["sql"] },
  { keyword: "HTML", category: "Programming", aliases: ["html5"] },
  { keyword: "CSS", category: "Programming", aliases: ["css3"] },
  { keyword: "Shell", category: "Programming", aliases: ["bash", "shell scripting"] },
  // Frameworks & libraries
  { keyword: "React", category: "Frameworks", aliases: ["react.js", "reactjs"] },
  { keyword: "Angular", category: "Frameworks", aliases: ["angularjs"] },
  { keyword: "Vue", category: "Frameworks", aliases: ["vue.js", "vuejs"] },
  { keyword: "Next.js", category: "Frameworks", aliases: ["nextjs", "next js"] },
  { keyword: "Node.js", category: "Frameworks", aliases: ["node", "nodejs"] },
  { keyword: "Express", category: "Frameworks", aliases: ["express.js", "expressjs"] },
  { keyword: "Spring", category: "Frameworks", aliases: ["spring boot", "spring-boot"] },
  { keyword: "Django", category: "Frameworks", aliases: [] },
  { keyword: "Flask", category: "Frameworks", aliases: [] },
  { keyword: "FastAPI", category: "Frameworks", aliases: ["fast api"] },
  { keyword: "TensorFlow", category: "Frameworks", aliases: ["tensorflow"] },
  { keyword: "PyTorch", category: "Frameworks", aliases: ["pytorch"] },
  { keyword: "pandas", category: "Frameworks", aliases: [] },
  { keyword: "NumPy", category: "Frameworks", aliases: ["numpy"] },
  { keyword: "scikit-learn", category: "Frameworks", aliases: ["sklearn"] },
  { keyword: "Jetpack Compose", category: "Frameworks", aliases: ["compose"] },
  { keyword: "Flutter", category: "Frameworks", aliases: [] },
  { keyword: "Bootstrap", category: "Frameworks", aliases: [] },
  { keyword: "Tailwind", category: "Frameworks", aliases: ["tailwind css"] },
  // Databases
  { keyword: "MySQL", category: "Databases", aliases: ["mysql"] },
  { keyword: "PostgreSQL", category: "Databases", aliases: ["postgres", "postgresql"] },
  { keyword: "MongoDB", category: "Databases", aliases: ["mongo"] },
  { keyword: "Redis", category: "Databases", aliases: ["redis"] },
  { keyword: "Oracle", category: "Databases", aliases: ["oracle db"] },
  { keyword: "SQLite", category: "Databases", aliases: ["sqlite"] },
  { keyword: "Firebase", category: "Databases", aliases: ["firestore"] },
  { keyword: "DynamoDB", category: "Databases", aliases: [] },
  { keyword: "Elasticsearch", category: "Databases", aliases: ["elastic"] },
  // Cloud & DevOps
  { keyword: "AWS", category: "Cloud", aliases: ["amazon web services"] },
  { keyword: "Azure", category: "Cloud", aliases: ["microsoft azure"] },
  { keyword: "GCP", category: "Cloud", aliases: ["google cloud", "google cloud platform"] },
  { keyword: "Docker", category: "Cloud", aliases: [] },
  { keyword: "Kubernetes", category: "Cloud", aliases: ["k8s"] },
  { keyword: "CI/CD", category: "Cloud", aliases: ["ci cd", "cicd"] },
  { keyword: "Jenkins", category: "Cloud", aliases: [] },
  { keyword: "GitHub Actions", category: "Cloud", aliases: ["github action"] },
  { keyword: "Terraform", category: "Cloud", aliases: [] },
  { keyword: "Linux", category: "Cloud", aliases: ["unix"] },
  { keyword: "Nginx", category: "Cloud", aliases: [] },
  // AI / Data
  { keyword: "Machine Learning", category: "AI/ML", aliases: ["ml"] },
  { keyword: "Deep Learning", category: "AI/ML", aliases: [] },
  { keyword: "NLP", category: "AI/ML", aliases: ["natural language processing"] },
  { keyword: "Computer Vision", category: "AI/ML", aliases: [] },
  { keyword: "Data Analysis", category: "AI/ML", aliases: ["data analytics"] },
  { keyword: "Data Visualization", category: "AI/ML", aliases: [] },
  { keyword: "Statistics", category: "AI/ML", aliases: ["statistical"] },
  { keyword: "ETL", category: "AI/ML", aliases: [] },
  // Tools
  { keyword: "Git", category: "Tools", aliases: ["github", "gitlab", "bitbucket"] },
  { keyword: "Jira", category: "Tools", aliases: [] },
  { keyword: "Figma", category: "Tools", aliases: [] },
  { keyword: "Postman", category: "Tools", aliases: [] },
  { keyword: "VS Code", category: "Tools", aliases: ["visual studio code"] },
  { keyword: "IntelliJ", category: "Tools", aliases: [] },
  { keyword: "Excel", category: "Tools", aliases: ["spreadsheet"] },
  // Methodologies & soft skills
  { keyword: "REST API", category: "Concepts", aliases: ["restful", "rest apis"] },
  { keyword: "GraphQL", category: "Concepts", aliases: [] },
  { keyword: "Microservices", category: "Concepts", aliases: [] },
  { keyword: "Agile", category: "Concepts", aliases: ["scrum"] },
  { keyword: "OOP", category: "Concepts", aliases: ["object oriented", "object-oriented"] },
  { keyword: "DSA", category: "Concepts", aliases: ["data structures", "algorithms"] },
  { keyword: "System Design", category: "Concepts", aliases: [] },
  { keyword: "Unit Testing", category: "Concepts", aliases: ["test driven", "tdd"] },
  { keyword: "Leadership", category: "Soft Skills", aliases: ["led"] },
  { keyword: "Teamwork", category: "Soft Skills", aliases: ["team player", "collaborative"] },
  { keyword: "Communication", category: "Soft Skills", aliases: [] },
  { keyword: "Problem Solving", category: "Soft Skills", aliases: ["problem-solving"] },
  { keyword: "Time Management", category: "Soft Skills", aliases: [] },
  { keyword: "Critical Thinking", category: "Soft Skills", aliases: [] },
  { keyword: "Adaptability", category: "Soft Skills", aliases: [] },
];

// --- ATS rule catalog (used for penalty engine + checklist) ---
export interface ATSRule {
  id: string;
  label: string;
  points: number;
}

export const ATS_RULES: ATSRule[] = [
  { id: "missing_email", label: "Missing email address", points: 5 },
  { id: "missing_phone", label: "Missing phone number", points: 4 },
  { id: "missing_linkedin", label: "No LinkedIn profile", points: 3 },
  { id: "missing_github", label: "No GitHub profile", points: 3 },
  { id: "missing_skills", label: "Missing Skills section", points: 8 },
  { id: "missing_projects", label: "No projects listed", points: 10 },
  { id: "missing_experience", label: "No experience/internships", points: 6 },
  { id: "missing_education", label: "Missing education", points: 6 },
  { id: "missing_summary", label: "No summary/objective", points: 4 },
  { id: "missing_achievements", label: "No achievements", points: 4 },
  { id: "missing_certifications", label: "No certifications", points: 3 },
  { id: "passive_voice", label: "Passive voice detected", points: 4 },
  { id: "weak_verbs", label: "Weak action verbs", points: 5 },
  { id: "no_metrics", label: "No measurable results", points: 8 },
  { id: "long_paragraphs", label: "Overly long paragraphs", points: 2 },
  { id: "long_sentences", label: "Sentences too long", points: 2 },
  { id: "double_spaces", label: "Double spaces / typos", points: 2 },
  { id: "generic_summary", label: "Generic summary", points: 3 },
  { id: "too_short", label: "Resume too short", points: 5 },
  { id: "too_long", label: "Resume too long", points: 4 },
  { id: "too_few_keywords", label: "Low ATS keyword coverage", points: 6 },
  { id: "weak_projects", label: "Projects lack detail", points: 5 },
  { id: "inconsistent_bullets", label: "Inconsistent bullet formatting", points: 2 },
  { id: "no_action_verbs", label: "Few strong action verbs", points: 4 },
];

// --- Common English stop words (for keyword extraction / readability) ---
export const STOP_WORDS = new Set([
  "a","an","the","and","or","but","if","then","else","for","of","to","in","on",
  "at","by","with","from","as","is","are","was","were","be","been","being",
  "have","has","had","do","does","did","will","would","should","could","can",
  "may","might","must","shall","i","you","he","she","it","we","they","me",
  "him","her","us","them","my","your","his","its","our","their","this","that",
  "these","those","am","not","no","nor","so","than","too","very","just","also",
  "about","above","after","again","against","all","any","because","before",
  "below","between","during","each","few","more","most","other","over","own",
  "same","some","such","through","under","until","up","down","out","off","here",
  "there","when","where","why","how","what","which","who","whom","while","into",
  "onto","upon","within","without","per","via","etc","ie","eg","get","got","make",
  "made","using","used","use","like","such","one","two","new","good","great",
]);

// --- Section header synonyms for the parser ---
export const SECTION_HEADERS: Record<string, string[]> = {
  summary: ["summary", "professional summary", "profile summary", "about me", "profile", "career summary"],
  objective: ["objective", "career objective", "professional objective"],
  education: ["education", "academic background", "academics", "educational qualifications"],
  experience: ["experience", "work experience", "professional experience", "employment", "work history", "employment history"],
  internships: ["internship", "internships", "internship experience"],
  projects: ["projects", "academic projects", "personal projects", "key projects", "project experience"],
  skills: ["skills", "core skills", "key skills", "areas of interest"],
  technicalSkills: ["technical skills", "tech skills", "technical proficiencies", "technologies", "technology stack", "tech stack"],
  softSkills: ["soft skills", "interpersonal skills"],
  achievements: ["achievements", "accomplishments", "awards", "honors", "honours", "recognitions"],
  certifications: ["certifications", "certificates", "licenses", "courses"],
  languages: ["languages", "languages known", "language proficiency"],
  publications: ["publications", "research", "papers", "research papers"],
  volunteer: ["volunteer", "volunteer experience", "community service", "extra curricular", "extracurricular"],
  references: ["references", "referees"],
};

// --- Tech keyword map for skills categorization ---
export const SKILL_CATEGORY_MAP: { category: string; terms: RegExp[] }[] = [
  {
    category: "Programming",
    terms: [
      /\b(python|java|javascript|typescript|c\+\+|c#|c\b|golang|go|rust|kotlin|swift|php|ruby|scala|r\b|matlab|dart|perl|sql|plsql|html|css|shell|bash)\b/gi,
    ],
  },
  {
    category: "Frameworks",
    terms: [
      /\b(react|reactjs|react\.js|angular|vue|vue\.js|next\.?js|node\.?js|express|spring|spring boot|django|flask|fastapi|tensorflow|pytorch|pandas|numpy|scikit[- ]learn|sklearn|keras|jetpack compose|flutter|bootstrap|tailwind|jquery|redux|graphql)\b/gi,
    ],
  },
  {
    category: "Databases",
    terms: [
      /\b(mysql|postgresql|postgres|mongodb|mongo|redis|oracle|sqlite|firebase|firestore|dynamodb|elasticsearch|cassandra|mariadb|db2|nosql)\b/gi,
    ],
  },
  {
    category: "Cloud & DevOps",
    terms: [
      /\b(aws|azure|gcp|google cloud|docker|kubernetes|k8s|jenkins|gitlab ci|github actions|terraform|ansible|nginx|linux|unix|ci\/cd|cicd|helm)\b/gi,
    ],
  },
  {
    category: "AI / Data",
    terms: [
      /\b(machine learning|deep learning|nlp|natural language processing|computer vision|data analysis|data science|data analytics|data visualization|statistics|etl|big data|hadoop|spark|tableau|power bi)\b/gi,
    ],
  },
  {
    category: "Tools",
    terms: [
      /\b(git|github|gitlab|bitbucket|jira|figma|postman|vs code|visual studio|intellij|eclipse|excel|word|powerpoint|slack|trello|notion)\b/gi,
    ],
  },
  {
    category: "Concepts",
    terms: [
      /\b(rest api|restful|graphql|microservices|agile|scrum|oop|object[- ]oriented|dsa|data structures|algorithms|system design|unit testing|tdd|bdd|design patterns|ci\/cd|security|networking|tcp\/ip)\b/gi,
    ],
  },
  {
    category: "Soft Skills",
    terms: [
      /\b(leadership|teamwork|team player|communication|problem solving|problem-solving|time management|critical thinking|adaptability|collaboration|creativity|mentoring|negotiation|presentation)\b/gi,
    ],
  },
];
