module.exports = {
  // TypeScript files
  '*.{ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    () => 'tsc --noEmit' // Type checking
  ],

  // JavaScript files
  '*.{js,jsx}': [
    'eslint --fix',
    'prettier --write'
  ],

  // JSON files
  '*.json': [
    'prettier --write'
  ],

  // Markdown files
  '*.md': [
    'prettier --write'
  ],

  // YAML files
  '*.{yml,yaml}': [
    'prettier --write'
  ],

  // Package.json files
  'package.json': [
    'npm run lint:package-json', // Custom script to validate package.json
    'prettier --write'
  ],

  // Docker files
  'Dockerfile*': [
    'hadolint' // Docker linter (if installed)
  ],

  // Shell scripts
  '*.sh': [
    'shellcheck' // Shell script linter (if installed)
  ]
};