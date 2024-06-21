import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function modifyManifest() {
  const buildDir = path.resolve(__dirname, 'build');
  const firefoxDir = path.resolve(__dirname, 'build-firefox');

  // Copy build folder to build-firefox
  await fs.copy(buildDir, firefoxDir);

  const manifestPath = path.join(firefoxDir, 'manifest.json');
  const manifest = await fs.readJson(manifestPath);

  // Modify manifest.json for Firefox
  manifest.browser_specific_settings = {
    gecko: {
      id: 'your-extension-id@domain.com',
      strict_min_version: '42.0'
    }
  };

  // Save the modified manifest.json
  await fs.writeJson(manifestPath, manifest, { spaces: 2 });

  console.log('Firefox build created successfully.');
}

modifyManifest().catch(err => {
  console.error(err);
  process.exit(1);
});
