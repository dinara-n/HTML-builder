async function copyDir(sourceDir, targetDir) {
  const path = require('path');
  const { rm, readdir, mkdir, copyFile } = require('fs/promises');
  const { stdout } = process;
  
  const sourceDirPath = path.join(__dirname, sourceDir);
  const targetDirPath = path.join(__dirname, targetDir);
  
  try {
    await rm(targetDirPath, { recursive: true, force: true });
    await mkdir(targetDirPath, { recursive: true });
    const contents = await readdir(sourceDirPath, {withFileTypes: true});
    for (const item of contents) {
      if (item.isDirectory()) {  // copying nested folders rercursively
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

copyDir('files', 'files-copy');