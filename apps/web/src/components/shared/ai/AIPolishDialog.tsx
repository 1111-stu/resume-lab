import { useEffect, useState, useRef } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "@/i18n/compat/client";
import { Streamdown } from "streamdown";
import "streamdown/styles.css";
import { createMarkdownExit } from "markdown-exit";
import TurndownService from "turndown";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAIConfigStore } from "@/store/useAIConfigStore";
import { AI_MODEL_CONFIGS } from "@/config/ai";
import { apiUrl } from "@/api/client";
import { cn } from "@/utils/cn";

interface AIPolishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  onApply: (content: string) => void;
}

const md = createMarkdownExit({
  html: true,
  breaks: true,
  linkify: false,
});

const turndownService = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
});

export default function AIPolishDialog({
  open,
  onOpenChange,
  content,
  onApply
}: AIPolishDialogProps) {
  const t = useTranslations("aiPolishDialog");
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishedContent, setPolishedContent] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const {
    selectedModel,
    doubaoApiKey,
    doubaoModelId,
    deepseekApiKey,
    deepseekModelId,
    openaiApiKey,
    openaiModelId,
    openaiApiEndpoint,
    geminiApiKey,
    geminiModelId,
    isConfigured
  } = useAIConfigStore();
  const abortControllerRef = useRef<AbortController | null>(null);
  const polishedContentRef = useRef<HTMLDivElement>(null);

  const handlePolish = async () => {
    try {
      if (!isConfigured()) {
        toast.error(t("error.configRequired"));
        onOpenChange(false);
        return;
      }

      setIsPolishing(true);
      setPolishedContent("");

      abortControllerRef.current = new AbortController();

      const config = AI_MODEL_CONFIGS[selectedModel];
      const apiKey =
        selectedModel === "doubao"
          ? doubaoApiKey
          : selectedModel === "openai"
            ? openaiApiKey
            : selectedModel === "gemini"
              ? geminiApiKey
              : deepseekApiKey;
      const modelId =
        selectedModel === "doubao"
          ? doubaoModelId
          : selectedModel === "openai"
            ? openaiModelId
            : selectedModel === "gemini"
              ? geminiModelId
              : deepseekModelId;

      const response = await fetch(apiUrl("/v1/resume/polish"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: turndownService.turndown(content),
          apiKey,
          apiEndpoint: selectedModel === "openai" ? openaiApiEndpoint : undefined,
          model: config.requiresModelId ? modelId : config.defaultModel,
          modelType: selectedModel,
          customInstructions: customInstructions.trim() || undefined
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error("Failed to polish content");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        setPolishedContent((prev) => prev + chunk);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Polish aborted");
        return;
      }
      console.error("Polish error:", error);
      toast.error(t("error.polishFailed"));
      onOpenChange(false);
    } finally {
      setIsPolishing(false);
    }
  };

  useEffect(() => {
    if (polishedContent && polishedContentRef.current) {
      const container = polishedContentRef.current;
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }, [polishedContent]);

  useEffect(() => {
    if (!open) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      setPolishedContent("");
      setCustomInstructions("");
    }
  }, [open]);

  const handleClose = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    onOpenChange(false);
    setPolishedContent("");
  };

  const handleApply = () => {
    const htmlContent = md.render(polishedContent);
    onApply(htmlContent);
    handleClose();
    toast.success(t("error.applied"));
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isPolishing) {
      onOpenChange(open);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-[1000px]",
          "bg-white dark:bg-neutral-900",
          "border-neutral-200 dark:border-neutral-800",
          "rounded-2xl shadow-2xl dark:shadow-none"
        )}
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader className="pb-6">
          <DialogTitle
            className={cn(
              "flex items-center gap-2 text-2xl",
              "text-neutral-800 dark:text-neutral-100"
            )}
          >
            <Sparkles
              className={cn(
                "h-6 w-6 text-primary animate-pulse",
                "dark:text-primary-400"
              )}
            />
            {t("title")}
          </DialogTitle>
          <DialogDescription
            className={cn(
              "text-base",
              "text-neutral-600 dark:text-neutral-400"
            )}
          >
            {isPolishing
              ? t("description.polishing")
              : polishedContent
                ? t("description.finished")
                : t("description.ready")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label
            htmlFor="custom-instructions"
            className={cn(
              "text-sm font-medium",
              "text-neutral-600 dark:text-neutral-400"
            )}
          >
            {t("customInstructions")}
          </Label>
          <Textarea
            id="custom-instructions"
            placeholder={t("customInstructionsPlaceholder")}
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            disabled={isPolishing}
            rows={2}
            className={cn(
              "resize-none rounded-xl border",
              "bg-neutral-50 dark:bg-neutral-800/50",
              "border-neutral-200 dark:border-neutral-800",
              "focus:border-primary/50 dark:focus:border-primary-500/50"
            )}
          />
        </div>

        <div
          ref={polishedContentRef}
          className={cn(
            "min-h-[320px] max-h-[420px] overflow-y-auto rounded-2xl border p-5",
            "bg-neutral-50 dark:bg-neutral-950/50",
            "border-neutral-200 dark:border-neutral-800"
          )}
        >
          {isPolishing && !polishedContent ? (
            <div
              className={cn(
                "flex h-full min-h-[280px] items-center justify-center gap-3",
                "text-neutral-500 dark:text-neutral-400"
              )}
            >
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{t("loading")}</span>
            </div>
          ) : polishedContent ? (
            <Streamdown>{polishedContent}</Streamdown>
          ) : (
            <div
              className={cn(
                "flex h-full min-h-[280px] items-center justify-center text-sm",
                "text-neutral-400 dark:text-neutral-500"
              )}
            >
              {t("empty")}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPolishing}
          >
            {t("cancel")}
          </Button>

          {polishedContent ? (
            <Button type="button" onClick={handleApply}>
              {t("apply")}
            </Button>
          ) : (
            <Button type="button" onClick={handlePolish} disabled={isPolishing}>
              {isPolishing ? t("polishing") : t("start")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
