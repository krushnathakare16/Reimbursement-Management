"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="p-2 bg-zinc-800 hover:bg-red-900/50 hover:text-red-400 text-zinc-300 rounded-xl transition-all"
    >
      <LogOut className="w-5 h-5" />
    </button>
  );
}
