import { ChartConfiguration } from 'chart.js';
import { createCanvas } from 'canvas';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

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

export async function renderLineChart(
  labels: string[],
  data: number[],
  title: string,
  width = 700,
  height = 300,
): Promise<string> {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;

  const config: ChartConfiguration = {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: title,
          data,
          fill: true,
          backgroundColor: 'rgba(45,125,70,0.18)',
          borderColor: BRAND.green,
          borderWidth: 2.5,
          pointBackgroundColor: '#E91E8C',
          pointRadius: 5,
          tension: 0.35,
        },
      ],
    },
    options: {
      responsive: false,
      animation: false as any,
      plugins: {
        legend: { display: false },
        title: { display: false },
      },
      scales: {
        x: {
          ticks: { color: BRAND.text, font: { size: 11 } },
          grid: { color: '#E0E0E0' },
        },
        y: {
          ticks: {
            color: BRAND.text,
            font: { size: 11 },
            callback: (v) =>
              `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`,
          },
          grid: { color: '#E0E0E0' },
        },
      },
    },
  };

  new Chart(ctx as any, config);
  return canvas.toDataURL('image/png');
}

export async function renderPieChart(
  labels: string[],
  data: number[],
  width = 360,
  height = 260,
): Promise<string> {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;

  const config: ChartConfiguration = {
    type: 'pie',
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: PALETTE.slice(0, data.length),
          borderWidth: 2,
          borderColor: '#fff',
        },
      ],
    },
    options: {
      responsive: false,
      animation: false as any,
      plugins: {
        legend: {
          display: true,
          position: 'right',
          labels: {
            font: { size: 11 },
            color: BRAND.text,
            padding: 10,
            boxWidth: 14,
          },
        },
      },
    },
  };

  new Chart(ctx as any, config);
  return canvas.toDataURL('image/png');
}

export async function renderBarChart(
  labels: string[],
  data: number[],
  title: string,
  width = 700,
  height = 300,
): Promise<string> {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;

  const config: ChartConfiguration = {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: title,
          data,
          backgroundColor: PALETTE.slice(0, data.length),
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: false,
      animation: false as any,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          ticks: { color: BRAND.text, font: { size: 10 } },
          grid: { color: '#E0E0E0' },
        },
        y: {
          ticks: { color: BRAND.text, font: { size: 10 } },
          grid: { display: false },
        },
      },
    },
  };

  new Chart(ctx as any, config);
  return canvas.toDataURL('image/png');
}
