'use client';
import { useState } from "react";
export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const formatJSON = async () => {
    try {
      const res = await fetch('/api/format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ json: input })
      });
      const data = await res.json();
      if (data.formatted) setOutput(data.formatted);
      else alert("Invalid JSON");
    } catch (e) {
      alert("Error contacting server");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow">
      <h1 className="text-2xl font-bold mb-4">Smart JSON Formatter</h1>
      <textarea className="w-full h-32 p-2 border mb-4" placeholder="Paste JSON here..." value={input} onChange={(e) => setInput(e.target.value)} />
      <button className="bg-blue-600 text-white px-4 py-2 rounded mb-4" onClick={formatJSON}>Format JSON</button>
      <textarea className="w-full h-32 p-2 border" placeholder="Formatted JSON" value={output} readOnly />
    </div>
  );
}