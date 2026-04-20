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
export function renderLineChart(
  labels: string[],
  data: number[],
  title: string,
  width = 700,
  height = 300,
): string {
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

  const rotateLabels = labels.length > 10;
  const leftPadding = 60;
  const rightPadding = 40;
  const topPadding = 45;
  const bottomPadding = rotateLabels ? 85 : 60;

  const chartWidth = width - leftPadding - rightPadding;
  const chartHeight = height - topPadding - bottomPadding;

  const xStep = chartWidth / (data.length - 1 || 1);
  const yStep = chartHeight / (maxValue - minValue || 1);

  // Limita quantidade de labels no eixo X para manter legibilidade.
  const maxVisibleLabels = 8;
  const labelStep = Math.max(1, Math.ceil(labels.length / maxVisibleLabels));
  const visibleLabelIdx = new Set<number>();
  labels.forEach((_, i) => {
    if (i % labelStep === 0 || i === labels.length - 1) visibleLabelIdx.add(i);
  });

  let pathData = '';
  const points: Array<{ x: number; y: number; value: number }> = [];

  data.forEach((value, i) => {
    const x = leftPadding + i * xStep;
    const y = height - bottomPadding - (value - minValue) * yStep;
    points.push({ x, y, value });
    pathData += `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  });

  // Gera área preenchida
  const areaPathData =
    pathData +
    ` L ${leftPadding + (data.length - 1) * xStep} ${height - bottomPadding} L ${leftPadding} ${height - bottomPadding} Z`;

  // Gera labels do eixo X
  const xLabels = labels
    .map((label, i) => {
      const shouldShow = visibleLabelIdx.has(i);
      if (!shouldShow) return '';

      const x = leftPadding + i * xStep;
      const y = height - (rotateLabels ? 22 : 18);

      if (rotateLabels) {
        return `<text x="${x}" y="${y}" text-anchor="end" transform="rotate(-35 ${x} ${y})" font-size="10" fill="${BRAND.text}">${label}</text>`;
      }

      return `<text x="${x}" y="${y}" text-anchor="middle" font-size="11" fill="${BRAND.text}">${label}</text>`;
    })
    .join('');

  const xGuideLines = labels
    .map((_, i) => {
      if (!visibleLabelIdx.has(i)) return '';
      const x = leftPadding + i * xStep;
      return `<line x1="${x}" y1="${topPadding}" x2="${x}" y2="${height - bottomPadding}" stroke="#E9EDF3" stroke-width="1" stroke-dasharray="2 4"/>`;
    })
    .join('');

  const maxIndex = data.indexOf(maxValue);
  const maxPoint = points[maxIndex];
  const maxLabel = labels[maxIndex] ?? '';

  // Gera grid e labels do eixo Y
  let gridAndLabels = '';
  for (let i = 0; i <= 4; i++) {
    const yValue = Math.round((maxValue / 4) * i);
    const y = height - bottomPadding - (i * chartHeight) / 4;
    gridAndLabels += `
      <line x1="${leftPadding}" y1="${y}" x2="${width - rightPadding}" y2="${y}" stroke="#E0E0E0" stroke-width="1"/>
      <text x="${leftPadding - 10}" y="${y + 4}" text-anchor="end" font-size="11" fill="${BRAND.text}">
        R$ ${yValue.toLocaleString('pt-BR')}
      </text>
    `;
  }

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="white"/>
      
      <!-- Grid -->
      ${gridAndLabels}

      <!-- X Guide Lines -->
      ${xGuideLines}
      
      <!-- Axes -->
      <line x1="${leftPadding}" y1="${topPadding}" x2="${leftPadding}" y2="${height - bottomPadding}" stroke="#1A1A1A" stroke-width="2"/>
      <line x1="${leftPadding}" y1="${height - bottomPadding}" x2="${width - rightPadding}" y2="${height - bottomPadding}" stroke="#1A1A1A" stroke-width="2"/>
      
      <!-- Area chart -->
      <path d="${areaPathData}" fill="rgba(45,125,70,0.18)" stroke="none"/>
      
      <!-- Line chart -->
      <path d="${pathData}" fill="none" stroke="${BRAND.green}" stroke-width="2.5"/>
      
      <!-- Points -->
      ${points
        .map((p, i) => {
          const isMaxPoint = i === maxIndex;
          const isLabeledPoint = visibleLabelIdx.has(i);
          const r = isMaxPoint ? 6 : isLabeledPoint ? 4.5 : 3.2;
          const fill = isMaxPoint
            ? '#E91E8C'
            : isLabeledPoint
              ? '#C2187A'
              : '#D8A3C9';
          return `<circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${fill}"/>`;
        })
        .join('')}

      <!-- Peak annotation -->
      <text x="${maxPoint.x}" y="${Math.max(topPadding + 12, maxPoint.y - 12)}" text-anchor="middle" font-size="10" fill="#6F2C5B" font-weight="600">
        ${maxLabel} • R$ ${maxValue.toLocaleString('pt-BR')}
      </text>
      
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
export function renderPieChart(
  labels: string[],
  data: number[],
  width = 360,
  height = 260,
  options?: {
    includeZeroInLegend?: boolean;
  },
): string {
  const includeZeroInLegend = options?.includeZeroInLegend ?? false;

  if (labels.length === 0 || data.length === 0) {
    return svgToDataUrl(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="#f9f9f9"/>
        <text x="${width / 2}" y="${height / 2}" text-anchor="middle" font-size="14" fill="#999">
          Sem dados
        </text>
      </svg>`,
    );
  }

  const entries = labels.map((label, i) => ({
    label,
    value: data[i] ?? 0,
    idx: i,
  }));
  const normalized = entries.filter((item) => item.value > 0);
  const legendEntries = includeZeroInLegend ? entries : normalized;

  const total = normalized.reduce((acc, item) => acc + item.value, 0);
  if (legendEntries.length === 0) {
    return svgToDataUrl(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="#f9f9f9"/>
        <text x="${width / 2}" y="${height / 2}" text-anchor="middle" font-size="14" fill="#999">
          Sem dados
        </text>
      </svg>`,
    );
  }

  const pieAreaHeight = 180;
  const legendLineHeight = 20;
  const legendTop = 176;
  const dynamicHeight = Math.max(
    height,
    legendTop + legendEntries.length * legendLineHeight + 20,
  );

  const centerX = width * 0.5;
  const centerY = 88;
  const radius = 62;

  let slices = '';
  let legend = '';
  let currentAngle = -Math.PI / 2;

  if (total > 0 && normalized.length === 1) {
    const item = normalized[0];
    const color = PALETTE[item.idx % PALETTE.length];
    slices = `<circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="${color}" stroke="white" stroke-width="2"/>`;
  }

  if (total > 0 && normalized.length > 1) {
    normalized.forEach((item) => {
      const value = item.value;
      const sliceAngle = (value / total) * 2 * Math.PI;
      const endAngle = currentAngle + sliceAngle;

      const x1 = centerX + radius * Math.cos(currentAngle);
      const y1 = centerY + radius * Math.sin(currentAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);

      const largeArc = sliceAngle > Math.PI ? 1 : 0;
      const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      const color = PALETTE[item.idx % PALETTE.length];

      slices += `<path d="${pathData}" fill="${color}" stroke="white" stroke-width="2"/>`;
      currentAngle = endAngle;
    });
  }

  if (total <= 0) {
    slices = `<circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="#EEF2F7" stroke="#D9E2EC" stroke-width="2"/>`;
  }

  legendEntries.forEach((item, i) => {
    const color = PALETTE[item.idx % PALETTE.length];
    const percentage =
      total > 0
        ? ((item.value / total) * 100).toFixed(1).replace(/\.0$/, '')
        : '0';
    const legendY = legendTop + i * legendLineHeight;
    legend += `
      <rect x="20" y="${legendY - 10}" width="14" height="14" fill="${color}"/>
      <text x="40" y="${legendY}" font-size="11" fill="${BRAND.text}">
        ${item.label}: ${percentage}%
      </text>
    `;
  });

  const svg = `
    <svg width="${width}" height="${dynamicHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${dynamicHeight}" fill="white"/>
      
      <!-- Pie slices -->
      ${slices}
      
      <!-- Legend -->
      ${legend}

      <!-- Spacer -->
      <rect x="0" y="${pieAreaHeight}" width="${width}" height="1" fill="transparent"/>
    </svg>
  `;

  return svgToDataUrl(svg);
}

/**
 * Renderiza gráfico de barras em SVG (horizontal)
 */
export function renderBarChart(
  labels: string[],
  data: number[],
  title: string,
  width = 700,
  height = 300,
): string {
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
    const barWidth = (data[i] / maxValue) * (width - padding * 2) || 0;
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
