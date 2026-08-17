# skills search

Search and list skills from the marketplace. The CLI handles authentication automatically.

## Usage

```bash
npx -y @lobehub/market-cli skills search [options]
```

## Options

| Option        | Default   | Description                                                            |
| ------------- | --------- | ---------------------------------------------------------------------- |
| `--q`         | -         | Search keyword (match your task)                                       |
| `--category`  | -         | Category filter                                                        |
| `--page`      | 1         | Page number (min 1)                                                    |
| `--page-size` | 20        | Items per page (1-100)                                                 |
| `--sort`      | createdAt | Sort: createdAt, updatedAt, installCount, stars, forks, watchers, name |
| `--order`     | desc      | Direction: asc, desc                                                   |
| `--locale`    | en-US     | Locale code (e.g. en-US, zh-CN)                                        |
| `--output`    | text      | Output format: text (table) or json (full response)                    |

## Text Output (default)

```bash
npx -y @lobehub/market-cli skills search --q "pdf"
```

Renders a table with aligned columns:

```
IDENTIFIER          NAME              DESCRIPTION                          STARS  INSTALLS
lobehub-pdf-tools   PDF Tools         Edit, merge, split PDF files         128    1.2k
lobehub-pptx        PPTX Generator    Create PowerPoint slides             56     890

Showing 1-20 of 45 results
```

Columns shown: IDENTIFIER, NAME, DESCRIPTION (truncated to 40 chars), STARS, INSTALLS.

## JSON Output

```bash
npx -y @lobehub/market-cli skills search --q "pdf" --output json
```

Returns the full API response:

```json
{
  "currentPage": 1,
  "items": [
    {
      "identifier": "owner-repo",
      "name": "Skill Name",
      "description": "Skill description",
      "author": "Author Name",
      "category": "productivity",
      "version": "1.0.0",
      "installCount": 1234,
      "ratingCount": 56,
      "isFeatured": true,
      "isValidated": true,
      "tags": ["tag1", "tag2"],
      "github": {
        "url": "https://github.com/owner/repo",
        "stars": 100,
        "forks": 20,
        "watchers": 50
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T00:00:00Z"
    }
  ],
  "pageSize": 20,
  "totalCount": 150,
  "totalPages": 8
}
```

## Search Tips

Use task-oriented keywords. Instead of generic terms, describe what you need to do:

- Need to edit images → `--q "image editor"`
- Need to work with Excel files → `--q "excel spreadsheet"`
- Need to send emails → `--q "email smtp"`
- Use `--sort installCount` if you want to sort by popularity explicitly

## Examples

```bash
# Basic keyword search
npx -y @lobehub/market-cli skills search --q "pdf editor"

# Filter by category
npx -y @lobehub/market-cli skills search --q "deploy" --category development

# Paginate through results
npx -y @lobehub/market-cli skills search --q "api" --page 2 --page-size 10

# Get localized results
npx -y @lobehub/market-cli skills search --q "文档" --locale zh-CN

# Get full JSON for programmatic use
npx -y @lobehub/market-cli skills search --q "pdf" --output json
```
