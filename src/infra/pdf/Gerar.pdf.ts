import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const handleDownloadPdf = async (
  elementId: string,
  fileName: string = 'relatorio.pdf',
) => {
  const element = document.getElementById(elementId);

  if (!element) {
    console.error('Elemento não encontrado!');
    return;
  }

  // Captura o elemento
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(fileName);
};