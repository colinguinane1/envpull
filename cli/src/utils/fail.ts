export function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function axiosResponseError(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return null;
  }

  const response = (error as { response?: { data?: { error?: string } } })
    .response;
  return response?.data?.error ?? null;
}

export function errorMessage(
  error: unknown,
  fallback = "Something went wrong",
): string {
  const fromApi = axiosResponseError(error);
  if (fromApi) {
    return fromApi;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
