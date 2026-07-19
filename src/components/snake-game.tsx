"use client";

import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Play, RotateCcw, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Cell = { x: number; y: number };
type Direction = Cell;

const boardSize = 15;
const initialSnake: Cell[] = [{ x: 7, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 7 }];
const directions = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const sameCell = (a: Cell, b: Cell) => a.x === b.x && a.y === b.y;

function nextFood(snake: Cell[]) {
  const free: Cell[] = [];
  for (let y = 0; y < boardSize; y += 1) for (let x = 0; x < boardSize; x += 1) {
    if (!snake.some(cell => cell.x === x && cell.y === y)) free.push({ x, y });
  }
  return free[Math.floor(Math.random() * free.length)] || { x: 2, y: 2 };
}

export function SnakeGame({ active, hasError, onClose }: { active: boolean; hasError: boolean; onClose: () => void }) {
  const [desktop, setDesktop] = useState(false);
  const [snake, setSnake] = useState<Cell[]>(initialSnake);
  const [food, setFood] = useState<Cell>({ x: 11, y: 7 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [manualPlaying, setManualPlaying] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const directionRef = useRef<Direction>(directions.right);
  const appliedDirectionRef = useRef<Direction>(directions.right);
  const wasActiveRef = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!desktop) return;
    if (active && !wasActiveRef.current) {
      if (gameOver) reset();
      else boardRef.current?.focus();
    }
    wasActiveRef.current = active;
  }, [active, desktop, gameOver]);

  useEffect(() => {
    if (!active) setManualPlaying(false);
  }, [active]);

  function reset() {
    setSnake(initialSnake);
    setFood({ x: 11, y: 7 });
    setScore(0);
    setGameOver(false);
    directionRef.current = directions.right;
    appliedDirectionRef.current = directions.right;
    requestAnimationFrame(() => boardRef.current?.focus());
  }

  function turn(next: Direction) {
    const applied = appliedDirectionRef.current;
    if (applied.x + next.x === 0 && applied.y + next.y === 0) return;
    directionRef.current = next;
  }

  function resume() {
    if (gameOver) reset();
    setManualPlaying(true);
    requestAnimationFrame(() => boardRef.current?.focus());
  }

  const running = active || manualPlaying;

  useEffect(() => {
    if (!desktop || !running || gameOver) return;
    const timer = window.setInterval(() => {
      setSnake(current => {
        const movement = directionRef.current;
        appliedDirectionRef.current = movement;
        const head = {
          x: (current[0].x + movement.x + boardSize) % boardSize,
          y: (current[0].y + movement.y + boardSize) % boardSize,
        };
        const ate = sameCell(head, food);
        const bodyToCheck = ate ? current : current.slice(0, -1);
        if (bodyToCheck.some(cell => sameCell(cell, head))) {
          setGameOver(true);
          return current;
        }
        const moved = [head, ...current];
        if (ate) {
          setScore(value => value + 1);
          setFood(nextFood(moved));
          return moved;
        }
        moved.pop();
        return moved;
      });
    }, 145);
    return () => window.clearInterval(timer);
  }, [running, desktop, food, gameOver]);

  const cells = useMemo(() => Array.from({ length: boardSize * boardSize }, (_, index) => ({ x: index % boardSize, y: Math.floor(index / boardSize) })), []);
  if (!desktop) return null;

  const pausedLabel = hasError ? "Request stopped" : "Response ready";
  return <aside className="fixed bottom-5 right-5 z-[70] w-72 rounded-xl border border-slate-300 bg-white p-3 shadow-2xl" aria-label="Snake game">
    <div className="flex items-center justify-between gap-3 px-1 pb-2">
      <div><p className="text-sm font-extrabold text-slate-900">Snake break</p><p className="text-[11px] text-slate-500">Score {score} · {active ? "Generating…" : manualPlaying ? "Free play" : `${pausedLabel} · paused`}</p></div>
      <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50" aria-label="Close snake game"><X size={16} /></button>
    </div>
    <div
      ref={boardRef}
      tabIndex={0}
      onKeyDown={event => {
        const map: Record<string, Direction> = { ArrowUp: directions.up, w: directions.up, W: directions.up, ArrowDown: directions.down, s: directions.down, S: directions.down, ArrowLeft: directions.left, a: directions.left, A: directions.left, ArrowRight: directions.right, d: directions.right, D: directions.right };
        if (map[event.key]) { event.preventDefault(); turn(map[event.key]); }
      }}
      className="relative grid aspect-square w-full grid-cols-[repeat(15,minmax(0,1fr))] overflow-hidden rounded-lg border border-slate-300 bg-slate-900 outline-none focus:ring-2 focus:ring-[#6956e8] focus:ring-offset-2"
      aria-label="Snake board. Use arrow keys or W A S D."
    >
      {cells.map(cell => {
        const snakeIndex = snake.findIndex(part => sameCell(part, cell));
        const isFood = sameCell(food, cell);
        return <span key={`${cell.x}-${cell.y}`} aria-hidden="true" className={`border-[0.5px] border-slate-800 ${snakeIndex === 0 ? "rounded-[3px] bg-[#a69af3]" : snakeIndex > 0 ? "rounded-[3px] bg-[#6956e8]" : isFood ? "rounded-full bg-[#f59e0b]" : ""}`} />;
      })}
      {(!running || gameOver) && <div className="absolute inset-0 grid place-items-center bg-slate-950/70 p-5 text-center text-white"><div><p className="text-sm font-bold">{gameOver ? "Game over" : pausedLabel}</p><p className="mt-1 text-[11px] text-slate-300">{gameOver ? `Score: ${score}` : "Paused automatically. Resume whenever you like."}</p>{gameOver ? <button onClick={() => { reset(); if (!active) setManualPlaying(true); }} className="mt-3 inline-flex items-center gap-1 rounded-md bg-white px-3 py-1.5 text-xs font-bold text-slate-900"><RotateCcw size={13} /> New game</button> : <button onClick={resume} className="mt-3 inline-flex items-center gap-1 rounded-md bg-white px-3 py-1.5 text-xs font-bold text-slate-900"><Play size={13} /> Resume game</button>}</div></div>}
    </div>
    <div className="mt-3 grid grid-cols-3 gap-1.5" aria-label="Snake controls">
      <span /><Control label="Up" onClick={() => turn(directions.up)}><ChevronUp size={16} /></Control><span />
      <Control label="Left" onClick={() => turn(directions.left)}><ChevronLeft size={16} /></Control><Control label="Down" onClick={() => turn(directions.down)}><ChevronDown size={16} /></Control><Control label="Right" onClick={() => turn(directions.right)}><ChevronRight size={16} /></Control>
    </div>
    <p className="mt-2 text-center text-[10px] text-slate-400">Click the board, then use arrows or W A S D.</p>
  </aside>;
}

function Control({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return <button disabled={false} onClick={() => { onClick(); }} className="grid h-8 place-items-center rounded-md border border-slate-200 text-slate-600 hover:border-violet-300 hover:text-[#6956e8]" aria-label={`Move ${label.toLowerCase()}`}>{children}</button>;
}
