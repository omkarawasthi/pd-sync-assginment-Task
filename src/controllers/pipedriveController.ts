import axios, { AxiosResponse } from "axios";
import type { PipedrivePerson, PipedrivePersonData, PipedriveCreateUpdateResponse, PipedriveSearchResponse } from "../types/pipedrive";
import { handlePersonSearchError, handlePersonCreateError, handlePersonUpdateError } from "../errors/pipedriveErrorHandler";

// Pipedrive API controller for person operations
export class PipedriveController {
    private apiKey: string;
    private companyDomain: string;

    constructor(apiKey: string, companyDomain: string) {
        this.apiKey = apiKey;
        this.companyDomain = companyDomain;
    }

    // Get the base URL for Pipedrive API calls
    private getBaseUrl(): string {
        // Simple check if domain already includes pipedrive.com
        if (this.companyDomain.includes('.pipedrive.com')) {
            return `https://${this.companyDomain}`;
        }
        return `https://${this.companyDomain}.pipedrive.com`;
    }


    // Search for a person by name in Pipedrive with retry logic
    async findPersonByName(name: string): Promise<PipedrivePerson | null> {
        const baseUrl = this.getBaseUrl();
        
        try {
            const api = `${baseUrl}/v1/persons/search`;
            const response: AxiosResponse<PipedriveSearchResponse> = await axios.get(api, {
                params: {
                    term: name
                },
                headers: {
                    Accept: "application/json",
                    "x-api-token": this.apiKey
                },

            });

            // Check if the response has the expected structure
            if (!response.data || !response.data.data || !response.data.data.items) {
                console.warn("Unexpected response structure when searching for person");
                return null;
            }

            // Return the first matching person or null if none found
            return response.data.data.items && response.data.data.items.length > 0
                ? response.data.data.items[0].item
                : null;
        }
        catch (error) {
            throw handlePersonSearchError(error);
        }
    }

    // Create a new person in Pipedrive with retry logic
    async createPerson(personData: PipedrivePersonData): Promise<PipedrivePerson> {
        const baseUrl = this.getBaseUrl();
        
        try {
            const api = `${baseUrl}/v1/persons`;
            const response: AxiosResponse<PipedriveCreateUpdateResponse> = await axios.post(api, personData, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "x-api-token": this.apiKey
                },
            });

            // Check if the response has the expected structure
            if (!response.data || !response.data.data) {
                throw new Error("Invalid response structure when creating person");
            }

            return response.data.data;
        }
        catch (error) {
            throw handlePersonCreateError(error);
        }

    }

    // Update an existing person in Pipedrive with retry logic
    async updatePerson(personId: number, personData: PipedrivePersonData): Promise<PipedrivePerson> {
        const baseUrl = this.getBaseUrl();
        
        try {
            const api = `${baseUrl}/v1/persons/${personId}`;
            const response: AxiosResponse<PipedriveCreateUpdateResponse> = await axios.put(api, personData, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "x-api-token": this.apiKey
                },
            });

            // Check if the response has the expected structure
            if (!response.data || !response.data.data) {
                throw new Error("Invalid response structure when updating person");
            }

            return response.data.data;
        } catch (error) {
            throw handlePersonUpdateError(error);
        }

    }
}