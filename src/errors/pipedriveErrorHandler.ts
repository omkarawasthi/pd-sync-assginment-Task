import { AxiosError } from "axios";

// Custom error class for Pipedrive API errors
export class PipedriveApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public errorDetails?: any
    ) {
        super(message);
        this.name = "PipedriveApiError";
    }
}

// Handle Pipedrive API errors and convert them to more specific error types
export const handlePipedriveApiError = (error: any, operation: string): PipedriveApiError => {
    // Handle network connectivity issues
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'ENETUNREACH') {
        return new PipedriveApiError(
            `Network connectivity issue during ${operation}: ${error.message}`,
            undefined,
            error
        );
    }
    
    // Handle timeout issues
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return new PipedriveApiError(
            `Request timeout during ${operation}: ${error.message}`,
            undefined,
            error
        );
    }

    // Handle specific Axios errors
    if (error.isAxiosError) {
        const axiosError = error as AxiosError;

        switch (axiosError.response?.status) {
            case 401:
                return new PipedriveApiError(
                    `Authentication failed during ${operation}: Invalid API token`,
                    401,
                    axiosError.response?.data
                );

            case 403:
                return new PipedriveApiError(
                    `Access forbidden during ${operation}: Insufficient permissions`,
                    403,
                    axiosError.response?.data
                );

            case 400:
                // Safely access error message from response data
                const errorMessage = axiosError.response?.data && typeof axiosError.response.data === 'object' && 'error' in axiosError.response.data
                    ? (axiosError.response.data as any).error
                    : axiosError.message;
                return new PipedriveApiError(
                    `Bad request during ${operation}: ${errorMessage}`,
                    400,
                    axiosError.response?.data
                );

            case 404:
                return new PipedriveApiError(
                    `Resource not found during ${operation}: ${axiosError.message}`,
                    404,
                    axiosError.response?.data
                );

            case 429:
                // Handle rate limiting with retry information if available
                const rateLimitMessage = `Rate limit exceeded during ${operation}: Too many requests`;
                return new PipedriveApiError(
                    rateLimitMessage,
                    429,
                    axiosError.response?.data
                );

            case 500:
                return new PipedriveApiError(
                    `Internal server error during ${operation}: ${axiosError.message}`,
                    500,
                    axiosError.response?.data
                );
                
            case 503:
                return new PipedriveApiError(
                    `Service unavailable during ${operation}: ${axiosError.message}`,
                    503,
                    axiosError.response?.data
                );

            default:
                return new PipedriveApiError(
                    `API request failed during ${operation} with status ${axiosError.response?.status}: ${axiosError.message}`,
                    axiosError.response?.status,
                    axiosError.response?.data
                );
        }
    } else {
        // Handle non-Axios errors
        return new PipedriveApiError(
            `Unexpected error during ${operation}: ${error.message || error}`,
            undefined,
            error
        );
    }
};

// Handle errors that occur during person search operations
export const handlePersonSearchError = (error: any): PipedriveApiError => {
    return handlePipedriveApiError(error, "person search");
};


// Handle errors that occur during person creation operations
export const handlePersonCreateError = (error: any): PipedriveApiError => {
    return handlePipedriveApiError(error, "person creation");
};


// Handle errors that occur during person update operations
export const handlePersonUpdateError = (error: any): PipedriveApiError => {
    return handlePipedriveApiError(error, "person update");
};