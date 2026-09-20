const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const MAX_INPUT_SIZE = 10000;
const MAX_OUTPUT_SIZE = 100000;

const compileCode = (sourcePath, executablePath) => {
  return new Promise((resolve, reject) => {
    const compiler = spawn(
      "g++",
      [
        sourcePath,
        "-std=c++17",
        "-O2",
        "-o",
        executablePath,
      ],
      {
        windowsHide: true,
      }
    );

    let stderr = "";
    let stdout = "";

    const timeout = setTimeout(() => {
      compiler.kill();
      reject({
        type: "compile_timeout",
        message: "Compilation timed out.",
      });
    }, 5000);

    compiler.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    compiler.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    compiler.on("error", (error) => {
      clearTimeout(timeout);

      if (error.code === "ENOENT") {
        reject({
          type: "compiler_not_found",
          message: "g++ was not found on the server.",
        });
      } else {
        reject({
          type: "compile_error",
          message: error.message,
        });
      }
    });

    compiler.on("close", (code) => {
      clearTimeout(timeout);

      if (code !== 0) {
        reject({
          type: "compile_error",
          message: stderr || "Compilation failed.",
        });

        return;
      }

      resolve({
        stdout,
        stderr,
      });
    });
  });
};

const runExecutable = (executablePath, input) => {
  return new Promise((resolve, reject) => {
    const executable = spawn(
      executablePath,
      [],
      {
        windowsHide: true,
      }
    );

    let stdout = "";
    let stderr = "";
    let outputTooLarge = false;

    const timeout = setTimeout(() => {
      executable.kill();

      reject({
        type: "timeout",
        message: "Execution timed out.",
      });
    }, 3000);

    const addOutput = (current, chunk) => {
      const updated = current + chunk.toString();

      if (updated.length > MAX_OUTPUT_SIZE) {
        outputTooLarge = true;
      }

      return updated;
    };

    executable.stdout.on("data", (data) => {
      stdout = addOutput(stdout, data);

      if (outputTooLarge) {
        executable.kill();

        reject({
          type: "output_limit",
          message: "Program output exceeded the allowed limit.",
        });
      }
    });

    executable.stderr.on("data", (data) => {
      stderr = addOutput(stderr, data);

      if (outputTooLarge) {
        executable.kill();

        reject({
          type: "output_limit",
          message: "Program output exceeded the allowed limit.",
        });
      }
    });

    executable.on("error", (error) => {
      clearTimeout(timeout);

      reject({
        type: "runtime_error",
        message: error.message,
      });
    });

    executable.on("close", (code) => {
      clearTimeout(timeout);

      if (code !== 0) {
        reject({
          type: "runtime_error",
          message: stderr || `Program exited with code ${code}.`,
        });

        return;
      }

      resolve({
        output: stdout,
      });
    });

    // Send input to the program
    executable.stdin.write(input || "");
    executable.stdin.end();
  });
};

const executeCpp = async (code, input) => {
  if (typeof code !== "string" || !code.trim()) {
    throw {
      type: "validation_error",
      message: "Code cannot be empty.",
    };
  }

  if (typeof input !== "string") {
    input = "";
  }

  if (input.length > MAX_INPUT_SIZE) {
    throw {
      type: "validation_error",
      message: "Input is too large.",
    };
  }

  const tempDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "collab-code-")
  );

  const sourcePath = path.join(tempDir, "main.cpp");
  const executablePath = path.join(
    tempDir,
    process.platform === "win32" ? "main.exe" : "main"
  );

  try {
    await fs.writeFile(sourcePath, code, "utf8");

    // Compile
    await compileCode(
      sourcePath,
      executablePath
    );

    // Execute
    const result = await runExecutable(
      executablePath,
      input
    );

    return result;

  } finally {
    // Delete temporary files
    await fs.rm(tempDir, {
      recursive: true,
      force: true,
    });
  }
};

module.exports = {
  executeCpp,
};