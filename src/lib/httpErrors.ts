export function messageFromError(error: unknown, fallback: string) {
  if (error instanceof SyntaxError) {
    return "Invalid JSON payload.";
  }

  return error instanceof Error ? error.message : fallback;
}
