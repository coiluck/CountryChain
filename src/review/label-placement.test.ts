import { describe, expect, it } from 'vitest';
import { nearestPointOnRect, placeLabel, type Rect } from './label-placement.ts';

const bounds: Rect = { x: 0, y: 0, width: 400, height: 400 };
const center = { x: 200, y: 200 };
const size = { width: 60, height: 20 };

function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

describe('placeLabel', () => {
  it('空いていれば接線方向のすぐ横に置く', () => {
    // 真上の点の接線は横向き
    const rect = placeLabel({ x: 200, y: 100 }, center, size, [], bounds);
    expect(rect.y).toBeCloseTo(90);
    expect(Math.abs(rect.x + rect.width / 2 - 200)).toBeGreaterThan(size.width / 2);
  });

  it('置いた箱と重ならない場所を探す', () => {
    const anchor = { x: 200, y: 100 };
    const taken: Rect[] = [];
    for (let i = 0; i < 4; i++) taken.push(placeLabel(anchor, center, size, taken, bounds));
    for (let i = 0; i < taken.length; i++) {
      for (let j = i + 1; j < taken.length; j++) expect(overlaps(taken[i]!, taken[j]!)).toBe(false);
    }
  });

  it('空きがなければ重なりが一番小さい場所に置く', () => {
    // 幅100の枠の左半分がふさがっていて、幅60の箱はどこに置いても重なる。右端に寄せたときが一番小さい
    const narrow = { x: 0, y: 0, width: 100, height: 30 };
    const blocker = { x: 0, y: 0, width: 50, height: 30 };
    const rect = placeLabel({ x: 50, y: 15 }, { x: 50, y: 200 }, size, [blocker], narrow);
    expect(rect.x).toBe(40);
  });

  it('枠からはみ出さない', () => {
    const rect = placeLabel({ x: 398, y: 200 }, center, size, [], bounds);
    expect(rect.x).toBeGreaterThanOrEqual(0);
    expect(rect.x + rect.width).toBeLessThanOrEqual(400);
  });

  it('中心と同じ点でも置ける', () => {
    const rect = placeLabel(center, center, size, [], bounds);
    expect(Number.isFinite(rect.x) && Number.isFinite(rect.y)).toBe(true);
  });
});

describe('nearestPointOnRect', () => {
  it('箱の外の点は一番近い辺の上へ、中の点はそのまま', () => {
    const rect = { x: 10, y: 10, width: 20, height: 10 };
    expect(nearestPointOnRect({ x: 0, y: 15 }, rect)).toEqual({ x: 10, y: 15 });
    expect(nearestPointOnRect({ x: 50, y: 50 }, rect)).toEqual({ x: 30, y: 20 });
    expect(nearestPointOnRect({ x: 15, y: 12 }, rect)).toEqual({ x: 15, y: 12 });
  });
});
