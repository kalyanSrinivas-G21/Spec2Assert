"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ArrowRight, Play, ExternalLink, X } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveAndLaunch = () => {
    if (!apiKey.trim().startsWith("sk-or-v1-") && !apiKey.trim().startsWith("sk-")) {
      setError("Please enter a valid OpenRouter API key (starts with sk-or-v1- or sk-).");
      return;
    }
    localStorage.setItem("spec2assert_openrouter_key", apiKey.trim());
    onClose();
    router.push("/workbench");
  };

  const handleLaunchDemoMode = () => {
    localStorage.removeItem("spec2assert_openrouter_key");
    onClose();
    router.push("/workbench?mode=demo");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono select-none">
      <div className="relative w-full max-w-lg border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 text-blue-500 text-xs font-bold tracking-wider mb-2">
          <KeyRound className="w-4 h-4" />
          <span>AUTHENTICATE_INFERENCE_ENGINE</span>
        </div>
        <h3 className="text-base font-bold text-white tracking-wide">
          Enter Your OpenRouter API Key
        </h3>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          Spec2Assert uses OpenRouter to orchestrate deterministic LLM synthesis (Llama 3.3, Claude 3.5). Your key is stored strictly inside client-side <code className="text-zinc-300">localStorage</code> and never logged.
        </p>

        {/* Key Input Field */}
        <div className="mt-4 flex flex-col gap-1.5">
          <label className="text-[11px] text-zinc-400">OPENROUTER_API_KEY:</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setError(null);
            }}
            placeholder="sk-or-v1-xxxxxxxxxxxxxxxx..."
            className="w-full bg-black border border-zinc-800 focus:border-blue-500 text-xs text-zinc-100 p-2.5 outline-none font-mono transition-colors"
          />
          {error && <span className="text-[11px] text-red-400 mt-1">{error}</span>}
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleSaveAndLaunch}
            disabled={!apiKey.trim()}
            className="flex-1 h-9 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>LAUNCH WITH KEY</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleLaunchDemoMode}
            className="h-9 px-3 border border-zinc-800 hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Play className="w-3 h-3 text-emerald-400" />
            <span>USE OFFLINE DEMO FIXTURES</span>
          </button>
        </div>

        {/* Footer Link */}
        <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Need an OpenRouter token?</span>
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Get API Key</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
