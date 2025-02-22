import * as vscode from 'vscode';

/**
 * Generic function to fetch data from the qBraid API.
 * This function handles both GET and POST requests.
 *
 * @param url - The API endpoint URL.
 * @param apiKey - The user's API key for authentication.
 * @param method - The HTTP method (default is 'GET').
 * @param body - The request payload for POST requests (default is null).
 * @returns A promise that resolves to the response data or null in case of an error.
 */
async function fetchData<T>(url: string, apiKey: string, method: string = 'GET', body: any = null): Promise<T | null> {
    const fetch = (await import('node-fetch')).default; // ✅ Dynamic import for node-fetch@3.x

    try {
        const options: any = {
            method,
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        // Logging request details for debugging
        console.log("API Request:", url);
        console.log("Request Headers:", options.headers);
        console.log("Request Body:", options.body || "No Body");

        const response = await fetch(url, options);

        console.log("Raw Response Status:", response.status);
        console.log("Raw Response Headers:", response.headers.raw());

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const jsonData = await response.json();
        console.log("Parsed Response:", JSON.stringify(jsonData, null, 2));

        return jsonData as T; //Explicitly cast response to expected type
    } catch (error: any) {
        vscode.window.showErrorMessage(`Error fetching data: ${error.message}`);
        console.error("API Fetch Error:", error);
        return null; //Return null in case of error
    }
}

//Define a proper response type for models
interface ChatModelsResponse {
    model: string; //Model name
    description: string; //Description
    pricing: {
        input: number; //Cost per input token
        output: number; //Cost per output token
        units: string; //Unit of measurement
    };
}

/**
 * Function to fetch available chat models from the qBraid API.
 *
 * @param apiKey - The API key for authentication.
 * @returns A promise that resolves to an array of available models or null in case of an error.
 */
export async function getChatModels(apiKey: string): Promise<ChatModelsResponse[] | null> {
    const url = 'https://api.qbraid.com/api/chat/models';
    const response = await fetchData<ChatModelsResponse[]>(url, apiKey);

    if (!response) {
        vscode.window.showErrorMessage('Failed to fetch chat models. Please check your API key.');
        return null;
    }

    return response; // Return array of models
}

/**
 * Function to send a chat message to the qBraid API.
 *
 * @param apiKey - The API key for authentication.
 * @param model - The chat model to use.
 * @param message - The user's message (prompt).
 * @returns A promise that resolves to the AI's response or null in case of an error.
 */
export async function sendChatMessage(apiKey: string, model: string, message: string): Promise<string | null> {
    const url = 'https://api.qbraid.com/api/chat';
    const body = {
        model,
        prompt: message, //API expects 'prompt', not 'messages'
        stream: false    //Explicitly set stream to false (matches API example)
    };

    console.log("Sending chat message:", JSON.stringify(body, null, 2));

    const response = await fetchData<{ content: string }>(url, apiKey, 'POST', body);

    console.log("Chat API Response:", response);

    if (!response || !response.content) {
        vscode.window.showErrorMessage('Failed to get a response from the chat.');
        return null;
    }

    return response.content; // Return chat response
}
