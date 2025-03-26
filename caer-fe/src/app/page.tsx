import { BackgroundLines } from "@/components/ui/background-lines";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { Button } from "@/components/ui/button";

export default function Home() {
  const words = [
    {
      text: "Crosschain",
    },
    {
      text: "Lending",
    },
    {
      text: "And",
    },
    {
      text: "Borrowing",
    },
    {
      text: "by",
    },
    {
      text: "Espresso.",
      className: "text-[#B67237] ",
    },
  ];

  return (
    <BackgroundLines className="flex items-center justify-center w-full flex-col px-4 max-h-screen overflow-hidden relative">
      <TypewriterEffectSmooth words={words} className="cursor-none absolute mx-auto text-center z-30" />

      <h2 className=" bg-clip-text text-center text-white bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-9xl font-sans py-2 md:py-10 relative z-20 font-bold tracking-tight">
        <TextHoverEffect text="CAER" /> <br />
      </h2>
      <div className="flex flex-row items-center gap-12 text-center hidden">
        <Button variant="secondary" size="default">Start</Button>
        <Button variant="secondary" size="default">View Docs</Button>
      </div>
    </BackgroundLines>

  );
}
