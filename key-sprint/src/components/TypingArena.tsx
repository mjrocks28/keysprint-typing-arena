"use client";

import { useEffect } from "react";
import BackgroundCanvas from "@/components/BackgroundCanvas";
import { useTypingTest } from "@/hooks/useTypingTest";
import { useConfetti } from "@/hooks/useConfetti";
import Scoreboard from "@/components/Scoreboard";

export default function TypingArena() {
  const t = useTypingTest();
  useConfetti(t.popupOpen);

  // Global keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && t.popupOpen) t.closePopup();
      if (e.key === "Enter") {
        if (t.popupOpen) {
          t.closePopup();
          t.start();
        } else if (!t.isRunning) {
          t.start();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [t.closePopup, t.isRunning, t.popupOpen, t.start]);

  // focus textarea when running
  useEffect(() => {
    if (t.isRunning) t.inputRef.current?.focus();
  }, [t.isRunning]);

  return (
    <div className="layout">
      <BackgroundCanvas />
      <div className="container">
        <h1 className="title"><span className="emoji">⚡</span> KeySprint</h1>
        <p className="subtitle">Master the neon typing arena. Race the clock, crush words, and climb your WPM.</p>

        {/* Controls */}
        <div className="controls">
          <div id="timeSelect" className="control">
            <label htmlFor="timeLimit">Time Limit</label>
            <select id="timeLimit" value={t.timeLimit} onChange={(e) => t.setTimeLimit(Number(e.target.value))}>
              <option value={30}>30 seconds</option>
              <option value={60}>1 minute</option>
              <option value={120}>2 minutes</option>
              <option value={180}>3 minutes</option>
              <option value={300}>5 minutes</option>
            </select>
          </div>
          <div id="difficultySelect" className="control">
            <label htmlFor="difficulty">Difficulty</label>
            <select
              id="difficulty"
              value={t.difficulty}
              onChange={(e) => t.setDifficulty(e.target.value as unknown as "easy" | "medium" | "hard" | "warrior")}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="warrior">Keyboard Warrior</option>
            </select>
          </div>
        </div>

        {/* Timer bar */}
        <div className={`progress ${t.isRunning ? t.barState : ""}`} aria-label="Time remaining">
          <div className="progress-fill" style={{ transform: `scaleX(${t.ratio})` }} />
          <div className="progress-label"><span>{t.timeLeft}</span>s</div>
        </div>

        {/* Quote */}
        <p className="quote">
          {t.currentQuote.split("").map((c, i) => {
            const expected = c === "\u00A0" ? " " : c;
            const actual = t.inputValue[i] === "\u00A0" ? " " : t.inputValue[i];
            let cls = "";
            if (actual == null) cls = "";
            else if (actual === expected) cls = "correct";
            else cls = "incorrect";
            return <span key={i} className={cls}>{c === " " ? "\u00A0" : c}</span>;
          })}
        </p>

        {/* Input */}
        <textarea
          ref={t.inputRef}
          placeholder="Start typing here..."
          disabled={!t.isRunning}
          value={t.inputValue}
          onChange={(e) => t.onInputChange(e.target.value)}
        />

        {/* Stats */}
        <div className="stats">
          <p className="badge"><span className="label">WPM</span> <span>{t.wpm}</span></p>
          <p className="badge"><span className="label">Words</span> <span>{t.wordsTyped}</span></p>
        </div>

        <button className="cta" onClick={t.start} disabled={t.isRunning}>Start Typing</button>
      </div>

      <aside className="sidebar">
        <h3 className="panel-title">Scoreboard</h3>
        <Scoreboard />
      </aside>

      {/* Popup */}
      {t.popupOpen && (
        <div className="popup" onClick={(e) => { if (e.currentTarget === e.target) t.closePopup(); }}>
          <div className="popup-content">
            <button className="close-btn" aria-label="Close popup" onClick={t.closePopup}>✕</button>
            <div className="trophy">🏆</div>
            <h2>Time&apos;s Up!</h2>
            <p>You typed <span>{t.wordsTyped}</span> words</p>
            <p>Your speed: <span>{t.wpm}</span> WPM</p>
            <button className="cta small" onClick={() => { t.closePopup(); t.start(); }}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
}


