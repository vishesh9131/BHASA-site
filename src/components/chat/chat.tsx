 "use client";

import React from "react";
import ChatTopbar from "./chat-topbar";
import ChatList from "./chat-list";
import ChatBottombar from "./chat-bottombar";
import { useChat } from "@/hooks/useChat";
import { MessageWithFiles } from "@/lib/types";
import Image from "next/image";
import AttachedFiles from "../attached-files";
import TypewriterEffect from "../typewriter-effect";

interface ChatProps {
  id: string;
  initialMessages: MessageWithFiles[];
}

const welcomePhrases = [
  "How can I help you today?",
  "Ask me anything about BHASA models...",
  "Try our new Gemini model integration!",
  "Have questions about your data?",
  "Let's work on your project together...",
  "Hey what do you actually meant by cuda??",
  "What is the difference between cuda and mps??",
  "Vishesh, did you know your name means 'special' or 'extraordinary' in Sanskrit?",
  "Ever wondered about Ramanujan's infinite series? Ask away!",
  "Want to explore Aryabhata's place value system?",
  "How to make matar paneer???",
  "What is the capital of India??",
  "Let's decode Brahmagupta's theorems on zero!",
  "Need insights on Chandrasekhar's limit in astrophysics?",
  "Have a query about CoreRec's recommendation engine?",
  "Curious about AI-powered astrology insights? Let's discuss!"
];

export default function Chat({ initialMessages, id }: ChatProps) {
  const {
    messages,
    loadingSubmit,
    handleSubmit,
    stop,
    regenerate,
    files,
    setFiles,
    fileText,
    setFileText,
    open,
    setOpen,
  } = useChat({ id, initialMessages });

  return (
    <div className="flex flex-col justify-between w-full max-w-3xl h-full">
      <ChatTopbar chatId={id} stop={stop} />

      {messages.length === 0 ? (
        <div className="flex flex-col h-full w-full items-center gap-4 justify-center">
          <div className="flex flex-col gap-1 items-center">
            <Image
              src="/logo.svg"
              alt="AI"
              width={100}
              height={100}
              className="dark:invert"
            />
            {/* <p className="text-center text-2xl md:text-3xl font-semibold text-muted-foreground/75">
              How can I help you today?
            </p> */}
            <p className="text-center text-2xl md:text-3xl font-semibold text-muted-foreground/75">
          <TypewriterEffect phrases={welcomePhrases} />
          </p>
            <p className="text-center text-sm text-muted-foreground/75 max-w-lg">
              Models with <strong>(1k)</strong> suffix lowers VRAM requirements
              by ~2-3GB.
            </p>
          </div>

          <div className="flex flex-col w-full ">
            {files && fileText && (
              <AttachedFiles files={files} open={open} setFileText={setFileText} setFiles={setFiles} setOpen={setOpen} />
            )}
            <ChatBottombar
              files={files}
              setFiles={setFiles}
              handleSubmit={handleSubmit}
              stop={stop}
              messages={messages}
            />
          </div>
        </div>
      ) : (
        <>
          <ChatList
            handleSubmit={handleSubmit}
            messages={messages}
            stop={stop}
            chatId={id}
            loadingSubmit={loadingSubmit}
            onRegenerate={regenerate}
          />
          {files && fileText && (
            <AttachedFiles files={files} open={open} setFileText={setFileText} setFiles={setFiles} setOpen={setOpen} />
          )}
          <ChatBottombar
            files={files}
            setFiles={setFiles}
            handleSubmit={handleSubmit}
            stop={stop}
            messages={messages}
          />
        </>
      )}
    </div>
  );
}
