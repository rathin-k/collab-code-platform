import Editor from "@monaco-editor/react";

function CodeEditor({ code, setCode, roomId, socket }) {

  const handleEditorChange = (value) => {
    setCode(value);

    socket.emit("code-change", {
      roomId,
      code: value,
    });
  };

  return (
    <Editor
      height="500px"
      defaultLanguage="cpp"
      theme="vs-dark"
      value={code}
      onChange={handleEditorChange}
    />
  );
}

export default CodeEditor;