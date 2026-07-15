export function fail(message) {
    console.error(message);
    process.exit(1);
}
function axiosResponseError(error) {
    if (typeof error !== "object" || error === null || !("response" in error)) {
        return null;
    }
    const response = error
        .response;
    return response?.data?.error ?? null;
}
export function errorMessage(error, fallback = "Something went wrong") {
    const fromApi = axiosResponseError(error);
    if (fromApi) {
        return fromApi;
    }
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return fallback;
}
//# sourceMappingURL=fail.js.map