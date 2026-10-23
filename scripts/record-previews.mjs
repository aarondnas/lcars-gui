// Records animated previews of the HTML demos (docs/<name>.gif) for the READMEs.
// Requires `npm run build`. Run with `npm run previews`.
//
// How it works: the demos are served by a small local server. A headless browser
// (Edge/Chrome; set another path with BROWSER=…) takes one screenshot per frame, where
// --virtual-time-budget controls how far the animations have progressed since load.
// Theme and alert come from the URL (?theme=…&alert=…).
import { execFile } from "child_process";
import fs from "fs";
import http from "http";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";
import gifenc from "gifenc";
import { PNG } from "pngjs";

const { GIFEncoder, quantize, applyPalette } = gifenc;
const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const previews = [
  {
    name: "federation",
    page: "apps/examples/web/index.html",
    scenes: ["?theme=tng#federation", "?theme=ds9#federation", "?theme=picard#federation", "?theme=tng&alert=red#federation"],
  },
  {
    name: "romulus",
    page: "apps/examples/web/index.html",
    scenes: ["?theme=warbird#romulus", "?theme=tal-shiar#romulus", "?theme=free-state#romulus", "?theme=warbird&alert=red#romulus"],
  },
];

const framesPerScene = 8;
const frameDelay = 140; // ms between two frames
const loadTime = 600; // ms of virtual time until the page has settled
const viewport = { width: 1200, height: 760, scale: 0.75 }; // → 900 × 570 pixels
const parallel = Number(process.env.PARALLEL ?? 4);

const browsers = [
  process.env.BROWSER,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/chromium",
  "/usr/bin/google-chrome",
].filter(Boolean);
const browser = browsers.find((file) => fs.existsSync(file));
if (!browser) throw new Error("No Edge/Chrome found – set the path with BROWSER=…");

const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".woff2": "font/woff2" };
const server = http
  .createServer((req, res) => {
    const file = path.join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return res.writeHead(404).end();
    res.writeHead(200, { "content-type": types[path.extname(file)] ?? "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  })
  .listen(0);
const port = server.address().port;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "lcars-previews-"));

async function screenshot(url, budget, file, profile) {
  await run(browser, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--mute-audio",
    `--user-data-dir=${path.join(tmp, `profile-${profile}`)}`,
    `--window-size=${viewport.width},${viewport.height}`,
    `--force-device-scale-factor=${viewport.scale}`,
    `--virtual-time-budget=${budget}`,
    `--screenshot=${file}`,
    url,
  ]);
  return readWhenReady(file);
}

// On Windows, Edge sometimes exits its launcher process before the screenshot is written
async function readWhenReady(file, timeout = 20000) {
  const start = Date.now();
  for (;;) {
    try {
      return PNG.sync.read(fs.readFileSync(file));
    } catch (error) {
      if (Date.now() - start > timeout) throw error;
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }
}

// Runs tasks with limited parallelism, results in original order
async function pool(tasks, limit) {
  const results = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: limit }, async (_, worker) => {
      while (next < tasks.length) {
        const i = next++;
        results[i] = await tasks[i](worker);
      }
    })
  );
  return results;
}

try {
  fs.mkdirSync(path.join(root, "docs"), { recursive: true });

  for (const { name, page, scenes } of previews) {
    const tasks = scenes.flatMap((query, s) =>
      Array.from({ length: framesPerScene }, (_, f) => (worker) =>
        screenshot(
          `http://localhost:${port}/${page}${query}`,
          loadTime + f * frameDelay,
          path.join(tmp, `${name}-${s}-${f}.png`),
          worker
        )
      )
    );
    const frames = await pool(tasks, parallel);

    const { width, height } = frames[0];
    const gif = GIFEncoder();
    for (const png of frames) {
      const palette = quantize(png.data, 256);
      gif.writeFrame(applyPalette(png.data, palette), width, height, { palette, delay: frameDelay });
    }
    gif.finish();

    const out = path.join(root, "docs", `${name}.gif`);
    fs.writeFileSync(out, gif.bytes());
    console.log(`✔ docs/${name}.gif (${frames.length} frames, ${width}×${height}, ${Math.round(fs.statSync(out).size / 1024)} KB)`);
  }
} finally {
  server.close();
  fs.rmSync(tmp, { recursive: true, force: true });
}
