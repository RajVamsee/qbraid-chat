"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAndStoreModels = fetchAndStoreModels;
exports.getStoredModels = getStoredModels;
const api_1 = require("./api");
/**
 * Stores the list of chat models retrieved from the API.
 * This allows the extension to avoid fetching models repeatedly.
 */
let storedModels = [];
/**
 * Fetches chat models from the API using the provided API key
 * and stores them in the `storedModels` variable.
 *
 * @param apiKey - The API key required to authenticate the request.
 */
async function fetchAndStoreModels(apiKey) {
    const models = await (0, api_1.getChatModels)(apiKey);
    storedModels = models ?? []; // Ensures storedModels is always an array to prevent null/undefined errors.
}
/**
 * Retrieves the stored chat models.
 * If `fetchAndStoreModels` has been called, this will return the cached models;
 * otherwise, it may return an empty array if models have not yet been fetched.
 *
 * @returns An array of stored chat models.
 */
function getStoredModels() {
    return storedModels;
}
//# sourceMappingURL=models.js.map