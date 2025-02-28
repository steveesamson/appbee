
export const errorMessage = (error: unknown): string | undefined => {
    if (!error) return undefined;

    if (error instanceof Error) {
        return error?.message;
    }
    return (error as object).toString();
}
const handleError = (error: unknown): { error: string; } => {

    if (error instanceof Error) {
        return { error: error?.message };
    }
    return { error: (error as object).toString() };
}

export default handleError;