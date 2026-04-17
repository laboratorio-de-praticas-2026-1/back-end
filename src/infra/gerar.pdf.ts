/**
 * Faz o download de um PDF gerado pelo backend.
 * @param endpoint - Rota do backend (ex: /api/reports/sales)
 * @param fileName - Nome que o arquivo terá ao salvar
 * @param body - Opcional: Dados para enviar via POST (filtros, labels do gráfico, etc)
 */
export const handleDownloadPdf = async (
  endpoint: string,
  fileName: string = 'relatorio.pdf',
  body?: object 
) => {
  try {
    const response = await fetch(endpoint, {
      method: body ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro status: ${response.status}`);
    }

    const blob = await response.blob();
    
    if (blob.type === 'application/json') {
      throw new Error('O servidor retornou um erro em formato JSON em vez do PDF.');
    }

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    
    document.body.appendChild(link);
    link.click();

    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);

    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/pdf')) {
      console.warn('O conteúdo recebido não parece ser um PDF.');
    }

  } catch (error) {
    console.error('Erro ao baixar PDF:', error);
    alert(`Não foi possível gerar o PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};