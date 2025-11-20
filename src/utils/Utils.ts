import type { InputData, FieldMapping, PipedrivePersonData } from "../types/pipedrive";


// Get nested Object value from object.
export const getNestedObjectValue = (obj: Record<string, any> | null | undefined, path: string): unknown => {
  // Edge case 3: obj itself is null/undefined
  if (obj === null || obj === undefined) {
    return undefined;
  }

  // Edge case 1: path is empty / invalid
  if (!path || typeof path !== 'string') {
    return undefined;
  }

  // Handle special invalid paths
  if (path === '.' || path === '..' || path.includes('..')) {
    return undefined;
  }

  // Trim whitespace from path
  const trimmedPath = path.trim();
  if (!trimmedPath) {
    return undefined;
  }

  // Split path into keys
  const keys = trimmedPath.split('.');

  // Remove empty keys (e.g., from "a..b" which would be ["a", "", "b"])
  const validKeys = keys.filter(key => key !== '');

  if (validKeys.length === 0) {
    return undefined;
  }

  let currentObject: any = obj;

  // Traverse the object using the keys
  for (const key of validKeys) {
    // Edge case 2: intermediate key is not an object
    if (currentObject === null || currentObject === undefined || typeof currentObject !== 'object') {
      return undefined;
    }

    // Check if the key exists in the current object
    if (!(key in currentObject)) {
      return undefined;
    }

    currentObject = currentObject[key];
  }

  return currentObject;
};

// Set nested object value in object.
export const setNestedObjectValue = (obj: Record<string, any>, path: string, value: any): void => {
  // Edge case 1: path is empty / invalid
  if (!obj || !path || typeof path !== 'string') {
    return;
  }

  // Handle special invalid paths
  if (path === '.' || path === '..' || path.includes('..')) {
    return;
  }

  // Trim whitespace from path
  const trimmedPath = path.trim();
  if (!trimmedPath) {
    return;
  }

  // Split path into keys
  const keys = trimmedPath.split('.');

  // Remove empty keys (e.g., from "a..b" which would be ["a", "", "b"])
  const validKeys = keys.filter(key => key !== '');

  if (validKeys.length === 0) {
    return;
  }

  // Get the final key (last element)
  const finalKey = validKeys.pop()!;

  // Navigate to the parent object
  const parent = validKeys.reduce((current, prop) => {
    // Edge case 2: intermediate key is not an object
    if (typeof current !== 'object' || current === null) {
      // Create the missing intermediate object
      (current as Record<string, any>)[prop] = {};
    } 
    else if (!(prop in current)) {
      // Create the missing property as an empty object
      current[prop] = {};
    
    } 
    else if (typeof current[prop] !== 'object' || current[prop] === null) {
      // If the property exists but is not an object, convert it to an object
      current[prop] = {};
    
    }

    return current[prop];
  }, obj as Record<string, any>);

  // Set the final value
  parent[finalKey] = value;
};

// Map input data to Pipedrive person format based on mappings
export const mapInputDataToPerson = (inputData: InputData, mappings: FieldMapping[]): PipedrivePersonData => {
  // Validate inputs
  if (!inputData) {
    throw new Error("Input data is required");
  }

  if (!mappings || !Array.isArray(mappings)) {
    throw new Error("Mappings must be an array");
  }

  const personData: PipedrivePersonData = {};

  // Find the mapping for the name field (required for person lookup)
  const nameMapping = mappings.find(mapping => mapping.pipedriveKey === "name");

  if (!nameMapping) {
    throw new Error("No mapping found for 'name' field - name mapping is required for person lookup");
  }

  // Get the person's name from input data for validation
  const personName = getNestedObjectValue(inputData, nameMapping.inputKey);
  if (!personName) {
    throw new Error(`Name value not found in inputData using path: ${nameMapping.inputKey}`);
  }

  // Build the complete person data object
  for (const mapping of mappings) {
    const inputValue = getNestedObjectValue(inputData, mapping.inputKey);

    // Skip undefined values
    if (inputValue === undefined) {
      continue;
    }

    // Handle special cases for email and phone which need to be arrays in Pipedrive
    if (mapping.pipedriveKey === "email") {
      personData.email = [{
        value: String(inputValue),
        primary: true
      }];
    }
    else if (mapping.pipedriveKey === "phone") {
      personData.phone = [{
        value: String(inputValue),
        primary: true
      }];
    }
    else {
      // For all other fields, set the value directly
      setNestedObjectValue(personData, mapping.pipedriveKey, inputValue);
    }
  }

  return personData;
};