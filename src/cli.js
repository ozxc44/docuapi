#!/usr/bin/env node

/**
 * DocuAPI CLI
 * Generate beautiful API documentation from OpenAPI/Swagger specs
 */

import { generateDocs } from './generator.js';
import { readFileSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse CLI arguments
function parseArgs(args) {
  const result = {
    inputs: [],
    output: 'docs/',
    theme: 'light',
    logo: null,
    favicon: null,
    tryItOut: false,
    search: true,
    toc: true,
    title: null
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '-o':
      case '--output':
        result.output = nextArg;
        i++;
        break;
      case '-t':
      case '--theme':
        result.theme = nextArg;
        i++;
        break;
      case '--logo':
        result.logo = nextArg;
        i++;
        break;
      case '--favicon':
        result.favicon = nextArg;
        i++;
        break;
      case '--try-it-out':
        result.tryItOut = true;
        break;
      case '--no-search':
        result.search = false;
        break;
      case '--no-toc':
        result.toc = false;
        break;
      case '--title':
        result.title = nextArg;
        i++;
        break;
      case '-h':
      case '--help':
        showHelp();
        process.exit(0);
      case '-v':
      case '--version':
        console.log('DocuAPI v1.0.0');
        process.exit(0);
      default:
        if (!arg.startsWith('-')) {
          result.inputs.push(arg);
        }
    }
  }

  return result;
}

function showHelp() {
  console.log(`
DocuAPI - Generate beautiful API documentation from OpenAPI/Swagger specs

Usage:
  docuapi <input.yaml|json> [options]

Arguments:
  input                 OpenAPI/Swagger file(s) (YAML or JSON)

Options:
  -o, --output <dir>    Output directory (default: docs/)
  -t, --theme <name>    Theme: light, dark, dracula, github (default: light)
  --logo <path>         Custom logo path
  --favicon <path>      Custom favicon path
  --try-it-out          Enable "Try It Out" feature
  --no-search           Disable search
  --no-toc              Disable table of contents
  --title <title>       Custom documentation title
  -h, --help            Show help
  -v, --version         Show version

Examples:
  docuapi openapi.yaml
  docuapi openapi.yaml -o ./docs --theme dark
  docuapi spec1.yaml spec2.yaml -o docs/
  npx docuapi openapi.yaml

For more information, visit: https://github.com/ozxc44/docuapi
  `);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.inputs.length === 0) {
    console.error('❌ Error: Please provide at least one input file');
    console.error('Usage: docuapi <openapi.yaml|json> [options]');
    console.error('Run "docuapi --help" for more information.');
    process.exit(1);
  }

  try {
    console.log(`📚 DocuAPI v1.0.0\n`);

    for (const input of args.inputs) {
      console.log(`📄 Processing: ${input}`);
      await generateDocs({
        input: resolve(input),
        output: resolve(args.output),
        theme: args.theme,
        logo: args.logo ? resolve(args.logo) : null,
        favicon: args.favicon ? resolve(args.favicon) : null,
        tryItOut: args.tryItOut,
        search: args.search,
        toc: args.toc,
        title: args.title
      });
      console.log(`✅ Generated docs for ${input}`);
    }

    console.log(`\n🎉 Documentation generated in: ${args.output}`);
    console.log(`\n📖 To view locally:\n`);
    console.log(`   cd ${args.output}`);
    console.log(`   npx serve .`);
    console.log(`   # Or: python -m http.server 8000`);
    console.log(`\n🌐 Visit: http://localhost:8000\n`);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    if (error.message.includes('ENOENT')) {
      console.error(`\n💡 Hint: Make sure the input file exists.`);
    }
    process.exit(1);
  }
}

main();
