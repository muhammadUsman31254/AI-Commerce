"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import LanguageToggle from "@/components/ui/LanguageToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <LanguageToggle />
      </div>
      {children}
    </>
  );
}
