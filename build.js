const { build } = require('esbuild');
const { readdirSync } = require('fs');
const { join } = require('path');

async function buildPackage(packagePath) {
  const formats = ['esm', 'cjs'];
  const extensions = { esm: '.mjs', cjs: '.js' };

  for (const format of formats) {
    await build({
      entryPoints: [join(packagePath, 'src/index.ts')],
      bundle: true,
      platform: 'neutral',
      format,
      outdir: join(packagePath, 'dist'),
      outExtension: { '.js': extensions[format] },
      outbase: join(packagePath, 'src'),
      external: ['react', '@tanstack/virtual-core']
    });
  }
}

async function buildAll() {
  const packages = ['butter-core', 'butter-virtual'];
  
  try {
    await Promise.all(
      packages.map(pkg => buildPackage(join(__dirname, 'packages', pkg)))
    );
    console.log('Build completed successfully');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildAll(); 