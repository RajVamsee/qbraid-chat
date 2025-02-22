import { getChatModels } from './api';

/**
 * Stores the list of chat models retrieved from the API.
 * This allows the extension to avoid fetching models repeatedly.
 */
let storedModels: any[] = [];

/**
 * Fetches chat models from the API using the provided API key
 * and stores them in the `storedModels` variable.
 *
 * @param apiKey - The API key required to authenticate the request.
 */
export async function fetchAndStoreModels(apiKey: string) {
    const models = await getChatModels(apiKey);
    storedModels = models ?? []; // Ensures storedModels is always an array to prevent null/undefined errors.
}

/**
 * Retrieves the stored chat models.
 * If `fetchAndStoreModels` has been called, this will return the cached models;
 * otherwise, it may return an empty array if models have not yet been fetched.
 *
 * @returns An array of stored chat models.
 */
export function getStoredModels(): any[] {
    return storedModels;
}
