"use client";
import { useEffect, useRef } from "react";

interface SpeakAnimateProps {
  children: React.ReactNode;
  enumerate?: boolean;
  randomVoices?: boolean;
}

interface SpokenSymbol {
  symbol: string;
  ref: HTMLSpanElement | null;
  utterance?: SpeechSynthesisUtterance;
}

const createUtterance = (
  message: string,
  useRandomVoices?: boolean
): SpeechSynthesisUtterance | undefined => {
  try {
    const ttsUtterance = new SpeechSynthesisUtterance();

    if (useRandomVoices) {
      const allowedLocales = ["en-US", "en-GB", "de-DE"];
      const voices = speechSynthesis
        .getVoices()
        .filter((voice) => allowedLocales.includes(voice.lang));
      ttsUtterance.voice = voices[Math.floor(Math.random() * voices.length)];
    }

    if (!isNaN(Number(message))) {
      const calcPitch = 0.25 * +message;
      ttsUtterance.rate = 0.2 * +message;
      ttsUtterance.pitch = calcPitch > 2 ? 2 : calcPitch <= 0 ? 0.5 : calcPitch; // Quick and dirty
    } else {
      ttsUtterance.rate = 0.8;
      ttsUtterance.pitch = 0.65;
    }

    ttsUtterance.text = getPronounciation(message);
    return ttsUtterance;
  } catch (error) {
    console.error("Error creating utterance", error);
    return;
  }
};

const getPronounciation = (symbol: string): string => {
  switch (symbol) {
    case ".":
      return "dot";
    case "-":
      return "dash";
    case ":":
      return "colon";
    default:
      return symbol;
  }
};

const toggleClasses = (ref: HTMLSpanElement) => {
  const classes = ["animate-bounce", "text-red-500"];
  classes.forEach((className) => {
    ref.classList.toggle(className);
  });
};

export const SpeakAnimate: React.FC<SpeakAnimateProps> = ({
  children,
  enumerate,
  randomVoices,
}) => {
  let words: string[] = [];
  const content = children?.toString().split("");
  if (content) {
    words = !enumerate ? [content.join("")] : content;
  }
  const symbolRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const spokenSymbols: SpokenSymbol[] = words.map((symbol, index) => {
    const utterance = createUtterance(symbol, randomVoices);
    const ref = symbolRefs.current[index];
    return { symbol, ref, utterance };
  });

  useEffect(() => {
    if (spokenSymbols.length === 0) return;
    if (spokenSymbols.some((spokenSymbol) => !spokenSymbol.ref)) return;

    async function speak() {
      let index = 0;
      while (1) {
        if (index >= spokenSymbols.length) index = 0;

        try {
          await new Promise((resolve) => {
            const { ref, utterance } = spokenSymbols[index];

            if (utterance) {
              utterance.onstart = () => {
                if (ref) toggleClasses(ref);
              };
              utterance.onend = () => {
                if (ref) toggleClasses(ref);
                resolve(null);
              };

              speechSynthesis.speak(utterance);
            } else {
              if (ref) toggleClasses(ref);

              setTimeout(() => {
                if (ref) toggleClasses(ref);
                resolve(null);
              }, 500);
            }
          });
        } catch (error) {
          console.error("Error speaking", error);
        }

        index++;
      }
    }

    speak();
  });

  return (
    <span className="relative inline-block">
      {spokenSymbols.map((spokenSymbol, index) => (
        <span
          ref={(element) => {
            spokenSymbol.ref = element;
          }}
          key={index}
          className="relative inline-block transition-colors ease-in-out"
        >
          {spokenSymbol.symbol}
        </span>
      ))}
    </span>
  );
};
