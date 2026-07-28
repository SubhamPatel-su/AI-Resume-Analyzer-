// Skills analyzer: categorizes detected skills from the resume text.
import { SkillsAnalysis, SkillCategory } from "./types";
import { SKILL_CATEGORY_MAP } from "./dictionaries";

export function analyzeSkills(text: string): SkillsAnalysis {
  const lower = text;
  const seen = new Map<string, Set<string>>(); // category -> set of skills
  const allFound = new Set<string>();

  for (const group of SKILL_CATEGORY_MAP) {
    const bucket = new Set<string>();
    for (const re of group.terms) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(lower)) !== null) {
        const raw = m[0].trim();
        // normalize display
        const display = normalizeSkill(raw);
        bucket.add(display);
        allFound.add(display.toLowerCase());
      }
    }
    if (bucket.size) seen.set(group.category, bucket);
  }

  const categories: SkillCategory[] = Array.from(seen.entries()).map(
    ([name, skills]) => ({ name, skills: Array.from(skills).sort() }),
  );

  return {
    categories,
    total: allFound.size,
    uncategorized: [],
  };
}

function normalizeSkill(raw: string): string {
  const r = raw.toLowerCase();
  const prettify: Record<string, string> = {
    "react.js": "React",
    "reactjs": "React",
    "react": "React",
    "next.js": "Next.js",
    "nextjs": "Next.js",
    "next js": "Next.js",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "node": "Node.js",
    "c++": "C++",
    "c#": "C#",
    "csharp": "C#",
    "golang": "Go",
    "go": "Go",
    "k8s": "Kubernetes",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "mongo": "MongoDB",
    "mongodb": "MongoDB",
    "aws": "AWS",
    "azure": "Azure",
    "gcp": "GCP",
    "google cloud": "GCP",
    "ml": "Machine Learning",
    "machine learning": "Machine Learning",
    "nlp": "NLP",
    "natural language processing": "NLP",
    "oop": "OOP",
    "object oriented": "OOP",
    "object-oriented": "OOP",
    "dsa": "DSA",
    "data structures": "DSA",
    "rest api": "REST API",
    "restful": "REST API",
    "rest apis": "REST API",
    "ci/cd": "CI/CD",
    "cicd": "CI/CD",
    "ci cd": "CI/CD",
    "scikit-learn": "scikit-learn",
    "sklearn": "scikit-learn",
    "tailwind": "Tailwind CSS",
    "tailwind css": "Tailwind CSS",
    "vs code": "VS Code",
    "visual studio code": "VS Code",
    "spring boot": "Spring Boot",
    "spring": "Spring",
    "jetpack compose": "Jetpack Compose",
    "compose": "Jetpack Compose",
    "problem solving": "Problem Solving",
    "problem-solving": "Problem Solving",
    "team player": "Teamwork",
    "object oriented": "OOP",
  };
  return prettify[r] || raw.replace(/\b\w/g, (c) => c.toUpperCase());
}
