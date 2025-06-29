'use client';
import { useState } from "react";
import { Controlled as CodeMirror } from "react-codemirror2";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/material.css";

export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [errorLine, setErrorLine] = useState(null);

  const formatJSON = async () => {
    setErrorLine(null);
    try {
      const res = await fetch('/api/format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ json: input })
      });
      const data = await res.json();
      if (data.formatted) setOutput(data.formatted);
      else if (data.error) {
        const lineMatch = data.error.match(/at position (\d+)/);
        if (lineMatch) {
          const position = parseInt(lineMatch[1], 10);
          const lineNumber = input.substring(0, position).split("\n").length;
          setErrorLine(lineNumber);
        }
        alert("Invalid JSON");
      }
    } catch (e) {
      alert("Error contacting server");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow">
      <h1 className="text-2xl font-bold mb-4">Smart JSON Formatter</h1>
      <div className="mb-4">
        <CodeMirror
          value={input}
          options={{
            mode: "application/json",
            theme: "material",
            lineNumbers: true,
          }}
          onBeforeChange={(editor, data, value) => {
            setInput(value);
          }}
          editorDidMount={(editor) => {
            editor.setSize(null, 150);
          }}
        />
        {errorLine && (
          <p className="text-red-600 mt-1">Syntax error near line {errorLine}</p>
        )}
      </div>
      <button className="bg-blue-600 text-white px-4 py-2 rounded mb-4" onClick={formatJSON}>Format JSON</button>
      <textarea className="w-full h-32 p-2 border" placeholder="Formatted JSON" value={output} readOnly />
    </div>
  );
}
