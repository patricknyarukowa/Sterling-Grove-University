// TypeScript shapes of the JSON the ASP.NET Core API sends and receives.

export type ProgrammeLevel = 'Undergraduate' | 'Honours' | 'Masters' | 'Doctoral' | 'Online' | 'ShortCourse';

export const PROGRAMME_LEVELS: { value: ProgrammeLevel; label: string }[] = [
  { value: 'Undergraduate', label: 'Undergraduate' },
  { value: 'Honours', label: 'Honours' },
  { value: 'Masters', label: "Master's" },
  { value: 'Doctoral', label: 'Doctoral' },
  { value: 'Online', label: 'Online' },
  { value: 'ShortCourse', label: 'Short course' },
];

export interface Faculty {
  id: number;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  deanName: string;
  icon: string;
}

export interface FacultySummary extends Faculty {
  programmeCount: number;
}

export interface Programme {
  id: number;
  title: string;
  code: string;
  level: ProgrammeLevel;
  durationYears: number;
  summary: string;
  admissionRequirements: string;
  facultyId: number;
  facultyName?: string;
  facultySlug?: string;
}

export interface FacultyDetail {
  faculty: Faculty;
  programmes: Programme[];
}

export interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  summary: string;
  body: string;
  category: string;
  author: string;
  publishedAt: string;
  isFeatured: boolean;
}

export interface CampusEvent {
  id: number;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string | null;
  location: string;
  category: string;
}

export interface Testimonial {
  id: number;
  studentName: string;
  programme: string;
  quote: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface AdminStats {
  faculties: number;
  programmes: number;
  news: number;
  upcomingEvents: number;
  unreadMessages: number;
}
