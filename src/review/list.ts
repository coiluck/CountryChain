import { el } from './dom.ts';
import type { MoveNode, MoveTree } from './move-tree.ts';

type NameOf = (code: string) => string;

// 1行に1手。言える国がなくなる手には詰みの印、実際に通った手には実際の印
function moveRow(node: MoveNode, nameOf: NameOf, actual: ReadonlySet<MoveNode>): HTMLSpanElement {
  const row = el('span', 'move-row', el('span', `move is-${node.role}`, nameOf(node.code)));
  if (node.children.length === 0) row.append(el('span', 'move-mate', '詰み'));
  if (actual.has(node)) row.append(el('span', 'move-actual', '実際'));
  return row;
}

// CPU の手に対するプレイヤーの答えを枝分かれさせ、それぞれの下に CPU の返しを続ける（TUI と同じ並び）
function replies(cpu: MoveNode, nameOf: NameOf, actual: ReadonlySet<MoveNode>): HTMLUListElement {
  const list = el('ul', '');
  for (const player of cpu.children) {
    const next = player.children[0]!;
    const then = el('div', 'move-then', moveRow(next, nameOf, actual));
    if (next.children.length > 0) then.append(replies(next, nameOf, actual));
    list.append(el('li', '', moveRow(player, nameOf, actual), then));
  }
  return list;
}

// 全手順を罫線つきの入れ子リストで表示する。actual は実際に通った節
export function createMoveList(tree: MoveTree, nameOf: NameOf, actual: ReadonlySet<MoveNode>): HTMLDivElement {
  const rootItem = el('li', 'move-root', moveRow(tree.root, nameOf, actual));
  if (tree.root.children.length > 0) rootItem.append(replies(tree.root, nameOf, actual));

  return el('div', 'move-list',
    el('div', 'move-legend',
      el('span', 'move is-player', 'あなた'),
      el('span', 'move is-cpu', 'コンピュータ'),
    ),
    el('ul', 'move-tree', rootItem),
  );
}
