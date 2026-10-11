import { useEffect, useId, useRef, useState } from "react";
import logo from "../assets/logo-b3.jpeg";
import "@fontsource/poppins/700.css";
import "./Brandintro.css";

// [x, y, lebar, tinggi] tiap simbol di kanvas 1254x1254
const SYMBOLS = [
  [195, 360, 110, 110], [712, 346, 152, 142], [447, 647, 122, 114],
  [762, 642, 98, 92], [767, 749, 129, 152], [377, 890, 96, 95], [565, 865, 124, 106],
];
const WORD = "B3Matika";
const ENTRANCE_S = 5.8; // durasi animasi masuk (detik) pada pace = 1
const SEEN_KEY = "b3-intro-seen";

// Deteksi prefers-reduced-motion secara aman (SSR-safe)
const prefersReducedMotion = () => {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
};

const seen = () => { try { return sessionStorage.getItem(SEEN_KEY) === "1"; } catch { return false; } };
const mark = () => { try { sessionStorage.setItem(SEEN_KEY, "1"); } catch { /* abaikan */ } };

/**
 * Props:
 *  size    ukuran logo (px)                        default 220
 *  pace    1 = normal, >1 lebih lambat, <1 lebih cepat   default 1
 *  splash  true = tampil layar penuh lalu memudar sendiri
 *  holdMs  jeda setelah animasi selesai sebelum memudar   default 1400
 *  fadeMs  lama memudar                            default 900
 *  once    true = splash hanya sekali per sesi tab
 *  onFinish dipanggil saat splash selesai
 */
export default function BrandIntro({
  size = 220, pace = 1, src = logo,
  splash = false, holdMs = 1400, fadeMs = 900, background = "#050507",
  once = false, onFinish, clickToReplay = false,
}) {
  const uid = useId().replace(/:/g, "");
  const id = (n) => `${n}-${uid}`;
  const ref = (n) => `url(#${id(n)})`;
  const [run, setRun] = useState(0);
  // Jika prefers-reduced-motion aktif, splash langsung selesai tanpa animasi
  const reducedMotion = prefersReducedMotion();
  const [phase, setPhase] = useState(() => {
    if (splash && once && seen()) return "gone";
    if (reducedMotion) return "play"; // akan langsung di-timeout cepat
    return "play";
  });
  const done = useRef(onFinish);
  done.current = onFinish;

  useEffect(() => {
    if (!splash) return;
    if (phase === "gone") { done.current?.(); return; }

    // Jika pengguna prefer-reduced-motion: tampilkan logo statis ~600ms lalu selesai
    const rm = prefersReducedMotion();
    const totalMs = rm
      ? 600
      : ENTRANCE_S * 1000 * pace + holdMs;
    const t1 = setTimeout(() => setPhase("out"), totalMs);
    const t2 = setTimeout(() => { mark(); setPhase("gone"); done.current?.(); }, totalMs + (rm ? 0 : fadeMs));
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [splash, pace, holdMs, fadeMs, run]); // eslint-disable-line react-hooks/exhaustive-deps

  const content = (
    <div
      key={run}
      className="bi bi-play"
      style={{ "--k": pace, "--bi-size": `${size}px` }}
      onClick={clickToReplay ? () => setRun((r) => r + 1) : undefined}
    >
      <svg className="bi-logo" viewBox="0 0 1254 1254" role="img" aria-label="Logo B3 Matika">
        <defs>
          <image id={id("img")} width="1254" height="1254" href={src} />
          <clipPath id={id("tile")}><rect x="134" y="104" width="987" height="1037" rx="278" /></clipPath>
          <mask id={id("rev")} maskUnits="userSpaceOnUse" x="0" y="0" width="1254" height="1254">
            <circle className="bi-reveal" cx="627" cy="622" r="900" fill="#fff" />
          </mask>
          <mask id={id("holes")} maskUnits="userSpaceOnUse" x="0" y="0" width="1254" height="1254">
            <rect width="1254" height="1254" fill="#fff" />
            {SYMBOLS.map(([x, y, w, h], i) => (
              <rect key={i} x={x} y={y} width={w} height={h} rx={Math.min(w, h) * 0.22} fill="#000" />
            ))}
          </mask>
          {SYMBOLS.map(([x, y, w, h], i) => (
            <clipPath key={i} id={id("c" + i)}>
              <rect x={x} y={y} width={w} height={h} rx={Math.min(w, h) * 0.22} />
            </clipPath>
          ))}
          <linearGradient id={id("sg")} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset=".5" stopColor="#fff" stopOpacity=".6" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="bi-breath">
          <g className="bi-tile" clipPath={ref("tile")}>
            <rect width="1254" height="1254" fill="#fff" />
            <g mask={ref("holes")}><g mask={ref("rev")}><use href={`#${id("img")}`} /></g></g>
            {SYMBOLS.map(([x, y, w, h], i) => {
              const st = { "--x": `${x + w / 2}px`, "--y": `${y + h / 2}px`, "--i": i };
              return (
                <g key={i} className="bi-sym bi-pop" style={st}>
                  <g className="bi-sym bi-float" style={{ ...st, "--t": `${3 + (i % 3) * 0.7}s` }}>
                    <use href={`#${id("img")}`} clipPath={ref("c" + i)} />
                  </g>
                </g>
              );
            })}
            <rect className="bi-shine" x="-300" y="0" width="260" height="1254" fill={ref("sg")} />
          </g>
        </g>
      </svg>

      <div className="bi-word" role="img" aria-label="B3Matika">
        {[...WORD].map((ch, i) => (
          <span key={i} aria-hidden="true" className={`bi-c${ch === "3" ? " bi-three" : ""}`} style={{ "--i": i }}>
            {/* data-char dipakai oleh CSS ::after untuk efek kilau di atas teks solid */}
            <span className="bi-l" data-char={ch}>{ch}</span>
          </span>
        ))}
      </div>
    </div>
  );

  if (!splash) return content;
  if (phase === "gone") return null;
  return (
    <div
      className={`bi-splash${phase === "out" ? " bi-out" : ""}`}
      style={{ "--bi-bg": background, "--fade": `${fadeMs}ms` }}
    >
      {content}
    </div>
  );
}