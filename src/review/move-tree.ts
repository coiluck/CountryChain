import type { Strategy } from '../search.ts';

export type Role = 'cpu' | 'player';

// 詰みの手順を1手ずつの節にした木。CPU の節の子はプレイヤーの答え、プレイヤーの節の子は CPU の返し1つ
export type MoveNode = {
  code: string;
  role: Role;
  // 最初の CPU の手からの手数
  ply: number;
  // 放射状に並べたときの角度（ラジアン）。枝先は円周上に等間隔、親は子の真ん中
  angle: number;
  parent: MoveNode | null;
  children: MoveNode[];
};

export type MoveTree = {
  root: MoveNode;
  // 枝先 = プレイヤーが言える国がなくなる CPU の手
  leaves: MoveNode[];
  maxPly: number;
};

function countLeaves(strategy: Strategy): number {
  if (strategy.replies.length === 0) return 1;
  return strategy.replies.reduce((sum, { next }) => sum + countLeaves(next), 0);
}

export function buildMoveTree(strategy: Strategy): MoveTree {
  const total = countLeaves(strategy);
  const leaves: MoveNode[] = [];
  let maxPly = 0;

  function cpuNode(s: Strategy, ply: number, parent: MoveNode | null): MoveNode {
    const node: MoveNode = { code: s.play, role: 'cpu', ply, angle: 0, parent, children: [] };
    maxPly = Math.max(maxPly, ply);
    if (s.replies.length === 0) {
      // 真上から時計回り
      node.angle = -Math.PI / 2 + ((leaves.length + 0.5) / total) * Math.PI * 2;
      leaves.push(node);
      return node;
    }
    for (const { reply, next } of s.replies) {
      const player: MoveNode = { code: reply, role: 'player', ply: ply + 1, angle: 0, parent: node, children: [] };
      const child = cpuNode(next, ply + 2, player);
      player.angle = child.angle;
      player.children.push(child);
      node.children.push(player);
    }
    node.angle = (node.children[0]!.angle + node.children.at(-1)!.angle) / 2;
    return node;
  }

  return { root: cpuNode(strategy, 0, null), leaves, maxPly };
}

// root から node までの節
export function pathTo(node: MoveNode): MoveNode[] {
  const path: MoveNode[] = [];
  for (let n: MoveNode | null = node; n !== null; n = n.parent) path.unshift(n);
  return path;
}

// played（root の CPU の手から実際に言った順の国）をたどれる一番深い節。最初から違えば null
export function followPlayed(root: MoveNode, played: readonly string[]): MoveNode | null {
  if (played[0] !== root.code) return null;
  let node = root;
  for (const code of played.slice(1)) {
    const next = node.children.find((child) => child.code === code);
    if (next === undefined) break;
    node = next;
  }
  return node;
}

// node から先頭の子をたどった枝先
export function firstLeaf(node: MoveNode): MoveNode {
  let n = node;
  while (n.children.length > 0) n = n.children[0]!;
  return n;
}
