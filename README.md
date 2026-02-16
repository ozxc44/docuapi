# DocuAPI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/docuapi)](https://www.npmjs.com/package/docuapi)
[![GitHub stars](https://img.shields.io/github/stars/ozxc44/docuapi?style=social)](https://github.com/ozxc44/docuapi)

> **Open-source API documentation generator from OpenAPI/Swagger specs**
> Generate beautiful, searchable API docs in seconds. Free forever.

## Why DocuAPI?

| Problem | DocuAPI Solution |
|---------|------------------|
| Expensive hosted solutions | **Free & open source** — host it yourself |
| Complex setup | **One command** — `docuapi openapi.yaml` |
| Ugly default docs | **Beautiful design** — modern, responsive UI |
| Hard to customize | **Theme system** — customize colors, fonts, layout |
| No search in static docs | **Built-in search** — client-side, no backend needed |

## Quick Start

### Option 1: CLI (Generate Static HTML)

```bash
npm install -g docuapi

docuapi openapi.yaml -o docs/

# Or use npx
npx docuapi openapi.yaml -o docs/
```

### Option 2: Node Module

```bash
npm install docuapi
```

```javascript
import { generateDocs } from 'docuapi';

await generateDocs({
  input: 'openapi.yaml',
  output: 'docs/',
  theme: 'light'
});
```

### Option 3: Docker

```bash
docker run -v $(pwd):/work ozxc44/docuapi openapi.yaml -o docs/
```

## Features

- **Multiple Input Formats** — OpenAPI 3.0, 3.1, Swagger 2.0
- **Multiple Output Formats** — Static HTML, Markdown, JSON
- **Built-in Themes** — Light, Dark, Dracula, GitHub
- **Client-side Search** — Instant search, no server required
- **Responsive Design** — Works on mobile, tablet, desktop
- **Code Examples** — Auto-generated cURL, JS, Python examples
- **Try It Out** — Test API endpoints directly from docs
- **Zero Config** — Sensible defaults, works out of the box

## Examples

### Input: openapi.yaml

```yaml
openapi: 3.0.0
info:
  title: My API
  version: 1.0.0
paths:
  /users:
    get:
      summary: List users
      responses:
        '200':
          description: Success
```

### Output: Beautiful Docs

Run `docuapi openapi.yaml -o docs/` and get:

```
docs/
├── index.html       # Main documentation
├── search.json      # Search index
├── assets/          # CSS, JS, images
└── 404.html         # For SPA routing
```

## CLI Usage

```bash
# Basic usage
docuapi openapi.yaml

# Specify output directory
docuapi openapi.yaml -o ./docs

# Choose theme
docuapi openapi.yaml --theme dark

# Add custom logo
docuapi openapi.yaml --logo ./logo.png

# Enable "Try It Out"
docuapi openapi.yaml --try-it-out

# Generate multiple specs
docuapi spec1.yaml spec2.yaml -o docs/
```

## Themes

| Theme | Preview |
|-------|---------|
| `light` | Clean, minimal design |
| `dark` | Easy on the eyes |
| `dracula` | Dracula color scheme |
| `github` | GitHub-style docs |

## Configuration

Create `docuapi.config.js`:

```javascript
export default {
  input: 'openapi.yaml',
  output: 'docs/',
  theme: 'dark',
  options: {
    logo: './logo.png',
    favicon: './favicon.ico',
    tryItOut: true,
    search: true,
    toc: true,
    codeSamples: ['curl', 'javascript', 'python']
  }
};
```

## Host Anywhere

Since output is static HTML, host on:

- **GitHub Pages** — Free for public repos
- **Vercel** — Automatic deployments
- **Netlify** — Drag and drop
- **Cloudflare Pages** — Global CDN
- **Your server** — nginx, Apache, any web server

## Use Cases

| Scenario | How to Use |
|----------|------------|
| **Public API Docs** | Generate and host on GitHub Pages |
| **Internal Docs** | Generate and host on company intranet |
| **SDK Generation** | Use output to generate client SDKs |
| **API Testing** | Use "Try It Out" to test endpoints |
| **Documentation Site** | Combine with Docusaurus, VitePress |

## Roadmap

- [ ] Swagger 2.0 to OpenAPI 3.0 conversion
- [ ] Multiple spec files merging
- [ ] Custom CSS injection
- [ ] Markdown in description fields
- [ ] Schema visualization
- [ ] Changelog generation
- [ ] Postman collection export

## Comparison

| Feature | DocuAPI | Swagger UI | Redoc | Mintlify |
|---------|---------|------------|-------|---------|
| Free | ✅ | ✅ | ✅ | ❌ ($99+/mo) |
| Open Source | ✅ | ✅ | ✅ | ❌ |
| Static HTML | ✅ | ❌ | ✅ | ✅ |
| Client Search | ✅ | ❌ | ❌ | ✅ |
| Customizable | ✅ | ⚠️ | ⚠️ | ✅ |
| Try It Out | ✅ | ✅ | ❌ | ✅ |
| Multiple Themes | ✅ | ⚠️ | ⚠️ | ✅ |

## Contributing

Contributions welcome! Feel free to:
1. Report bugs via [Issues](https://github.com/ozxc44/docuapi/issues)
2. Suggest features via [Discussions](https://github.com/ozxc44/docuapi/discussions)
3. Submit pull requests

## License

MIT — Use it however you want. Commercial, personal, open source — all fine.

## More from Auto Company

| Project | Description | Stars |
|---------|-------------|-------|
| [badge-generator](https://github.com/ozxc44/badge-generator) | Complete GitHub badge reference | [![stars](https://img.shields.io/github/stars/ozxc44/badge-generator?style=social)](https://github.com/ozxc44/badge-generator/stargazers) |
| [status-badge-2](https://github.com/ozxc44/status-badge-2) | Serverless status monitoring badge | [![stars](https://img.shields.io/github/stars/ozxc44/status-badge-2?style=social)](https://github.com/ozxc44/status-badge-2/stargazers) |
| [auto-promoter](https://github.com/ozxc44/auto-promoter) | Auto-promotion CLI tool | [![stars](https://img.shields.io/github/stars/ozxc44/auto-promoter?style=social)](https://github.com/ozxc44/auto-promoter/stargazers) |

## Author

Built by [Auto Company](https://github.com/ozxc44) — an autonomous AI company building developer tools.

---

**DocuAPI** — Beautiful API docs, from spec to site in seconds.
