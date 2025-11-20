import dotenv from "dotenv";
import type { PipedrivePerson } from "./types/pipedrive";
import inputData from "./mappings/inputData.json";
import mappings from "./mappings/mappings.json";
import { PipedriveController } from "./controllers/pipedriveController";
import { getNestedObjectValue, mapInputDataToPerson } from "./utils/Utils";
import { PipedriveApiError } from "./errors/pipedriveErrorHandler";

// Load environment variables from .env file
dotenv.config();

// Get API key and company domain from environment variables
const apiKey = process.env.PIPEDRIVE_API_KEY;
const companyDomain = process.env.PIPEDRIVE_COMPANY_DOMAIN;

// Validate that required environment variables are present
const validateEnvironmentVariables = (apiKey: string | undefined, companyDomain: string | undefined): void => {
  if (!apiKey) {
    throw new Error("PIPEDRIVE_API_KEY must be set in .env file");
  }
  
  if (!companyDomain) {
    throw new Error("PIPEDRIVE_COMPANY_DOMAIN must be set in .env file");
  }
};

// Validate that the person name is valid and not empty
const validatePersonName = (name: string): void => {
  if (!name || typeof name !== 'string') {
    throw new Error("Person name must be a non-empty string");
  }
  
  // Trim whitespace and check if empty
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error("Person name cannot be empty or whitespace only");
  }
  
};

// Sync person data to Pipedrive
const syncPdPerson = async (): Promise<PipedrivePerson> => {
  try {
    // Validate environment variables
    validateEnvironmentVariables(apiKey, companyDomain);
    
    // Initialize the Pipedrive controller
    const pipedriveController = new PipedriveController(apiKey!, companyDomain!);

    // Map input data to Pipedrive person format
    const personData = mapInputDataToPerson(inputData, mappings);

    // Get the person's name for lookup.
    const nameMapping = mappings.find(mapping => mapping.pipedriveKey === "name");

    if (!nameMapping) {
      throw new Error("Name mapping is required for person lookup");
    }

    const personNameValue = getNestedObjectValue(inputData, nameMapping.inputKey);
    
    if (typeof personNameValue !== 'string') {
      throw new Error(`Expected string for person name, but got ${typeof personNameValue}`);
    }

    // Validate the person name
    validatePersonName(personNameValue);
    const personName = personNameValue.trim();

    
    // Check if person already exists
    console.log(`Searching for existing person with name: ${personName}`);
    const existingPerson = await pipedriveController.findPersonByName(personName);

    let person: PipedrivePerson;

    if (existingPerson) {
      // Update existing person
      console.log(`Found existing person with ID: ${existingPerson.id}`);
      person = await pipedriveController.updatePerson(existingPerson.id, personData);
      console.log(`Successfully updated person with ID: ${person.id}`);
    } else {
      // Create new person
      console.log("No existing person found, creating new person...");
      person = await pipedriveController.createPerson(personData);
      console.log(`Successfully created person with ID: ${person.id}`);
    }

    return person;
  } 
  catch (error) {
    if (error instanceof PipedriveApiError) {
      console.error("Pipedrive API Error:", error.message);
      // Handle specific error cases
      if (error.statusCode === 429) {
        console.error("Rate limit exceeded. Please wait before making more requests.");
      } else if (error.statusCode === 500) {
        console.error("Pipedrive server error. Please try again later.");
      } else if (error.statusCode === 503) {
        console.error("Pipedrive service unavailable. Please try again later.");
      }
    } else {
      console.error("Error syncing person to Pipedrive:", error);
    }
    throw error;
  }
};

// Execute the sync function and handle the result
syncPdPerson()
  .then((result: PipedrivePerson) => {
    console.log("Person sync completed successfully!");
    console.log("Result:", JSON.stringify(result, null, 2));
  })
  .catch((error: Error) => {
    console.error("Failed to sync person to Pipedrive:", error.message);
    process.exit(1);
  });