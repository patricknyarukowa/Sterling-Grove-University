import { facultyImage, newsImage, roman } from './imagery';

describe('imagery', () => {
  it('picks a photo for each news category, with a fallback for new ones', () => {
    expect(newsImage('Research')).toBe('dome');
    expect(newsImage('Something new')).toBe('chapel-long');
  });

  it('has a photo for every faculty in the sample data', () => {
    const seeded = ['business-leadership', 'engineering-technology', 'health-sciences', 'humanities-creative-arts', 'law-governance', 'natural-computational-sciences'];

    // Each is matched by slug, so each gets its chosen photo whatever its position in the list
    for (const slug of seeded) expect(facultyImage(slug, 0)).toBe(facultyImage(slug, 5));
    expect(new Set(seeded.map(s => facultyImage(s))).size).toBe(seeded.length);
  });

  it('cycles through the fallback photos for faculties added later', () => {
    expect(facultyImage('new-faculty', 6)).toBe(facultyImage('new-faculty', 0));
  });

  it('writes roman numerals, and plain numbers past twelve', () => {
    expect(roman(1)).toBe('I');
    expect(roman(4)).toBe('IV');
    expect(roman(12)).toBe('XII');
    expect(roman(13)).toBe('13');
  });
});
