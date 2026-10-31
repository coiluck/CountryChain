import { describe, expect, it } from 'vitest';
import type { CountryMap } from './game.ts';
import { bestMoves, findCheckmate, isDecidedEarly } from './search.ts';

// [国, 隣接国] の組から双方向の地図を作る
function graph(edges: [string, string][], islands: string[] = []): CountryMap {
  const neighbors: Record<string, string[]> = Object.fromEntries(islands.map((code) => [code, []]));
  for (const [a, b] of edges) {
    (neighbors[a] ??= []).push(b);
    (neighbors[b] ??= []).push(a);
  }
  return Object.fromEntries(
    Object.entries(neighbors).map(([code, list]) => [code, { enName: code, jaName: code, jaKana: code, neighbors: list }]),
  );
}

// codes を順につないだ一本道
function line(codes: string[]): [string, string][] {
  return codes.slice(1).map((code, i): [string, string] => [codes[i]!, code]);
}

// 探索の深さでは決着が見えない長い一本道
function longLine(head: string): [string, string][] {
  return line([head, ...Array.from({ length: 30 }, (_, i) => `${head}${i}`)]);
}

describe('isDecidedEarly', () => {
  it('島国は最初に言う側が言えずに決着する', () => {
    expect(isDecidedEarly(graph([], ['JPN']), 'JPN')).toBe(true);
  });

  it('自分→相手→自分のあと自分が言えなければ決着', () => {
    expect(isDecidedEarly(graph(line(['A', 'B', 'C'])), 'A')).toBe(true);
  });

  it('自分→相手→自分のあと相手が言えなければ決着', () => {
    expect(isDecidedEarly(graph(line(['A', 'B', 'C', 'D'])), 'A')).toBe(true);
  });

  it('4手目以降まで続くなら決着しない', () => {
    expect(isDecidedEarly(graph(line(['A', 'B', 'C', 'D', 'E', 'F'])), 'A')).toBe(false);
  });

  it('相手の返し次第で続くなら決着しない', () => {
    // S → T のあと、U なら自分が U1 で勝つが、V なら長く続く
    const countries = graph([['S', 'T'], ['T', 'U'], ['U', 'U1'], ['T', 'V'], ...longLine('V')]);
    expect(isDecidedEarly(countries, 'S')).toBe(false);
  });
});

describe('bestMoves', () => {
  it('相手を詰ませる手があればその手だけを返す', () => {
    // A を言えば相手は言えない。B だと X で返される
    const countries = graph([['S', 'A'], ['S', 'B'], ['B', 'X']]);
    expect(bestMoves(countries, 'S', new Set(['S']), 8)).toEqual(['A']);
  });

  it('詰ませられなければ相手に詰まされない手を返す', () => {
    // P だと P2 で返されて自分が言えない
    const countries = graph([['S', 'P'], ['P', 'P2'], ['S', 'Q'], ...longLine('Q')]);
    expect(bestMoves(countries, 'S', new Set(['S']), 8)).toEqual(['Q']);
  });

  it('どの手でも詰まされるならすべての手を返す', () => {
    const countries = graph([['S', 'P'], ['P', 'P2']]);
    expect(bestMoves(countries, 'S', new Set(['S']), 8)).toEqual(['P']);
  });

  it('depth より先の詰みは見つけない', () => {
    // A → B → C で相手が言えなくなる（自分が 2 回言う）。D は長く続く
    const countries = graph([...line(['S', 'A', 'B', 'C']), ['S', 'D'], ...longLine('D')]);
    expect(bestMoves(countries, 'S', new Set(['S']), 1)).toEqual(['A', 'D']);
    expect(bestMoves(countries, 'S', new Set(['S']), 2)).toEqual(['A']);
  });

  it('使用済みの国は返さない', () => {
    const countries = graph([['S', 'A'], ['S', 'B'], ['B', 'X']]);
    expect(bestMoves(countries, 'S', new Set(['S', 'A']), 8)).toEqual(['B']);
  });

  it('使用済みの国の集合を書き換えない', () => {
    const used = new Set(['S']);
    bestMoves(graph([['S', 'P'], ['P', 'P2']]), 'S', used, 8);
    expect([...used]).toEqual(['S']);
  });
});

describe('findCheckmate', () => {
  // S → T のあと、U と答えると U1 で詰む。V なら長く続く
  const countries = graph([['S', 'T'], ['T', 'U'], ['U', 'U1'], ['T', 'V'], ...longLine('V')]);

  it('最初から詰んでいれば 0', () => {
    const result = findCheckmate(graph(line(['A', 'B', 'C', 'D'])), ['A', 'B', 'C', 'D'], 8);
    expect(result?.index).toBe(0);
    expect(result?.strategy.play).toBe('B');
  });

  it('詰みになった答えの位置と、何を答えても詰む手順を返す', () => {
    expect(findCheckmate(countries, ['S', 'T', 'U', 'U1'], 8)).toEqual({
      index: 2,
      strategy: { play: 'U1', replies: [] },
    });
  });

  it('詰みにならなければ null', () => {
    expect(findCheckmate(countries, ['S', 'T', 'V', 'V0'], 8)).toBeNull();
  });
});
