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
exports.getChatModels = getChatModels;
exports.sendChatMessage = sendChatMessage;
const vscode = __importStar(require("vscode"));
// Generic function to fetch data from qBraid API
async function fetchData(url, apiKey, method = 'GET', body = null) {
    const fetch = (await import('node-fetch')).default; // ✅ Dynamic import for node-fetch@3.x
    try {
        const options = {
            method,
            headers: {
                'api-key': apiKey, // ✅ Corrected header format
                'Content-Type': 'application/json'
            }
        };
        if (body) {
            options.body = JSON.stringify(body);
        }
        console.log("🟢 API Request:", url);
        console.log("📌 Request Headers:", options.headers);
        console.log("📩 Request Body:", options.body || "No Body");
        const response = await fetch(url, options);
        console.log("🔵 Raw Response Status:", response.status);
        console.log("📩 Raw Response Headers:", response.headers.raw());
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const jsonData = await response.json();
        console.log("✅ Parsed Response:", JSON.stringify(jsonData, null, 2));
        return jsonData; // ✅ Explicitly cast response to expected type
    }
    catch (error) {
        vscode.window.showErrorMessage(`Error fetching data: ${error.message}`);
        console.error("❌ API Fetch Error:", error);
        return null;
    }
}
// Function to get available chat models from qBraid API
async function getChatModels(apiKey) {
    const url = 'https://api.qbraid.com/api/chat/models'; // ✅ Corrected endpoint
    const response = await fetchData(url, apiKey);
    if (!response) {
        vscode.window.showErrorMessage('Failed to fetch chat models. Please check your API key.');
        return null;
    }
    return response;
}
// ✅ Function to send a chat message to qBraid API
async function sendChatMessage(apiKey, model, message) {
    const url = 'https://api.qbraid.com/api/chat'; // ✅ Corrected endpoint
    const body = {
        model,
        prompt: message, // ✅ API expects 'prompt', not 'messages'
        stream: false // ✅ Explicitly set stream to false (matches API example)
    };
    console.log("🟡 Sending chat message:", JSON.stringify(body, null, 2));
    const response = await fetchData(url, apiKey, 'POST', body);
    console.log("🔵 Chat API Response:", response);
    if (!response || !response.content) {
        vscode.window.showErrorMessage('Failed to get a response from the chat.');
        return null;
    }
    return response.content;
}
//# sourceMappingURL=api.js.map