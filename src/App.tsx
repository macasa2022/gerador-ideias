import React, { useState } from "react";

// Main App component
const App = () => {
  const [prompt, setPrompt] = useState("");
  const [numIdeas, setNumIdeas] = useState(5); // New state for number of ideas, default to 5
  const [ideaType, setIdeaType] = useState(""); // New state for idea type/style
  //const [ideas, setIdeas] = useState([]);
  const [ideas, setIdeas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(""); // State for copy success message

  // Function to handle idea generation
  const generateIdeas = async () => {
    setIsLoading(true);
    setError("");
    setIdeas([]); // Clear previous ideas
    setCopySuccess(""); // Clear copy success message

    if (!prompt.trim()) {
      setError("Por favor, introduza um tópico para gerar ideias.");
      setIsLoading(false);
      return;
    }
    if (numIdeas <= 0 || numIdeas > 20) {
      // Add a reasonable limit
      setError("O número de ideias deve ser entre 1 e 20.");
      setIsLoading(false);
      return;
    }

    try {
      // Construct the prompt with customization options
      let generatedPrompt = `Gere ${numIdeas} ${
        ideaType ? `ideias de ${ideaType} ` : ""
      }criativas e detalhadas sobre o seguinte tópico: "${prompt}". Apresente cada ideia como um item de lista numerado.`;

      // Construct the chat history with the user's prompt
      let chatHistory = [];
      chatHistory.push({
        role: "user",
        parts: [{ text: generatedPrompt }],
      });

      // Prepare the payload for the Gemini API
      const payload = { contents: chatHistory };
      const apiKey = "AIzaSyB3SgK0LY_F-AyGz3l6_JW3pu1QARtzp3U"; // Canvas will automatically provide the API key here
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      // Make the API call
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Parse the response
      const result = await response.json();

      // Check if the response contains generated content
      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        const generatedText = result.candidates[0].content.parts[0].text;
        // Split the generated text into individual ideas
        const ideaList = generatedText
          .split("\n")
          .filter((line: string) => line.trim().length > 0);
        setIdeas(ideaList);
      } else {
        setError("Não foi possível gerar ideias. Por favor, tente novamente.");
        console.error("Unexpected API response structure:", result);
      }
    } catch (err) {
      console.error("Error generating ideas:", err);
      setError(
        "Ocorreu um erro ao comunicar com a API. Por favor, tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Function to copy ideas to clipboard
  const copyIdeasToClipboard = () => {
    const textToCopy = ideas.join("\n");
    if (textToCopy) {
      const tempTextArea = document.createElement("textarea");
      tempTextArea.value = textToCopy;
      document.body.appendChild(tempTextArea);
      tempTextArea.select();
      try {
        document.execCommand("copy");
        setCopySuccess("Ideias copiadas para a área de transferência!");
        setTimeout(() => setCopySuccess(""), 3000); // Clear message after 3 seconds
      } catch (err) {
        console.error("Failed to copy text: ", err);
        setCopySuccess("Falha ao copiar ideias.");
      } finally {
        document.body.removeChild(tempTextArea);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 text-white flex items-center justify-center p-4">
      <div className="bg-white bg-opacity-10 rounded-xl shadow-2xl p-8 max-w-2xl w-full backdrop-blur-sm border border-white border-opacity-20">
        <h1 className="text-4xl font-extrabold mb-6 text-center text-white drop-shadow-lg">
          Gerador de Ideias 💡
        </h1>

        <div className="mb-6">
          <label
            htmlFor="prompt-input"
            className="block text-lg font-medium text-white mb-2"
          >
            Qual é o seu tópico para geração de ideias?
          </label>
          <input
            id="prompt-input"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Novos produtos ecológicos, atividades para o fim de semana"
            className="w-full px-5 py-3 rounded-lg bg-gray-800 bg-opacity-60 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition duration-300 ease-in-out"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label
              htmlFor="num-ideas-input"
              className="block text-lg font-medium text-white mb-2"
            >
              Número de ideias:
            </label>
            <input
              id="num-ideas-input"
              type="number"
              value={numIdeas}
              onChange={(e) =>
                setNumIdeas(Math.max(1, parseInt(e.target.value) || 1))
              } // Ensure at least 1
              min="1"
              max="20" // Max limit to prevent overly long responses
              className="w-full px-5 py-3 rounded-lg bg-gray-800 bg-opacity-60 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition duration-300 ease-in-out"
            />
          </div>
          <div>
            <label
              htmlFor="idea-type-input"
              className="block text-lg font-medium text-white mb-2"
            >
              Tipo de ideia (opcional):
            </label>
            <input
              id="idea-type-input"
              type="text"
              value={ideaType}
              onChange={(e) => setIdeaType(e.target.value)}
              placeholder="Ex: negócio, design, marketing"
              className="w-full px-5 py-3 rounded-lg bg-gray-800 bg-opacity-60 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition duration-300 ease-in-out"
            />
          </div>
        </div>

        <button
          onClick={generateIdeas}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-3 text-white"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Gerando ideias...
            </div>
          ) : (
            "Gerar Ideias"
          )}
        </button>

        {error && (
          <div className="mt-6 p-4 bg-red-500 bg-opacity-20 rounded-lg text-red-300 border border-red-400">
            <p>{error}</p>
          </div>
        )}

        {ideas.length > 0 && (
          <div className="mt-8 bg-white bg-opacity-15 p-6 rounded-xl shadow-inner border border-white border-opacity-20">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              As suas ideias:
            </h2>
            <ul className="space-y-3">
              {ideas.map((idea, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-xl mr-3 text-yellow-300">✨</span>
                  <p className="text-white text-lg leading-relaxed">
                    {idea.replace(/^\d+\.\s*/, "")}
                  </p>
                </li>
              ))}
            </ul>
            <button
              onClick={copyIdeasToClipboard}
              className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transform transition duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Copiar Ideias
            </button>
            {copySuccess && (
              <p className="mt-2 text-center text-green-300">{copySuccess}</p>
            )}
          </div>
        )}
        <footer className="fixed bottom-0 left-0 right-0 py-3 text-center text-sm text-yellow-200 bg-black bg-opacity-20 backdrop-blur-md border-t border-white border-opacity-10">
          ⚡ Desenvolvido por MACASA © {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
};

export default App;
