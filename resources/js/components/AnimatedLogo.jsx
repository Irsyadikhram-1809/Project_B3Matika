import { useId, useState } from "react";
import logo from "../assets/logo-b3.jpeg"; // sesuaikan path-nya
import "./AnimatedLogo.css";

// [x, y, lebar, tinggi] tiap simbol di kanvas 1254x1254
const SYMBOLS = [
  [195, 360, 110, 110], [712, 346, 152, 142], [447, 647, 122, 114],
  [762, 642, 98, 92], [767, 749, 129, 152], [377, 890, 96, 95], [565, 865, 124, 106],
];

export default function AnimatedLogo({ size = 320, src = logo, clickToReplay = true }) {
  const uid = useId().replace(/:/g, "");
  const [run, setRun] = useState(0);
  const id = (n) => `${n}-${uid}`;
  const ref = (n) => `url(#${id(n)})`;

  return (
    <svg
      key={run}
      className="b3-logo b3-play"
      viewBox="0 0 1254 1254"
      style={{ width: size, height: size }}
      role="img"
      aria-label="Logo B3 Matika"
      onClick={clickToReplay ? () => setRun((r) => r + 1) : undefined}
    >
      <defs>
        <image id={id("img")} width="1254" height="1254" href={src} />
        <clipPath id={id("tile")}>
          <rect x="134" y="104" width="987" height="1037" rx="278" />
        </clipPath>
        <mask id={id("rev")} maskUnits="userSpaceOnUse" x="0" y="0" width="1254" height="1254">
          <circle className="b3-reveal" cx="627" cy="622" r="900" fill="#fff" />
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

      <g className="b3-breath">
        <g className="b3-tile" clipPath={ref("tile")}>
          <rect width="1254" height="1254" fill="#fff" />
          <g mask={ref("holes")}>
            <g mask={ref("rev")}>
              <use href={`#${id("img")}`} />
            </g>
          </g>
          {SYMBOLS.map(([x, y, w, h], i) => {
            const st = { "--x": `${x + w / 2}px`, "--y": `${y + h / 2}px`, "--i": i };
            return (
              <g key={i} className="b3-sym b3-pop" style={st}>
                <g className="b3-sym b3-float" style={{ ...st, "--t": `${3 + (i % 3) * 0.7}s` }}>
                  <use href={`#${id("img")}`} clipPath={ref("c" + i)} />
                </g>
              </g>
            );
          })}
          <rect className="b3-shine" x="-300" y="0" width="260" height="1254" fill={ref("sg")} />
        </g>
      </g>
    </svg>
  );
}
