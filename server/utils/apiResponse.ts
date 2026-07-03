export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  metadata?: Record<string, any>;
}

export function sendSuccess<T>(message: string, data: T, metadata?: Record<string, any>): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      ...metadata,
    },
  };
}

export function sendError(message: string, metadata?: Record<string, any>): ApiResponse<null> {
  return {
    success: false,
    message,
    data: null,
    metadata: {
      timestamp: new Date().toISOString(),
      ...metadata,
    },
  };
}
