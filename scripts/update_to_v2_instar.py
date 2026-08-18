#!/usr/bin/env python3
"""
Update all package files, manifest scripts, extensions, and configs to
Version 2.0 "Instar" (2.0.0).
"""

import os
import re

replacements = [
    # lorapok-python
    ("packages/lorapok-python/lorapok/__init__.py", r'__version__ = ".*?"', '__version__ = "2.0.0"'),
    ("packages/lorapok-python/lorapok/cli.py", r'@click\.version_option\(version=".*?",', '@click.version_option(version="2.0.0",'),
    ("packages/lorapok-python/pyproject.toml", r'version = ".*?"', 'version = "2.0.0"'),
    ("packages/lorapok-python/setup.py", r'version=".*?",', 'version="2.0.0",'),

    # vscode-lorapok
    ("packages/vscode-lorapok/package.json", r'"version": ".*?"', '"version": "2.0.0"'),
    ("packages/vscode-lorapok/build_extension.js", r'lorapok-player-vscode-[\d\.]+\.vsix', 'lorapok-player-vscode-2.0.0.vsix'),
    ("packages/vscode-lorapok/build_extension.js", r'lorapok-player-vscode-[\d\.]+\.zip', 'lorapok-player-vscode-2.0.0.zip'),
    ("packages/vscode-lorapok/README.md", r'lorapok-player-vscode-[\d\.]+\.vsix', 'lorapok-player-vscode-2.0.0.vsix'),

    # php
    ("packages/lorapok-php/composer.json", r'"license": ".*?"', '"license": "Proprietary"'),

    # extensions
    ("lorapok-extension/package.json", r'"version": ".*?"', '"version": "2.0.0"'),
    ("lorapok-extension/manifest.json", r'"version": ".*?"', '"version": "2.0.0"'),
    ("lorapok-extension/manifest.chrome.json", r'"version": ".*?"', '"version": "2.0.0"'),
    ("lorapok-extension/manifest.firefox.json", r'"version": ".*?"', '"version": "2.0.0"'),
    ("lorapok-extension/popup.html", r'<span class="badge">v[\d\.]+</span>', '<span class="badge">v2.0.0</span>'),
    ("lorapok-extension/build_extensions.js", r'1\.5\.0', '2.0.0'),
    ("lorapok-extension/AMO_SUBMISSION_DETAILS.md", r'1\.5\.0', '2.0.0'),

    # snapcraft
    ("snap/snapcraft.yaml", r"version: '.*?'", "version: '2.0.0'"),
    ("snapcraft.yaml", r"version: '.*?'", "version: '2.0.0'"),

    # core player packages
    ("lorapok-player/package.json", r'"version": ".*?"', '"version": "2.0.0"'),
    ("lorapok-player/packages/lorapok-player/package.json", r'"version": ".*?"', '"version": "2.0.0"'),
    ("lorapok-player/packages/website/package.json", r'"version": ".*?"', '"version": "2.0.0"'),
    ("lorapok-player/packages/website/scripts/sync_downloads.js", r'v1\.5\.0', 'v2.0.0'),
    ("lorapok-player/packages/website/scripts/sync_downloads.js", r'1\.5\.0', '2.0.0'),
]

for filepath, pattern, repl in replacements:
    if os.path.exists(filepath):
        with open(filepath, "r") as f:
            content = f.read()
        new_content = re.sub(pattern, repl, content)
        with open(filepath, "w") as f:
            f.write(new_content)
        print(f"Updated {filepath}")
    else:
        print(f"File not found: {filepath}")

print("✅ Successfully updated version references to 2.0.0 across all packages.")
