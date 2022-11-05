const fs = require('fs');
const path = require('path');
const { stdin, stdout } = process;
const filePath = path.join(__dirname, 'text.txt');

function exit() {
  stdout.write('Bye!');
  process.exit();
}

stdout.write('Hi! Type something here please:\n');
const output = fs.createWriteStream(filePath);

stdin.on('data', data => {
  if (data.toString().trim() === 'exit') {
    exit();
  }
  output.write(data);
});

process.on('SIGINT', exit);