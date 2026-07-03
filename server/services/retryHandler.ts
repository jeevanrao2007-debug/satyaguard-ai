export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isTransient = 
      error.message?.includes("429") || 
      error.message?.includes("quota") || 
      error.message?.includes("503") || 
      error.message?.includes("timeout");
      
    if (retries > 0 && isTransient) {
      console.warn(`[RETRY_HANDLER] Transient error encountered. Retrying in ${delay}ms... (Retries left: ${retries})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}
