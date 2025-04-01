"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import TextareaAutosize from "react-textarea-autosize";
import { AnimatePresence } from "framer-motion";
import { Cross2Icon, StopIcon } from "@radix-ui/react-icons";
import { ChatProps } from "@/lib/types";
import useChatStore from "@/hooks/useChatStore";
import FileLoader from "../file-loader";
import { Mic, Send, SendHorizonal } from "lucide-react";
import useSpeechToText from "@/hooks/useSpeechRecognition";
import MultiImagePicker from "../image-embedder";
import { Models } from "@/lib/models";
import { ChatInput } from "../ui/chat/chat-input";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Command } from "lucide-react";

interface MergedProps extends ChatProps {
  files: File[] | undefined;
  setFiles: (files: File[] | undefined) => void;
}

export default function ChatBottombar({
  handleSubmit,
  stop,
  files,
  setFiles,
}: MergedProps) {
  const input = useChatStore((state) => state.input);
  const handleInputChange = useChatStore((state) => state.handleInputChange);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const [open, setOpen] = React.useState(false);

  const isLoading = useChatStore((state) => state.isLoading);
  const fileText = useChatStore((state) => state.fileText);
  const setFileText = useChatStore((state) => state.setFileText);
  const setInput = useChatStore((state) => state.setInput);
  const base64Images = useChatStore((state) => state.base64Images);
  const setBase64Images = useChatStore((state) => state.setBase64Images);
  const selectedModel = useChatStore((state) => state.selectedModel);

  const [inputFocused, setInputFocused] = useState(false);
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);
  const [commands] = useState([
    { id: 'hindi', label: 'Hindi', description: 'Translate response to Hindi', suffix: 'translate in hindi' },
    { id: 'logic', label: 'Logic', description: 'Provide logical analysis', suffix: 'analyze this logically' },
  ]);
  const [commandPosition, setCommandPosition] = useState({ x: 0, y: 0 });
  const [selectedCommand, setSelectedCommand] = useState<string | null>(null);

  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    // Only run on the client side
    setWindowHeight(window.innerHeight);
    
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  console.log("Current model ID:", selectedModel?.name);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (isLoading) return;

      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const { isListening, transcript, startListening, stopListening } =
    useSpeechToText({ continuous: true });

  const listen = () => {
    isListening ? stopVoiceInput() : startListening();
  };

  const stopVoiceInput = () => {
    setInput(transcript.length ? transcript : "");
    stopListening();
  };

  const handleListenClick = () => {
    listen();
  };

  const handleInputFocus = () => {
    setInputFocused(true);
  };

  const handleInputBlur = () => {
    setInputFocused(false);
  };

  const handleCommandSelect = (commandId: string) => {
    const command = commands.find(cmd => cmd.id === commandId);
    if (command) {
      setSelectedCommand(command.suffix);
      setInput("");
    }
    setCommandMenuOpen(false);
  };

  const handleInputChangeWithCommands = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    handleInputChange(e);
    
    if (value === '/') {
      const textAreaRect = e.target.getBoundingClientRect();
      const lineHeight = parseInt(getComputedStyle(e.target).lineHeight) || 20;
      
      const cursorX = textAreaRect.left + 20; 
      
      const cursorY = textAreaRect.top + 10;
      
      setCommandPosition({ x: cursorX, y: cursorY });
      setCommandMenuOpen(true);
    }
    
    if (commandMenuOpen && !value.startsWith('/')) {
      setCommandMenuOpen(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (isLoading) return;
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
      return;
    }
    
    if (e.key === "Escape" && commandMenuOpen) {
      setCommandMenuOpen(false);
      e.preventDefault();
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (selectedCommand) {
      const originalInput = input;
      const finalInput = `${originalInput} ${selectedCommand}`;
      
      setInput(finalInput);
      
      setTimeout(() => {
        handleSubmit(e);
        setSelectedCommand(null);
      }, 0);
    } else {
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (isLoading) {
      stopVoiceInput();
    }
  }, [isLoading]);

  useEffect(() => {
    // Debug model information
    console.log("Selected model:", selectedModel);
    
    // If model is undefined, attempt to use a fallback
    if (!selectedModel || !selectedModel.name) {
      console.warn("Model undefined or missing ID, attempting to use default");
      // You might want to set a default model here if needed
    }
  }, [selectedModel]);

  return (
    <div className="px-4 pb-7 flex justify-between w-full items-center relative ">
      <AnimatePresence initial={false}>
        <form
          onSubmit={handleFormSubmit}
          className="w-full items-center flex flex-col  bg-accent dark:bg-card rounded-lg "
        >
          <div className="relative w-full flex flex-col">
            <TextareaAutosize
              ref={inputRef}
              tabIndex={0}
              onKeyDown={handleInputKeyDown}
              value={input}
              onChange={handleInputChangeWithCommands}
              onClick={() => setCommandMenuOpen(false)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              name="message"
              placeholder={!isListening ? "Ask me anything" : "Listening"}
              className="max-h-40 px-6 pt-6 border-0 shadow-none bg-accent rounded-lg text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed dark:bg-card"
            />
            
            {commandMenuOpen && (
              <div 
                className="absolute z-50 bg-popover border rounded-md shadow-md overflow-hidden"
                style={{ 
                  bottom: '100%',  // Position at the bottom of the container
                  marginBottom: '8px', // Add some spacing
                  left: '20px', // Match the padding of the input
                  width: '240px' // Fixed width
                }}
              >
                {/* <div className="py-1.5 px-2 font-medium text-xs border-b"></div> */}
                <div className="max-h-[150px] overflow-y-auto">
                  {commands.map((command) => (
                    <div
                      key={command.id}
                      className="flex items-center px-2 py-1.5 text-sm hover:bg-accent rounded-sm cursor-pointer"
                      onClick={() => handleCommandSelect(command.id)}
                    >
                      <Command className="mr-2 h-3.5 w-3.5" />
                      <span className="font-medium">{command.label}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{command.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex w-full items-center p-2">
            {isLoading ? (
              // Loading state
              <div className="flex w-full justify-between">
                <div className="flex">
                  <MultiImagePicker
                    disabled={!selectedModel.vision}
                    onImagesPick={setBase64Images}
                  />
                  <FileLoader
                    setFileText={setFileText}
                    files={files}
                    setFiles={setFiles}
                  />
                </div>
                <div>
                  <Button
                    className="shrink-0 rounded-full"
                    variant="ghost"
                    size="icon"
                    type="button"
                    role="presentation"
                    disabled
                  >
                    <Mic className="w-5 h-5" />
                  </Button>
                  <Button
                    className="shrink-0 rounded-full"
                    variant="ghost"
                    size="icon"
                    type="submit"
                    role="presentation"
                    onClick={(e) => {
                      e.preventDefault();
                      stop();
                    }}
                  >
                    <StopIcon className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ) : (
              // Default state
              <div className="flex w-full justify-between">
                <div className="flex">
                  <MultiImagePicker
                    disabled={!selectedModel.vision}
                    onImagesPick={setBase64Images}
                  />
                  <FileLoader
                    setFileText={setFileText}
                    files={files}
                    setFiles={setFiles}
                  />
                </div>
                <div>
                  {/* Microphone button with animation when listening */}
                  <Button
                    className={`shrink-0 rounded-full ${
                      isListening
                        ? "relative bg-blue-500/30 hover:bg-blue-400/30"
                        : ""
                    }`}
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={handleListenClick}
                    disabled={isLoading}
                    aria-label="Activate voice input"
                  >
                    <Mic className="w-5 h-5" />
                    {isListening && (
                      <span className="animate-pulse absolute h-[120%] w-[120%] rounded-full bg-blue-500/30" />
                    )}
                  </Button>

                  {/* Send button */}
                  <Button
                    className="shrink-0 rounded-full"
                    variant="ghost"
                    size="icon"
                    type="submit"
                    aria-label="Submit prompt"
                    disabled={
                      isLoading ||
                      !input.trim() ||
                      isListening ||
                      !selectedModel
                    }
                  >
                    <SendHorizonal className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          {base64Images && (
            <div className="w-full flex px-2 pb-2 gap-2 ">
              {base64Images.map((image, index) => {
                return (
                  <div
                    key={index}
                    className="relative bg-muted-foreground/20 flex w-fit flex-col gap-2 p-1 border-t border-x rounded-md"
                  >
                    <div className="flex text-sm">
                      <Image
                        src={image}
                        width={20}
                        height={20}
                        className="h-auto rounded-md w-auto max-w-[100px] max-h-[100px]"
                        alt={""}
                      />
                    </div>
                    <Button
                      onClick={() => {
                        const updatedImages = (prevImages: string[]) =>
                          prevImages.filter((_, i) => i !== index);
                        setBase64Images(updatedImages(base64Images));
                      }}
                      size="icon"
                      className="absolute -top-1.5 -right-1.5 text-white cursor-pointer  bg-red-500 hover:bg-red-600 w-4 h-4 rounded-full flex items-center justify-center"
                    >
                      <Cross2Icon className="w-3 h-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </form>
      </AnimatePresence>
    </div>
  );
}
