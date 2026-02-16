#!/usr/bin/env node

/**
 * DocuAPI CLI
 * Generate beautiful API documentation from OpenAPI/Swagger specs
 */

import { generateDocs } from './generator.js';
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const program = new Command();

program
  .name('docuapi')
  .description('Generate beautiful API documentation from OpenAPI/Swagger specs')
  .version('1.0.0');

program
  .argument('[input...]', 'Input OpenAPI/Swagger file(s) (YAML or JSON)')
  .option('-o, --output <dir>', 'Output directory', 'docs/')
  .option('-t, --theme <name>', 'Theme (light, dark, dracula, github)', 'light')
  .option('--logo <path>', 'Custom logo path')
  .option('--favicon <path>', 'Custom favicon path')
  .option('--try-it-out', 'Enable "Try It Out" feature', false)
  .option('--no-search', 'Disable search')
  .option('--no-toc', 'Disable table of contents')
  .option('--title <title>', 'Custom documentation title')
  .action(async (inputs, options) => {
    if (!inputs || inputs.length === 0) {
      console.error('Error: Please provide at least one input file');
      console.error('Usage: docuapi <openapi.yaml|json> [options]');
      process.exit(1);
    }

    try {
      console.log(`📚 DocuAPI v1.0.0\n`);

      for (const input of inputs) {
        console.log(`Processing: ${input}`);
        await generateDocs({
          input: resolve(input),
          output: resolve(options.output),
          theme: options.theme,
          logo: options.logo ? resolve(options.logo) : null,
          favicon: options.favicon ? resolve(options.favicon) : null,
          tryItOut: options.tryItOut,
          search: options.search !== false,
          toc: options.toc !== false,
          title: options.title
        });
        console.log(`✅ Generated docs for ${input}`);
      }

      console.log(`\n🎉 Documentation generated in: ${options.output}`);
      console.log(`\nTo view:\n  cd ${options.output} && npx serve .`);
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

program.parse();
