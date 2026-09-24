/**
 * Genera i placeholder fotografici in /assets/images.
 * Sono SVG "art-directed" (duotone + grana + linee di movimento) pensati per
 * essere sostituiti 1:1 da fotografie reali mantenendo lo stesso file name.
 *
 *   node tools/generate-placeholders.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'images');
mkdirSync(OUT, { recursive: true });

/** Duotone derivati dai colori sociali: navy (profondità) + Tiffany/bianco (luce).
 *  [ombra, base, mezzitoni, luce] */
const DUOTONES = {
  tiffany: ['#030A16', '#0A2440', '#12615F', '#81D8D0'], // navy con luce Tiffany
  navy: ['#030814', '#0B1F3A', '#1D4174', '#9FB8DA'],    // navy istituzionale
  lagoon: ['#030B14', '#082838', '#0F6F72', '#B9E9E4'],  // acqua: piscina, wellness
  pearl: ['#050D1C', '#132B4D', '#3F6589', '#F2F5F9'],   // navy con luce bianca
  night: ['#02060E', '#071630', '#13305A', '#4FC4BA'],   // notte profonda
};

/** Composizioni: ogni voce descrive il "soggetto" astratto della foto. */
const SHOTS = [
  ['hero-club', 'tiffany', 2400, 1400, 'sweep'],
  ['club-01', 'navy', 1400, 1750, 'arc'],
  ['club-02', 'tiffany', 1200, 900, 'grid'],
  ['club-03', 'night', 1200, 1500, 'sweep'],
  ['activity-fitness', 'tiffany', 1200, 1500, 'sweep'],
  ['activity-pesi', 'navy', 1200, 1500, 'grid'],
  ['activity-functional', 'night', 1200, 1500, 'arc'],
  ['activity-pilates', 'pearl', 1200, 1500, 'arc'],
  ['activity-yoga', 'lagoon', 1200, 1500, 'sweep'],
  ['activity-swimming', 'lagoon', 1200, 1500, 'wave'],
  ['activity-tennis', 'tiffany', 1200, 1500, 'grid'],
  ['activity-personal', 'pearl', 1200, 1500, 'sweep'],
  ['activity-kids', 'night', 1200, 1500, 'grid'],
  ['activity-wellness', 'lagoon', 1200, 1500, 'arc'],
  ['event-01', 'tiffany', 1600, 1100, 'sweep'],
  ['event-02', 'night', 1200, 900, 'arc'],
  ['event-03', 'navy', 1200, 900, 'grid'],
  ['event-04', 'pearl', 1200, 900, 'wave'],
  ['merch-01', 'tiffany', 1000, 1250, 'grid'],
  ['merch-02', 'pearl', 1000, 1250, 'arc'],
  ['merch-03', 'navy', 1000, 1250, 'sweep'],
  ['merch-04', 'night', 1000, 1250, 'grid'],
  ['social-01', 'tiffany', 900, 900, 'arc'],
  ['social-02', 'navy', 900, 900, 'sweep'],
  ['social-03', 'night', 900, 900, 'grid'],
  ['social-04', 'lagoon', 900, 900, 'wave'],
  ['social-05', 'pearl', 900, 900, 'arc'],
  ['social-06', 'tiffany', 900, 900, 'sweep'],
  ['corporate', 'navy', 1600, 1100, 'grid'],
];

const rnd = (seed) => {
  let s = [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
};

function motion(kind, w, h, hi, r) {
  const p = [];
  if (kind === 'sweep') {
    for (let i = 0; i < 9; i++) {
      const x = w * (-0.2 + i * 0.16) + r() * 60;
      p.push(`<path d="M${x} ${h * 1.1} L${x + w * 0.42} ${-h * 0.1}" stroke="${hi}" stroke-width="${
        1 + r() * 3
      }" opacity="${(0.05 + r() * 0.16).toFixed(3)}"/>`);
    }
  } else if (kind === 'arc') {
    for (let i = 0; i < 6; i++) {
      const rad = w * (0.28 + i * 0.13);
      p.push(
        `<circle cx="${w * 0.62}" cy="${h * 0.44}" r="${rad.toFixed(1)}" fill="none" stroke="${hi}" stroke-width="${(
          0.8 + r() * 2.2
        ).toFixed(2)}" opacity="${(0.06 + r() * 0.13).toFixed(3)}"/>`,
      );
    }
  } else if (kind === 'grid') {
    for (let i = 1; i < 10; i++) {
      p.push(
        `<line x1="0" y1="${(h / 10) * i}" x2="${w}" y2="${(h / 10) * i}" stroke="${hi}" stroke-width="1" opacity="${(
          0.04 + r() * 0.07
        ).toFixed(3)}"/>`,
        `<line x1="${(w / 10) * i}" y1="0" x2="${(w / 10) * i}" y2="${h}" stroke="${hi}" stroke-width="1" opacity="${(
          0.04 + r() * 0.07
        ).toFixed(3)}"/>`,
      );
    }
  } else {
    for (let i = 0; i < 7; i++) {
      const y = h * (0.15 + i * 0.12);
      p.push(
        `<path d="M${-w * 0.1} ${y} Q ${w * 0.25} ${y - h * 0.09} ${w * 0.5} ${y} T ${w * 1.1} ${y}" fill="none" stroke="${hi}" stroke-width="${(
          1 + r() * 2.5
        ).toFixed(2)}" opacity="${(0.07 + r() * 0.15).toFixed(3)}"/>`,
      );
    }
  }
  return p.join('');
}

for (const [name, tone, w, h, kind] of SHOTS) {
  const [c0, c1, c2, hi] = DUOTONES[tone];
  const r = rnd(name);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset=".55" stop-color="${c0}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
<radialGradient id="glow" cx="${(0.3 + r() * 0.45).toFixed(2)}" cy="${(0.25 + r() * 0.4).toFixed(2)}" r=".72">
<stop offset="0" stop-color="${hi}" stop-opacity=".62"/><stop offset=".45" stop-color="${c2}" stop-opacity=".38"/><stop offset="1" stop-color="${c0}" stop-opacity="0"/></radialGradient>
<radialGradient id="glow2" cx="${(0.55 + r() * 0.4).toFixed(2)}" cy="${(0.6 + r() * 0.35).toFixed(2)}" r=".6">
<stop offset="0" stop-color="${c2}" stop-opacity=".7"/><stop offset="1" stop-color="${c0}" stop-opacity="0"/></radialGradient>
<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
<filter id="soft"><feGaussianBlur stdDeviation="${Math.round(w * 0.04)}"/></filter>
</defs>
<rect width="${w}" height="${h}" fill="url(#g)"/>
<rect width="${w}" height="${h}" fill="url(#glow)"/>
<rect width="${w}" height="${h}" fill="url(#glow2)"/>
<g filter="url(#soft)" opacity=".75"><ellipse cx="${(w * (0.2 + r() * 0.6)).toFixed(0)}" cy="${(h * (0.2 + r() * 0.6)).toFixed(0)}" rx="${(w * 0.3).toFixed(0)}" ry="${(h * 0.26).toFixed(0)}" fill="${c2}" opacity=".7"/></g>
<g filter="url(#soft)" opacity=".5"><ellipse cx="${(w * (0.1 + r() * 0.35)).toFixed(0)}" cy="${(h * (0.55 + r() * 0.35)).toFixed(0)}" rx="${(w * 0.22).toFixed(0)}" ry="${(h * 0.18).toFixed(0)}" fill="${hi}" opacity=".35"/></g>
<g>${motion(kind, w, h, hi, r)}</g>
<rect width="${w}" height="${h}" filter="url(#grain)" opacity=".2" style="mix-blend-mode:overlay"/>
<rect width="${w}" height="${h}" fill="${c0}" opacity=".06"/>
</svg>`;
  writeFileSync(resolve(OUT, `${name}.svg`), svg.replace(/\n/g, ''));
}

console.log(`✓ ${SHOTS.length} placeholder generati in assets/images`);
