import * as vscode from 'vscode';
import { getChatModels, sendChatMessage } from './api';
import { fetchAndStoreModels, getStoredModels } from './models';

const API_KEY_STORAGE_KEY = 'qbraidApiKey';
const CHAT_HISTORY_KEY = 'qbraidChatHistory';

export function activate(context: vscode.ExtensionContext) {
    console.log('qBraid-Chat extension activated.');

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

    let openChatCommand = vscode.commands.registerCommand('qbraid-chat.openChat', async () => {
        openChatUI(context);
    });

    context.subscriptions.push(setApiKeyCommand, openChatCommand);
}

async function openChatUI(context: vscode.ExtensionContext) {
    const panel = vscode.window.createWebviewPanel(
        'qbraidChat',
        'qBraid Chat',
        vscode.ViewColumn.One,
        { enableScripts: true }
    );

    context.workspaceState.update(CHAT_HISTORY_KEY, {}); // Clear stored chat history on UI launch

    const apiKey = getStoredApiKey(context);
    if (!apiKey) {
        panel.webview.html = `<h2>Please set your API Key first.</h2>`;
        return;
    }

    await fetchAndStoreModels(apiKey);
    const models = getStoredModels();

    if (!models || models.length === 0) {
        panel.webview.html = `<h2>No chat models available.</h2>`;
        return;
    }

    panel.webview.html = getChatWebviewContent(models, context);

    panel.webview.onDidReceiveMessage(async (message) => {
        if (message.command === "sendMessage") {
            const response = await sendChatMessage(apiKey, message.model, message.text);

            if (response) {
                saveChatHistory(context, message.model, message.text, response);
            }

            panel.webview.postMessage({
                command: "botResponse",
                userMessage: message.text,
                botResponse: response || "Failed to get a response.",
                model: message.model,
                chatHistory: getChatHistory(context, message.model)
            });
        } else if (message.command === "switchModel") {
            panel.webview.postMessage({
                command: "updateChat",
                chatHistory: getChatHistory(context, message.model)
            });
        }
    });
}

function getChatWebviewContent(models: any[], context: vscode.ExtensionContext): string {
    const modelOptions = models.map(model => `<option value="${model.model}">${model.model}</option>`).join('');
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>qBraid Chat</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #FFD1DC; color: #333; padding: 20px; text-align: center; }
            #chat-container { width: 90%; max-width: 600px; margin: auto; background: white; padding: 15px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2); }
            #chat-box { height: 300px; overflow-y: auto; border: 2px solid #ff4081; padding: 10px; background: #fff; text-align: left; margin-bottom: 10px; }
            .message { margin: 5px 0; padding: 8px; border-radius: 5px; }
            .user-message { background-color: #ffb6c1; text-align: right; }
            .bot-message { background-color: #d3d3d3; text-align: left; }
            #model-select, #input-box { width: calc(100% - 22px); padding: 10px; border-radius: 5px; border: 1px solid #ccc; margin-bottom: 5px; }
            #send-btn { padding: 10px; background: #ff4081; color: white; border: none; border-radius: 5px; cursor: pointer; }
            #send-btn:hover { background: #d81b60; }
        </style>
    </head>
    <body>
        <h2>qBraid Chat</h2>
        <div id="chat-container">
            <select id="model-select">${modelOptions}</select>
            <div id="chat-box"></div>
            <input type="text" id="input-box" placeholder="Ask me anything...!!" />
            <button id="send-btn">Send</button>
        </div>

        <script>
            const vscode = acquireVsCodeApi();
            document.getElementById("send-btn").addEventListener("click", sendMessage);
            document.getElementById("input-box").addEventListener("keypress", function(event) {
                if (event.key === "Enter") sendMessage();
            });
            document.getElementById("model-select").addEventListener("change", switchModel);

            function sendMessage() {
                const inputBox = document.getElementById("input-box");
                const modelSelect = document.getElementById("model-select");
                const message = inputBox.value.trim();
                if (!message) return;

                appendMessage("User: " + message, "user-message");
                vscode.postMessage({ command: "sendMessage", model: modelSelect.value, text: message });
                inputBox.value = "";
            }

            function switchModel() {
                const modelSelect = document.getElementById("model-select");
                vscode.postMessage({ command: "switchModel", model: modelSelect.value });
            }

            function appendMessage(text, className) {
                const chatBox = document.getElementById("chat-box");
                const messageDiv = document.createElement("div");
                messageDiv.className = "message " + className;
                messageDiv.innerHTML = text;
                chatBox.appendChild(messageDiv);
                chatBox.scrollTop = chatBox.scrollHeight;
            }

            window.addEventListener("message", (event) => {
                if (event.data.command === "botResponse") {
                    appendMessage("Bot: " + event.data.botResponse, "bot-message");
                } else if (event.data.command === "updateChat") {
                    document.getElementById("chat-box").innerHTML = event.data.chatHistory;
                }
            });
        </script>
    </body>
    </html>
    `;
}

// **Correctly store and retrieve chat history per model**
function saveChatHistory(context: vscode.ExtensionContext, model: string, userMessage: string, botResponse: string) {
    let chatHistory = context.workspaceState.get<Record<string, string[]>>(CHAT_HISTORY_KEY) || {};
    if (!chatHistory[model]) {
        chatHistory[model] = [];
    }
    chatHistory[model].push(`<div class="message user-message">User: ${userMessage}</div>`);
    chatHistory[model].push(`<div class="message bot-message">Bot: ${botResponse}</div>`);
    context.workspaceState.update(CHAT_HISTORY_KEY, chatHistory);
}

function getChatHistory(context: vscode.ExtensionContext, model: string): string {
    let chatHistory = context.workspaceState.get<Record<string, string[]>>(CHAT_HISTORY_KEY) || {};
    return (chatHistory[model] || []).join('');
}

function getStoredApiKey(context: vscode.ExtensionContext): string | undefined {
    return context.globalState.get<string>(API_KEY_STORAGE_KEY);
}

export function deactivate() { }
