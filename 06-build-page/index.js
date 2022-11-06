buildPage('project-dist');

async function buildPage(folderName) {
  const path = require('path');
  const { rm, mkdir } = require('fs/promises');
  const { stdout } = process;

  try {
    const distPath = path.join(__dirname, folderName);
    await rm(distPath, { recursive: true, force: true });
    await mkdir(distPath, { recursive: true });
    createHtml('template.html', 'components', 'project-dist', 'index.html');
    bundleStyles('styles', 'project-dist', 'style.css');
    copyDir('assets', 'project-dist/assets');

  } catch(error) {
    stdout.write(error.message);
  }
}

async function readFromFile(filePath) {
  const fs = require('fs');

  return new Promise((resolve, reject) => {
    let data = '';
    const input = fs.createReadStream(filePath, 'utf-8');
    input.on('data', chunk => data += chunk);
    input.on('end', () => resolve(data));
    input.on('error', error => reject(error));
  })

}

async function createHtml(templateFile, componentsFolder, targetFolder, targetFile) {
  const fs = require('fs');
  const path = require('path');
  const { readdir } = require('fs/promises');
  const { stdout } = process;

  try {
    const templateFilePath = path.join(__dirname, templateFile);
    const componentsFolderPath = path.join(__dirname, componentsFolder);
    const targetFilePath = path.join(__dirname, targetFolder, targetFile);

    let template = await readFromFile(templateFilePath);
    const components = new Map();
    const folderContents = await readdir(componentsFolderPath, { withFileTypes: true });
    for await (const item of folderContents) {
      const filePath = path.join(componentsFolderPath, item.name);
      if (item.isFile() && path.extname(filePath) === '.html') {
        const fileName = item.name.slice(0, item.name.lastIndexOf('.'));
        const component = await readFromFile(filePath);
        components.set(fileName, component);
      }
    }
    for await (const component of components.keys()) {
      if (template.indexOf(`{{${component}}}`) !== -1) {
        template = template.replaceAll(`{{${component}}}`, components.get(component));
      }
    }
    const output = fs.createWriteStream(targetFilePath);
    output.write(template);

  } catch(error) {
    stdout.write(error.message);
  }
}

async function bundleStyles(sourceFolder, targetFolder, bundleName) {
  const fs = require('fs');
  const path = require('path');
  const { rm, readdir } = require('fs/promises');
  const { stdout } = process;

  try {
    const sourceFolderPath = path.join(__dirname, sourceFolder);
    const bundlePath = path.join(__dirname, targetFolder, bundleName);

    await rm(bundlePath, { force: true });
    const stylesArray = [];
    const contents = await readdir(sourceFolderPath, { withFileTypes: true });
    for await (const item of contents) {
      if (item.isFile() && path.extname(item.name) === '.css') {
        const filePath = path.join(sourceFolderPath, item.name);
        const data = await readFromFile(filePath);
        stylesArray.push(data);
      }
    }
    const output = fs.createWriteStream(bundlePath);
    output.write(stylesArray.join('\n'));
  } catch(error) {
    stdout.write(error.message);
  }
}

async function copyDir(sourceDir, targetDir) {
  const path = require('path');
  const { rm, readdir, mkdir, copyFile } = require('fs/promises');
  const { stdout } = process;
  
  try {
    const sourceDirPath = path.join(__dirname, sourceDir);
    const targetDirPath = path.join(__dirname, targetDir);

    await rm(targetDirPath, { recursive: true, force: true });
    await mkdir(targetDirPath, { recursive: true });
    const contents = await readdir(sourceDirPath, {withFileTypes: true});
    for (const item of contents) {
      if (item.isDirectory()) {
        const sourceDirNested = path.join(sourceDir, item.name);
        const targetDirNested = path.join(targetDir, item.name);
        copyDir(sourceDirNested, targetDirNested);
      } else {
        const sourceFilePath = path.join(sourceDirPath, item.name);
        const targetFilePath = path.join(targetDirPath, item.name);
        copyFile(sourceFilePath, targetFilePath);
      }
    }
  } catch(error) {
    stdout.write(error.message);
  }
}