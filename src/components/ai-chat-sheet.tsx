"use client";

import { Message01Icon, SentIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function AiChatSheet() {
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) return;
    setMessage("");
  }

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            type="button"
            size="icon-lg"
            aria-label="Open AI chat"
            className="fixed right-6 bottom-6 z-40 rounded-full shadow-lg"
          >
            <HugeiconsIcon icon={Message01Icon} strokeWidth={2} />
          </Button>
        }
      />
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>AI assistant</SheetTitle>
          <SheetDescription>
            Ask about your classes, meetings, and materials.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 items-center justify-center px-6">
          <p className="text-muted-foreground text-center text-sm">
            Start a conversation below.
          </p>
        </div>
        <SheetFooter>
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              id="ai-chat-message"
              name="message"
              placeholder="Ask anything..."
              autoComplete="off"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <Button
              type="submit"
              size="icon"
              aria-label="Send message"
              disabled={!message.trim()}
            >
              <HugeiconsIcon icon={SentIcon} strokeWidth={2} />
            </Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
