/**
 * DocuAPI Generator
 * Generates static HTML documentation from OpenAPI/Swagger specs
 */

import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import yaml from 'yaml';

const TEMPLATES = {
  light: getTemplate('light'),
  dark: getTemplate('dark'),
  dracula: getTemplate('dracula'),
  github: getTemplate('github')
};

export async function generateDocs(options) {
  const {
    input,
    output,
    theme = 'light',
    logo,
    favicon,
    tryItOut = false,
    search = true,
    toc = true,
    title
  } = options;

  // Read and parse OpenAPI spec
  const spec = parseSpec(input);

  // Generate documentation HTML
  const html = generateHTML(spec, {
    theme,
    logo,
    favicon,
    tryItOut,
    search,
    toc,
    title: title || spec.info?.title || 'API Documentation'
  });

  // Create output directory
  const outputDir = resolve(output);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Write index.html
  writeFileSync(resolve(outputDir, 'index.html'), html);

  // Write search index
  if (search) {
    const searchIndex = generateSearchIndex(spec);
    writeFileSync(resolve(outputDir, 'search.json'), JSON.stringify(searchIndex, null, 2));
  }

  // Copy assets (CSS, JS)
  const assetsDir = resolve(outputDir, 'assets');
  if (!existsSync(assetsDir)) {
    mkdirSync(assetsDir, { recursive: true });
  }

  writeFileSync(resolve(assetsDir, 'style.css'), getCSS(theme));
  writeFileSync(resolve(assetsDir, 'app.js'), getJS());

  return { outputDir, spec };
}

function parseSpec(inputPath) {
  const content = readFileSync(inputPath, 'utf8');
  const ext = inputPath.split('.').pop();

  if (ext === 'yaml' || ext === 'yml') {
    return yaml.parse(content);
  }
  return JSON.parse(content);
}

function generateHTML(spec, options) {
  const { theme, logo, favicon, tryItOut, search, toc, title } = options;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  ${favicon ? `<link rel="icon" href="${favicon}">` : ''}
  <link rel="stylesheet" href="/assets/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
</head>
<body class="theme-${theme}">
  <div class="container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        ${logo ? `<img src="${logo}" alt="Logo" class="logo">` : ''}
        <h1>${escapeHtml(spec.info?.title || 'API Documentation')}</h1>
        <p class="version">${escapeHtml(spec.info?.version || '1.0.0')}</p>
      </div>

      ${toc ? `
      <nav class="toc">
        <h3>Endpoints</h3>
        <ul>
          ${Object.entries(spec.paths || {}).map(([path, methods]) => `
            <li>
              <a href="#${slugify(path)}">${escapeHtml(path)}</a>
              <ul>
                ${Object.entries(methods).map(([method, details]) => `
                  <li class="method-${method}">
                    <a href="#${slugify(path)}-${method}">${method.toUpperCase()}</a>
                  </li>
                `).join('')}
              </ul>
            </li>
          `).join('')}
        </ul>
      </nav>
      ` : ''}

      ${search ? `
      <div class="search">
        <input type="text" id="search-input" placeholder="Search endpoints...">
        <div id="search-results"></div>
      </div>
      ` : ''}
    </aside>

    <!-- Main Content -->
    <main class="content">
      <header class="header">
        <h1>${escapeHtml(title)}</h1>
        <p class="description">${escapeHtml(spec.info?.description || '')}</p>
        ${spec.info?.contact ? `
          <p class="contact">
            ${spec.info.contact.email ? `<a href="mailto:${spec.info.contact.email}">${escapeHtml(spec.info.contact.email)}</a>` : ''}
            ${spec.info.contact.url ? ` | <a href="${spec.info.contact.url}" target="_blank">${escapeHtml(spec.info.contact.url)}</a>` : ''}
          </p>
        ` : ''}
      </header>

      <!-- Endpoints -->
      <section class="endpoints">
        ${Object.entries(spec.paths || {}).map(([path, methods]) => `
          <div id="${slugify(path)}" class="endpoint-group">
            <h2>${escapeHtml(path)}</h2>

            ${Object.entries(methods).map(([method, details]) => `
              <div id="${slugify(path)}-${method}" class="endpoint method-${method}">
                <div class="endpoint-header">
                  <span class="method">${method.toUpperCase()}</span>
                  <span class="path">${escapeHtml(path)}</span>
                  <span class="summary">${escapeHtml(details.summary || details.description || '')}</span>
                </div>

                ${details.description ? `<p class="description">${escapeHtml(details.description)}</p>` : ''}

                ${details.parameters?.length ? `
                  <h3>Parameters</h3>
                  <table class="params">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>In</th>
                        <th>Required</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${details.parameters.map(param => `
                        <tr>
                          <td><code>${escapeHtml(param.name)}</code></td>
                          <td>${escapeHtml(param.schema?.type || 'string')}</td>
                          <td>${escapeHtml(param.in)}</td>
                          <td>${param.required ? 'Yes' : 'No'}</td>
                          <td>${escapeHtml(param.description || '-')}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                ` : ''}

                ${details.requestBody ? `
                  <h3>Request Body</h3>
                  <pre><code class="language-json">${escapeHtml(JSON.stringify(details.requestBody.content?.['application/json']?.schema || {}, null, 2))}</code></pre>
                ` : ''}

                <h3>Responses</h3>
                ${Object.entries(details.responses || {}).map(([code, response]) => `
                  <div class="response response-${code.startsWith('2') ? 'success' : code.startsWith('4') ? 'client' : 'server'}">
                    <h4>${code} ${escapeHtml(response.description || '')}</h4>
                    ${response.content?.['application/json']?.schema ? `
                      <pre><code class="language-json">${escapeHtml(JSON.stringify(response.content['application/json'].schema, null, 2))}</code></pre>
                    ` : ''}
                  </div>
                `).join('')}

                ${tryItOut ? `
                  <div class="try-it-out">
                    <h4>Try It Out</h4>
                    <button onclick="tryItOut('${method}', '${path}')">Send Request</button>
                    <pre id="response-${slugify(path)}-${method}" class="response-output hidden"></pre>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        `).join('')}
      </section>

      ${spec.components?.schemas ? `
        <section class="schemas">
          <h2>Schemas</h2>
          ${Object.entries(spec.components.schemas).map(([name, schema]) => `
            <div class="schema">
              <h3>${escapeHtml(name)}</h3>
              <pre><code class="language-json">${escapeHtml(JSON.stringify(schema, null, 2))}</code></pre>
            </div>
          `).join('')}
        </section>
      ` : ''}
    </main>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <script src="/assets/app.js"></script>
</body>
</html>`;
}

function generateSearchIndex(spec) {
  const index = [];

  for (const [path, methods] of Object.entries(spec.paths || {})) {
    for (const [method, details] of Object.entries(methods)) {
      index.push({
        path,
        method,
        title: details.summary || details.description || path,
        description: details.description || '',
        slug: `${slugify(path)}-${method}`
      });
    }
  }

  return { index };
}

function getCSS(theme) {
  const colors = {
    light: {
      bg: '#ffffff',
      text: '#333333',
      sidebar: '#f8f9fa',
      border: '#e1e4e8',
      code: '#f6f8fa'
    },
    dark: {
      bg: '#1a1a1a',
      text: '#e6e6e6',
      sidebar: '#242424',
      border: '#3a3a3a',
      code: '#2d2d2d'
    },
    dracula: {
      bg: '#282a36',
      text: '#f8f8f2',
      sidebar: '#21222c',
      border: '#44475a',
      code: '#44475a'
    },
    github: {
      bg: '#ffffff',
      text: '#24292f',
      sidebar: '#f6f8fa',
      border: '#d0d7de',
      code: '#f6f8fa'
    }
  };

  const c = colors[theme] || colors.light;

  return `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: ${c.bg}; color: ${c.text}; line-height: 1.6; }
.container { display: flex; min-height: 100vh; }

/* Sidebar */
.sidebar { width: 300px; background: ${c.sidebar}; border-right: 1px solid ${c.border}; padding: 20px; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
.sidebar-header h1 { font-size: 1.2rem; margin: 10px 0 5px; }
.sidebar-header .version { font-size: 0.9rem; opacity: 0.7; }
.logo { max-height: 40px; margin-bottom: 10px; }

/* TOC */
.toc { margin-top: 20px; }
.toc h3 { font-size: 0.9rem; text-transform: uppercase; opacity: 0.7; margin-bottom: 10px; }
.toc ul { list-style: none; }
.toc li { margin: 5px 0; }
.toc a { color: ${c.text}; text-decoration: none; display: block; padding: 5px; border-radius: 4px; }
.toc a:hover { background: ${c.border}; }
.method-get { color: #10b981; }
.method-post { color: #3b82f6; }
.method-put { color: #f59e0b; }
.method-delete { color: #ef4444; }
.method-patch { color: #8b5cf6; }

/* Search */
.search { margin-top: 20px; }
.search input { width: 100%; padding: 10px; border: 1px solid ${c.border}; border-radius: 6px; background: ${c.bg}; color: ${c.text}; }
#search-results { margin-top: 10px; max-height: 200px; overflow-y: auto; }
.search-result { padding: 10px; cursor: pointer; border-radius: 4px; }
.search-result:hover { background: ${c.border}; }

/* Content */
.content { flex: 1; padding: 40px; max-width: 1200px; }
.header { margin-bottom: 40px; border-bottom: 1px solid ${c.border}; padding-bottom: 20px; }
.header h1 { font-size: 2.5rem; margin-bottom: 10px; }

.endpoint-group { margin-bottom: 40px; }
.endpoint { background: ${c.code}; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
.endpoint-header { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; }
.method { padding: 4px 12px; border-radius: 4px; font-weight: bold; font-size: 0.85rem; text-transform: uppercase; }
.method-get { background: #10b981; color: white; }
.method-post { background: #3b82f6; color: white; }
.method-put { background: #f59e0b; color: white; }
.method-delete { background: #ef4444; color: white; }
.method-patch { background: #8b5cf6; color: white; }
.path { font-family: monospace; background: ${c.border}; padding: 4px 8px; border-radius: 4px; }
.summary { flex: 1; }

.params { width: 100%; border-collapse: collapse; margin: 15px 0; }
.params th, .params td { text-align: left; padding: 12px; border-bottom: 1px solid ${c.border}; }
.params th { font-weight: 600; opacity: 0.7; }
.params code { background: ${c.border}; padding: 2px 6px; border-radius: 3px; }

.response { margin: 15px 0; padding: 15px; border-radius: 6px; border-left: 4px solid; }
.response-success { border-color: #10b981; background: rgba(16, 185, 129, 0.1); }
.response-client { border-color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
.response-server { border-color: #ef4444; background: rgba(239, 68, 68, 0.1); }

pre { background: ${c.code}; padding: 15px; border-radius: 6px; overflow-x: auto; margin: 10px 0; }
code { font-family: 'Fira Code', monospace; font-size: 0.9rem; }

.try-it-out { margin-top: 15px; }
.try-it-out button { padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; }
.try-it-out button:hover { background: #2563eb; }
.response-output { margin-top: 10px; }
.hidden { display: none; }

@media (max-width: 768px) {
  .container { flex-direction: column; }
  .sidebar { width: 100%; height: auto; position: relative; }
  .content { padding: 20px; }
}
`;
}

function getJS() {
  return `
// Syntax highlighting
document.addEventListener('DOMContentLoaded', () => {
  hljs.highlightAll();

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
});

// Search functionality
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

if (searchInput) {
  fetch('/search.json')
    .then(r => r.json())
    .then(data => {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (query.length < 2) {
          searchResults.innerHTML = '';
          return;
        }

        const matches = data.index.filter(item =>
          item.title.toLowerCase().includes(query) ||
          item.path.toLowerCase().includes(query)
        );

        searchResults.innerHTML = matches.slice(0, 5).map(item => \`
          <div class="search-result" onclick="location.hash = '\${item.slug}'">
            <strong>\${item.method.toUpperCase()}</strong> \${item.path}
            <br><small>\${item.title}</small>
          </div>
        \`).join('');
      });
    });
}

// Try It Out
function tryItOut(method, path) {
  const output = document.getElementById(\`response-\${slugify(path)}-\${method}\`);
  output.classList.remove('hidden');
  output.textContent = 'This feature requires the API to be running. Configure the base URL in the settings.';
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '-');
}
`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '-');
}

function getTemplate(theme) {
  // Placeholder for template system
  return theme;
}
