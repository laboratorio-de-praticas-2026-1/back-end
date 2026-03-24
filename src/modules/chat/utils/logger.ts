// Logger utilitário para logs estruturados

interface LogParams {
  message: string;
  userId?: string | number | null;
  chatId?: string | number | null;
  stack?: string | null;
  context?: string; // 🔥 ex: ChatGateway, ChatService
  meta?: Record<string, any>; // 🔥 dados extras
}

function baseLog(level: 'info' | 'error', params: LogParams) {
  const {
    message,
    userId = null,
    chatId = null,
    stack = null,
    context = 'app',
    meta = {},
  } = params;

  const log = {
    level,
    timestamp: new Date().toISOString(),
    context,
    userId,
    chatId,
    message,
    ...(meta && Object.keys(meta).length ? { meta } : {}),
    ...(typeof stack === 'string' && stack ? { stack } : {}),
  };

  const output = JSON.stringify(log);

  if (level === 'error') {
    console.error(output);
  } else {
    console.log(output);
  }
}

// ================= EXPORTS =================

export function logError(params: LogParams) {
  baseLog('error', params);
}

export function logInfo(params: LogParams) {
  baseLog('info', params);
}