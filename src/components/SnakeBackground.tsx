import { useEffect, useRef } from "react";

/**
 * Ambient snake-game background that slowly spells UNADMITTED across the grid.
 * Pure visual decoration — pointer-events disabled, runs with rAF + setInterval.
 */
export const SnakeBackground = ({ className = "" }: { className?: string }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const COLS = 33, ROWS = 22, CELL = 20;
    canvas.width = COLS * CELL;
    canvas.height = ROWS * CELL;
    const WORD = "UNADMITTED";

    type Cell = { x: number; y: number };
    let snake: Cell[] = [];
    let dir: Cell = { x: 1, y: 0 };
    let charPos = 0;
    let placed: Record<string, string> = {};
    let target: { x: number; y: number; ch: string } = { x: 0, y: 0, ch: "U" };
    let gameOver = false;
    let interval: number | undefined;
    let raf = 0;

    const key = (x: number, y: number) => `${x},${y}`;

    const spawnTarget = () => {
      let x = 0, y = 0, tries = 0;
      do {
        x = Math.floor(Math.random() * COLS);
        y = Math.floor(Math.random() * ROWS);
        tries++;
      } while ((placed[key(x, y)] || snake.some((s) => s.x === x && s.y === y)) && tries < 500);
      target = { x, y, ch: WORD[charPos % WORD.length] };
    };

    // Lightweight autopilot so the snake actually fills the canvas without input.
    const chooseDir = () => {
      const head = snake[0];
      const options: Cell[] = [
        { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 },
      ].filter((d) => !(d.x === -dir.x && d.y === -dir.y));

      const safe = options.filter((d) => {
        const nx = (head.x + d.x + COLS) % COLS;
        const ny = (head.y + d.y + ROWS) % ROWS;
        return !snake.some((s) => s.x === nx && s.y === ny);
      });

      const pool = safe.length ? safe : options;
      pool.sort((a, b) => {
        const da = Math.abs(((head.x + a.x + COLS) % COLS) - target.x) +
                   Math.abs(((head.y + a.y + ROWS) % ROWS) - target.y);
        const db = Math.abs(((head.x + b.x + COLS) % COLS) - target.x) +
                   Math.abs(((head.y + b.y + ROWS) % ROWS) - target.y);
        // 70% greedy toward target, 30% wander for organic motion
        return Math.random() < 0.7 ? da - db : Math.random() - 0.5;
      });
      dir = pool[0];
    };

    const init = () => {
      snake = [];
      for (let i = 9; i >= 0; i--) snake.push({ x: i, y: 11 });
      dir = { x: 1, y: 0 };
      charPos = 0;
      placed = {};
      gameOver = false;
      spawnTarget();
      if (interval) window.clearInterval(interval);
      interval = window.setInterval(tick, 140);
    };

    const tick = () => {
      if (gameOver) return;
      chooseDir();
      const head = {
        x: (snake[0].x + dir.x + COLS) % COLS,
        y: (snake[0].y + dir.y + ROWS) % ROWS,
      };
      if (snake.some((s) => s.x === head.x && s.y === head.y)) {
        gameOver = true;
        if (interval) window.clearInterval(interval);
        window.setTimeout(init, 1800);
        return;
      }
      snake.unshift(head);
      let ate = false;
      if (head.x === target.x && head.y === target.y) {
        placed[key(head.x, head.y)] = WORD[charPos % WORD.length];
        charPos++;
        ate = true;
        spawnTarget();
      }
      if (!ate) snake.pop();

      const total = COLS * ROWS;
      if (Object.keys(placed).length + snake.length >= total - 5) {
        gameOver = true;
        if (interval) window.clearInterval(interval);
        window.setTimeout(init, 2400);
      }
    };

    const draw = () => {
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const [k, ch] of Object.entries(placed)) {
        const [px, py] = k.split(",").map(Number);
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(px * CELL + 1, py * CELL + 1, CELL - 2, CELL - 2);
        ctx.fillStyle = "#534AB7";
        ctx.font = "bold 12px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(ch, px * CELL + CELL / 2, py * CELL + CELL / 2);
      }

      const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 200);
      ctx.fillStyle = `rgba(83,74,183,${pulse * 0.3})`;
      ctx.fillRect(target.x * CELL + 1, target.y * CELL + 1, CELL - 2, CELL - 2);
      ctx.fillStyle = `rgba(200,180,255,${pulse})`;
      ctx.font = "bold 13px ui-monospace, monospace";
      ctx.fillText(target.ch, target.x * CELL + CELL / 2, target.y * CELL + CELL / 2);

      snake.forEach((seg, i) => {
        const t = i / Math.max(snake.length, 1);
        const r = Math.round(83 + (200 - 83) * (1 - t));
        const g = Math.round(74 + (160 - 74) * (1 - t));
        const b = Math.round(183 + (255 - 183) * (1 - t));
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);
      });

      if (gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 22px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("UNADMITTED", canvas.width / 2, canvas.height / 2);
      }

      raf = requestAnimationFrame(draw);
    };

    init();
    raf = requestAnimationFrame(draw);

    return () => {
      if (interval) window.clearInterval(interval);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`pointer-events-none select-none ${className}`}
    />
  );
};
