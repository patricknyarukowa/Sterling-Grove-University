// Which photograph (in public/images) illustrates each kind of content.
// Records in the database have no images of their own, so the site picks one by category or faculty.

const NEWS: Record<string, string> = {
  'Research': 'dome',
  'Student Life': 'quad-lawn',
  'Teaching & Learning': 'lecture-theatre',
  'Community': 'hall-georgian',
  'Announcements': 'gothic-entrance',
};

const FACULTY: Record<string, string> = {
  'business-leadership': 'hall-georgian',
  'engineering-technology': 'research-centre',
  'health-sciences': 'quad-winter',
  'humanities-creative-arts': 'chapel-long',
  'law-governance': 'hall-classical',
  'natural-computational-sciences': 'dome',
};

const FALLBACK = ['chapel-vault', 'quad-winter', 'gothic-entrance', 'hall-georgian', 'library-reading-room', 'quad-lawn'];

export function newsImage(category: string): string {
  return NEWS[category] ?? 'chapel-long';
}

export function facultyImage(slug: string, index = 0): string {
  return FACULTY[slug] ?? FALLBACK[index % FALLBACK.length];
}

// Roman numerals for numbered index lists (I to XII is plenty here).
export function roman(n: number): string {
  return ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][n - 1] ?? String(n);
}
