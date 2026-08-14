import packageMetadata from '../package.json';

/** Public release version, sourced from the root package manifest at build time. */
export const APP_VERSION = packageMetadata.version;
