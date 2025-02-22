"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAndStoreModels = fetchAndStoreModels;
exports.getStoredModels = getStoredModels;
const api_1 = require("./api");
let storedModels = [];
async function fetchAndStoreModels(apiKey) {
    const models = await (0, api_1.getChatModels)(apiKey);
    storedModels = models ?? []; // Ensures storedModels is always an array
}
function getStoredModels() {
    return storedModels;
}
//# sourceMappingURL=models.js.map