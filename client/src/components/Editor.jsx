import { useState } from "react";
import Editor from "@monaco-editor/react";
import "../styles/Editor.css";

function CodeEditor({ code, setCode, roomId, socket }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const handleEditorChange = (value) => {
    const updatedCode = value || "";

    setCode(updatedCode);

    // Keep real-time collaboration working
    socket.emit("code-change", {
      roomId,
      code: updatedCode,
    });
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput("Running...");

    try {
      const response = await fetch("http://localhost:5000/api/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: "cpp",
          code,
          input,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setOutput(data.error || "Code execution failed.");
        return;
      }

      setOutput(
        data.output ||
        data.error ||
        "Program executed successfully with no output."
      );

    } catch (error) {
      console.error("Run code error:", error);
      setOutput("Unable to connect to the code execution server.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="editor-container">

      {/* Editor Header */}
      <div className="editor-toolbar">

        <div className="language-selector">
          <span>Language</span>

          <select value="cpp" disabled>
            <option value="cpp">C++</option>
          </select>
        </div>

        <button
          className="run-button"
          onClick={handleRunCode}
          disabled={isRunning}
        >
          {isRunning ? "⏳ Running..." : "▶ Run Code"}
        </button>

      </div>

      {/* Monaco Editor */}
      <div className="monaco-container">
        <Editor
          height="100%"
          defaultLanguage="cpp"
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          options={{
            minimap: {
              enabled: false,
            },
            fontSize: 15,
            automaticLayout: true,
          }}
        />
      </div>

      {/* Input + Output */}
      <div className="execution-panel">

        <div className="execution-box">
          <h4>Input</h4>

          <textarea
            className="code-input"
            placeholder="Enter program input here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <div className="execution-box">
          <h4>Output</h4>

          <pre className="code-output">
            {output || "Program output will appear here..."}
          </pre>
        </div>

      </div>

    </div>
  );
}

export default CodeEditor;