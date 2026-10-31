import { el } from './dom.ts';
import { nearestPointOnRect, placeLabel, type Point, type Rect } from './label-placement.ts';
import { firstLeaf, pathTo, type MoveNode, type MoveTree } from './move-tree.ts';

type NameOf = (code: string) => string;

const FONT = '"mamelon3.5", Arial, sans-serif';
const LABEL_HEIGHT = 20;
const LABEL_PADDING = 9;
// 役割の札は国名の左上にはみ出して置く
const TAG_HEIGHT = 13;
const TAG_OFFSET = { x: 6, y: 8 };
const STAMP_RADIUS = 13;
// 枝先を押したとみなす距離
const HIT_RADIUS = 24;
const ROLE_NAMES = { cpu: 'CPU', player: 'プレイヤー' } as const;

function cssColor(name: string, fallback: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

// 詰みの手順を放射状に描く。下の canvas は木全体で大きさが変わったときだけ、上の canvas は選択やホバーのたびに描き直す
export function createMoveGraph(tree: MoveTree, nameOf: NameOf, actualEnd: MoveNode | null): HTMLDivElement {
  const base = el('canvas', '');
  const overlay = el('canvas', '');
  overlay.setAttribute('role', 'img');
  overlay.setAttribute('aria-label', `あなたの答え方${tree.leaves.length}通りがすべて詰みで終わる図`);
  const stage = el('div', 'graph-stage', base, overlay);
  const hint = el('p', 'graph-hint', '枝先を押すと、その流れの国を表示します');
  const wrapper = el('div', 'move-graph', stage,
    el('div', 'graph-legend',
      el('span', '', el('i', 'is-mate'), '詰み'),
      el('span', '', el('i', 'is-actual'), '実際の流れ'),
      el('span', '', el('i', 'is-selected'), '表示中の流れ'),
    ),
    hint,
  );

  const baseCtx = base.getContext('2d')!;
  const overlayCtx = overlay.getContext('2d')!;
  const ink = cssColor('--color-ink', '#2a1414');
  const primary = cssColor('--color-primary', '#ff7f7e');
  const actualPath = actualEnd === null ? [] : pathTo(actualEnd);
  let selected = firstLeaf(actualEnd ?? tree.root);
  let hovered: MoveNode | null = null;

  // 大きさに応じた値
  let size = 0;
  let innerRadius = 0;
  let plyStep = 0;
  let centerRect: Rect = { x: 0, y: 0, width: 0, height: 0 };
  const center = (): Point => ({ x: size / 2, y: size / 2 });

  function pos(node: MoveNode): Point {
    const r = innerRadius + node.ply * plyStep;
    return { x: size / 2 + Math.cos(node.angle) * r, y: size / 2 + Math.sin(node.angle) * r };
  }

  // CPU → プレイヤーは枝分かれするので曲線、プレイヤー → CPU は一本道なので直線
  function traceLink(path: Path2D, from: MoveNode, to: MoveNode): void {
    const end = pos(to);
    if (to.role === 'player') {
      const r = innerRadius + (from.ply + to.ply) / 2 * plyStep;
      path.bezierCurveTo(
        size / 2 + Math.cos(from.angle) * r, size / 2 + Math.sin(from.angle) * r,
        size / 2 + Math.cos(to.angle) * r, size / 2 + Math.sin(to.angle) * r,
        end.x, end.y,
      );
    } else {
      path.lineTo(end.x, end.y);
    }
  }

  function linePath(nodes: readonly MoveNode[]): Path2D {
    const path = new Path2D();
    const start = pos(nodes[0]!);
    path.moveTo(start.x, start.y);
    for (let i = 1; i < nodes.length; i++) traceLink(path, nodes[i - 1]!, nodes[i]!);
    return path;
  }

  function resize(): boolean {
    const width = stage.clientWidth;
    if (width === 0 || width === size) return false;
    size = width;
    const dpr = window.devicePixelRatio || 1;
    for (const [canvas, ctx] of [[base, baseCtx], [overlay, overlayCtx]] as const) {
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    innerRadius = Math.max(34, size * 0.07);
    plyStep = (size / 2 - innerRadius - 16) / Math.max(tree.maxPly, 1);
    return true;
  }

  // 木全体。線・点ともに1本の Path2D にまとめて一度に描く
  function drawBase(): void {
    const ctx = baseCtx;
    ctx.clearRect(0, 0, size, size);
    const { x: cx, y: cy } = center();

    // 何手先かの目安になる輪
    const rings = new Path2D();
    for (let ply = 2; ply <= tree.maxPly; ply += 2) {
      const r = innerRadius + ply * plyStep;
      rings.moveTo(cx + r, cy);
      rings.arc(cx, cy, r, 0, Math.PI * 2);
    }
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1;
    ctx.stroke(rings);

    const links = new Path2D();
    (function trace(node: MoveNode) {
      for (const child of node.children) {
        const start = pos(node);
        links.moveTo(start.x, start.y);
        traceLink(links, node, child);
        trace(child);
      }
    })(tree.root);
    const many = tree.leaves.length;
    ctx.globalAlpha = many > 600 ? 0.16 : many > 100 ? 0.26 : 0.4;
    ctx.lineWidth = many > 600 ? 0.8 : 1.4;
    ctx.lineCap = 'round';
    ctx.stroke(links);

    const dotRadius = Math.min(4.5, Math.max(1.6, 900 / many));
    const dots = new Path2D();
    for (const leaf of tree.leaves) {
      const { x, y } = pos(leaf);
      dots.moveTo(x + dotRadius, y);
      dots.arc(x, y, dotRadius, 0, Math.PI * 2);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = primary;
    ctx.fill(dots);
  }

  // 真ん中：コンピュータの最初の手
  function drawCenter(ctx: CanvasRenderingContext2D): void {
    const { x, y } = center();
    ctx.font = `${Math.round(innerRadius * 0.36)}px ${FONT}`;
    const width = Math.max(innerRadius * 1.7, ctx.measureText(nameOf(tree.root.code)).width + 28);
    const height = innerRadius * 0.9;
    centerRect = { x: x - width / 2, y: y - height / 2, width, height };
    ctx.beginPath();
    ctx.roundRect(centerRect.x, centerRect.y, width, height, height / 2);
    ctx.fillStyle = ink;
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(nameOf(tree.root.code), x, y + 1);
  }

  function strokePath(path: Path2D, color: string, width: number, alpha = 1): void {
    overlayCtx.globalAlpha = alpha;
    overlayCtx.strokeStyle = color;
    overlayCtx.lineWidth = width;
    overlayCtx.lineCap = 'round';
    overlayCtx.lineJoin = 'round';
    overlayCtx.stroke(path);
    overlayCtx.globalAlpha = 1;
  }

  function drawStamp({ x, y }: Point): void {
    const ctx = overlayCtx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.2);
    ctx.beginPath();
    ctx.arc(0, 0, STAMP_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = primary;
    ctx.stroke();
    ctx.fillStyle = primary;
    ctx.font = `bold 14px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('詰', 0, 1);
    ctx.restore();
  }

  // 表示中の流れのうち、枝分かれするところと枝先に国名を出す
  function labelTargets(path: readonly MoveNode[]): MoveNode[] {
    const isBranch = (node: MoveNode) => node.role === 'cpu'
      ? node.children.length >= 2
      : node.parent!.children.length >= 2;
    return [selected, ...path.filter((node) => node !== tree.root && node !== selected && isBranch(node))];
  }

  function drawLabels(path: readonly MoveNode[]): void {
    const ctx = overlayCtx;
    const bounds = { x: 4, y: 4, width: size - 8, height: size - 8 };
    const stampPoint = pos(selected);
    const taken: Rect[] = [
      centerRect,
      { x: stampPoint.x - STAMP_RADIUS, y: stampPoint.y - STAMP_RADIUS, width: STAMP_RADIUS * 2, height: STAMP_RADIUS * 2 },
    ];

    // 先に場所を決めて、引き出し線を国名の下に描く
    const labels = labelTargets(path).map((node) => {
      ctx.font = `12px ${FONT}`;
      const pillWidth = ctx.measureText(nameOf(node.code)).width + LABEL_PADDING * 2;
      ctx.font = `9px ${FONT}`;
      const tagWidth = ctx.measureText(ROLE_NAMES[node.role]).width + 10;
      const anchor = pos(node);
      const box = placeLabel(anchor, center(), {
        width: Math.max(pillWidth + TAG_OFFSET.x, tagWidth),
        height: LABEL_HEIGHT + TAG_OFFSET.y,
      }, taken, bounds);
      taken.push(box);
      const pill = { x: box.x + TAG_OFFSET.x, y: box.y + TAG_OFFSET.y, width: pillWidth, height: LABEL_HEIGHT };
      return { node, anchor, pill, tag: { x: box.x, y: box.y, width: tagWidth, height: TAG_HEIGHT } };
    });

    ctx.lineWidth = 1.2;
    ctx.strokeStyle = ink;
    for (const { anchor, pill } of labels) {
      const end = nearestPointOnRect(anchor, pill);
      ctx.beginPath();
      ctx.moveTo(anchor.x, anchor.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    for (const { node, anchor, pill, tag } of labels) {
      const isCpu = node.role === 'cpu';
      // 節の印
      ctx.beginPath();
      ctx.arc(anchor.x, anchor.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = isCpu ? '#fff' : ink;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 国名：プレイヤーは濃い色、CPU は白（チャットの吹き出しと同じ）
      ctx.beginPath();
      ctx.roundRect(pill.x, pill.y, pill.width, pill.height, pill.height / 2);
      ctx.fillStyle = isCpu ? '#fff' : ink;
      ctx.fill();
      if (isCpu) ctx.stroke();
      ctx.font = `12px ${FONT}`;
      ctx.fillStyle = isCpu ? ink : '#fff';
      ctx.fillText(nameOf(node.code), pill.x + LABEL_PADDING, pill.y + pill.height / 2 + 1);

      if (isCpu) {
        ctx.beginPath();
        ctx.roundRect(tag.x, tag.y, tag.width, tag.height, 5);
        ctx.fillStyle = primary;
        ctx.fill();
        ctx.font = `9px ${FONT}`;
        ctx.fillStyle = '#fff';
        ctx.fillText(ROLE_NAMES[node.role], tag.x + 5, tag.y + tag.height / 2 + 1);
      }
    }
  }

  function drawOverlay(): void {
    overlayCtx.clearRect(0, 0, size, size);
    if (hovered !== null && hovered !== selected) strokePath(linePath(pathTo(hovered)), ink, 2.5, 0.4);
    if (actualPath.length > 1) strokePath(linePath(actualPath), ink, 3.5);
    const path = pathTo(selected);
    const line = linePath(path);
    strokePath(line, '#fff', 8);
    strokePath(line, primary, 4.5);
    drawCenter(overlayCtx);
    drawLabels(path);
    // 枝先の節の印に隠れないよう最後に
    drawStamp(pos(selected));
  }

  // ホバーのたびに描き直さないよう、1フレームにまとめる
  let frame = 0;
  function requestOverlay(): void {
    if (frame !== 0) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      drawOverlay();
    });
  }

  function nearestLeaf(event: PointerEvent | MouseEvent): MoveNode | null {
    const rect = overlay.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    let best: MoveNode | null = null;
    let bestDistance = HIT_RADIUS ** 2;
    for (const leaf of tree.leaves) {
      const p = pos(leaf);
      const distance = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = leaf;
      }
    }
    return best;
  }

  overlay.addEventListener('pointermove', (event) => {
    const leaf = nearestLeaf(event);
    overlay.style.cursor = leaf === null ? '' : 'pointer';
    if (leaf === hovered) return;
    hovered = leaf;
    requestOverlay();
  });
  overlay.addEventListener('pointerleave', () => {
    hovered = null;
    requestOverlay();
  });
  overlay.addEventListener('click', (event) => {
    const leaf = nearestLeaf(event);
    if (leaf === null || leaf === selected) return;
    selected = leaf;
    hint.hidden = true;
    requestOverlay();
  });

  function drawAll(): void {
    if (size === 0) return;
    drawBase();
    drawOverlay();
  }
  new ResizeObserver(() => {
    if (resize()) drawAll();
  }).observe(stage);
  // 国名の幅をフォントで測るので、読み込み後に描き直す
  document.fonts.load(`12px ${FONT}`).then(drawAll);

  return wrapper;
}
