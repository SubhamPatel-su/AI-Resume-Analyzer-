"use client";

import * as React from "react";
import { UploadCloud, FileText, Image as ImageIcon, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface DropzoneProps {
  onFile: (file: File) => void;
  onSample: () => void;
  onPaste: (text: string) => void;
  disabled?: boolean;
}

export function Dropzone({ onFile, onSample, onPaste, disabled }: DropzoneProps) {
  const { toast } = useToast();
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [pasteOpen, setPasteOpen] = React.useState(false);
  const [pasteText, setPasteText] = React.useState("");

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSend(file);
    }
  }

  function validateAndSend(file: File) {
    const name = file.name.toLowerCase();
    const ok =
      file.type === "application/pdf" ||
      /\.(pdf|png|jpe?g|webp|bmp|txt)$/i.test(name) ||
      file.type.startsWith("image/");
    if (!ok) {
      toast({
        title: "Unsupported file",
        description: "Please upload a PDF, image (PNG/JPG), or .txt file.",
        variant: "destructive",
      });
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Max file size is 15 MB.",
        variant: "destructive",
      });
      return;
    }
    onFile(file);
  }

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-card/50 px-6 py-12 text-center transition-all",
          "hover:border-primary/60 hover:bg-accent/40",
          dragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.bmp,.txt,image/*,application/pdf"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) validateAndSend(f);
            e.target.value = "";
          }}
        />
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
          <UploadCloud className="h-8 w-8" />
        </div>
        <p className="text-lg font-semibold">
          Drop your resume here, or <span className="text-primary">browse</span>
        </p>
        <p className="text-muted-foreground mt-1 text-sm">
          PDF, PNG, JPG or TXT · processed entirely in your browser
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
            <FileText className="h-3 w-3" /> PDF
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
            <ImageIcon className="h-3 w-3" /> Image OCR
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
            <Type className="h-3 w-3" /> Text
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <Button variant="outline" size="sm" onClick={onSample} disabled={disabled}>
          Try a sample resume
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPasteOpen((v) => !v)}
          disabled={disabled}
        >
          Paste resume text
        </Button>
      </div>

      {pasteOpen && (
        <div className="mt-3 rounded-xl border bg-card p-3">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste your resume text here…"
            className="scroll-thin h-40 w-full resize-none rounded-lg bg-background p-3 text-sm outline-none ring-1 ring-border focus:ring-primary"
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setPasteOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={pasteText.trim().length < 20}
              onClick={() => {
                onPaste(pasteText);
                setPasteOpen(false);
                setPasteText("");
              }}
            >
              Analyze text
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
