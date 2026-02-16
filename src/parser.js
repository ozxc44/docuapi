/**
 * OpenAPI/Swagger Parser
 */

import { readFileSync } from 'fs';
import yaml from 'yaml';

export function parseSpec(inputPath) {
  const content = readFileSync(inputPath, 'utf8');
  const ext = inputPath.split('.').pop();

  if (ext === 'yaml' || ext === 'yml') {
    return yaml.parse(content);
  }
  return JSON.parse(content);
}

export function validateSpec(spec) {
  const errors = [];

  if (!spec.openapi && !spec.swagger) {
    errors.push('Missing openapi or swagger version');
  }

  if (!spec.info) {
    errors.push('Missing info object');
  }

  if (!spec.paths) {
    errors.push('Missing paths object');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
