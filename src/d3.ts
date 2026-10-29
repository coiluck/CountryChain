import * as d3 from 'd3';

// borderのほうにあってmapのほうにない国リスト
const MISSING_COORDS: Record<string, [number, number]> = {
  "AND": [1.52, 42.50],   // Andorra
  "ATG": [-61.85, 17.12], // Antigua and Barbuda
  "BHR": [50.55, 26.06],  // Bahrain
  "BRB": [-59.54, 13.19], // Barbados
  "COM": [43.33, -11.64], // Comoros
  "CPV": [-24.01, 16.00], // Cape Verde
  "DMA": [-61.37, 15.41], // Dominica
  "FSM": [158.15, 6.92],  // Micronesia
  "GRD": [-61.67, 12.11], // Grenada
  "KIR": [-157.36, 1.87], // Kiribati (Christmas Island付近)
  "KNA": [-62.78, 17.35], // Saint Kitts and Nevis
  "LCA": [-60.97, 13.90], // Saint Lucia
  "LIE": [9.55, 47.16],   // Liechtenstein
  "MCO": [7.42, 43.73],   // Monaco
  "MDV": [73.22, 3.20],   // Maldives
  "MHL": [171.18, 7.13],  // Marshall Islands
  "MLT": [14.45, 35.93],  // Malta
  "MUS": [57.55, -20.34], // Mauritius
  "NRU": [166.93, -0.52], // Nauru
  "PLW": [134.58, 7.51],  // Palau
  "SGP": [103.81, 1.35],  // Singapore
  "SMR": [12.45, 43.94],  // San Marino
  "STP": [6.61, 0.18],    // Sao Tome and Principe
  "SYC": [55.49, -4.67],  // Seychelles
  "TON": [-175.19, -21.17], // Tonga
  "TUV": [179.14, -8.51], // Tuvalu
  "VAT": [12.45, 41.90],  // Vatican City
  "VCT": [-61.22, 13.25], // Saint Vincent and the Grenadines
  "WSM": [-172.10, -13.75] // Samoa
};

// viewBox の大きさ。表示サイズは CSS で決める
const WIDTH = 500;
const HEIGHT = 250;
const MAX_ZOOM = 10;

// 地図データは大きいので、最初に描画するときに読み込む
let mapData: Promise<d3.ExtendedFeatureCollection> | undefined;
function loadCountryMapData(): Promise<d3.ExtendedFeatureCollection> {
  mapData ??= import('./data/country-map.json').then((m) => m.default as unknown as d3.ExtendedFeatureCollection);
  return mapData;
}

// current を中心にした地図を container に描く。used は使用済みの国
export async function renderMap(container: HTMLElement, used: ReadonlySet<string>, current: string): Promise<void> {
  const data = await loadCountryMapData();

  // SVGの作成
  const svg = d3.select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${WIDTH} ${HEIGHT}`)
    .attr("class", "size-full");

  const projection = d3.geoMercator()
    .fitSize([WIDTH, HEIGHT], data);

  const pathGenerator = d3.geoPath().projection(projection);

  const mapGroup = svg.append("g");

  // 色は main.css の .is-current / .is-used で付ける
  function stateOf(id: string): string | null {
    if (id === current) return "is-current"; // 今の国
    if (used.has(id)) return "is-used"; // 履歴
    return null;
  }

  // 地図の描画と色塗り
  mapGroup.selectAll("path")
    .data(data.features)
    .join("path")
    .attr("d", pathGenerator)
    .attr("class", (d) => stateOf(String(d.id)));

  mapGroup.selectAll("circle")
    .data(Object.entries(MISSING_COORDS))
    .join("circle")
    .attr("cx", ([, coords]) => projection(coords)?.[0] ?? 0)
    .attr("cy", ([, coords]) => projection(coords)?.[1] ?? 0)
    .attr("r", 0.3) // 点の国のサイズ, (* 10) pxに拡大
    .attr("class", ([id]) => stateOf(id));

  // zoom設定
  let transform = d3.zoomIdentity; // デフォルトは1
  const targetFeature = data.features.find((f) => f.id === current);
  const missingCoords = MISSING_COORDS[current];

  if (targetFeature) {
    // 画面上の範囲で測ると、日付変更線をまたぐ国（ロシアなど）は地図の端から端までになる。
    // 経緯度の範囲から求める
    const [[west, south], [east, north]] = d3.geoBounds(targetFeature);
    const [left, top] = projection([west, north]) ?? [0, 0];
    const [, bottom] = projection([west, south]) ?? [0, 0];
    const lonSpan = east >= west ? east - west : east - west + 360;
    const dx = lonSpan * Math.PI / 180 * projection.scale();
    const dy = bottom - top;
    const x = left + dx / 2;
    const y = (top + bottom) / 2;

    const calcedScale = 0.6 / Math.max(dx / WIDTH, dy / HEIGHT);
    const scale = Math.min(calcedScale, MAX_ZOOM);

    transform = d3.zoomIdentity
      .translate(WIDTH / 2 - scale * x, HEIGHT / 2 - scale * y)
      .scale(scale);
  } else if (missingCoords) {
    const projected = projection(missingCoords); // [x, y]

    if (projected) {
      const [x, y] = projected;
      transform = d3.zoomIdentity
        .translate(WIDTH / 2 - MAX_ZOOM * x, HEIGHT / 2 - MAX_ZOOM * y)
        .scale(MAX_ZOOM);
    }
  }
  mapGroup.transition().duration(750)
    .attr("transform", transform.toString());
}
