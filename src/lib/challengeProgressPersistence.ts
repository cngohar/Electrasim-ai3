const STORAGE_KEY = 'electrasim:challenge-progress:v1';

type ProgressMap = Record<string, number>;

function read(): ProgressMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function write(progress: ProgressMap): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage is optional; the active challenge remains fully usable.
  }
}

export function getCompletedChallengeIds(): string[] {
  return Object.keys(read());
}

export function isChallengeCompleted(id: string): boolean {
  return Boolean(read()[id]);
}

export function markChallengeCompleted(id: string): void {
  const progress = read();
  progress[id] ??= Date.now();
  write(progress);
}

export function clearChallengeProgress(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage is optional.
  }
}
