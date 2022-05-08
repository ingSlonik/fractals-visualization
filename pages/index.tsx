import Head from 'next/head';
import { throttle } from "lodash";
import { useLayoutEffect, useRef, useState } from 'react';

type C = { x: number, y: number };

export default function Home() {
  const refMandelbrot = useRef<null | HTMLCanvasElement>(null);
  const refJulia = useRef<null | HTMLCanvasElement>(null);

  const width = 1221;
  const height = 640;

  const [realStart, setRealStart] = useState(-2);
  const [realEnd, setRealEnd] = useState(2);
  const [imaginaryStart, setImaginaryStart] = useState(-1);
  const [imaginaryEnd, setImaginaryEnd] = useState(1);

  const [colors, setColors] = useState(false);

  const [c, setC] = useState<C>({ x: -0.8, y: 0.156 });

  useLayoutEffect(() => {
    if (refMandelbrot.current !== null) {
      const canvas = refMandelbrot.current as HTMLCanvasElement;
      throttleDraw(canvas, realStart, realEnd, imaginaryStart, imaginaryEnd, colors ? COLORS_COLOR : COLORS_GRAY);
    }
  }, [realStart, realEnd, imaginaryStart, imaginaryEnd, colors]);

  useLayoutEffect(() => {
    if (refJulia.current !== null) {
      const canvas = refJulia.current as HTMLCanvasElement;
      throttleDraw(canvas, realStart, realEnd, imaginaryStart, imaginaryEnd, colors ? COLORS_COLOR : COLORS_GRAY, c);
    }
  }, [realStart, realEnd, imaginaryStart, imaginaryEnd, colors, c]);

  function mouseMove(e: MouseEvent) {
    e.preventDefault();

    if (refJulia.current !== null) {
      const canvas = refJulia.current as HTMLCanvasElement;

      const { top, left } = canvas.getBoundingClientRect();
      const { clientX, clientY } = e;

      const x = clientX - left;
      const y = clientY - top;

      setC({
        x: realStart + (x / width) * (realEnd - realStart),
        y: imaginaryStart + (y / height) * (imaginaryEnd - imaginaryStart)
      });
    }
  }

  return <div>
    <Head>
      <title>Mandelbrot visualization</title>
      <meta name="description" content="Mandelbrot visualization JavaScript" />
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <main>
      <h1>Fractal visualization</h1>

      <label>Real start ({realStart})</label>
      <input type="range" value={realStart} min={-2} max={1} step={0.01} onChange={e => setRealStart(Number(e.target.value))} />
      <label>Real end ({realEnd})</label>
      <input type="range" value={realEnd} min={-2} max={1} step={0.01} onChange={e => setRealEnd(Number(e.target.value))} />

      <label>Imaginary start ({imaginaryStart})</label>
      <input type="number" value={imaginaryStart} min={-1} max={1} step={0.01} onChange={e => setImaginaryStart(Number(e.target.value))} />
      <label>Imaginary start ({imaginaryEnd})</label>
      <input type="number" value={imaginaryEnd} min={-1} max={1} step={0.01} onChange={e => setImaginaryEnd(Number(e.target.value))} />

      <label>Colors</label>
      <input type="checkbox" checked={colors} onChange={e => setColors(e.target.checked)} />

      <h1>Mandelbrot</h1>
      <canvas ref={refMandelbrot} width={width} height={height} />

      <h1>Julia set</h1>
      <h3>C: {c.x}, {c.y}</h3>
      <canvas ref={refJulia} width={width} height={height} onMouseMove={e => mouseMove(e as any)} />

    </main>

    <footer>
      Powered by Fíla
    </footer>
  </div>;
}

const MAX_ITERATION = 16 * 4;
const COLORS_GRAY = new Array(16).fill(0).map((_, i) => {
  const c = (i).toString(16);
  return "#" + c + c + c + c + c + c;
});
const COLORS_COLOR = [
  "#140c1c",
  "#442434",
  "#30346d",
  "#4e4a4e",
  "#854c30",
  "#346524",
  "#d04648",
  "#757161",
  "#597dce",
  "#d27d2c",
  "#8595a1",
  "#6daa2c",
  "#d2aa99",
  "#6dc2ca",
  "#dad45e",
  "#deeed6",
];

function mandelbrot(z: C, c: C): [number, boolean] {
  let n = 1, p, d, powX, powY;

  do {
    powX = Math.pow(z.x, 2);
    powY = Math.pow(z.y, 2);
    p = {
      x: powX - powY,
      y: 2 * z.x * z.y
    }
    z = {
      x: p.x + c.x,
      y: p.y + c.y,
    }
    d = powX + powY;
    n += 1;
  } while (d <= 4 && n < MAX_ITERATION)
  return [n, d <= 4]
}

function draw(canvas: HTMLCanvasElement, realStart: number, realEnd: number, imaginaryStart: number, imaginaryEnd: number, colors: string[], z?: C) {
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const { width, height } = canvas;

  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      const c = {
        x: realStart + (i / width) * (realEnd - realStart),
        y: imaginaryStart + (j / height) * (imaginaryEnd - imaginaryStart)
      }

      const [m, isMandelbrotSet] = mandelbrot(c, z || c);
      ctx.fillStyle = colors[m % colors.length];
      ctx.fillRect(i, j, 1, 1);
    }
  }
}

const throttleDraw = throttle(draw, 350);
