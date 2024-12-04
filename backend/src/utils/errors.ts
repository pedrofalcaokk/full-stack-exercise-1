/**
 * Custom HTTP Error class for handling API errors
 */
export class HttpError extends Error {
    /**
     * Creates a new HTTP Error
     * @param statusCode The HTTP status code for the error (e.g. 400, 404, 500)
     * @param message Detailed error message describing what went wrong
     */
    constructor(public statusCode: number, message: string) {
        super(message);
        this.name = 'HttpError';
    }
}
