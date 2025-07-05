'use client';
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), { ssr: false });

export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [errorLine, setErrorLine] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    import("codemirror/lib/codemirror.css");
    import("codemirror/mode/javascript/javascript");
    import("codemirror/theme/material.css");

    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

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
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-4 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 p-6 rounded-2xl shadow space-y-4">

        {/* Header and Dark Mode Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold mb-2 sm:mb-0 text-center sm:text-left">Smart JSON Formatter</h1>
          <button
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        {/* Input Area with Enhanced Border and Visible Line Numbers */}
        <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          <CodeMirror
            style={{ height: "384px" }}
            value={input}
            options={{
              mode: "application/json",
              theme: "material",
              lineNumbers: true,
              viewportMargin: Infinity
            }}
            onChange={(editor, data, value) => {
              setInput(value);
            }}
          />
        </div>
        {errorLine && (
          <p className="text-red-600 mt-2">Syntax error near line {errorLine}</p>
        )}

        {/* Format Button */}
        <button
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={formatJSON}
        >
          Format JSON
        </button>

        {/* Output Area with Enhanced Styling */}
        <div>
          <textarea
            className="w-full h-64 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Formatted JSON"
            value={output}
            readOnly
          />
        </div>
      </div>
    </div>
  );
}
