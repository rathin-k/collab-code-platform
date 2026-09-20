const {
  executeCpp,
} = require("../services/codeExecutor");

const runCode = async (req, res) => {
  try {
    const {
      language,
      code,
      input,
    } = req.body;

    if (!language) {
      return res.status(400).json({
        error: "Language is required.",
      });
    }

    if (language !== "cpp") {
      return res.status(400).json({
        error: "Only C++ is supported currently.",
      });
    }

    const result = await executeCpp(
      code,
      input
    );

    return res.status(200).json({
      success: true,
      output: result.output,
    });

  } catch (error) {
    console.error("Run code error:", error);

    return res.status(200).json({
      success: false,
      errorType: error.type || "execution_error",
      error: error.message || "Code execution failed.",
    });
  }
};

module.exports = {
  runCode,
};