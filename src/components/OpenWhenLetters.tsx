import React, { useState, useEffect } from 'react';
import { ArrowLeft, Cake } from 'lucide-react';
import { YouTubeBackgroundMusic } from './YouTubeBackgroundMusic';

export interface LetterItem {
  id: string;
  title: string;
  label: string;
  image: string;
  message: string;
}

const DEFAULT_SINGLE_LETTER: LetterItem = {
  id: 'read-me',
  title: 'HAPPY 21ST BIRTHDAY LOVE!',
  label: 'Read Me...',
  image: '/letters-images/need-a-hug.png',
  message: `Happy birthday to youu, happy birthday to youu, happy birthday...happy birthday...happy birthday to youuu!!! Happy birthday ate namnam hihihi 21 naka pero baby namnam gyapun nako syempreeee. I just wanted to say how happy and thankful I am that you were born. Because if you weren't, I wouldn't have met someone as special as you.I'm so lucky to have you in my life lovey!!. You make me happy in ways you probably don't even realize, and even the simplest things feel special when they're with you. Sometimes, I just look at you and think, "How did I get so lucky to have this person?"

Thank you for being my love, my happiness, my comfort. Thank you for making me smile, for making me feel loved, and for being someone I can share my random thoughts and kulit moments with. On your special day, I wish you nothing but happiness, good health, peace of mind, and success in everything you do. I hope all your dreams slowly come true ofc I’ll be here for you and I hope life becomes kinder to you. I hope I get to celebrate more birthdays with you, blow candles with you, eat good food with you, take lots of pictures with you, and make more memories together. I wanna be there for your little wins and big achievements, and even on your ordinary days when nothing special happens. Because honestly, I don't need a special occasion to be happy with you. Even doing the most random things together would be enough for me.

I am sorry for what I've done to you. Hurting you like that was the worst, and I will forever feel guilty about what I did. I will do my best to earn your trust uli :>> I made this thingy kase pangit man ko agi if mag himo ko letters hahaha, but I hope you like it.Anywayssss enough with the drama!!!! It's your birthday, so dapat happy happy lang ta today!! HAPPY 21ST BIRTHDAY AGAIN, MY BABYYYY!! Thank you for existing, thank you for being you, and thank you for being someone I get to love. I'm so proud of you, and I'll always be cheering for you, even in the little things that you think aren't worth celebrating.

Enjoy your day, my baby! Always remember that no matter how old you get, you'll always be my baby nga gusto nako i-hug, i-kiss, and i-spoil with love. HEHEHEHE.

HAPPY 21ST BIRTHDAY, MY LOVE! MY BABY, MY FAVORITE PERSON, MY EVERYTHINGGG!! I LOVE YOU TO THE MOON AND BACK, AND THEN BACK AGAINNN!!`,
};

interface OpenWhenLettersProps {
  onBackToCake: () => void;
  recipientName?: string;
}

export const OpenWhenLetters: React.FC<OpenWhenLettersProps> = ({
  onBackToCake,
}) => {
  const [letter, setLetter] = useState<LetterItem>(() => {
    const saved = localStorage.getItem('open_when_single_letter_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_SINGLE_LETTER;
  });

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isAnimationFinished, setIsAnimationFinished] = useState<boolean>(false);

  // Play opening animation when letter is clicked
  useEffect(() => {
    if (isOpen) {
      setIsAnimationFinished(false);
      const timer = setTimeout(() => {
        setIsAnimationFinished(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-between p-3 sm:p-6 bg-cover bg-center bg-no-repeat bg-fixed relative overflow-y-auto"
      style={{
        backgroundImage: "url('/letters-images/bg.jpg')",
        fontFamily: "'Special Elite', monospace",
        color: '#4a3030',
      }}
    >
      {/* Top Navigation */}
      <div className="w-full max-w-4xl flex items-center justify-between py-1.5 sm:py-2 px-2 sm:px-3 z-20 gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onBackToCake}
          className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-white/90 hover:bg-white text-[#4a3030] shadow-md border border-[#f3d2d9] font-bold text-xs sm:text-sm transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Cake className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#e07a5f]" />
          <span>Cake 🎂</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Background Music: Coldplay - Sparks */}
          <YouTubeBackgroundMusic videoId="1aokooixKIo" autoPlay={true} />

          {isOpen && (
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-white/95 hover:bg-white text-[#4a3030] shadow-md border border-[#f3d2d9] font-bold text-xs sm:text-sm transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#e07a5f]" />
              <span>Envelope</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Letter Screen (Opened Letter View vs Big Centered Envelope) */}
      {isOpen ? (
        /* LETTER READING VIEW */
        <main className="flex flex-col items-center justify-center w-full max-w-3xl my-auto animate-in fade-in zoom-in-95 duration-300 px-1 sm:px-0">
          <div className="relative w-full max-w-[700px]">
            {/* Opening GIF / Final letter PNG */}
            <img
              src={
                isAnimationFinished
                  ? '/letters-images/letter-final.png'
                  : '/letters-images/envelope-opening.GIF'
              }
              alt="Letter"
              className="block w-full h-auto drop-shadow-2xl select-none"
            />

            {/* Letter Text Overlay - perfectly fitted inside the brown parchment border */}
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[53%] max-h-[62%] overflow-y-auto px-1.5 sm:px-3 py-1.5 sm:py-2.5 text-center transition-opacity duration-1000 select-text touch-pan-y overscroll-contain ${
                isAnimationFinished ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#c97d6d transparent',
              }}
            >
              {/* Header inside the letter */}
              <div className="mb-1.5 sm:mb-2.5 pb-1 border-b border-[#b87667]/35">
                <h1
                  className="text-[11px] sm:text-sm md:text-base font-bold text-[#3d1e1e] tracking-wide uppercase"
                  style={{ fontFamily: "'Special Elite', monospace" }}
                >
                  {letter.title}
                </h1>
                <p className="text-[8px] sm:text-[10px] text-[#8c5244] mt-0.5 tracking-wider font-mono">
                  ✨ 21st Birthday Special ✨
                </p>
              </div>

              {/* Message body with paragraphs - fits strictly within brown paper border */}
              <div
                className="text-[10px] sm:text-[11.5px] md:text-[13px] leading-[1.48] sm:leading-[1.6] text-[#3d2020] whitespace-pre-line text-left space-y-2 font-normal break-words pb-2"
                style={{ fontFamily: "'Special Elite', monospace" }}
              >
                {letter.message}
              </div>
            </div>
          </div>
        </main>
      ) : (
        /* 1 BIG CENTERED ENVELOPE */
        <main
          className="w-full max-w-[800px] bg-[rgba(255,241,243,0.95)] rounded-[35px] px-6 sm:px-14 py-8 sm:py-12 shadow-2xl flex flex-col items-center justify-center my-auto text-center"
        >
          {/* Main Title in Monsieur La Doulaise cursive font */}
          <h1
            className="text-4xl sm:text-6xl text-center text-[#4a3030] mb-2 font-normal"
            style={{ fontFamily: "'Monsieur La Doulaise', cursive" }}
          >
            A Letter For You
          </h1>

          {/* 1 Big Centered Envelope Button */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group flex flex-col items-center text-center cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 focus:outline-hidden my-3"
          >
            <div className="w-[260px] sm:w-[380px] md:w-[440px] h-[190px] sm:h-[280px] md:h-[320px] flex items-center justify-center">
              <img
                src={letter.image}
                alt="Read Me..."
                className="w-full h-full object-contain filter group-hover:brightness-105 drop-shadow-xl transition-all"
              />
            </div>
            <p className="mt-3 sm:mt-5 text-2xl sm:text-3xl md:text-4xl font-normal text-[#4a3030] group-hover:text-[#8b4f4f] transition-colors tracking-wide">
              Read Me...
            </p>
          </button>
        </main>
      )}

      {/* Footer spacer */}
      <div className="h-2" />
    </div>
  );
};
