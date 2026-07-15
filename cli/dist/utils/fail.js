export function fail(message) {
    console.error(message);
    process.exit(1);
}
export function errorMessage(error, fallback = "Something went wrong") {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    if (typeof error === "object" &&
        error !== null &&
        "response" in error) {
        const response = error
            .response;
        if (response?.data?.error) {
            return response.data.error;
        }
    }
    return fallback;
}
//# sourceMappingURL=fail.js.map