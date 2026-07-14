const { execFile } = require("child_process");

const runCommand = (command, args = []) => {
  return new Promise((resolve, reject) => {
    execFile(
      command,
      args,
      {
        windowsHide: true,
        maxBuffer: 5 * 1024 * 1024,
      },
      (error, stdout, stderr) => {
        if (error && !stdout && !stderr) {
          return reject(error);
        }

        resolve({
          exitCode: error?.code || 0,
          stdout: stdout || "",
          stderr: stderr || "",
        });
      }
    );
  });
};

module.exports = {
  runCommand,
};