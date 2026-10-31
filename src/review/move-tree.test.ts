import { describe, expect, it } from 'vitest';
import type { Strategy } from '../search.ts';
import { buildMoveTree, firstLeaf, followPlayed, pathTo } from './move-tree.ts';

// A のあと、プレイヤーが B なら C で詰み、D なら E → F → G で詰み
const strategy: Strategy = {
  play: 'A',
  replies: [
    { reply: 'B', next: { play: 'C', replies: [] } },
    { reply: 'D', next: { play: 'E', replies: [{ reply: 'F', next: { play: 'G', replies: [] } }] } },
  ],
};

const codes = (nodes: { code: string }[]) => nodes.map((node) => node.code);

describe('buildMoveTree', () => {
  const tree = buildMoveTree(strategy);

  it('CPU とプレイヤーの手を交互に節にする', () => {
    expect(tree.root).toMatchObject({ code: 'A', role: 'cpu', ply: 0 });
    expect(codes(tree.root.children)).toEqual(['B', 'D']);
    expect(tree.root.children.map((node) => node.role)).toEqual(['player', 'player']);
    expect(codes(tree.root.children[1]!.children)).toEqual(['E']);
  });

  it('枝先は言えなくなる CPU の手', () => {
    expect(codes(tree.leaves)).toEqual(['C', 'G']);
    expect(tree.leaves.map((leaf) => leaf.ply)).toEqual([2, 4]);
    expect(tree.maxPly).toBe(4);
  });

  it('枝先を円周上に等間隔に並べ、親は子の真ん中に置く', () => {
    const [c, g] = tree.leaves;
    expect(g!.angle - c!.angle).toBeCloseTo(Math.PI);
    expect(tree.root.angle).toBeCloseTo((c!.angle + g!.angle) / 2);
    // 一本道は同じ角度
    expect(tree.root.children[1]!.angle).toBeCloseTo(g!.angle);
  });

  it('すぐ詰むなら root だけが枝先', () => {
    const single = buildMoveTree({ play: 'A', replies: [] });
    expect(single.leaves).toEqual([single.root]);
    expect(single.maxPly).toBe(0);
  });
});

describe('pathTo', () => {
  it('root からの節を返す', () => {
    const tree = buildMoveTree(strategy);
    expect(codes(pathTo(tree.leaves[1]!))).toEqual(['A', 'D', 'E', 'F', 'G']);
  });
});

describe('followPlayed', () => {
  const tree = buildMoveTree(strategy);

  it('実際の流れをたどれるところまで進む', () => {
    expect(followPlayed(tree.root, ['A', 'D', 'E', 'F', 'G'])?.code).toBe('G');
  });

  it('途中から違えば、そこまで', () => {
    expect(codes(pathTo(followPlayed(tree.root, ['A', 'D', 'X', 'Y'])!))).toEqual(['A', 'D']);
  });

  it('最初の手から違えば null', () => {
    expect(followPlayed(tree.root, ['X', 'D'])).toBeNull();
  });
});

describe('firstLeaf', () => {
  it('先頭の子をたどった枝先', () => {
    const tree = buildMoveTree(strategy);
    expect(firstLeaf(tree.root).code).toBe('C');
    expect(firstLeaf(tree.root.children[1]!).code).toBe('G');
  });
});
