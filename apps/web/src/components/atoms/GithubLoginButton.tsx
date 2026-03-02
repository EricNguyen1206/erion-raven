"use client";

import { useTransition } from "react";
import { Github } from "lucide-react";

export default function GithubLoginButton() {
  const [isPending, startTransition] = useTransition();

  const handleClickLoginButton = () => {
    startTransition(() => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
      window.location.href = `${apiUrl}/auth/github`;
    });
  };

  return (
    <button
      className="bg-[#24292e] text-white font-bold rounded-md px-6 py-2 w-[100%] flex items-center justify-center gap-3 hover:bg-[#2f363d] transition-colors border border-[#24292e]"
      onClick={handleClickLoginButton}
      type="button"
      disabled={isPending}
    >
      <Github size={24} />
      <span>{isPending ? "Connecting..." : "Sign in with GitHub"}</span>
    </button>
  );
}
