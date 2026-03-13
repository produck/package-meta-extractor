import * as fs from 'node:fs';
import * as path from 'node:path';

import * as Ow from '@produck/ow';
import { ThrowTypeError } from '@produck/type-error';

const LANGUAGE = {
	ECMAScript: 'ECMAScript',
	TypeScript: 'TypeScript',
};

const VALID_LANGUAGE = [LANGUAGE.ECMAScript, LANGUAGE.TypeScript];

const EXTENSION_NAME = {
	[LANGUAGE.ECMAScript]: ['.mjs', '.js'],
	[LANGUAGE.TypeScript]: ['.ts', '.mts'],
};

const PROPERTY = {
	name: 'NAME',
	version: 'VERSION',
	description: 'DESCRIPTION',
};

const PROPERTY_KEYS = Object.keys(PROPERTY);

function isValidLanguage(language) {
	return VALID_LANGUAGE.includes(language);
}

function isValidExtensionName(extensionName, language) {
	return EXTENSION_NAME[language].includes(extensionName);
}

function generate(meta) {
	const lines = PROPERTY_KEYS.filter((key) => meta[key] !== undefined).map(
		(key) => `export const ${PROPERTY[key]} = '${meta[key]}';`,
	);

	return lines.join('\n') + '\n';
}

export class PackageExtractor {
	#pathname;
	#meta = {};

	constructor(pathname) {
		if (typeof pathname !== 'string') {
			ThrowTypeError('pathname', 'string');
		}

		if (!path.isAbsolute(pathname)) {
			ThrowTypeError('pathname', 'absolute path');
		}

		this.#pathname = pathname;
	}

	async read() {
		const fullPath = path.resolve(this.#pathname, 'package.json');
		const content = await fs.promises.readFile(fullPath, 'utf-8');
		const packageJson = JSON.parse(content);

		this.#meta = {};

		for (const key of PROPERTY_KEYS) {
			if (key in packageJson) {
				this.#meta[key] = packageJson[key];
			}
		}

		return this.#meta;
	}

	async generate(pathname, language = LANGUAGE.ECMAScript) {
		if (typeof pathname !== 'string') {
			ThrowTypeError('args[0] as pathname', 'string');
		}

		if (!path.isAbsolute(pathname)) {
			ThrowTypeError('args[0] as pathname', 'absolute path');
		}

		if (!isValidLanguage(language)) {
			ThrowTypeError('args[1] as language', VALID_LANGUAGE.join(' | '));
		}

		const extensionName = path.extname(pathname);

		if (extensionName && !isValidExtensionName(extensionName, language)) {
			Ow.Error.Common(`Use ${EXTENSION_NAME[language].join(' or ')}.`);
		}

		const content = generate(this.#meta);

		await fs.promises.mkdir(path.dirname(pathname), { recursive: true });
		await fs.promises.writeFile(pathname, content, 'utf-8');
	}
}
