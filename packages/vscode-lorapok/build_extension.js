const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧩 Building Lorapok VS Code Extension...');

const root = __dirname;
const dist = path.join(root, 'dist');
if (!fs.existsSync(dist)) fs.mkdirSync(dist, { recursive: true });

// Transpile / bundle extension.js
const extensionJs = `
const vscode = require('vscode');

function activate(context) {
    console.log('Lorapok Media Player extension activated.');

    const provider = new LorapokCustomEditorProvider(context);
    context.subscriptions.push(
        vscode.window.registerCustomEditorProvider('lorapok.mediaPlayer', provider, {
            webviewOptions: { retainContextWhenHidden: true },
            supportsMultipleEditorsPerDocument: false,
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('lorapok.openStream', async () => {
            const url = await vscode.window.showInputBox({
                prompt: 'Enter HLS (.m3u8), DASH (.mpd), or direct media URL',
                placeHolder: 'https://example.com/live/stream.m3u8',
            });

            if (url) {
                const panel = vscode.window.createWebviewPanel(
                    'lorapok.streamView',
                    'Lorapok: ' + (url.split('/').pop() || 'Stream'),
                    vscode.ViewColumn.Active,
                    { enableScripts: true, retainContextWhenHidden: true }
                );
                panel.webview.html = getPlayerHtml(panel.webview, url);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('lorapok.openWebPlayer', () => {
            vscode.env.openExternal(vscode.Uri.parse('https://media.lorapok.tech'));
        })
    );
}

function deactivate() {}

class LorapokCustomEditorProvider {
    constructor(context) { this.context = context; }
    async openCustomDocument(uri) { return { uri, dispose: () => {} }; }
    async resolveCustomEditor(document, webviewPanel) {
        webviewPanel.webview.options = { enableScripts: true };
        const mediaUri = webviewPanel.webview.asWebviewUri(document.uri);
        webviewPanel.webview.html = getPlayerHtml(webviewPanel.webview, mediaUri.toString());
    }
}

function getPlayerHtml(webview, mediaUrl) {
    return \`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lorapok Media Player</title>
    <style>
        body, html {
            margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden;
            background: #050510; display: flex; align-items: center; justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #ffffff;
        }
        .container { width: 100%; height: 100%; display: flex; flex-direction: column; }
        iframe { width: 100%; height: 100%; border: none; }
    </style>
</head>
<body>
    <div class="container">
        <iframe
            src="https://media.lorapok.tech/?embed=true&stream=\${encodeURIComponent(mediaUrl)}&autoplay=true&ambient=true"
            allow="autoplay; fullscreen; encrypted-media"
        ></iframe>
    </div>
</body>
</html>\`;
}

module.exports = { activate, deactivate };
`;

fs.writeFileSync(path.join(dist, 'extension.js'), extensionJs.trim());

// Copy icon from lorapok-extension
const iconSrc = path.join(root, '../../lorapok-extension/icons/icon128.png');
const iconDst = path.join(root, 'icon.png');
if (fs.existsSync(iconSrc)) {
    fs.copyFileSync(iconSrc, iconDst);
}

// Build .vsix or .zip package
const releaseBuildDir = path.join(root, '../../lorapok-player/release/builds/extensions');
if (!fs.existsSync(releaseBuildDir)) fs.mkdirSync(releaseBuildDir, { recursive: true });

const vsixTarget = path.join(releaseBuildDir, 'lorapok-player-vscode-2.0.0.vsix');
const vsixZip = path.join(releaseBuildDir, 'lorapok-player-vscode-2.0.0.zip');

try {
    // Try npx @vscode/vsce package if available
    console.log('📦 Attempting vsce packaging...');
    execSync('npx -y @vscode/vsce package -o "' + vsixTarget + '" --no-git-tag-version --no-update-package-json --allow-missing-repository', {
        cwd: root,
        stdio: 'inherit'
    });
    console.log('✅ Created VSIX: ' + vsixTarget);
} catch (e) {
    console.log('⚠️ @vscode/vsce failed or offline. Creating standard VSIX archive with zip...');
    execSync('zip -9 -q -r "' + vsixTarget + '" package.json dist/ icon.png README.md', { cwd: root });
    execSync('zip -9 -q -r "' + vsixZip + '" package.json dist/ icon.png README.md', { cwd: root });
    console.log('✅ Created fallback VSIX/ZIP: ' + vsixTarget);
}

console.log('🎉 VS Code Extension build complete!');
