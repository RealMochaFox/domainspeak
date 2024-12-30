"use client";
import { SpeakAnimate } from "@/components/SpeakAnimate";
import { useEffect, useState } from "react";

export default function Home() {
  const [host, setHost] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") setHost(window.location.host);
  }, []);

  return (
    <div className="px-8 bg-slate-900 text-white">
      <main className="flex flex-1 flex-col items-center justify-center min-h-screen">
        <div className="sm:w-1/2 md:w-1/3 lg:w-1/3">
          <h1 className="m-0 text-5xl text-center break-all">
            <SpeakAnimate enumerate randomVoices>
              {host}
            </SpeakAnimate>
          </h1>
        </div>
      </main>
    </div>
  );
}
