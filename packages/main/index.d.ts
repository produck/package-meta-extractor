/** Supported output languages. */
type Language = 'ECMAScript' | 'TypeScript';

/** Extracted metadata from package.json. */
interface PackageMeta {
  name?: string;
  version?: string;
  description?: string;
}

export declare class PackageExtractor {
  /**
   * @param pathname - Absolute path to the directory containing package.json.
   */
  constructor(pathname: string);

  /** Reads package.json and extracts metadata. */
  read(): Promise<PackageMeta>;

  /**
   * Generates a module file exporting the extracted metadata.
   *
   * @param pathname - Absolute path of the output file.
   * @param language - Target language, defaults to 'ECMAScript'.
   */
  generate(pathname: string, language?: Language): Promise<void>;
}
