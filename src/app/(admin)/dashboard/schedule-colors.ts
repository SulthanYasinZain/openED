const PALETTE = [
  "bg-blue-700",
  "bg-emerald-700",
  "bg-purple-700",
  "bg-orange-700",
  "bg-teal-700",
  "bg-rose-700",
] as const;

function hash(value: string): number {
  let result = 0;
  for (let index = 0; index < value.length; index++) {
    result = (result * 31 + value.charCodeAt(index)) % 997;
  }
  return result;
}

/** Stable deep marker color per class, shared by the week grid and agenda. */
export function classColor(className: string): string {
  return PALETTE[hash(className) % PALETTE.length];
}
