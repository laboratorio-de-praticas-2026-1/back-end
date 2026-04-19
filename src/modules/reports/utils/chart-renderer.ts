/**
 * Chart Renderer - Generates SVG charts without canvas dependency
 * Provides methods to render line, pie, and bar charts as SVG strings
 * encoded in base64 for embedding in PDF documents
 */

const BRAND = {
  navy: '#1B2B4B',
  green: '#2D7D46',
  white: '#FFFFFF',
  gray: '#F4F4F4',
  text: '#1A1A1A',
};

const PALETTE = [
  '#2D7D46',
  '#1B2B4B',
  '#E74C3C',
  '#C0392B',
  '#8E44AD',
  '#3498DB',
  '#E67E22',
  '#F39C12',
  '#1ABC9C',
  '#16A085',
];

/**
 * Converte SVG para base64 data URL
 */
function svgToDataUrl(svg: string): string {
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Renderiza gráfico de linhas em SVG
 */
export async function renderLineChart(
  labels: string[],
  data: number[],
  title: string,
  width = 700,
  height = 300,
): Promise<string> {
  if (data.length === 0) {
    return svgToDataUrl(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="#f9f9f9"/>
        <text x="${width / 2}" y="${height / 2}" text-anchor="middle" font-size="14" fill="#999">
          Sem dados disponíveis
        </text>
      </svg>`,
    );
  }

  const maxValue = Math.max(...data);
  const minValue = 0;
  const padding = 60;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const xStep = chartWidth / (data.length - 1 || 1);
  const yStep = chartHeight / (maxValue - minValue || 1);

  let pathData = '';
  let points: Array<{ x: number; y: number; value: number }> = [];

  data.forEach((value, i) => {
    const x = padding + i * xStep;
    const y = height - padding - (value - minValue) * yStep;
    points.push({ x, y, value });
    pathData += `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  });

  // Gera área preenchida
  const areaPathData =
    pathData +
    ` L ${padding + (data.length - 1) * xStep} ${height - padding} L ${padding} ${height - padding} Z`;

  // Gera labels do eixo X
  const xLabels = labels
    .map((label, i) => {
      const x = padding + i * xStep;
      return `<text x="${x}" y="${height - 20}" text-anchor="middle" font-size="11" fill="${BRAND.text}">${label}</text>`;
    })
    .join('');

  // Gera grid e labels do eixo Y
  let gridAndLabels = '';
  for (let i = 0; i <= 4; i++) {
    const yValue = Math.round((maxValue / 4) * i);
    const y = height - padding - (i * chartHeight) / 4;
    gridAndLabels += `
      <line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="#E0E0E0" stroke-width="1"/>
      <text x="${padding - 10}" y="${y + 4}" text-anchor="end" font-size="11" fill="${BRAND.text}">
        R$ ${yValue.toLocaleString('pt-BR')}
      </text>
    `;
  }

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="white"/>
      
      <!-- Grid -->
      ${gridAndLabels}
      
      <!-- Axes -->
      <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#1A1A1A" stroke-width="2"/>
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#1A1A1A" stroke-width="2"/>
      
      <!-- Area chart -->
      <path d="${areaPathData}" fill="rgba(45,125,70,0.18)" stroke="none"/>
      
      <!-- Line chart -->
      <path d="${pathData}" fill="none" stroke="${BRAND.green}" stroke-width="2.5"/>
      
      <!-- Points -->
      ${points.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="5" fill="#E91E8C"/>`).join('')}
      
      <!-- X Labels -->
      ${xLabels}
      
      <!-- Title -->
      <text x="${width / 2}" y="25" text-anchor="middle" font-size="14" font-weight="bold" fill="${BRAND.text}">
        ${title}
      </text>
    </svg>
  `;

  return svgToDataUrl(svg);
}

/**
 * Renderiza gráfico de pizza em SVG
 */
export async function renderPieChart(
  labels: string[],
  data: number[],
  width = 360,
  height = 260,
): Promise<string> {
  if (data.length === 0) {
    return svgToDataUrl(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="#f9f9f9"/>
        <text x="${width / 2}" y="${height / 2}" text-anchor="middle" font-size="14" fill="#999">
          Sem dados
        </text>
      </svg>`,
    );
  }

  const total = data.reduce((a, b) => a + b, 0);
  const centerX = width * 0.5;
  const centerY = height * 0.45;
  const radius = 60;

  let slices = '';
  let legend = '';
  let currentAngle = -Math.PI / 2;

  data.forEach((value, i) => {
    const sliceAngle = (value / total) * 2 * Math.PI;
    const endAngle = currentAngle + sliceAngle;

    const x1 = centerX + radius * Math.cos(currentAngle);
    const y1 = centerY + radius * Math.sin(currentAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    const color = PALETTE[i % PALETTE.length];
    const percentage = ((value / total) * 100).toFixed(1);

    slices += `<path d="${pathData}" fill="${color}" stroke="white" stroke-width="2"/>`;

    // Legend
    const legendY = 140 + i * 20;
    legend += `
      <rect x="20" y="${legendY - 10}" width="14" height="14" fill="${color}"/>
      <text x="40" y="${legendY}" font-size="11" fill="${BRAND.text}">
        ${labels[i]}: ${percentage}%
      </text>
    `;

    currentAngle = endAngle;
  });

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="white"/>
      
      <!-- Pie slices -->
      ${slices}
      
      <!-- Legend -->
      ${legend}
    </svg>
  `;

  return svgToDataUrl(svg);
}

/**
 * Renderiza gráfico de barras em SVG (horizontal)
 */
export async function renderBarChart(
  labels: string[],
  data: number[],
  title: string,
  width = 700,
  height = 300,
): Promise<string> {
  if (data.length === 0) {
    return svgToDataUrl(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="#f9f9f9"/>
        <text x="${width / 2}" y="${height / 2}" text-anchor="middle" font-size="14" fill="#999">
          Sem dados disponíveis
        </text>
      </svg>`,
    );
  }

  const maxValue = Math.max(...data);
  const padding = 120;
  const barHeight = 20;
  const barGap = 10;
  const totalHeight = labels.length * (barHeight + barGap) + padding * 2;

  let bars = '';
  let labels_svg = '';

  labels.forEach((label, i) => {
    const barWidth = ((data[i] / maxValue) * (width - padding * 2)) || 0;
    const y = padding + i * (barHeight + barGap);
    const color = PALETTE[i % PALETTE.length];

    bars += `<rect x="${padding}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${color}" rx="4"/>`;

    // Label value on bar
    bars += `
      <text x="${padding + barWidth + 5}" y="${y + barHeight / 2 + 4}" font-size="11" fill="${BRAND.text}">
        R$ ${data[i].toLocaleString('pt-BR')}
      </text>
    `;

    // Y axis label
    labels_svg += `<text x="${padding - 10}" y="${y + barHeight / 2 + 4}" text-anchor="end" font-size="11" fill="${BRAND.text}">${label}</text>`;
  });

  const svg = `
    <svg width="${width}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${totalHeight}" fill="white"/>
      
      <!-- Y Axis Line -->
      <line x1="${padding}" y1="20" x2="${padding}" y2="${totalHeight - 40}" stroke="#1A1A1A" stroke-width="2"/>
      
      <!-- X Axis Line -->
      <line x1="${padding}" y1="${totalHeight - 40}" x2="${width - 20}" y2="${totalHeight - 40}" stroke="#1A1A1A" stroke-width="2"/>
      
      <!-- Bars -->
      ${bars}
      
      <!-- Y Labels -->
      ${labels_svg}
      
      <!-- Title -->
      <text x="${width / 2}" y="25" text-anchor="middle" font-size="14" font-weight="bold" fill="${BRAND.text}">
        ${title}
      </text>
    </svg>
  `;

  return svgToDataUrl(svg);
}
