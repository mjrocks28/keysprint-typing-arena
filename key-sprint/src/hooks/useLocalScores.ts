"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Difficulty } from "@/lib/quotes";

export type Score = {
  wpm: number;
  words: number;
  time: number;
  difficulty: Difficulty;
  timeLimit: number;
  timestamp: number;
};

const STORAGE_KEY = "typing_scores_v2";

function safeParse(json: string | null): Score[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? (parsed as Score[]) : [];
  } catch {
    return [];
  }
}

export function useLocalScores() {
  const [scores, setScores] = useState<Score[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    setScores(safeParse(raw));
  }, []);

  const saveScores = useCallback((next: Score[]) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore write errors
    }
  }, []);

  const recordResult = useCallback(
    (result: Omit<Score, "timestamp">) => {
      const withTs: Score = { ...result, timestamp: Date.now() };
      const sorted = [withTs, ...scores]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 100);
      setScores(sorted);
      saveScores(sorted);
    },
    [saveScores, scores]
  );

  const bestOverall = useMemo(() => {
    if (scores.length === 0) return undefined;
    return scores.reduce((acc, s) => (s.wpm > acc.wpm ? s : acc), scores[0]);
  }, [scores]);

  const bestByDifficulty = useMemo(() => {
    const map: Partial<Record<Difficulty, Score>> = {};
    for (const s of scores) {
      const key = (s.difficulty ?? "medium") as Difficulty;
      if (!map[key] || s.wpm > (map[key]!.wpm ?? 0)) map[key] = s;
    }
    return map;
  }, [scores]);

  const recentTop10 = useMemo(() => {
    return scores.slice().sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
  }, [scores]);

  return { scores, recordResult, bestOverall, bestByDifficulty, recentTop10 };
}


