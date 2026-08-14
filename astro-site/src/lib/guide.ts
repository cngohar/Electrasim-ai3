export function levelClass(level: string): string {
  if (level === 'Beginner') return 'level-beginner';
  if (level === 'Intermediate') return 'level-intermediate';
  return 'level-advanced';
}
