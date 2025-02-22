# qBraid Chat - VS Code Extension

## 🚀 Assessment Details  
qBraid Chat is a Visual Studio Code extension designed to provide an interactive chat interface with qBraid's AI models. It allows users to send messages, receive responses and interact seamlessly with qBraid’s REST API. This project was built as part of an assessment challenge.

## 🔧 Tech Stack 
- **TypeScript**  
- **Node.js**  
- **VS Code API**   

## 👤 About Me 
**Name:** Gopala Raj  
**Role:** Full-Stack Developer
**Email:** rajgopalavamsee01@gmail.com 

📌 Features
-  Interactive Chat Interface – Users can send and receive messages using qBraid AI.
-  Customizable Models – Users can select from multiple AI models provided by qBraid.
-  API Key Management – Users can securely store their API key for authentication.
-  VS Code WebView Panel – The chat runs inside a dedicated WebView in VS Code.
-  Enhanced UI/UX – Clean, responsive UI with proper error handling and auto-scrolling.  

---

⚙️ **Installation & Setup**
📥 Prerequisites
- Install VS Code (Latest Version)
- Install Node.js and npm

```bash
git clone https://github.com/RajVamsee/qbraid-chat.git
cd qbraid-chat
```

---

📦 **Install Dependencies**
```bash
npm install
```

---

🔑 **Set API Key**
- You need a qBraid API key to access the chat functionalities.
- Open VS Code 
- Run the command :
```vbnet
Ctrl + Shift + P → qBraid Chat: Set API Key
```

- Enter your qBraid API key when prompted.

--- 

🚀 **Run the Extension**

```bash
npm run compile
code .
```
- Press F5 in VS Code to launch the extension in a new development window.

---

📜 **Instructions**
- Open VS Code
- Run :
```css
Ctrl + Shift + P → qBraid Chat: Open Chat
```
- Choose an AI model from the dropdown.
- Enter a message in the text box.
- Click Send to receive a response.
- The response is streamed in real-time.

--- 





