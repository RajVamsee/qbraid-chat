"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const api_1 = require("./api");
const API_KEY_STORAGE_KEY = 'qbraidApiKey'; // Key to store API key in global state
function activate(context) {
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
        }
        else {
            vscode.window.showWarningMessage('No API Key entered. The extension might not work properly.');
        }
    });
    // Command to view the stored API key (for debugging, should be removed before final submission)
    let viewApiKeyCommand = vscode.commands.registerCommand('qbraid-chat.viewApiKey', () => {
        const storedKey = getStoredApiKey(context);
        if (storedKey) {
            vscode.window.showInformationMessage(`Stored API Key: ${storedKey}`);
        }
        else {
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
        const models = await (0, api_1.getChatModels)(apiKey);
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
        const models = await (0, api_1.getChatModels)(apiKey);
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
        const response = await (0, api_1.sendChatMessage)(apiKey, selectedModel, userMessage);
        if (response) {
            vscode.window.showInformationMessage(`Chat Response: ${response}`);
        }
        else {
            vscode.window.showErrorMessage('Failed to get a response from the chat.');
        }
    });
    // Register commands
    context.subscriptions.push(setApiKeyCommand, viewApiKeyCommand, fetchModelsCommand, sendMessageCommand);
}
// Function to retrieve the stored API key
function getStoredApiKey(context) {
    return context.globalState.get(API_KEY_STORAGE_KEY);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map