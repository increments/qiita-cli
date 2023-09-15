export function getMagnitudeFromRange(
  target: Element,
  x: number,
  length: number,
) {
  const rect = target.getBoundingClientRect();
  return Math.ceil((x - rect.left) / (rect.width / length));
}
