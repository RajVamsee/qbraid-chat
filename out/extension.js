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
    // Command to Open Chat UI
    let openChatCommand = vscode.commands.registerCommand('qbraid-chat.openChat', async () => {
        openChatUI(context);
    });
    // Register commands
    context.subscriptions.push(setApiKeyCommand, openChatCommand);
}
// Function to open the Webview Panel for Chat
function openChatUI(context) {
    const panel = vscode.window.createWebviewPanel('qbraidChat', 'qBraid Chat', vscode.ViewColumn.One, {
        enableScripts: true, // Allow JavaScript execution in Webview
    });
    panel.webview.html = getChatWebviewContent();
    // Handle messages from Webview
    panel.webview.onDidReceiveMessage(async (message) => {
        if (message.command === "sendMessage") {
            const apiKey = getStoredApiKey(context);
            if (!apiKey) {
                panel.webview.postMessage({ command: "error", text: "API Key is not set. Please set it first." });
                return;
            }
            // Get available models
            const models = await (0, api_1.getChatModels)(apiKey);
            if (!models || models.length === 0) {
                panel.webview.postMessage({ command: "error", text: "No chat models available. Try again later." });
                return;
            }
            const selectedModel = models[0].model; // Automatically selecting the first model for now
            // Send the chat message
            const response = await (0, api_1.sendChatMessage)(apiKey, selectedModel, message.text);
            if (response) {
                panel.webview.postMessage({ command: "botResponse", text: response });
            }
            else {
                panel.webview.postMessage({ command: "error", text: "Failed to get a response from the AI." });
            }
        }
    });
}
// Function to generate Webview UI
function getChatWebviewContent() {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>qBraid Chat</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #FFD1DC; /* Light Pink */
                color: #333;
                padding: 20px;
                text-align: center;
            }
            #chat-container {
                width: 90%;
                max-width: 600px;
                margin: auto;
                background: white;
                padding: 15px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            }
            #chat-box {
                height: 300px;
                overflow-y: auto;
                border: 1px solid #ccc;
                padding: 10px;
                background: #fff;
                text-align: left;
            }
            .message {
                margin: 5px 0;
                padding: 8px;
                border-radius: 5px;
            }
            .user-message {
                background-color: #ffb6c1;
                text-align: right;
            }
            .bot-message {
                background-color: #d3d3d3;
                text-align: left;
            }
            #input-box {
                width: 80%;
                padding: 10px;
                border-radius: 5px;
                border: 1px solid #ccc;
            }
            #send-btn {
                padding: 10px;
                background: #ff4081;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }
            #send-btn:hover {
                background: #d81b60;
            }
        </style>
    </head>
    <body>
        <h2>qBraid Chat</h2>
        <div id="chat-container">
            <div id="chat-box"></div>
            <input type="text" id="input-box" placeholder="Type your message..." />
            <button id="send-btn">Send</button>
        </div>

        <script>
            const vscode = acquireVsCodeApi();

            document.getElementById("send-btn").addEventListener("click", () => {
                const inputBox = document.getElementById("input-box");
                const message = inputBox.value.trim();
                if (!message) return;

                // Display user message
                appendMessage(message, "user-message");

                // Send message to extension
                vscode.postMessage({
                    command: "sendMessage",
                    text: message
                });

                inputBox.value = "";
            });

            function appendMessage(text, className) {
                const chatBox = document.getElementById("chat-box");
                const messageDiv = document.createElement("div");
                messageDiv.className = "message " + className;
                messageDiv.textContent = text;
                chatBox.appendChild(messageDiv);
                chatBox.scrollTop = chatBox.scrollHeight;
            }

            window.addEventListener("message", (event) => {
                if (event.data.command === "botResponse") {
                    appendMessage(event.data.text, "bot-message");
                } else if (event.data.command === "error") {
                    alert(event.data.text);
                }
            });
        </script>
    </body>
    </html>
    `;
}
// Function to retrieve the stored API key
function getStoredApiKey(context) {
    return context.globalState.get(API_KEY_STORAGE_KEY);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map