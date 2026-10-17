"use client";

import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ShareClassDialog({
  className,
  code,
  open,
  onOpenChange,
}: {
  className: string;
  code: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [copied, setCopied] = useState(false);

  const joinUrl =
    typeof window === "undefined"
      ? `/join?code=${code}`
      : `${window.location.origin}/join?code=${code}`;

  const inviteText =
    `You have been invited to join "${className}"! ` +
    `Click this link to join: ${joinUrl} ` +
    `Or type the class code directly: ${code}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Share {className}</DialogTitle>
          <DialogDescription>
            Scan the QR or send the invite to add students to this class.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-lg border border-stone-200 bg-white p-3">
            <QRCodeSVG
              value={joinUrl}
              size={160}
              aria-label={`QR code for joining ${className}`}
            />
          </div>
          <div className="flex w-full items-center gap-2">
            <code className="flex-1 rounded-md bg-stone-100 px-3 py-2 text-center text-lg font-semibold tracking-[0.3em] tabular-nums">
              {code}
            </code>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Copy invite"
              title="Copy invite"
              onClick={handleCopy}
            >
              <HugeiconsIcon
                icon={copied ? Tick02Icon : Copy01Icon}
                strokeWidth={2}
              />
            </Button>
          </div>
          <p className="text-muted-foreground text-center text-xs">
            {copied
              ? "Invite copied to clipboard."
              : "Copies an invite message with the link and the code."}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
