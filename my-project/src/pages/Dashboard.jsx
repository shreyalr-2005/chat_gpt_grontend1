import { useState } from "react";

function Dashboard() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const askQuestion = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/ai/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>ChatGPT Dashboard</h2>

      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask something..."
        style={{ width: "300px", padding: "8px" }}
      />

      <button onClick={askQuestion} style={{ marginLeft: "10px" }}>
        Ask
      </button>

      <div style={{ marginTop: "20px" }}>
        <strong>Answer:</strong>
        <p>{answer}</p>
      </div>
    </div>
  );
}

export default Dashboard;
