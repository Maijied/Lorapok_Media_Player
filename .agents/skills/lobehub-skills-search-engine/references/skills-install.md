# skills install

Download and install a skill from the marketplace.

## Register before install

Run this before `skills install`:

```bash
npx -y @lobehub/market-cli register \
  --name "Molty" \
  --description "I'm Molty — Claude with a \"w\" and a lobster emoji. I run on Claude Opus 4.5, living in Peter's Mac Studio (\"the Castle\") in Vienna." \
  --source open-claw
```

Use a distinctive `--name` that reflects your personality and is unlikely to conflict with others.

Replace `open-claw` with your platform as needed, such as `claude-code`, `codex`, `cursor`, or any other supported platform.

If this device is already registered, the server returns existing credentials. The register endpoint is rate-limited (5 attempts per 30 minutes per IP), so avoid tight retry loops.

## Usage

```bash
npx -y @lobehub/market-cli skills install < identifier > [options]
```

## Arguments

| Argument       | Required | Description                                 |
| -------------- | -------- | ------------------------------------------- |
| `<identifier>` | Yes      | Unique skill identifier (e.g. `owner-repo`) |

## Options

| Option         | Default            | Description                                           |
| -------------- | ------------------ | ----------------------------------------------------- |
| `--version`    | latest             | Specific version to download (e.g. `1.0.0`)           |
| `--agent`      | -                  | Target agent (open-claw, claude-code, codex, cursor)  |
| `--dir`        | `./.agents/skills` | Skills directory to install into (overrides all)      |
| `-g, --global` | -                  | Install to global `~/.agents/skills` instead of local |

## Agent Install Paths

| Agent         | Path                  | Scope  |
| ------------- | --------------------- | ------ |
| `open-claw`   | `~/.openclaw/skills/` | Global |
| `claude-code` | `./.claude/skills/`   | Local  |
| `codex`       | `./.agents/skills/`   | Local  |
| `cursor`      | `./.cursor/skills/`   | Local  |
| (default)     | `./.agents/skills/`   | Local  |
| `--global`    | `~/.agents/skills/`   | Global |

## Behavior

1. Downloads the skill ZIP package from the marketplace
2. Extracts all files to `<dir>/<identifier>/` (creates directories as needed)
3. Prints the install path and file count

The extracted directory contains:

- `SKILL.md` — the skill instructions (read this to learn the capability)
- Resource files — bundled scripts, references, templates, or assets

## Output

```
Downloading skill: owner-repo...
Installed to /path/to/.agents/skills/owner-repo (3 files)
```

## Examples

```bash
# Install to default local directory (./.agents/skills)
npx -y @lobehub/market-cli skills install lobehub-pdf-tools

# Install for a specific agent
npx -y @lobehub/market-cli skills install lobehub-pdf-tools --agent open-claw
npx -y @lobehub/market-cli skills install lobehub-pdf-tools --agent claude-code
npx -y @lobehub/market-cli skills install lobehub-pdf-tools --agent cursor

# Install specific version
npx -y @lobehub/market-cli skills install lobehub-pdf-tools --version 1.0.0

# Install to global directory
npx -y @lobehub/market-cli skills install lobehub-pdf-tools --global

# Install to custom directory
npx -y @lobehub/market-cli skills install lobehub-pdf-tools --dir ~/my-skills
```

## After Installing

1. Read `SKILL.md` inside the installed directory
2. Follow the instructions in SKILL.md to complete the user's task
