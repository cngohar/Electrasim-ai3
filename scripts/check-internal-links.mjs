import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = resolve(projectRoot, process.argv[2] ?? 'dist');
const siteOrigin = 'https://electrasim.com';

if (!existsSync(outputRoot)) {
  console.error(`Internal-link check failed: ${relative(projectRoot, outputRoot)} does not exist.`);
  console.error('Run the production build before checking links.');
  process.exit(1);
}

function listHtmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) return listHtmlFiles(entryPath);
    return entry.name.endsWith('.html') ? [entryPath] : [];
  });
}

function outputPathExists(pathname) {
  const relativePath = pathname.replace(/^\/+/, '');
  const directPath = join(outputRoot, relativePath);

  if (pathname.endsWith('/')) return existsSync(join(directPath, 'index.html'));
  return existsSync(directPath) || existsSync(join(directPath, 'index.html'));
}

function pageUrl(filePath) {
  const outputPath = relative(outputRoot, filePath).split(sep).join('/');
  return `/${outputPath.replace(/index\.html$/, '')}`;
}

const failures = [];
const htmlFiles = listHtmlFiles(outputRoot);

for (const filePath of htmlFiles) {
  const html = readFileSync(filePath, 'utf8');
  const source = pageUrl(filePath);

  for (const match of html.matchAll(/<a\b[^>]*\bhref\s*=\s*(["'])([^"']+)\1/gi)) {
    const href = match[2].trim();
    if (!href || href.startsWith('#') || /^(?:data|javascript|mailto|tel):/i.test(href)) continue;

    let url;
    try {
      url = new URL(href, `${siteOrigin}${source}`);
    } catch {
      failures.push({ source, href, target: 'invalid URL' });
      continue;
    }

    if (url.origin !== siteOrigin) continue;

    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      failures.push({ source, href, target: 'invalid encoded path' });
      continue;
    }

    if (outputPathExists(pathname)) continue;
    failures.push({ source, href, target: url.pathname });
  }
}

if (failures.length > 0) {
  console.error(`Internal-link check failed with ${failures.length} broken link(s):`);
  for (const failure of failures) {
    console.error(`  ${failure.source} -> ${failure.href} (${failure.target})`);
  }
  process.exit(1);
}

console.log(`Internal-link check passed (${htmlFiles.length} HTML files).`);
