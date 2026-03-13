import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { PackageExtractor } from '@produck/package-meta-extractor';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('package-meta-extractor', () => {
	const OUTPUT_DIR = path.join(__dirname, 'output.ign');
	let fixtureIndex = 0;

	before(async () => {
		await fs.rm(OUTPUT_DIR, { recursive: true, force: true });
		await fs.mkdir(OUTPUT_DIR, { recursive: true });
	});

	async function createFixture(pkg) {
		const dir = path.join(OUTPUT_DIR, `pkg-${fixtureIndex++}`);
		await fs.mkdir(dir, { recursive: true });
		await fs.writeFile(path.join(dir, 'package.json'), JSON.stringify(pkg), 'utf-8');

		return dir;
	}

	it('should throw if pathname is not a string.', () => {
		assert.throws(() => new PackageExtractor(123));
	});

	it('should throw if pathname is not an absolute path.', () => {
		assert.throws(() => new PackageExtractor('relative/path'));
	});

	it('should read package.json and extract mapped properties.', async () => {
		const dir = await createFixture({
			name: '@produck/foo',
			version: '1.0.0',
			description: 'A test package.',
			license: 'MIT',
		});

		const extractor = new PackageExtractor(dir);
		const meta = await extractor.read();

		assert.equal(meta.name, '@produck/foo');
		assert.equal(meta.version, '1.0.0');
		assert.equal(meta.description, 'A test package.');
		assert.equal(meta.license, undefined);
	});

	it('should generate an ES module file.', async () => {
		const dir = await createFixture({
			name: 'bar',
			version: '2.0.0',
			description: 'Bar package.',
		});

		const extractor = new PackageExtractor(dir);
		const outFile = path.join(dir, 'meta.mjs');

		await extractor.read();
		await extractor.generate(outFile, 'ECMAScript');

		const content = await fs.readFile(outFile, 'utf-8');

		assert.ok(content.includes('export const NAME = \'bar\';'));
		assert.ok(content.includes('export const VERSION = \'2.0.0\';'));
		assert.ok(content.includes('export const DESCRIPTION = \'Bar package.\';'));
	});

	it('should generate a TypeScript file.', async () => {
		const dir = await createFixture({
			name: 'baz',
			version: '3.0.0',
			description: 'Baz package.',
		});

		const extractor = new PackageExtractor(dir);
		await extractor.read();

		const outFile = path.join(dir, 'meta.ts');
		await extractor.generate(outFile, 'TypeScript');

		const content = await fs.readFile(outFile, 'utf-8');

		assert.ok(content.includes('export const NAME = \'baz\';'));
		assert.ok(content.includes('export const VERSION = \'3.0.0\';'));
	});

	it('should throw on invalid language.', async () => {
		const dir = await createFixture({ name: 'test' });
		const extractor = new PackageExtractor(dir);
		await extractor.read();

		await assert.rejects(() => extractor.generate(path.join(dir, 'out.mjs'), 'Python'));
	});

	it('should throw if generate pathname is not a string.', async () => {
		const dir = await createFixture({ name: 'test' });
		const extractor = new PackageExtractor(dir);
		await extractor.read();

		await assert.rejects(() => extractor.generate(123));
	});

	it('should throw if generate pathname is not an absolute path.', async () => {
		const dir = await createFixture({ name: 'test' });
		const extractor = new PackageExtractor(dir);
		await extractor.read();

		await assert.rejects(() => extractor.generate('relative/out.mjs'));
	});

	it('should throw on mismatched extname for language.', async () => {
		const dir = await createFixture({ name: 'test' });
		const extractor = new PackageExtractor(dir);
		await extractor.read();

		await assert.rejects(() => extractor.generate(path.join(dir, 'out.ts'), 'ECMAScript'));
	});
});
