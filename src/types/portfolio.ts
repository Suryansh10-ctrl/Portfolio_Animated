export interface Spec {
  label: string;
  value: string;
}

export interface Palette {
  paper: string;
  paperDeep: string;
  paperPale: string;
  ink: string;
  inkSoft: string;
  wall: string;
  shelf: string;
  shelfDark: string;
  light: string;
  fill: string;
}

export interface AboutItem {
  label: string;
  value: string;
}

export interface ProjectItem {
  title: string;
  summary: string;
  role: string;
  stack: string;
  year: string;
  status: string;
  url?: string;
  source?: string;
  image?: string;
  imageAlt?: string;
  bullets?: string[];
  learning?: string;
}

export interface SkillItem {
  area: string;
  skills: string[];
}

export interface ExperienceItem {
  org: string;
  title: string;
  start: string;
  end: string;
  bullets: string[];
}

export interface EducationItem {
  institution: string;
  programme: string;
  start: string;
  end: string;
  coursework: string[];
}

export interface AchievementItem {
  title: string;
  issuer: string;
  date: string;
  url?: string;
}

export type BookItem =
  | ProjectItem
  | SkillItem
  | ExperienceItem
  | EducationItem
  | AchievementItem
  | AboutItem
  | Record<string, unknown>;

export interface Book {
  id: string;
  volumeLabel: string;
  roman: string;
  title: string;
  discipline: string;
  note: string;
  deck: string;
  color: string;
  foil: string;
  motifKey: string;
  motif: string;
  paletteLabel: string;
  width: number;
  height: number;
  depth: number;
  seed: number;
  palette: Palette;
  specs: Spec[];
  chapters: string[];
  items: BookItem[];
}

export interface ContactLink {
  label: string;
  url: string;
}

export interface PersonPhoto {
  src: string;
  alt: string;
  caption: string;
}

export interface Person {
  name: string;
  role: string;
  location: string;
  bio: string;
  currently: string;
  aspirations?: string[];
  workingPrinciples?: string[];
  photos: PersonPhoto[];
  resume: string;
  resumePdf?: string;
  resumeDocx?: string;
  contact: {
    email: string;
    phone?: string;
    links: ContactLink[];
  };
}

export interface SiteNarrative {
  headline: string;
  intro: string;
  closing: string;
  primaryCta?: string;
  secondaryCta?: string;
}

export interface PortfolioData {
  _note?: string;
  person: Person;
  collectionTitle: string;
  collectionSubtitle: string;
  collectionEdition: string;
  siteNarrative?: SiteNarrative;
  books: Book[];
}
