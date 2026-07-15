/**
 * Pixel-art Oval Office backdrop on a 960x540 grid, NimbleBit-style:
 * every object dark-outlined and instantly recognizable, 2-3 shading tones,
 * text always fitted inside its plaque (Press Start 2P advances ~1em/char).
 *
 * Left wall: grandfather clock, gold-framed landscape, CLASSIFIED boxes.
 * Right wall: DOW 100K frame, golf scorecard, bust in a red cap, putting
 * green, golf bag. Center: night windows (mostly behind the laptop).
 */

function Window({ x }: { x: number }) {
  return (
    <g>
      {/* valance */}
      <rect x={x - 24} y="86" width="158" height="24" fill="#8a5a10" />
      <rect x={x - 22} y="88" width="154" height="20" fill="#d9a520" />
      {[0, 38, 76, 114].map((sx) => (
        <rect key={sx} x={x - 22 + sx} y="104" width="20" height="6" fill="#b8860b" />
      ))}
      {/* drapes */}
      <rect x={x - 24} y="86" width="26" height="294" fill="#8a5a10" />
      <rect x={x - 22} y="88" width="22" height="290" fill="#d9a520" />
      <rect x={x - 12} y="88" width="5" height="290" fill="#b8860b" />
      <rect x={x - 22} y="88" width="4" height="290" fill="#eebc3a" />
      <rect x={x + 108} y="86" width="26" height="294" fill="#8a5a10" />
      <rect x={x + 110} y="88" width="22" height="290" fill="#d9a520" />
      <rect x={x + 117} y="88" width="5" height="290" fill="#b8860b" />
      <rect x={x + 128} y="88" width="4" height="290" fill="#eebc3a" />
      {/* frame + glass */}
      <rect x={x - 8} y="94" width="126" height="268" fill="#c9b183" />
      <rect x={x - 6} y="96" width="122" height="264" fill="#f8f2e0" />
      <rect x={x} y="102" width="110" height="240" fill="#141f38" />
      {/* stars */}
      {[
        [14, 118], [78, 132], [40, 112], [96, 156], [22, 170], [64, 190], [88, 116],
      ].map(([sx, sy]) => (
        <rect key={`${sx}-${sy}`} x={x + sx} y={sy} width="3" height="3" fill="#eef2ff" />
      ))}
      {/* lawn */}
      <rect x={x} y="300" width="110" height="42" fill="#1c3826" />
      <rect x={x + 10} y="282" width="26" height="20" fill="#234430" />
      <rect x={x + 70} y="288" width="24" height="16" fill="#234430" />
      {/* mullions */}
      <rect x={x + 52} y="102" width="6" height="240" fill="#f8f2e0" />
      <rect x={x} y="158" width="110" height="5" fill="#f8f2e0" />
      <rect x={x} y="218" width="110" height="5" fill="#f8f2e0" />
      <rect x={x} y="278" width="110" height="5" fill="#f8f2e0" />
    </g>
  );
}

/** Plain NimbleBit-style sofa: outlined, two cushions, two solid pillows. */
function Sofa({ x }: { x: number }) {
  return (
    <g>
      {/* outline */}
      <rect x={x - 16} y="376" width="232" height="92" fill="#4a3014" />
      {/* back */}
      <rect x={x - 2} y="380" width="204" height="44" fill="#d9b98a" />
      <rect x={x - 2} y="380" width="204" height="8" fill="#e8cea6" />
      {/* arms */}
      <rect x={x - 12} y="392" width="18" height="72" fill="#e0c092" />
      <rect x={x + 194} y="392" width="18" height="72" fill="#e0c092" />
      {/* seat cushions */}
      <rect x={x + 6} y="424" width="92" height="26" fill="#cfa976" />
      <rect x={x + 102} y="424" width="92" height="26" fill="#cfa976" />
      <rect x={x + 6} y="424" width="92" height="6" fill="#dcb886" />
      <rect x={x + 102} y="424" width="92" height="6" fill="#dcb886" />
      {/* skirt + legs */}
      <rect x={x - 2} y="450" width="204" height="14" fill="#c19b66" />
      <rect x={x + 2} y="464" width="12" height="8" fill="#4a3014" />
      <rect x={x + 186} y="464" width="12" height="8" fill="#4a3014" />
      {/* pillows */}
      <rect x={x + 16} y="392" width="40" height="34" fill="#9a2b20" />
      <rect x={x + 20} y="396" width="32" height="26" fill="#b8382a" />
      <rect x={x + 144} y="392" width="40" height="34" fill="#17265c" />
      <rect x={x + 148} y="396" width="32" height="26" fill="#22357c" />
    </g>
  );
}

export default function OvalOfficeBackdrop({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 960 540"
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      aria-hidden
    >
      {/* ---- Ceiling + curved cove ---- */}
      <rect x="0" y="0" width="960" height="60" fill="#f9f2de" />
      <ellipse cx="480" cy="-300" rx="760" ry="368" fill="#fbf6e8" />
      <rect x="0" y="56" width="960" height="10" fill="#efe2c2" />
      {[...Array(30)].map((_, i) => (
        <rect key={i} x={i * 32 + 6} y="58" width="14" height="6" fill="#d8c496" />
      ))}
      <rect x="0" y="66" width="960" height="4" fill="#cdb684" />

      {/* ---- Walls ---- */}
      <rect x="0" y="70" width="960" height="330" fill="#efdfba" />
      {/* chair rail + wainscot + baseboard */}
      <rect x="0" y="400" width="960" height="8" fill="#c9ab6e" />
      <rect x="0" y="408" width="960" height="132" fill="#e4d0a4" />
      {[...Array(12)].map((_, i) => (
        <rect key={i} x={i * 80 + 36} y="420" width="5" height="96" fill="#cdb17c" />
      ))}
      <rect x="0" y="520" width="960" height="20" fill="#c9ab6e" />
      <rect x="0" y="516" width="960" height="4" fill="#b3945a" />

      {/* ---- Chandelier ---- */}
      <rect x="476" y="0" width="8" height="18" fill="#b8860b" />
      <rect x="444" y="18" width="72" height="10" fill="#8a5a10" />
      <rect x="446" y="19" width="68" height="8" fill="#d9a520" />
      {[440, 470, 500, 528].map((x) => (
        <g key={x}>
          <rect x={x} y="28" width="10" height="10" fill="#fff2b0" />
          <rect x={x - 3} y="26" width="16" height="14" fill="#fff7d6" opacity="0.4" />
        </g>
      ))}

      {/* ---- Windows (mostly behind the laptop) ---- */}
      <Window x={280} />
      <Window x={425} />
      <Window x={570} />
      {/* moon */}
      <rect x="300" y="120" width="18" height="18" fill="#f4eeda" />
      <rect x="304" y="124" width="6" height="6" fill="#e2d9bd" />
      {/* Washington Monument */}
      <rect x="472" y="206" width="14" height="96" fill="#42506e" />
      <rect x="475" y="194" width="8" height="12" fill="#42506e" />
      <rect x="477" y="186" width="4" height="8" fill="#42506e" />
      <rect x="477" y="216" width="4" height="4" fill="#ff4040" />

      {/* ---- Presidential seal ---- */}
      <circle cx="480" cy="76" r="21" fill="#8a5a10" />
      <circle cx="480" cy="76" r="19" fill="#d9a520" />
      <circle cx="480" cy="76" r="15" fill="#1f2a6e" />
      <rect x="473" y="66" width="14" height="14" fill="#d9a520" />
      <rect x="468" y="73" width="24" height="5" fill="#d9a520" />
      <rect x="476" y="62" width="8" height="6" fill="#d9a520" />

      {/* ---- Flags ---- */}
      <g>
        <rect x="206" y="96" width="6" height="300" fill="#8a6d3b" />
        <rect x="202" y="86" width="14" height="10" fill="#ffd76a" />
        <rect x="210" y="104" width="90" height="58" fill="#7a6540" />
        <rect x="212" y="106" width="86" height="54" fill="#f5f5f5" />
        {[0, 12, 24, 36, 48].map((sy) => (
          <rect key={sy} x="212" y={106 + sy} width="86" height="6" fill="#c1272d" />
        ))}
        <rect x="212" y="106" width="36" height="28" fill="#1f3a93" />
        {[
          [216, 110], [226, 110], [236, 110], [221, 117], [231, 117],
          [216, 124], [226, 124], [236, 124],
        ].map(([sx, sy]) => (
          <rect key={`${sx}-${sy}`} x={sx} y={sy} width="4" height="4" fill="#fff" />
        ))}
        <rect x="212" y="160" width="86" height="5" fill="#ffd76a" />
      </g>
      <g>
        <rect x="748" y="96" width="6" height="300" fill="#8a6d3b" />
        <rect x="744" y="86" width="14" height="10" fill="#ffd76a" />
        <rect x="660" y="104" width="90" height="58" fill="#131c4d" />
        <rect x="662" y="106" width="86" height="54" fill="#22307a" />
        <circle cx="705" cy="133" r="16" fill="#d9a520" />
        <circle cx="705" cy="133" r="11" fill="#22307a" />
        <rect x="698" y="126" width="14" height="10" fill="#d9a520" />
        <rect x="693" y="131" width="24" height="4" fill="#d9a520" />
        <rect x="662" y="160" width="86" height="5" fill="#ffd76a" />
      </g>

      {/* ================= LEFT WALL ================= */}

      {/* --- Grandfather clock (real Oval Office staple) --- */}
      {/* outline/case */}
      <rect x="8" y="116" width="56" height="286" fill="#3a2208" />
      <rect x="12" y="120" width="48" height="278" fill="#6b3f1a" />
      {/* crown */}
      <rect x="4" y="108" width="64" height="10" fill="#3a2208" />
      <rect x="8" y="110" width="56" height="8" fill="#8a5a2b" />
      <rect x="28" y="98" width="16" height="12" fill="#8a5a2b" />
      <rect x="32" y="94" width="8" height="6" fill="#d9a520" />
      {/* face */}
      <rect x="16" y="128" width="40" height="44" fill="#3a2208" />
      <circle cx="36" cy="150" r="17" fill="#fdf6e3" />
      <circle cx="36" cy="150" r="2" fill="#3a2208" />
      {/* hands at 10:10 */}
      <rect x="28" y="142" width="8" height="3" fill="#3a2208" />
      <rect x="36" y="140" width="3" height="10" fill="#3a2208" />
      {/* tick marks */}
      <rect x="34" y="135" width="4" height="3" fill="#8a6d3b" />
      <rect x="34" y="162" width="4" height="3" fill="#8a6d3b" />
      <rect x="21" y="148" width="3" height="4" fill="#8a6d3b" />
      <rect x="48" y="148" width="3" height="4" fill="#8a6d3b" />
      {/* pendulum window */}
      <rect x="18" y="180" width="36" height="180" fill="#3a2208" />
      <rect x="22" y="184" width="28" height="172" fill="#241505" />
      <rect x="34" y="188" width="4" height="120" fill="#b8860b" />
      <circle cx="36" cy="318" r="11" fill="#d9a520" />
      <circle cx="33" cy="315" r="3" fill="#eebc3a" />
      {/* weights */}
      <rect x="26" y="230" width="6" height="18" fill="#d9a520" />
      <rect x="40" y="238" width="6" height="18" fill="#d9a520" />
      {/* feet */}
      <rect x="12" y="398" width="12" height="8" fill="#3a2208" />
      <rect x="48" y="398" width="12" height="8" fill="#3a2208" />

      {/* --- Gold-framed landscape painting --- */}
      <rect x="72" y="96" width="100" height="80" fill="#8a5a10" />
      <rect x="76" y="100" width="92" height="72" fill="#d9a520" />
      <rect x="82" y="106" width="80" height="60" fill="#8ec6e8" />
      {/* clouds */}
      <rect x="90" y="112" width="18" height="6" fill="#fdfdf5" />
      <rect x="96" y="108" width="10" height="4" fill="#fdfdf5" />
      <rect x="132" y="118" width="16" height="5" fill="#fdfdf5" />
      {/* mountains with snow caps */}
      <rect x="86" y="134" width="28" height="18" fill="#6b7a8c" />
      <rect x="94" y="126" width="12" height="10" fill="#6b7a8c" />
      <rect x="96" y="124" width="8" height="5" fill="#f5f5f5" />
      <rect x="118" y="130" width="32" height="22" fill="#7c8ba0" />
      <rect x="128" y="122" width="12" height="10" fill="#7c8ba0" />
      <rect x="130" y="120" width="8" height="5" fill="#f5f5f5" />
      {/* meadow + river */}
      <rect x="82" y="150" width="80" height="16" fill="#4c8a44" />
      <rect x="108" y="152" width="10" height="14" fill="#4f9ed9" />
      <rect x="116" y="158" width="8" height="8" fill="#4f9ed9" />

      {/* --- CLASSIFIED document boxes (very securely stored) --- */}
      {/* bottom box */}
      <rect x="76" y="368" width="100" height="60" fill="#6b4a1c" />
      <rect x="80" y="372" width="92" height="52" fill="#b98a4e" />
      <rect x="80" y="372" width="92" height="10" fill="#a3763c" />
      <rect x="88" y="392" width="76" height="16" fill="#fdf6e3" />
      <text x="126" y="404" textAnchor="middle" fontSize="6" fill="#c1272d" fontFamily="var(--font-pixel), monospace">
        CLASSIFIED
      </text>
      {/* top box, slightly offset */}
      <rect x="86" y="310" width="100" height="60" fill="#6b4a1c" />
      <rect x="90" y="314" width="92" height="52" fill="#b98a4e" />
      <rect x="90" y="314" width="92" height="10" fill="#a3763c" />
      <rect x="98" y="334" width="76" height="16" fill="#fdf6e3" />
      <text x="136" y="346" textAnchor="middle" fontSize="6" fill="#c1272d" fontFamily="var(--font-pixel), monospace">
        TOP SECRET
      </text>
      {/* a leaked page sticking out */}
      <rect x="166" y="300" width="14" height="18" fill="#fdf6e3" />
      <rect x="169" y="304" width="8" height="2" fill="#9aa0a6" />
      <rect x="169" y="308" width="8" height="2" fill="#9aa0a6" />

      {/* ================= RIGHT WALL ================= */}

      {/* sofa sliver behind the phone */}
      <Sofa x={606} />

      {/* --- picture light + DOW 100K gold frame --- */}
      <rect x="822" y="86" width="56" height="6" fill="#b8860b" />
      <rect x="826" y="92" width="48" height="10" fill="#fff2c4" opacity="0.45" />
      <rect x="800" y="98" width="100" height="92" fill="#8a5a10" />
      <rect x="804" y="102" width="92" height="84" fill="#d9a520" />
      <rect x="810" y="108" width="80" height="72" fill="#fdfdf5" />
      <text x="850" y="124" textAnchor="middle" fontSize="10" fill="#111" fontFamily="var(--font-pixel), monospace">
        DOW
      </text>
      <text x="850" y="138" textAnchor="middle" fontSize="9" fill="#0a8f2e" fontFamily="var(--font-pixel), monospace">
        100K
      </text>
      {/* chart that only goes up */}
      <rect x="814" y="168" width="10" height="8" fill="#0a8f2e" />
      <rect x="824" y="162" width="10" height="14" fill="#0a8f2e" />
      <rect x="834" y="156" width="10" height="20" fill="#0a8f2e" />
      <rect x="844" y="150" width="10" height="26" fill="#0a8f2e" />
      <rect x="854" y="144" width="10" height="32" fill="#0a8f2e" />
      <rect x="864" y="148" width="12" height="4" fill="#c1272d" />
      <rect x="868" y="144" width="4" height="8" fill="#c1272d" />

      {/* --- framed golf scorecard --- */}
      <rect x="806" y="206" width="88" height="64" fill="#5a3c14" />
      <rect x="810" y="210" width="80" height="56" fill="#8a6d3b" />
      <rect x="814" y="214" width="72" height="48" fill="#fdf6e3" />
      <text x="850" y="228" textAnchor="middle" fontSize="6" fill="#333" fontFamily="var(--font-pixel), monospace">
        SCORECARD
      </text>
      <text x="850" y="242" textAnchor="middle" fontSize="6" fill="#0a8f2e" fontFamily="var(--font-pixel), monospace">
        18 HOLES
      </text>
      <text x="850" y="256" textAnchor="middle" fontSize="6" fill="#c1272d" fontFamily="var(--font-pixel), monospace">
        18 UNDER
      </text>

      {/* --- marble bust wearing the red cap --- */}
      <rect x="774" y="330" width="48" height="76" fill="#a3885c" />
      <rect x="778" y="334" width="40" height="68" fill="#e8d8b0" />
      <rect x="770" y="322" width="56" height="10" fill="#8a6d3b" />
      {/* head + shoulders */}
      <rect x="784" y="292" width="28" height="30" fill="#ded6c2" />
      <rect x="778" y="314" width="40" height="10" fill="#ded6c2" />
      <rect x="790" y="300" width="4" height="4" fill="#a89f8a" />
      <rect x="802" y="300" width="4" height="4" fill="#a89f8a" />
      <rect x="794" y="310" width="8" height="3" fill="#c4bba4" />
      {/* red cap */}
      <rect x="782" y="282" width="32" height="10" fill="#d61f26" />
      <rect x="786" y="276" width="24" height="8" fill="#e5333a" />
      <rect x="776" y="288" width="12" height="5" fill="#a5121c" />

      {/* --- putting green with flag + ball --- */}
      <rect x="828" y="452" width="104" height="10" fill="#1e5a28" />
      <rect x="834" y="446" width="92" height="10" fill="#2c7a38" />
      <rect x="842" y="442" width="76" height="6" fill="#2c7a38" />
      {/* hole + flag */}
      <rect x="900" y="448" width="10" height="5" fill="#12200f" />
      <rect x="904" y="404" width="3" height="44" fill="#d8d0bc" />
      <rect x="907" y="404" width="14" height="10" fill="#d61f26" />
      {/* ball */}
      <rect x="848" y="446" width="6" height="6" fill="#fdfdf5" />

      {/* --- golf bag with putter leaning on it --- */}
      <rect x="916" y="326" width="38" height="96" fill="#7a1418" />
      <rect x="920" y="330" width="30" height="88" fill="#c1272d" />
      <rect x="920" y="352" width="30" height="12" fill="#f5f5f5" />
      <rect x="920" y="392" width="30" height="8" fill="#8a1216" />
      {/* clubs */}
      <rect x="926" y="298" width="4" height="34" fill="#9aa0a6" />
      <rect x="934" y="292" width="4" height="40" fill="#9aa0a6" />
      <rect x="942" y="302" width="4" height="30" fill="#9aa0a6" />
      <rect x="922" y="292" width="10" height="8" fill="#5f6368" />
      <rect x="931" y="286" width="10" height="8" fill="#5f6368" />
      {/* putter leaning against bag */}
      <rect x="908" y="352" width="3" height="70" fill="#9aa0a6" />
      <rect x="904" y="418" width="10" height="6" fill="#5f6368" />
      <rect x="907" y="346" width="5" height="8" fill="#16181d" />
    </svg>
  );
}
