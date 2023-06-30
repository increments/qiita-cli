// Wrapped Object.entries with strict type
export const entries = <T extends {}>(o: T) => {
  return Object.entries(o) as [keyof T, T[keyof T]][];
};

// Wrapped Object.fromEntries with strict type
export const fromEntries = <K extends PropertyKey, V>(
  e: Iterable<readonly [K, V]>
) => {
  return Object.fromEntries(e) as { [key in K]: V };
};
