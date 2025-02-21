import * as vscode from 'vscode';

const API_KEY_STORAGE_KEY = 'qbraidApiKey'; // Key to store API key in global state

export function activate(context: vscode.ExtensionContext) {
    console.log('qBraid-Chat extension activated.');

    // Command to set API Key
    let setApiKeyCommand = vscode.commands.registerCommand('qbraid-chat.setApiKey', async () => {
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your qBraid API Key',
            ignoreFocusOut: true, // Keeps the input box open even if the user clicks elsewhere
            placeHolder: 'Your API Key here...',
            password: true // Hides input for security
        });

        if (apiKey) {
            context.globalState.update(API_KEY_STORAGE_KEY, apiKey);
            vscode.window.showInformationMessage('API Key saved successfully!');
        } else {
            vscode.window.showWarningMessage('No API Key entered. The extension might not work properly.');
        }
    });

    // Command to view the stored API key (for debugging, should be removed before final submission)
    let viewApiKeyCommand = vscode.commands.registerCommand('qbraid-chat.viewApiKey', () => {
        const storedKey = context.globalState.get<string>(API_KEY_STORAGE_KEY);
        if (storedKey) {
            vscode.window.showInformationMessage(`Stored API Key: ${storedKey}`);
        } else {
            vscode.window.showWarningMessage('No API Key found. Please set it using the command.');
        }
    });

    // Register commands
    context.subscriptions.push(setApiKeyCommand, viewApiKeyCommand);
}

export function deactivate() { }
