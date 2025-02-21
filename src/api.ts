import * as vscode from 'vscode';

// Generic function to fetch data from qBraid API
async function fetchData<T>(url: string, apiKey: string, method: string = 'GET', body: any = null): Promise<T | null> {
    const fetch = (await import('node-fetch')).default; // ✅ Dynamic import for node-fetch@3.x

    try {
        const options: any = {
            method,
            headers: {
                'api-key': apiKey, // ✅ Corrected header format
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} - ${await response.text()}`);
        }

        const jsonData = await response.json();
        return jsonData as T; // ✅ Explicitly cast response to expected type
    } catch (error: any) {
        vscode.window.showErrorMessage(`Error fetching data: ${error.message}`);
        return null;
    }
}

// ✅ Define a proper response type for models
interface ChatModel {
    model: string;
    description: string;
    pricing: {
        input: number;
        output: number;
        units: string;
    };
}

// Function to get available chat models from qBraid API
export async function getChatModels(apiKey: string): Promise<string[]> {
    const url = 'https://api.qbraid.com/api/chat/models'; // ✅ Corrected endpoint
    const response = await fetchData<ChatModel[]>(url, apiKey);

    if (!response) {
        vscode.window.showErrorMessage('Failed to fetch chat models. Please check your API key.');
        return [];
    }

    // Extract and return readable model names
    return response.map(modelObj => modelObj.model);
}

// Function to send a message to the qBraid chat API
export async function sendChatMessage(apiKey: string, model: string, message: string) {
    const url = 'https://api.qbraid.com/api/chat'; // ✅ Corrected endpoint
    const body = {
        model,
        messages: [{ role: 'user', content: message }]
    };

    return fetchData(url, apiKey, 'POST', body);
}
