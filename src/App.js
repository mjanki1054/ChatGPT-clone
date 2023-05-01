import "./ScrollableContent";
// Importing CSS files and React icons

import "./App.css";
import "./normal.css";
import { HiOutlineUserCircle } from "react-icons/hi";
import { SiOpenai } from "react-icons/si";
import { BsSendFill } from "react-icons/bs";

// Importing React hooks and OpenAI API

import React, { useState } from "react";
import { Configuration, OpenAIApi } from "openai";

// Importing Prettier for code formatting

import prettier from "prettier/standalone";
import parserBabel from "prettier/parser-babel";
import ScrollableContent from "./ScrollableContent";

// App function starts here
function App() {
  // State variables to store user's question, chat log, and whether the response contains code

  const [question, setQuestion] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [isCode, setIsCode] = useState(false);
  const [previous, setPrevious] = useState("");

  // Event handler for changing question state

  const handleQuestionChange = (event) => {
    setQuestion(event.target.value);
  };

  // Event handler for pressing enter key to submit the question
  const handleEnterKey = async (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (question.trim() === "") {
        alert("Please enter your query");
        return;
      }

      try {
        const response = await fetchResponseFromOpenAI(question);
        const newChatLog = [
          ...chatLog,
          { type: "question", text: question },
          { type: "response", text: response },
        ];
        setChatLog(newChatLog);
        setQuestion("");
      } catch (error) {
        console.error(error);
        const newChatLog = [
          ...chatLog,
          { type: "question", text: question },
          { type: "response", text: "Sorry, kuch to galat hai." },
        ];
        setChatLog(newChatLog);
        setQuestion("");
      }
    } else if (event.key === "Enter" && event.shiftKey) {
      setQuestion(question + "\n");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (question.trim() === "") {
      alert("Please enter your query");
      return;
    }

    try {
      const response = await fetchResponseFromOpenAI(question);
      const newChatLog = [
        ...chatLog,
        { type: "question", text: question },
        { type: "response", text: response },
      ];
      setChatLog(newChatLog);
      setQuestion("");
    } catch (error) {
      console.error(error);
      const newChatLog = [
        ...chatLog,
        { type: "question", text: question },
        { type: "response", text: "Sorry, kuch to galat hai." },
      ];
      setChatLog(newChatLog);
      setQuestion("");
    }
    // } else if (event.key === "Enter" && event.shiftKey) {
    // setQuestion(question + "\n");
    // }
  };

  // Event handler for starting a new chat

  const handleNewChat = () => {
    setChatLog([]);
  };

  // Function for fetching response from OpenAI API

  const fetchResponseFromOpenAI = async (question) => {
    try {
      // Configuring the OpenAI API with the API key

      const configuration = new Configuration({
        apiKey: process.env.REACT_APP_OPENAI_API_KEY,
      });
      const openai = new OpenAIApi(configuration);

      // Sending the question to the OpenAI API and receiving the response

      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: previous ? `${previous}\n${question}` : question,
        temperature: 0.9,
        max_tokens: 500,
        top_p: 1,
        frequency_penalty: 0.0,
        presence_penalty: 0.6,
        stop: [" Human:", " AI:"],
      });

      let formattedResult = response.data.choices[0].text;
      setPrevious(formattedResult);
      // Format the response as code using Prettier if the model used is Codex

      if (response.data.choices[0].model === "davinci-codex") {
        formattedResult = prettier.format(formattedResult, {
          parser: "babel",
          plugins: [parserBabel],
          printWidth: 120,
          tabWidth: 2,
          useTabs: false,
          semi: true,
          singleQuote: true,
          trailingComma: "es5",
          bracketSpacing: true,
        });
      }

      // Check if the response contains code

      const isCode =
        formattedResult &&
        formattedResult.match(/(function|class|\[.*\]|{|\/\/|import)/);

      setIsCode(isCode);

      return formattedResult;
    } catch (error) {
      console.error(error);
      return "Sorry, response nhi aa paa rha hai";
    }
  };

  return (
    <div className="App">
      <aside className="side-menu">
        <div className="new-side-menu-btn" onClick={handleNewChat}>
          <span>+</span>
          New chat
        </div>
      </aside>

      <section className="chatbox">
        <div className="chat-log-wrapper">
          <ScrollableContent>
            <div className="chat-log">
              {chatLog.map((message, index) => (
                <div
                  className={`chat-message ${message.type} ${
                    isCode ? "code" : ""
                  }`}
                  key={index}
                >
                  <div className="chat-message-center">
                    <div className="avatar">
                      {message.type === "question" ? (
                        <HiOutlineUserCircle
                          className="icons"
                          id="usercircle"
                        />
                      ) : (
                        <SiOpenai className="icons" id="MsgFill" />
                      )}
                    </div>
                    {message.type === "question" ? (
                      <div className="message-l">{message.text}</div>
                    ) : (
                      <div className="message-r">
                        {message.text.replace(/^\s+|\s+$/g, "")}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollableContent>
        </div>
        <div className="chat-input-holder">
          <textarea
            rows="1"
            placeholder="ask your query?"
            className="chat-input-textarea"
            value={question}
            onChange={handleQuestionChange}
            onKeyDown={handleEnterKey}
          />
          <button
            type="submit"
            className="submit-btn"
            onClick={handleSubmit}
            onChange={handleQuestionChange}
          >
            <BsSendFill className="fa-paper-plane-svg" />
          </button>
        </div>
      </section>
    </div>
  );
}

export default App;
