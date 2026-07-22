export function fmtKSh(v: number): string {
  if (v >= 1e9) return `KSh ${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `KSh ${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `KSh ${(v / 1e3).toFixed(0)}K`;
  return `KSh ${Math.round(v).toLocaleString()}`;
}

export function fmtKShFull(v: number): string {
  return `KSh ${Math.round(v).toLocaleString()}`;
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function fmtPct(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}
