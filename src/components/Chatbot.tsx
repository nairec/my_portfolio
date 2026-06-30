import "tailwindcss";
import React from "react";
import type { Message } from "../types/types";
import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { chatMessages } from "../chatStore";

export default function Chatbot() {
  const [input, setInput] = useState("");
  const messages = useStore(chatMessages);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    handleScroll();
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    if (input.trim()) {
      const updatedHistory = [
        ...messages,
        { content: input, role: "user" },
        { role: "assistant", content: "" },
      ] as Message[];
      chatMessages.set(updatedHistory);
      setInput("");
      await SendMessage(updatedHistory);
    }
  };

  const SendMessage = async (history: Message[]) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: history }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Server error:", errorData);
        chatMessages.set([
          ...history.slice(0, -1),
          {
            role: "assistant",
            content: "Sorry, there was an error processing the request.",
          },
        ]);
        setIsLoading(false);
        return;
      }

      if (response && response.body != null) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = "";
        let result = await reader.read();
        while (!result.done) {
          const chunk = decoder.decode(result.value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.trim()) {
              const message = line.replace(/^data: /, "").trim();
              if (message === "" || message === "[DONE]") continue;
              try {
                const parsed = JSON.parse(message);
                const content = parsed.choices[0]?.delta?.content || "";
                accumulatedText += content;

                chatMessages.set(
                  history.map((msg, i) =>
                    i === history.length - 1 && msg.role === "assistant"
                    ? { ...msg, content: accumulatedText }
                    : msg
                  )
                );
              } catch (e) {
                console.error(e);
              }
            }
          }
          result = await reader.read();
        }
        setIsLoading(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = () => {
    const chatbot = document.querySelector(".flex-1");
    if (chatbot) {
      chatbot.scrollTop = chatbot.scrollHeight;
    }
  };

  return (
    <div className="flex flex-col gap-4 border border-[#BABABA] p-4 mt-6 max-w-xl max-h-xl h-120 w-130 font-mono text-sm">
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-2 custom-scrollbar text-clip">
        {messages.map((msg: Message, index: number) => (
          <p
            key={index}
            className={`max-w-[85%] break-words ${msg.role === "user" ? "text-right self-end ml-auto text-[#41d3ff]" : "text-white text-left self-start mr-auto"}`}
          >
            {msg.role === "user" ? `${msg.content} <` : `> ${msg.content}`}
          </p>
        ))}
      </div>
      <form
        className="flex w-full border border-[#BABABA] focus-within:border-[#41d3ff] transition-colors mt-auto"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          onChange={handleInputChange}
          value={input}
          className="flex-1 px-3 py-2 text-[#41d3ff] bg-transparent outline-none placeholder:text-[#BABABA]/50 focus-visible:ring-2 focus-visible:ring-[#41d3ff]/50 focus-visible:ring-inset"
          placeholder="Ask iREC anything..."
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-[#BABABA] hover:text-[#41d3ff] hover:bg-[#41d3ff]/10 transition-colors duration-[250ms] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#41d3ff]/50"
          aria-label="Send message"
        >
          {isLoading ? "..." : "↵"}
        </button>
      </form>
    </div>
  );
}
