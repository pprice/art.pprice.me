export function averageOf<T>(array: readonly T[], accessor: (i: T) => number) {
  return sumOf<T>(array, accessor) / array.length;
}

export function sumOf<T>(array: readonly T[], accessor: (i: T) => number) {
  return array.reduce((acc, i) => acc + accessor(i), 0);
}

export function medianOf<T>(array: readonly T[], accessor: (i: T) => number) {
  if (array.length <= 1) {
    return accessor(array[0]);
  }

  const mapped = array.map(accessor);

  const sorted = mapped.sort((a, b) => a - b);
  const half = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0 ? sorted[half] : (sorted[half - 1] + sorted[half]) / 2;
}

export function maximumOf<T>(array: readonly T[], accessor: (i: T) => number) {
  return Math.max(...array.map(accessor));
}

export function minimumOf<T>(array: readonly T[], accessor: (i: T) => number) {
  return Math.min(...array.map(accessor));
}
