import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import "../styles/Editor.css";

function CodeEditor({ code, setCode, roomId, socket }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const editorRef = useRef(null);
  const decorationsRef = useRef(new Map());
  const remoteWidgetsRef = useRef(new Map());
  const isRemoteUpdateRef = useRef(false);

  // Create or update a remote user's username label
  const createCursorLabel = (
  editor,
  socketId,
  name,
  color,
  position,
  decorationId
) => {
  if (!position || !name || !color || !decorationId) return;

  const existing = remoteWidgetsRef.current.get(socketId);

  if (existing) {
    existing.decorationId = decorationId;
    existing.name = name;
    existing.color = color;

    const node = existing.getDomNode();
    node.className =
      `remote-cursor-name remote-cursor-name-${color}`;
    node.textContent = name;

    editor.layoutContentWidget(existing);
    return;
  }

  const node = document.createElement("div");
  node.className =
    `remote-cursor-name remote-cursor-name-${color}`;
  node.textContent = name;

  const widget = {
    decorationId,
    name,
    color,

    getId: () => `remote-cursor-label-${socketId}`,

    getDomNode: () => node,

    getPosition: () => {
      const model = editor.getModel();

      if (!model) return null;

      const range = model.getDecorationRange(widget.decorationId);

      if (!range) return null;

      return {
        position: {
          lineNumber: range.endLineNumber,
          column: range.endColumn,
        },
        preference: [2, 1],
      };
    },
  };

  remoteWidgetsRef.current.set(socketId, widget);
  editor.addContentWidget(widget);
};

  // Remove a user's cursor, selection, and label
  const removeRemoteCursor = (editor, socketId) => {
    const widget = remoteWidgetsRef.current.get(socketId);

    if (widget) {
      editor.removeContentWidget(widget);
      remoteWidgetsRef.current.delete(socketId);
    }

    const oldDecorations = decorationsRef.current.get(socketId);

    if (oldDecorations) {
      editor.deltaDecorations(oldDecorations, []);
      decorationsRef.current.delete(socketId);
    }
  };

  // Synchronize local code changes
  const handleEditorChange = (value) => {
  const updatedCode = value ?? "";

  setCode(updatedCode);

  if (isRemoteUpdateRef.current) {
    return;
  }

  socket.emit("code-change", {
    roomId,
    code: updatedCode,
  });
};

  // Monaco editor initialization
  const handleEditorMount = (editor) => {
    editorRef.current = editor;

    const sendCursorPosition = () => {
      const position = editor.getPosition();
      const selection = editor.getSelection();

      if (!position) return;

      socket.emit("cursor-move", {
        roomId,
        position,
        selection,
      });
    };

    // Send the initial position
    sendCursorPosition();

    // Send future cursor and selection changes
    const cursorDisposable =
      editor.onDidChangeCursorPosition(sendCursorPosition);

    const selectionDisposable =
      editor.onDidChangeCursorSelection(sendCursorPosition);

    editorRef.current.cursorDisposables = [
      cursorDisposable,
      selectionDisposable,
    ];
  };

  // Run C++ code
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

  // Draw or update a remote cursor and its selection
  const renderRemoteCursor = (data) => {
    const editor = editorRef.current;

    if (!editor) return;

    const {
      socketId,
      name,
      color,
      position,
      selection,
    } = data;

    if (!socketId || !color || !position) return;

    const className = `remote-cursor-${color}`;
    const decorations = [];

    // Remote cursor
    decorations.push({
      range: {
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      },
      options: {
        className,
        hoverMessage: {
          value: `👤 ${name}`,
        },
      },
    });

    // Remote text selection
    if (
      selection &&
      (
        selection.startLineNumber !== selection.endLineNumber ||
        selection.startColumn !== selection.endColumn
      )
    ) {
      decorations.push({
        range: {
          startLineNumber: selection.startLineNumber,
          startColumn: selection.startColumn,
          endLineNumber: selection.endLineNumber,
          endColumn: selection.endColumn,
        },
        options: {
          className: `${className}-selection`,
        },
      });
    }

    const oldDecorations =
      decorationsRef.current.get(socketId) || [];

    const newDecorations = editor.deltaDecorations(
  oldDecorations,
  decorations
);

decorationsRef.current.set(socketId, newDecorations);

// The first decoration is the remote cursor.
const cursorDecorationId = newDecorations[0];

createCursorLabel(
  editor,
  socketId,
  name,
  color,
  position,
  cursorDecorationId
);
  };

  // Receive live cursor movements and handle departures
  useEffect(() => {
    const handleRemoteCursor = (data) => {
      renderRemoteCursor(data);
    };

    const handleCursorLeft = ({ socketId }) => {
      const editor = editorRef.current;

      if (editor) {
        removeRemoteCursor(editor, socketId);
      }
    };

    socket.on("remote-cursor", handleRemoteCursor);
    socket.on("cursor-left", handleCursorLeft);

    return () => {
      socket.off("remote-cursor", handleRemoteCursor);
      socket.off("cursor-left", handleCursorLeft);
    };
  }, [socket]);

  // Receive cursor information for users already in the room
  useEffect(() => {
  const handleExistingCursors = (cursors) => {
    cursors.forEach((cursor) => {
      renderRemoteCursor(cursor);
    });
  };

  socket.on("existing-cursors", handleExistingCursors);

  return () => {
    socket.off("existing-cursors", handleExistingCursors);
  };
}, [socket]);

  // Dispose Monaco listeners and remove remote widgets on unmount
  useEffect(() => {
    return () => {
      const editor = editorRef.current;

      if (!editor) return;

      editorRef.current.cursorDisposables?.forEach((disposable) => {
        disposable.dispose();
      });

      remoteWidgetsRef.current.forEach((widget) => {
        editor.removeContentWidget(widget);
      });

      remoteWidgetsRef.current.clear();
      decorationsRef.current.clear();
      editorRef.current = null;
    };
  }, []);

  return (
    <div className="editor-container">
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

      <div className="monaco-container">
        <Editor
          height="100%"
          defaultLanguage="cpp"
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          options={{
            minimap: {
              enabled: false,
            },
            fontSize: 15,
            automaticLayout: true,
          }}
        />
      </div>

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
