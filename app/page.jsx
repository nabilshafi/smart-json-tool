'use client';
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), { ssr: false });

export default function Home() {
  const defaultEmptyLines = "\n\n\n\n\n\n\n\n\n";
  const [input, setInput] = useState(defaultEmptyLines);
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4 space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-6xl">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Smart JSON Formatter</h1>
        <button
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      {/* Side by Side Layout */}
      <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6 w-full max-w-6xl">
        
        {/* Input Area */}
        <div className="flex-1 space-y-2">
          <label className="text-gray-700 dark:text-gray-200 font-medium">JSON Input</label>
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 shadow-inner overflow-hidden h-[500px]">
            <CodeMirror
              style={{ height: "100%" }}
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
            <p className="text-red-600 text-sm">Syntax error near line {errorLine}</p>
          )}
        </div>

        {/* Center Button */}
        <div className="flex flex-col items-center justify-center">
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={formatJSON}
          >
            Format JSON
          </button>
        </div>

        {/* Output Area */}
        <div className="flex-1 space-y-2">
          <label className="text-gray-700 dark:text-gray-200 font-medium">Formatted Output</label>
          <textarea
            className="w-full h-[500px] border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none resize-none font-mono shadow-inner"
            placeholder="Formatted JSON will appear here..."
            value={output}
            readOnly
          />
        </div>
      </div>
    </div>
  );
}
