# @produck/package-meta-extractor

Extract metadata from `package.json` and generate a module file exporting named
constants.

## Installation

```bash
npm install @produck/package-meta-extractor
```

## Usage

```js
import { PackageExtractor } from '@produck/package-meta-extractor';

const extractor = new PackageExtractor('/path/to/project');

// Read package.json
await extractor.read();

// Generate ECMAScript module (default)
await extractor.generate('/path/to/output/meta.mjs');

// Generate TypeScript module
await extractor.generate('/path/to/output/meta.ts', 'TypeScript');
```

The generated file will contain:

```js
export const NAME = 'your-package-name';
export const VERSION = '1.0.0';
export const DESCRIPTION = 'Your package description.';
```

## API

### `new PackageExtractor(pathname)`

- `pathname` — Absolute path to the directory containing `package.json`.

### `extractor.read()`

Reads `package.json` and extracts the following properties:

| package.json  | Exported constant |
| ------------- | ----------------- |
| `name`        | `NAME`            |
| `version`     | `VERSION`         |
| `description` | `DESCRIPTION`     |

Returns the extracted metadata object.

### `extractor.generate(pathname, language?)`

- `pathname` — Absolute path of the output file. The extension must match the
  target language.
- `language` — `'ECMAScript'` (default) or `'TypeScript'`.

Supported extensions:

| Language   | Extensions    |
| ---------- | ------------- |
| ECMAScript | `.mjs`, `.js` |
| TypeScript | `.ts`, `.mts` |

## License

MIT
