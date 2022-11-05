const fs = require('fs');
const path = require('path');
const { readdir, stat } = require('fs/promises');
const { stdout } = process;
const dirPath = path.join(__dirname, 'secret-folder');

readdir(dirPath, {withFileTypes: true})
.then(contents => {
  for (const item of contents) {
    if (item.isFile()) {
      const filePath = path.join(dirPath, item.name);
      const fileName = item.name.slice(0, item.name.lastIndexOf('.')) || 'NO NAME';
      // const fileExtension = path.extname(filePath);
      const fileExtension = item.name.slice(item.name.lastIndexOf('.') + 1);
      stat(filePath)
      .then(stats => {
        const fileSize = stats.size;
        stdout.write(`${fileName} - ${fileExtension} - ${fileSize} bytes\n`);
      });
    }
  }
})
.catch(error => {
  stdout.write(error.message);
})