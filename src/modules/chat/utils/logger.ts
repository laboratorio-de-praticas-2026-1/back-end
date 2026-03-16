// Logger utilitário para logs estruturados
interface LogParams {
  message: string;
  userId?: number | null;
  chatId?: number | null;
  stack?: string | null;
}

export function logError({
  message,
  userId = null,
  chatId = null,
  stack = null,
}: LogParams) {
  const log = {
    level: 'error',
    timestamp: new Date().toISOString(),
    userId,
    chatId,
    message,
    stack,
  };

  console.error(JSON.stringify(log));
}

export function logInfo({ message, userId = null, chatId = null }: LogParams) {
  const log = {
    level: 'info',
    timestamp: new Date().toISOString(),
    userId,
    chatId,
    message,
  };

  console.log(JSON.stringify(log));
}
