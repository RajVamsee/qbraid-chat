import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('qbraid-chat.myChatCommand', () => {
        vscode.window.showInformationMessage('Hi guys, qBraid Chat will answer your queries !!');
    });

    context.subscriptions.push(disposable);
}

export function deactivate() { }

