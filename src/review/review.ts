import type { Strategy } from '../search.ts';
import { el } from './dom.ts';
import { createMoveGraph } from './graph.ts';
import { createMoveList } from './list.ts';
import { buildMoveTree, followPlayed, pathTo } from './move-tree.ts';

export type Review = {
  // 詰みになった局面からの CPU の手順
  strategy: Strategy;
  // strategy の最初の手から、実際に言った順の国
  played: readonly string[];
  // 詰みになったときにプレイヤーが答えた国。最初から詰みなら null
  answer: string | null;
  nameOf: (code: string) => string;
};

// 振り返りのカード。最初は全手順の一覧、ボタンでグラフに切り替える
export function createReview({ strategy, played, answer, nameOf }: Review): HTMLElement {
  const tree = buildMoveTree(strategy);
  const actualEnd = followPlayed(tree.root, played);
  const list = createMoveList(tree, nameOf, new Set(actualEnd === null ? [] : pathTo(actualEnd)));
  // グラフは重いので、初めて開くときに作る
  let graph: HTMLDivElement | undefined;

  const title = answer === null
    ? el('h2', 'review-title', '最初から詰んでいました')
    : el('h2', 'review-title', el('mark', '', nameOf(answer)), 'と答えた時点で詰みでした');

  const body = el('div', 'review-body', list);
  const head = el('div', 'review-section-head', el('span', 'review-section-label', 'コンピュータが読んだ全手順'));
  if (tree.root.children.length > 0) {
    let showsGraph = false;
    const toggle = el('button', 'review-toggle press', 'グラフで見る');
    toggle.type = 'button';
    toggle.addEventListener('click', () => {
      showsGraph = !showsGraph;
      body.replaceChildren(showsGraph ? (graph ??= createMoveGraph(tree, nameOf, actualEnd)) : list);
      toggle.textContent = showsGraph ? '一覧で見る' : 'グラフで見る';
    });
    head.append(toggle);
  }

  return el('section', 'review',
    el('div', 'review-header',
      el('div', 'review-eyebrow', '振り返り'),
      title,
      el('p', 'review-lead', 'ここから先、あなたの答え方 ', el('strong', '', `${tree.leaves.length.toLocaleString('ja-JP')}通り`), ' はどれを選んでも詰みになります。'),
    ),
    head,
    body,
  );
}
