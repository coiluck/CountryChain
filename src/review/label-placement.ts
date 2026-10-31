export type Point = { x: number; y: number };
export type Rect = { x: number; y: number; width: number; height: number };

// anchor からの距離の候補。近い順に試す
const DISTANCES = [10, 24, 42, 64, 90, 120, 150];

function overlapArea(a: Rect, b: Rect): number {
  const width = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const height = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  return width > 0 && height > 0 ? width * height : 0;
}

function clamp(rect: Rect, bounds: Rect): Rect {
  return {
    ...rect,
    x: Math.min(Math.max(rect.x, bounds.x), bounds.x + bounds.width - rect.width),
    y: Math.min(Math.max(rect.y, bounds.y), bounds.y + bounds.height - rect.height),
  };
}

// anchor の近くで、taken と重ならない位置に size の箱を置く。
// 枝に沿う向きを避けるため、まず円の接線方向（左右）、次に外側・斜め・内側へずらす。どこも空いていなければ重なりが一番小さい候補
export function placeLabel(anchor: Point, center: Point, size: { width: number; height: number }, taken: readonly Rect[], bounds: Rect): Rect {
  const dx = anchor.x - center.x;
  const dy = anchor.y - center.y;
  const length = Math.hypot(dx, dy) || 1;
  const outward = { x: dx / length, y: dy / length };
  const tangent = { x: -outward.y, y: outward.x };
  const diagonal = (a: Point, b: Point) => ({ x: (a.x + b.x) * Math.SQRT1_2, y: (a.y + b.y) * Math.SQRT1_2 });
  const back = { x: -tangent.x, y: -tangent.y };
  const inward = { x: -outward.x, y: -outward.y };
  const directions = [tangent, back, outward, diagonal(tangent, outward), diagonal(back, outward), diagonal(tangent, inward), diagonal(back, inward), inward];

  let best: Rect | undefined;
  let bestOverlap = Infinity;
  for (const distance of DISTANCES) {
    for (const dir of directions) {
      // 箱の端が anchor から distance 離れるように、箱の半分の大きさぶん余分にずらす
      const half = Math.abs(dir.x) * size.width / 2 + Math.abs(dir.y) * size.height / 2;
      const cx = anchor.x + dir.x * (distance + half);
      const cy = anchor.y + dir.y * (distance + half);
      const rect = clamp({ x: cx - size.width / 2, y: cy - size.height / 2, ...size }, bounds);
      const overlap = taken.reduce((sum, t) => sum + overlapArea(rect, t), 0);
      if (overlap === 0) return rect;
      if (overlap < bestOverlap) {
        bestOverlap = overlap;
        best = rect;
      }
    }
  }
  return best!;
}

// rect の上で point に一番近い点（引き出し線の端）
export function nearestPointOnRect(point: Point, rect: Rect): Point {
  return {
    x: Math.min(Math.max(point.x, rect.x), rect.x + rect.width),
    y: Math.min(Math.max(point.y, rect.y), rect.y + rect.height),
  };
}
