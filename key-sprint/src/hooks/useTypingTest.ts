"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QUOTES_BY_DIFFICULTY, type Difficulty } from "@/lib/quotes";
import { useLocalScores } from "@/hooks/useLocalScores";

export function useTypingTest() {
  const [timeLimit, setTimeLimit] = useState<number>(120);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [totalTime, setTotalTime] = useState<number>(120);
  const [timeLeft, setTimeLeft] = useState<number>(120);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentQuote, setCurrentQuote] = useState<string>("");
  const [currentPool, setCurrentPool] = useState<string[]>(
    QUOTES_BY_DIFFICULTY["medium"].slice()
  );
  const [inputValue, setInputValue] = useState<string>("");
  const [wordsTyped, setWordsTyped] = useState<number>(0);
  const [popupOpen, setPopupOpen] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const { recordResult } = useLocalScores();

  const ratio = useMemo(() => {
    return totalTime > 0 ? Math.max(0, timeLeft / totalTime) : 0;
  }, [timeLeft, totalTime]);

  const elapsed = useMemo(() => totalTime - timeLeft, [totalTime, timeLeft]);

  const wpm = useMemo(() => {
    if (elapsed <= 0) return 0;
    return Math.floor((wordsTyped / elapsed) * 60);
  }, [elapsed, wordsTyped]);

  const barState = useMemo(() => {
    if (ratio > 0.5) return "ok" as const;
    if (ratio > 0.2) return "warn" as const;
    return "danger" as const;
  }, [ratio]);

  const refreshPoolForDifficulty = useCallback(
    (d: Difficulty) => setCurrentPool(QUOTES_BY_DIFFICULTY[d].slice()),
    []
  );

  useEffect(() => {
    refreshPoolForDifficulty(difficulty);
  }, [difficulty, refreshPoolForDifficulty]);

  const loadNextQuote = useCallback(() => {
    setCurrentPool((pool) => {
      let nextPool = pool;
      if (!nextPool || nextPool.length === 0) {
        nextPool = QUOTES_BY_DIFFICULTY[difficulty].slice();
      }
      const idx = Math.floor(Math.random() * nextPool.length);
      const [next] = nextPool.splice(idx, 1);
      setCurrentQuote(next);
      setInputValue("");
      return [...nextPool];
    });
  }, [difficulty]);

  const start = useCallback(() => {
    setTotalTime(timeLimit);
    setTimeLeft(timeLimit);
    setWordsTyped(0);
    setPopupOpen(false);
    setIsRunning(true);
    loadNextQuote();
  }, [loadNextQuote, timeLimit]);

  useEffect(() => {
    if (!isRunning) return;
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => {
      timerRef.current && clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    if (elapsed > 0) {
      // no-op: wpm derived from state
    }
    if (timeLeft <= 0) {
      // finalize
      setIsRunning(false);
      setPopupOpen(true);
      recordResult({
        wpm: Number(wpm) || 0,
        words: wordsTyped,
        time: totalTime,
        difficulty,
        timeLimit,
      });
    }
  }, [elapsed, isRunning, recordResult, timeLeft, totalTime, wpm, wordsTyped, difficulty, timeLimit]);

  const onInputChange = useCallback(
    (value: string) => {
      setInputValue(value);
      // compute per-char correctness and detect completion
      const arrayQuote = currentQuote.split("");
      const arrayValue = value.split("");
      let correct = true;
      for (let i = 0; i < arrayQuote.length; i++) {
        const expectedChar = arrayQuote[i] === "\u00A0" ? " " : arrayQuote[i];
        const actualChar = arrayValue[i] === "\u00A0" ? " " : arrayValue[i];
        if (actualChar == null) {
          correct = false;
          break;
        }
        if (actualChar !== expectedChar) {
          correct = false;
        }
      }
      if (correct && arrayValue.length === arrayQuote.length) {
        setWordsTyped((w) => w + currentQuote.split(/\s+/).length);
        loadNextQuote();
      }
    },
    [currentQuote, loadNextQuote]
  );

  const closePopup = useCallback(() => setPopupOpen(false), []);

  return {
    // controls
    timeLimit,
    setTimeLimit,
    difficulty,
    setDifficulty,
    // state
    totalTime,
    timeLeft,
    ratio,
    barState,
    wpm,
    isRunning,
    currentQuote,
    inputValue,
    wordsTyped,
    popupOpen,
    // refs
    inputRef,
    // actions
    start,
    onInputChange,
    closePopup,
  };
}

export type UseTypingTest = ReturnType<typeof useTypingTest>;


