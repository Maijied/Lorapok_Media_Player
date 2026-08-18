import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Lorapok Media Player extension activated.');

    // Register Custom Editor Provider for audio/video files
    const provider = new LorapokCustomEditorProvider(context);
    context.subscriptions.push(
        vscode.window.registerCustomEditorProvider('lorapok.mediaPlayer', provider, {
            webviewOptions: {
                retainContextWhenHidden: true,
            },
            supportsMultipleEditorsPerDocument: false,
        })
    );

    // Register Open Stream command
    context.subscriptions.push(
        vscode.commands.registerCommand('lorapok.openStream', async () => {
            const url = await vscode.window.showInputBox({
                prompt: 'Enter HLS (.m3u8), DASH (.mpd), or direct media URL',
                placeHolder: 'https://example.com/live/stream.m3u8',
            });

            if (url) {
                const panel = vscode.window.createWebviewPanel(
                    'lorapok.streamView',
                    `Lorapok: ${url.split('/').pop() || 'Stream'}`,
                    vscode.ViewColumn.Active,
                    {
                        enableScripts: true,
                        retainContextWhenHidden: true,
                    }
                );
                panel.webview.html = getPlayerHtml(panel.webview, url, context.extensionUri);
            }
        })
    );

    // Register Open in Web Player command
    context.subscriptions.push(
        vscode.commands.registerCommand('lorapok.openWebPlayer', () => {
            vscode.env.openExternal(vscode.Uri.parse('https://media.lorapok.tech'));
        })
    );
}

export function deactivate() {}

class LorapokCustomEditorProvider implements vscode.CustomReadonlyEditorProvider {
    constructor(private readonly context: vscode.ExtensionContext) {}

    async openCustomDocument(uri: vscode.Uri): Promise<vscode.CustomDocument> {
        return { uri, dispose: () => {} };
    }

    async resolveCustomEditor(
        document: vscode.CustomDocument,
        webviewPanel: vscode.WebviewPanel
    ): Promise<void> {
        webviewPanel.webview.options = {
            enableScripts: true,
        };

        const mediaUri = webviewPanel.webview.asWebviewUri(document.uri);
        webviewPanel.webview.html = getPlayerHtml(webviewPanel.webview, mediaUri.toString(), this.context.extensionUri);
    }
}

function getPlayerHtml(webview: vscode.Webview, mediaUrl: string, extensionUri: vscode.Uri): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lorapok Media Player</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: #050510;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #ffffff;
        }
        .container {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            position: relative;
        }
        iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <iframe
            src="https://media.lorapok.tech/?embed=true&stream=${encodeURIComponent(mediaUrl)}&autoplay=true&ambient=true"
            allow="autoplay; fullscreen; encrypted-media"
        ></iframe>
    </div>
</body>
</html>`;
}
