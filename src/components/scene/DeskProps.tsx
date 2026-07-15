/**
 * Pixel-art desk items, NimbleBit-style: outlined, 2-3 shading tones,
 * instantly recognizable, text sized to fit its plaque (Press Start 2P
 * advances ~1em per character, so plaqueWidth >= chars * fontSize + padding).
 *
 * Left: green banker's lamp, red hotline phone, MSGA cap, executive orders.
 * Right: "EMPLOYEE OF THE MONTH: ME" standing frame, Diet Cola can,
 * "100% LEGAL" mug, a small cactus.
 */

export function DeskPropsLeft({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 190" shapeRendering="crispEdges" aria-hidden>
      {/* --- Green banker's lamp --- */}
      {/* shade (outlined emerald) */}
      <rect x="6" y="84" width="64" height="6" fill="#0d3d20" />
      <rect x="10" y="90" width="56" height="14" fill="#14663a" />
      <rect x="10" y="90" width="56" height="4" fill="#1f8a4f" />
      <rect x="6" y="104" width="64" height="4" fill="#0d3d20" />
      {/* warm light spilling below the shade */}
      <rect x="14" y="108" width="48" height="8" fill="#fff2c4" opacity="0.5" />
      {/* brass stem + arm */}
      <rect x="34" y="80" width="8" height="6" fill="#b8860b" />
      <rect x="34" y="108" width="8" height="42" fill="#d9a520" />
      <rect x="36" y="108" width="3" height="42" fill="#eebc3a" />
      {/* pull chain */}
      <rect x="56" y="108" width="3" height="12" fill="#d9a520" />
      <rect x="55" y="120" width="5" height="5" fill="#b8860b" />
      {/* base */}
      <rect x="18" y="150" width="40" height="6" fill="#d9a520" />
      <rect x="14" y="156" width="48" height="6" fill="#b8860b" />

      {/* --- Red hotline phone --- */}
      {/* body (outlined) */}
      <rect x="82" y="106" width="94" height="56" fill="#7a0d12" />
      <rect x="86" y="110" width="86" height="48" fill="#c1272d" />
      <rect x="86" y="110" width="86" height="8" fill="#e5333a" />
      {/* handset resting on top */}
      <rect x="88" y="92" width="20" height="16" fill="#7a0d12" />
      <rect x="150" y="92" width="20" height="16" fill="#7a0d12" />
      <rect x="102" y="96" width="54" height="10" fill="#7a0d12" />
      <rect x="104" y="98" width="50" height="4" fill="#a5121c" />
      {/* keypad */}
      <rect x="94" y="122" width="10" height="8" fill="#fdf6e3" />
      <rect x="108" y="122" width="10" height="8" fill="#fdf6e3" />
      <rect x="122" y="122" width="10" height="8" fill="#fdf6e3" />
      <rect x="94" y="134" width="10" height="8" fill="#fdf6e3" />
      <rect x="108" y="134" width="10" height="8" fill="#fdf6e3" />
      <rect x="122" y="134" width="10" height="8" fill="#fdf6e3" />
      {/* label: "HOTLINE" = 7 chars * 6px = 42px, plate is 62px wide */}
      <rect x="136" y="126" width="34" height="26" fill="#a5121c" />
      <rect x="94" y="146" width="62" height="12" fill="#ffd76a" />
      <text x="125" y="155" textAnchor="middle" fontSize="6" fill="#5a0a0e" fontFamily="var(--font-pixel), monospace">
        HOTLINE
      </text>
      {/* coiled cord */}
      <rect x="176" y="128" width="4" height="4" fill="#5a0a0e" />
      <rect x="180" y="124" width="4" height="4" fill="#5a0a0e" />
      <rect x="184" y="128" width="4" height="4" fill="#5a0a0e" />
      <rect x="188" y="124" width="4" height="4" fill="#5a0a0e" />

      {/* --- MSGA cap --- */}
      {/* crown (outlined) */}
      <rect x="188" y="112" width="48" height="8" fill="#7a0d12" />
      <rect x="190" y="104" width="44" height="10" fill="#d61f26" />
      <rect x="194" y="96" width="36" height="10" fill="#d61f26" />
      <rect x="198" y="92" width="28" height="6" fill="#e5333a" />
      {/* brim */}
      <rect x="186" y="118" width="34" height="8" fill="#a5121c" />
      {/* "MSGA" = 4 chars * 6px = 24px on a 44px front panel */}
      <text x="212" y="112" textAnchor="middle" fontSize="6" fill="#fff" fontFamily="var(--font-pixel), monospace">
        MSGA
      </text>

      {/* --- Executive orders folder + gold pen --- */}
      {/* "EXECUTIVE ORDERS" = 16 chars * 7px = 112px, folder is 196px wide */}
      <rect x="18" y="164" width="200" height="13" fill="#8a6a2a" />
      <rect x="20" y="166" width="196" height="11" fill="#e8c87a" />
      <rect x="14" y="177" width="208" height="11" fill="#dfbc64" />
      <text x="118" y="175" textAnchor="middle" fontSize="7" fill="#6b4a12" fontFamily="var(--font-pixel), monospace">
        EXECUTIVE ORDERS
      </text>
      <rect x="186" y="156" width="32" height="4" fill="#d9a520" />
      <rect x="216" y="155" width="5" height="6" fill="#b8860b" />
    </svg>
  );
}

export function DeskPropsRight({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 210 190" shapeRendering="crispEdges" aria-hidden>
      {/* --- Standing frame: EMPLOYEE OF MONTH: ME --- */}
      {/* "EMPLOYEE" / "OF MONTH" = 8 chars * 7px = 56px, mat is 80px wide */}
      <rect x="8" y="50" width="104" height="78" fill="#8a5a10" />
      <rect x="12" y="54" width="96" height="70" fill="#d9a520" />
      <rect x="18" y="60" width="84" height="58" fill="#fdf6e3" />
      <text x="60" y="76" textAnchor="middle" fontSize="7" fill="#333" fontFamily="var(--font-pixel), monospace">
        EMPLOYEE
      </text>
      <text x="60" y="90" textAnchor="middle" fontSize="7" fill="#333" fontFamily="var(--font-pixel), monospace">
        OF MONTH
      </text>
      <text x="60" y="108" textAnchor="middle" fontSize="8" fill="#c1272d" fontFamily="var(--font-pixel), monospace">
        * ME *
      </text>
      {/* kickstand */}
      <rect x="106" y="100" width="8" height="28" fill="#8a5a10" />

      {/* --- Diet cola can --- */}
      {/* can body (outlined silver) */}
      <rect x="128" y="62" width="42" height="64" fill="#6e747e" />
      <rect x="132" y="66" width="34" height="56" fill="#c9ccd4" />
      <rect x="134" y="66" width="6" height="56" fill="#e4e7ec" />
      {/* top + tab */}
      <rect x="130" y="58" width="38" height="8" fill="#9aa0a8" />
      <rect x="144" y="54" width="12" height="5" fill="#9aa0a8" />
      {/* red script ribbon (the "wave") */}
      <rect x="132" y="88" width="34" height="5" fill="#d61f26" />
      <rect x="138" y="84" width="10" height="5" fill="#d61f26" />
      <rect x="152" y="92" width="10" height="5" fill="#d61f26" />
      {/* "DIET" = 4 chars * 5px = 20px on a 34px face */}
      <text x="149" y="80" textAnchor="middle" fontSize="5" fill="#d61f26" fontFamily="var(--font-pixel), monospace">
        DIET
      </text>
      <text x="149" y="110" textAnchor="middle" fontSize="5" fill="#6e747e" fontFamily="var(--font-pixel), monospace">
        COLA
      </text>

      {/* --- "100% LEGAL" mug --- */}
      {/* "LEGAL" = 5 chars * 7px = 35px, mug face is 44px wide */}
      <rect x="10" y="134" width="52" height="46" fill="#b3b3b3" />
      <rect x="14" y="138" width="44" height="38" fill="#f5f5f5" />
      <rect x="62" y="144" width="12" height="22" fill="#b3b3b3" />
      <rect x="65" y="148" width="6" height="14" fill="#e4d0a4" />
      <rect x="14" y="138" width="44" height="7" fill="#3a2503" />
      <text x="36" y="158" textAnchor="middle" fontSize="7" fill="#c1272d" fontFamily="var(--font-pixel), monospace">
        100%
      </text>
      <text x="36" y="170" textAnchor="middle" fontSize="7" fill="#c1272d" fontFamily="var(--font-pixel), monospace">
        LEGAL
      </text>

      {/* --- Small potted cactus (a perfectly normal desk plant) --- */}
      {/* pot */}
      <rect x="150" y="156" width="44" height="8" fill="#8a4a24" />
      <rect x="154" y="164" width="36" height="18" fill="#a85c2e" />
      <rect x="154" y="164" width="36" height="4" fill="#c06a36" />
      {/* cactus with arms */}
      <rect x="166" y="118" width="12" height="40" fill="#2c7a38" />
      <rect x="168" y="118" width="4" height="40" fill="#3c9a4a" />
      <rect x="154" y="130" width="8" height="6" fill="#2c7a38" />
      <rect x="154" y="122" width="6" height="12" fill="#2c7a38" />
      <rect x="182" y="138" width="8" height="6" fill="#2c7a38" />
      <rect x="184" y="128" width="6" height="14" fill="#2c7a38" />
      {/* flower on top */}
      <rect x="168" y="112" width="8" height="6" fill="#e86aa0" />
    </svg>
  );
}
