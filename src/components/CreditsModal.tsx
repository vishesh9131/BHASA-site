"use client";

import React, { useState } from 'react';
import { Button } from "./ui/button";
import { InfoIcon, Github, Coffee } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function CreditsModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-full opacity-70 hover:opacity-100 transition-opacity"
          aria-label="About BHASA"
        >
          <InfoIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>About BHASA</span>
            <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 rounded-full">
              In Progress
            </span>
          </DialogTitle>
          <DialogDescription>
            Bayesian Hyperdimensional Adaptive Sequence Architecture
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Coffee className="h-5 w-5 text-amber-600" />
            <p className="text-sm">
              Made with love and caffeine by Vishesh and team.
            </p>
          </div>
          
          <a 
            href="https://github.com/vishesh9131/BHASA_LLM.git" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm hover:underline"
          >
            <Github className="h-5 w-5" />
            <span>github.com/vishesh9131/BHASA_LLM</span>
          </a>
          
          <div className="text-sm text-muted-foreground pt-2 border-t">
            <p>Current Status: In Progress</p>
            <p className="mt-1">BHASA is an open-source project developing advanced language models.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 