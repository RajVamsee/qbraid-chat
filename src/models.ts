import { getChatModels } from './api';

let storedModels: any[] = [];

export async function fetchAndStoreModels(apiKey: string) {
    const models = await getChatModels(apiKey);
    storedModels = models ?? []; // Ensures storedModels is always an array
}

export function getStoredModels(): any[] {
    return storedModels;
}
