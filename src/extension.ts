import * as vscode from 'vscode';
import { getChatModels, sendChatMessage } from './api';

const API_KEY_STORAGE_KEY = 'qbraidApiKey'; // Key to store API key in global state

export function activate(context: vscode.ExtensionContext) {
    console.log('qBraid-Chat extension activated.');

    // Command to set API Key
    let setApiKeyCommand = vscode.commands.registerCommand('qbraid-chat.setApiKey', async () => {
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your qBraid API Key',
            ignoreFocusOut: true,
            placeHolder: 'Your API Key here...',
            password: true
        });

        if (apiKey) {
            await context.globalState.update(API_KEY_STORAGE_KEY, apiKey);
            vscode.window.showInformationMessage('API Key saved successfully!');
        } else {
            vscode.window.showWarningMessage('No API Key entered. The extension might not work properly.');
        }
    });

    // Command to view the stored API key (for debugging, should be removed before final submission)
    let viewApiKeyCommand = vscode.commands.registerCommand('qbraid-chat.viewApiKey', () => {
        const storedKey = getStoredApiKey(context);
        if (storedKey) {
            vscode.window.showInformationMessage(`Stored API Key: ${storedKey}`);
        } else {
            vscode.window.showWarningMessage('No API Key found. Please set it using the command.');
        }
    });

    // Command to fetch chat models from qBraid API
    let fetchModelsCommand = vscode.commands.registerCommand('qbraid-chat.getModels', async () => {
        const apiKey = getStoredApiKey(context);
        if (!apiKey) {
            vscode.window.showWarningMessage('API Key not set. Please set it using "Set qBraid API Key" command.');
            return;
        }

        const models = await getChatModels(apiKey);
        if (models) {
            const modelNames = models.map(model => model.model).join(', ');
            vscode.window.showInformationMessage(`Available Models: ${modelNames}`);
        }
    });

    //Command: Send Chat Message
    let sendMessageCommand = vscode.commands.registerCommand('qbraid-chat.sendMessage', async () => {
        const apiKey = getStoredApiKey(context);
        if (!apiKey) {
            vscode.window.showWarningMessage('API Key not set. Please set it using "Set qBraid API Key" command.');
            return;
        }

        const models = await getChatModels(apiKey);
        if (!models || models.length === 0) {
            vscode.window.showWarningMessage('No chat models available. Please try again later.');
            return;
        }

        // Prompt user to select a model
        const selectedModel = await vscode.window.showQuickPick(models.map(model => model.model), {
            placeHolder: 'Select a chat model'
        });

        if (!selectedModel) {
            vscode.window.showWarningMessage('No model selected.');
            return;
        }

        // Prompt user to enter a message
        const userMessage = await vscode.window.showInputBox({
            prompt: 'Enter your message',
            ignoreFocusOut: true
        });

        if (!userMessage) {
            vscode.window.showWarningMessage('No message entered.');
            return;
        }

        // Send message
        vscode.window.showInformationMessage('Sending message...');
        const response = await sendChatMessage(apiKey, selectedModel, userMessage);

        if (response) {
            vscode.window.showInformationMessage(`Chat Response: ${response}`);
        } else {
            vscode.window.showErrorMessage('Failed to get a response from the chat.');
        }
    });

    // Register commands
    context.subscriptions.push(setApiKeyCommand, viewApiKeyCommand, fetchModelsCommand, sendMessageCommand);
}

// Function to retrieve the stored API key
function getStoredApiKey(context: vscode.ExtensionContext): string | undefined {
    return context.globalState.get<string>(API_KEY_STORAGE_KEY);
}

export function deactivate() { }
