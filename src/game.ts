import countryBorder from './data/country-border.json' with { type: 'json' };

export type Country = {
  enName: string;
  jaName: string;
  jaKana: string;
  // 隣接する国の ISO 3166-1 alpha-3 コード
  neighbors: readonly string[];
};

// ISO 3166-1 alpha-3 コード -> 国
export type CountryMap = Readonly<Record<string, Country>>;

export type Settings = {
  removeNonmembers: boolean;
  removeEnclaves: boolean;
  removeIslands: boolean;
};

export type GameState = {
  current: string;
  used: ReadonlySet<string>;
  mistakes: number;
};

export type AnswerResult = 'ok' | 'not-adjacent' | 'already-used';

export const allCountries: CountryMap = countryBorder;

// この回数連続でミスするとゲームオーバー
export const MAX_MISTAKES = 2;

// 非国連加盟国（コソボ、パレスチナ、台湾、バチカン、西サハラ）
const NON_MEMBERS = ['XKX', 'PSE', 'TWN', 'VAT', 'ESH'];

// 飛び地による隣接（両方向とも除外）
const ENCLAVE_BORDERS: readonly (readonly [string, string])[] = [
  ['ESP', 'MAR'], // セウタ・メリリャ
  ['RUS', 'POL'], // カリーニングラード
  ['RUS', 'LTU'], // カリーニングラード
  ['AGO', 'COG'], // カビンダ
  ['AZE', 'TUR'], // ナヒチェヴァン
  ['FRA', 'BRA'], // フランス領ギアナ
  ['FRA', 'SUR'], // フランス領ギアナ
];

type Entry = [string, Country];

function isEnclaveBorder(a: string, b: string): boolean {
  return ENCLAVE_BORDERS.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

function excludeNeighbors(entries: Entry[], shouldExclude: (code: string, neighbor: string) => boolean): Entry[] {
  return entries.map(([code, country]): Entry => [
    code,
    { ...country, neighbors: country.neighbors.filter((neighbor) => !shouldExclude(code, neighbor)) },
  ]);
}

// 設定に応じて国を除外したデータを新しく作る
export function filterCountries(data: CountryMap, settings: Settings): CountryMap {
  let entries: Entry[] = Object.entries(data);
  if (settings.removeNonmembers) {
    entries = excludeNeighbors(
      entries.filter(([code]) => !NON_MEMBERS.includes(code)),
      (_, neighbor) => NON_MEMBERS.includes(neighbor),
    );
  }
  if (settings.removeEnclaves) {
    entries = excludeNeighbors(entries, isEnclaveBorder);
  }
  // 島国 = 隣接国がない国
  if (settings.removeIslands) {
    entries = entries.filter(([, country]) => country.neighbors.length > 0);
  }
  return Object.fromEntries(entries);
}

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

function searchableNames(country: Country): string[] {
  return [country.enName, country.jaName, country.jaKana].map(normalize);
}

// 英語名・日本語名・読みがなのいずれかに一致する国のコード
export function findCountryCode(countries: CountryMap, input: string): string | undefined {
  const query = normalize(input);
  return Object.keys(countries).find((code) => searchableNames(countries[code]!).includes(query));
}

// 英語名・日本語名・読みがなのいずれかに入力を含む国を予測変換の候補として返す
export function suggestCountries(countries: CountryMap, input: string): Country[] {
  const query = normalize(input);
  if (query === '') return [];
  return Object.values(countries).filter((country) =>
    searchableNames(country).some((name) => name.includes(query)),
  );
}

export function pickRandom<T>(items: readonly T[], random: () => number = Math.random): T | undefined {
  return items[Math.floor(random() * items.length)];
}

export function startGame(countries: CountryMap, random: () => number = Math.random): GameState {
  const first = pickRandom(Object.keys(countries), random);
  if (first === undefined) throw new Error('国データが空です');
  return { current: first, used: new Set([first]), mistakes: 0 };
}

// 現在の国に隣接していて、まだ使われていない国のコード
export function availableNeighbors(countries: CountryMap, state: GameState): string[] {
  return (countries[state.current]?.neighbors ?? []).filter((code) => !state.used.has(code));
}

function moveTo(state: GameState, code: string): GameState {
  return { ...state, current: code, used: new Set(state.used).add(code) };
}

// コンピュータの手を打った後の状態。言える国がなければ null
export function cpuMove(
  countries: CountryMap,
  state: GameState,
  random: () => number = Math.random
): GameState | null {
  const next = pickRandom(availableNeighbors(countries, state), random);
  return next === undefined ? null : moveTo(state, next);
}

// プレイヤーの入力を判定し、判定結果と次の状態を返す
export function playerMove(
  countries: CountryMap,
  state: GameState,
  input: string,
): { result: AnswerResult; state: GameState } {
  const code = findCountryCode(countries, input);
  if (code === undefined || !(countries[state.current]?.neighbors ?? []).includes(code)) {
    return { result: 'not-adjacent', state: { ...state, mistakes: state.mistakes + 1 } };
  }
  if (state.used.has(code)) {
    return { result: 'already-used', state: { ...state, mistakes: state.mistakes + 1 } };
  }
  return { result: 'ok', state: { ...moveTo(state, code), mistakes: 0 } };
}

export function isGameOver(state: GameState): boolean {
  return state.mistakes >= MAX_MISTAKES;
}
