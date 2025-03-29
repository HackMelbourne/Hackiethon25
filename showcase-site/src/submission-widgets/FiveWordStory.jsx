// By Binglin LI and BV1090
import { useState } from "react";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true,
});

const FiveWordStory = () => {
  const [selectedWordsList, setSelectedWordsList] = useState([]);
  const [wordList, setWordList] = useState([]);
  const [page, setPage] = useState(1);
  const [story, setStory] = useState("");
  const [customWord, setCustomWord] = useState(""); 

  // get words from API
  const fetchWord = async () => {
    try {
      const response = await fetch(
        `https://random-word-api.herokuapp.com/word?number=5`
      );
      const data = await response.json();
      setWordList(data);
    } catch (e) {
      console.log(e);
    }
  };

  // handdle select words
  const handleSelect = (word) => {
    if (selectedWordsList.length < 5) {
      setSelectedWordsList([...selectedWordsList, word]);
    }
    if (selectedWordsList.length + 1 === 5) {
      setPage(2);
    }
  };

  // handle input change
  const handleInputChange = (e) => {
    setCustomWord(e.target.value);
  };

  // make custom word
  const addCustomWord = () => {
    if (customWord.trim() && selectedWordsList.length < 5) {
      handleSelect(customWord.trim());
      setCustomWord(""); // 清空输入框
    }
  };

  // generate story
  const generateStory = async () => {
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content:
            "You are a productivity tool. You will be provided five different English words to write a creative long novel. You must not provide all the novel. Provide a short summary of this story within 80 words. Capitalize those 5 words provided before. You need to provide the title of this novel. Use text format instead of markdown.",
        },
        {
          role: "user",
          content: selectedWordsList.toString(),
        },
      ],
      text: {
        format: {
          type: "text",
        },
      },
      reasoning: {},
      tools: [],
      temperature: 0.85,
      max_output_tokens: 256,
      top_p: 1,
      store: true,
    });
    setStory(response.output_text);
  };

  switch (page) {
    case 1: // slect words
      return (
        <div className="flex-col items-center justify-center bg-gradient-to-b from-gray-100 to-blue-200 p-6">
          {/* title */}
          <h2 className="text-xl font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 rounded-lg shadow-md">
            Please choose or enter 5 words:
          </h2>

          {/* user input */}
          <div className="flex items-center gap-3 my-4">
            <input
              type="text" 
              value={customWord}
              onChange={handleInputChange}
              placeholder="Enter your word"
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addCustomWord}
              className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:scale-105 transition"
            >
              Add Word
            </button>
          </div>
          {/* generate button */}
          <button
            onClick={fetchWord}
            className="z-10 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-full shadow-md hover:scale-105 transition"
          >
            Generate New Words
          </button>

          {/* word button */}
          <div className="flex flex-wrap gap-3 my-6 justify-center">
            {wordList.map((word, i) => (
              <button
                key={i}
                onClick={() => handleSelect(word)}
                className="cursor-pointer px-5 py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-full shadow-md hover:scale-105 transform transition-all"
              >
                {word}
              </button>
            ))}
          </div>

          
          {/* selected button */}
          <div className="mt-6 w-full max-w-md p-5 bg-white rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700">Chosen words：</h3>
            <div className="flex flex-wrap gap-3 mt-3">
              {selectedWordsList.map((word, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-green-500 text-white rounded-full shadow-md"
                >
                  {word}
                </span>
              ))}
            </div>

            {/* Complete */}
            {selectedWordsList.length === 5 && (
              <div className="mt-4 text-center">
                <p className="text-green-600 font-semibold">✅ Complete!</p>
              </div>
            )}
          </div>
        </div>
      );

    case 2: // generate story
      return (
        <div className="flex-col items-center justify-center bg-gradient-to-b from-gray-100 to-blue-200 p-6">
          {/* 标题 */}
          <h2 className="text-xl font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 rounded-lg shadow-md">
            Your chosen words are：
          </h2>

          {/* selected word */}
          <div className="flex flex-wrap gap-3 my-6 justify-center">
            {selectedWordsList.map((word, i) => (
              <span
                key={i}
                className="px-4 py-2 bg-green-500 text-white rounded-full shadow-md"
              >
                {word}
              </span>
            ))}
          </div>

          {/* generate story */}
          <button
            onClick={generateStory}
            className="z-10 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-full shadow-md hover:scale-105 transition"
          >
            Generate Story
          </button>

          {/* story text */}
          <div className="mt-6 w-full max-w-md p-5 bg-white rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700">Story：</h3>
            <p className="mt-3 text-gray-600">{story}</p>
          </div>
        </div>
      );

    default:
      return null;
  }
}

export default FiveWordStory;
