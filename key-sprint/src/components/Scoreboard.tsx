"use client";

import { useLocalScores } from "@/hooks/useLocalScores";
import type { Difficulty } from "@/lib/quotes";
import { formatDate } from "@/lib/format";

export default function Scoreboard() {
  const { bestOverall, bestByDifficulty, recentTop10 } = useLocalScores();

  const bestBadge = (label: string, s?: { wpm: number; words: number; time: number }) => (
    <p className="badge" key={`best-${label}`}>
      <span className="label">{label}</span>
      <span>{s?.wpm ?? 0}</span> WPM • <span>{s?.words ?? 0}</span> words • <span>{s?.time ?? 0}</span>s
    </p>
  );

  const diffOrder: Difficulty[] = ["easy", "medium", "hard", "warrior"];
  const diffLabel: Record<Difficulty, string> = {
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    warrior: "Keyboard Warrior",
  };

  return (
    <div className="scoreboard">
      <div className="best">
        <div className="best-grid">
          {bestBadge("Best (All)", bestOverall)}
          {diffOrder.map((d) => (
            <p className="badge" key={`best-${d}`}>
              <span className="label">{diffLabel[d]}</span>
              <span>{bestByDifficulty?.[d]?.wpm ?? 0}</span> WPM • <span>{bestByDifficulty?.[d]?.words ?? 0}</span> words • <span>{bestByDifficulty?.[d]?.time ?? 0}</span>s
            </p>
          ))}
        </div>
      </div>
      <ul className="recent-list">
        {recentTop10.map((s) => (
          <li key={`${s.timestamp}-${s.wpm}-${s.words}`}>
            <span>
              {s.wpm} WPM • {s.words} words • {s.time}s • {s.difficulty} • {s.timeLimit}s
            </span>
            <span className="meta">{formatDate(s.timestamp)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}


