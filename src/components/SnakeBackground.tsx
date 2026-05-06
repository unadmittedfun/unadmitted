import { useEffect, useRef } from "react";

/**
 * Playable snake background. Uses arrow keys / WASD on desktop and swipe on
 * touch devices. Falls back to gentle autopilot until the user takes over.
 */
export const SnakeBackground = ({ className = "", interactive = true }: { className?: string; interactive?: boolean }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const interactiveRef = useRef(interactive);
  useEffect(() => { interactiveRef.current = interactive; }, [interactive]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const CELL = 22;
    let COLS = 33, ROWS = 22;
    const WORD = "UNADMITTED";

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      COLS = Math.max(20, Math.floor(w / CELL));
      ROWS = Math.max(15, Math.floor(h / CELL));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    type Cell = { x: number; y: number };
    let snake: Cell[] = [];
    let dir: Cell = { x: 1, y: 0 };
    let nextDir: Cell = { x: 1, y: 0 };
    let charPos = 0;
    let placed: Record<string, string> = {};
    let target: { x: number; y: number; ch: string } = { x: 0, y: 0, ch: "U" };
    let gameOver = false;
    let userControlling = false;
    let lastInputAt = 0;
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

    const autoChooseDir = () => {
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
        return Math.random() < 0.7 ? da - db : Math.random() - 0.5;
      });
      nextDir = pool[0];
    };

    const init = () => {
      snake = [];
      const startY = Math.floor(ROWS / 2);
      for (let i = 9; i >= 0; i--) snake.push({ x: i, y: startY });
      dir = { x: 1, y: 0 };
      nextDir = { x: 1, y: 0 };
      charPos = 0;
      placed = {};
      gameOver = false;
      spawnTarget();
      if (interval) window.clearInterval(interval);
      interval = window.setInterval(tick, 110);
    };

    const tick = () => {
      if (gameOver) return;
      // Autopilot when not interactive, or after 4s of no input.
      if (!interactiveRef.current || !userControlling || Date.now() - lastInputAt > 4000) {
        userControlling = false;
        autoChooseDir();
      }
      dir = nextDir;
      const head = {
        x: (snake[0].x + dir.x + COLS) % COLS,
        y: (snake[0].y + dir.y + ROWS) % ROWS,
      };
      if (snake.some((s) => s.x === head.x && s.y === head.y)) {
        gameOver = true;
        if (interval) window.clearInterval(interval);
        window.setTimeout(init, 1500);
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
    };

    const draw = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, w, h);

      for (const [k, ch] of Object.entries(placed)) {
        const [px, py] = k.split(",").map(Number);
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(px * CELL + 1, py * CELL + 1, CELL - 2, CELL - 2);
        ctx.fillStyle = "#534AB7";
        ctx.font = "bold 13px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(ch, px * CELL + CELL / 2, py * CELL + CELL / 2);
      }

      const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 200);
      ctx.fillStyle = `rgba(83,74,183,${pulse * 0.35})`;
      ctx.fillRect(target.x * CELL + 1, target.y * CELL + 1, CELL - 2, CELL - 2);
      ctx.fillStyle = `rgba(220,200,255,${pulse})`;
      ctx.font = "bold 14px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
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
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 24px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("UNADMITTED", w / 2, h / 2);
      }

      raf = requestAnimationFrame(draw);
    };

    const setDir = (x: number, y: number) => {
      if (dir.x === -x && dir.y === -y) return;
      nextDir = { x, y };
      userControlling = true;
      lastInputAt = Date.now();
    };

    const onKey = (e: KeyboardEvent) => {
      if (!interactiveRef.current) return;
      const k = e.key;
      if (k === "ArrowUp" || k === "w" || k === "W") { setDir(0, -1); e.preventDefault(); }
      else if (k === "ArrowDown" || k === "s" || k === "S") { setDir(0, 1); e.preventDefault(); }
      else if (k === "ArrowLeft" || k === "a" || k === "A") { setDir(-1, 0); e.preventDefault(); }
      else if (k === "ArrowRight" || k === "d" || k === "D") { setDir(1, 0); e.preventDefault(); }
    };

    let touchX = 0, touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (!interactiveRef.current) return;
      const t = e.touches[0];
      touchX = t.clientX; touchY = t.clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!interactiveRef.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchX, dy = t.clientY - touchY;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
      if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 1 : -1, 0);
      else setDir(0, dy > 0 ? 1 : -1);
    };

    resize();
    init();
    raf = requestAnimationFrame(draw);

    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("resize", resize);

    return () => {
      if (interval) window.clearInterval(interval);
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{ width: "100%", height: "100%", display: "block" }}
      className={`select-none ${className}`}
    />
  );
};
