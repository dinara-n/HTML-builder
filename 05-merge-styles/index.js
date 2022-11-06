async function bundleStyles(sourceFolder, targetFolder, bundleName) {
  const fs = require('fs');
  const path = require('path');
  const { rm, readdir } = require('fs/promises');
  const { stdout } = process;

  try {
    const sourceFolderPath = path.join(__dirname, sourceFolder);
    const targetFolderPath = path.join(__dirname, targetFolder);
    const bundlePath = path.join(targetFolderPath, bundleName);

    await rm(bundlePath, { force: true });
    const output = fs.createWriteStream(bundlePath);
    const contents = await readdir(sourceFolderPath, { withFileTypes: true });
    for (const item of contents) {
      if (item.isFile() && path.extname(item.name) === '.css') {
        const filePath = path.join(sourceFolderPath, item.name);
        const input = fs.createReadStream(filePath, 'utf-8');
        let data = '';
        input.on('data', chunk => data += chunk);
        input.on('end', () => {
          output.write(data);
          output.write('\n');
        });
        input.on('error', error => stdout.write(error.message));
      }
    }
  } catch(error) {
    stdout.write(error.message);
  }
}

bundleStyles('styles', 'project-dist', 'bundle.css');