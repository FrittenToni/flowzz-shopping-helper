import fs from 'fs-extra';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function modifyManifest() {
  const buildDir = path.resolve(__dirname, 'build');
  const firefoxDir = path.resolve(__dirname, 'build-firefox');
  const releaseDir = path.resolve(__dirname, 'release');

  // Copy build folder to build-firefox
  await fs.copy(buildDir, firefoxDir);

  const manifestPath = path.join(firefoxDir, 'manifest.json');
  const manifest = await fs.readJson(manifestPath);

  // Modify manifest.json for Firefox
  manifest.browser_specific_settings = {
    gecko: {
      id: 'fritten@toni.com',
      strict_min_version: '42.0'
    }
  };

  // Save the modified manifest.json
  await fs.writeJson(manifestPath, manifest, { spaces: 2 });

  console.log('Firefox build created successfully.');

  // Zip the content of build-firefox
  const firefoxOutput = fs.createWriteStream(path.join(firefoxDir, 'flowzz-shopping-helper.xpi'));
  const firefoxArchive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  firefoxOutput.on('close', function() {
    console.log(firefoxArchive.pointer() + ' total bytes');
    console.log('flowzz-shopping-helper.xpi has been created successfully.');
  });

  firefoxArchive.on('error', function(err) {
    throw err;
  });

  firefoxArchive.pipe(firefoxOutput);

  // Append files from build-firefox
  firefoxArchive.directory(firefoxDir, false);

  await firefoxArchive.finalize();

  // Zip the content of build into flowzz-shopping-helper folder inside the zip
  const buildOutput = fs.createWriteStream(path.join(__dirname, 'flowzz-shopping-helper.zip'));
  const buildArchive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  buildOutput.on('close', function() {
    console.log(buildArchive.pointer() + ' total bytes');
    console.log('flowzz-shopping-helper.zip has been created successfully.');
  });

  buildArchive.on('error', function(err) {
    throw err;
  });

  buildArchive.pipe(buildOutput);

  // Append files from build into a folder called "flowzz-shopping-helper" inside the zip
  buildArchive.directory(buildDir, 'flowzz-shopping-helper');

  await buildArchive.finalize();

  // Ensure the release directory is clean
  if (await fs.pathExists(releaseDir)) {
    await fs.remove(releaseDir);
  }
  await fs.mkdir(releaseDir);

  // Move the zip and xpi files to the release folder
  await fs.move(path.join(__dirname, 'flowzz-shopping-helper.zip'), path.join(releaseDir, 'flowzz-shopping-helper.zip'));
  await fs.move(path.join(firefoxDir, 'flowzz-shopping-helper.xpi'), path.join(releaseDir, 'flowzz-shopping-helper.xpi'));

  console.log('Release folder created and files moved successfully.');
}

modifyManifest().catch(err => {
  console.error(err);
  process.exit(1);
});
