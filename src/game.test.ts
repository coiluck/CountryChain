import { describe, expect, it } from 'vitest';
import {
  allCountries,
  availableNeighbors,
  cpuMove,
  filterCountries,
  findCountryCode,
  isGameOver,
  pickRandom,
  playerMove,
  startGame,
  suggestCountries,
  type Country,
  type CountryMap,
  type GameState,
} from './game.ts';

function country(enName: string, jaName: string, jaKana: string, neighbors: string[]): Country {
  return { enName, jaName, jaKana, neighbors };
}

// 実データから一部を抜き出した小さな地図
const countries: CountryMap = {
  FRA: country('France', 'フランス', 'ふらんす', ['ESP', 'BRA', 'VAT']),
  ESP: country('Spain', 'スペイン', 'すぺいん', ['FRA', 'MAR']),
  MAR: country('Morocco', 'モロッコ', 'もろっこ', ['ESP']),
  BRA: country('Brazil', 'ブラジル', 'ぶらじる', ['FRA']),
  VAT: country('Vatican City', 'バチカン', 'ばちかん', ['FRA']),
  JPN: country('Japan', '日本', 'にほん', []),
};

const noFilter = { removeNonmembers: false, removeEnclaves: false, removeIslands: false };

function stateAt(current: string, used: string[] = [current], mistakes = 0): GameState {
  return { current, used: new Set(used), mistakes };
}

// この2つだけ実際のjson
describe('allCountries', () => {
  it('隣接国のコードがすべて国データにある', () => {
    for (const [code, { neighbors }] of Object.entries(allCountries)) {
      for (const neighbor of neighbors) {
        expect(allCountries, `${code} -> ${neighbor}`).toHaveProperty(neighbor);
      }
    }
  });

  it('隣接は双方向', () => {
    for (const [code, { neighbors }] of Object.entries(allCountries)) {
      for (const neighbor of neighbors) {
        expect(allCountries[neighbor]?.neighbors, `${code} -> ${neighbor}`).toContain(code);
      }
    }
  });
});

describe('filterCountries', () => {
  it('設定がすべてオフなら何も除外しない', () => {
    expect(filterCountries(countries, noFilter)).toEqual(countries);
  });

  it('非国連加盟国を国と隣接国の両方から除外する', () => {
    const result = filterCountries(countries, { ...noFilter, removeNonmembers: true });
    expect(result).not.toHaveProperty('VAT');
    expect(result.FRA?.neighbors).toEqual(['ESP', 'BRA']);
  });

  it('飛び地による隣接を両方向とも除外する', () => {
    const result = filterCountries(countries, { ...noFilter, removeEnclaves: true });
    expect(result.FRA?.neighbors).toEqual(['ESP', 'VAT']);
    expect(result.ESP?.neighbors).toEqual(['FRA']);
    expect(result.MAR?.neighbors).toEqual([]);
    expect(result.BRA?.neighbors).toEqual([]);
  });

  it('島国（隣接国がない国）を除外する', () => {
    const result = filterCountries(countries, { ...noFilter, removeIslands: true });
    expect(result).not.toHaveProperty('JPN');
    expect(result).toHaveProperty('FRA');
  });

  it('飛び地の除外で隣接国がなくなった国も島国として除外する', () => {
    const result = filterCountries(countries, { removeNonmembers: false, removeEnclaves: true, removeIslands: true });
    expect(Object.keys(result).sort()).toEqual(['ESP', 'FRA', 'VAT']);
  });

  it('元のデータを書き換えない', () => {
    filterCountries(countries, { removeNonmembers: true, removeEnclaves: true, removeIslands: true });
    expect(countries.FRA?.neighbors).toEqual(['ESP', 'BRA', 'VAT']);
    expect(countries).toHaveProperty('JPN');
  });
});

describe('findCountryCode', () => {
  it.each(['France', 'フランス', 'ふらんす'])('%s から国を見つける', (input) => {
    expect(findCountryCode(countries, input)).toBe('FRA');
  });

  it('大文字小文字と前後の空白を無視する', () => {
    expect(findCountryCode(countries, '  FRANCE ')).toBe('FRA');
  });

  it('部分一致では見つけない', () => {
    expect(findCountryCode(countries, 'Fran')).toBeUndefined();
  });

  it('存在しない国は undefined', () => {
    expect(findCountryCode(countries, 'Atlantis')).toBeUndefined();
  });
});

describe('suggestCountries', () => {
  it('名前の一部を含む国を返す', () => {
    expect(suggestCountries(countries, 'ra').map((c) => c.enName)).toEqual(['France', 'Brazil']);
  });

  it('読みがなでも候補を返す', () => {
    expect(suggestCountries(countries, 'すぺ').map((c) => c.enName)).toEqual(['Spain']);
  });

  it('空の入力では候補を返さない', () => {
    expect(suggestCountries(countries, '  ')).toEqual([]);
  });
});

describe('pickRandom', () => {
  it('random の値に応じた要素を返す', () => {
    expect(pickRandom(['a', 'b', 'c'], () => 0)).toBe('a');
    expect(pickRandom(['a', 'b', 'c'], () => 0.99)).toBe('c');
  });

  it('空の配列では undefined', () => {
    expect(pickRandom([], () => 0)).toBeUndefined();
  });
});

describe('startGame', () => {
  it('最初の国を使用済みにして始める', () => {
    const state = startGame(countries, () => 0);
    expect(state).toEqual(stateAt('FRA'));
  });

  it('国データが空なら例外を投げる', () => {
    expect(() => startGame({})).toThrow();
  });
});

describe('availableNeighbors', () => {
  it('使用済みの国を除いた隣接国を返す', () => {
    expect(availableNeighbors(countries, stateAt('FRA', ['FRA', 'ESP']))).toEqual(['BRA', 'VAT']);
  });

  it('国データにない国なら空', () => {
    expect(availableNeighbors(countries, stateAt('XXX'))).toEqual([]);
  });
});

describe('cpuMove', () => {
  it('まだ使われていない隣接国へ進む', () => {
    const next = cpuMove(countries, stateAt('FRA', ['FRA', 'ESP']), () => 0);
    expect(next).toEqual(stateAt('BRA', ['FRA', 'ESP', 'BRA']));
  });

  it('ミスの回数はそのまま', () => {
    expect(cpuMove(countries, stateAt('ESP', ['ESP'], 1), () => 0)?.mistakes).toBe(1);
  });

  it('言える国がなければ null', () => {
    expect(cpuMove(countries, stateAt('MAR', ['MAR', 'ESP']))).toBeNull();
    expect(cpuMove(countries, stateAt('JPN'))).toBeNull();
  });
});

describe('playerMove', () => {
  it('隣接していて未使用の国なら進み、ミスをリセットする', () => {
    const move = playerMove(countries, stateAt('FRA', ['FRA'], 1), 'スペイン');
    expect(move.result).toBe('ok');
    expect(move.state).toEqual(stateAt('ESP', ['FRA', 'ESP']));
  });

  it('隣接していない国はミス', () => {
    const move = playerMove(countries, stateAt('FRA'), 'モロッコ');
    expect(move.result).toBe('not-adjacent');
    expect(move.state).toEqual(stateAt('FRA', ['FRA'], 1));
  });

  it('存在しない国は隣接していない扱い', () => {
    expect(playerMove(countries, stateAt('FRA'), 'Atlantis').result).toBe('not-adjacent');
  });

  it('使用済みの国はミス', () => {
    const move = playerMove(countries, stateAt('ESP', ['FRA', 'ESP']), 'フランス');
    expect(move.result).toBe('already-used');
    expect(move.state).toEqual(stateAt('ESP', ['FRA', 'ESP'], 1));
  });

  it('元の状態を書き換えない', () => {
    const state = stateAt('FRA');
    playerMove(countries, state, 'スペイン');
    expect(state).toEqual(stateAt('FRA'));
  });
});

describe('isGameOver', () => {
  it('2回連続でミスするとゲームオーバー', () => {
    expect(isGameOver(stateAt('FRA', ['FRA'], 1))).toBe(false);
    expect(isGameOver(stateAt('FRA', ['FRA'], 2))).toBe(true);
  });

  it('ミスが続くと2回目でゲームオーバーになる', () => {
    const first = playerMove(countries, stateAt('FRA'), 'モロッコ').state;
    const second = playerMove(countries, first, '日本').state;
    expect(isGameOver(first)).toBe(false);
    expect(isGameOver(second)).toBe(true);
  });
});
