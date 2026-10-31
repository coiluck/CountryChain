// 探索で確定コンボ（詰み）を見つける
import type { CountryMap } from './game.ts';

export type Strategy = {
  play: string; // 自分が言う国
  replies: { reply: string; next: Strategy }[]; // 相手の返し → 次の自分の手。これが空なら相手の負け
};

// 自分が言う回数の上限。これ以上深くするとブラウザが固まる（10 で最悪 0.6 秒ほど）
const SEARCH_DEPTH = 8;

const getLegalMoves = (countries: CountryMap, currentCode: string, used: ReadonlySet<string>) => {
  return (countries[currentCode]?.neighbors ?? []).filter(country => !used.has(country));
}

// current の次に自分が言う番で、depth 回以内に言って相手を詰ませる手順。なければ null
function searchCombo(countries: CountryMap, current: string, used: Set<string>, depth: number): Strategy | null {
  if (depth === 0) return null;

  // 自分の番
  for (const myMove of getLegalMoves(countries, current, used)) {
    used.add(myMove);

    const replies: Strategy['replies'] = [];
    let allWin = true;

    // 相手の番：全部の手に勝てないといけない
    for (const eneMove of getLegalMoves(countries, myMove, used)) {
      used.add(eneMove);
      const next = searchCombo(countries, eneMove, used, depth - 1);
      used.delete(eneMove);

      if (next === null) {   // 1つでも勝てない返しがあったら
        allWin = false;      // この myMove はダメ
        break;
      }
      replies.push({ reply: eneMove, next });
    }

    used.delete(myMove);

    if (allWin) return { play: myMove, replies };
  }

  return null; // どの手を試しても自分は詰ませられない
}

// start の次に言う側を自分として、自分 -> 相手 -> 自分 のうちにどちらかの勝ちが確定するか
export function isDecidedEarly(countries: CountryMap, start: string): boolean {
  const used = new Set([start]);
  // 自分が相手を詰ませられる
  if (searchCombo(countries, start, used, 2) !== null) return true;
  // 自分が何を言っても相手に詰まされる
  return getLegalMoves(countries, start, used).every((myMove) => {
    used.add(myMove);
    const strategy = searchCombo(countries, myMove, used, 1);
    used.delete(myMove);
    return strategy !== null;
  });
}

// current の次に言う手の候補。詰ませる手があればそれだけ、なければ相手に詰まされない手、それもなければすべての手
export function bestMoves(countries: CountryMap, current: string, used: ReadonlySet<string>): string[] {
  const work = new Set(used);
  const strategy = searchCombo(countries, current, work, SEARCH_DEPTH);
  if (strategy !== null) return [strategy.play];

  const moves = getLegalMoves(countries, current, work);
  const safeMoves = moves.filter((myMove) => {
    work.add(myMove);
    const enemyStrategy = searchCombo(countries, myMove, work, SEARCH_DEPTH);
    work.delete(myMove);
    return enemyStrategy === null;
  });
  return safeMoves.length > 0 ? safeMoves : moves;
}

// history（言った順の国）の中で、history[0] の次に言う側が最初に詰ませられるようになった位置とその手順
// CPU側の番（0, 2, 4, ...）だけを調べる
export function findCheckmate(
  countries: CountryMap,
  history: readonly string[],
): { index: number; strategy: Strategy } | null {
  for (let index = 0; index < history.length; index += 2) {
    const strategy = searchCombo(countries, history[index]!, new Set(history.slice(0, index + 1)), SEARCH_DEPTH);
    if (strategy !== null) return { index, strategy };
  }
  return null;
}
