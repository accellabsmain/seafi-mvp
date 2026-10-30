"use client";

import { Zap } from "lucide-react";
import React, { useMemo } from "react";

interface QrCodeMatrixProps {
  value: string;
  size?: number;
  label?: string;
}

export default function QrCodeMatrix({
  value,
  size = 196,
  label,
}: QrCodeMatrixProps) {
  const gridSize = 21;

  const cells = useMemo(() => {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i++) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }

    const matrix: boolean[][] = Array.from({ length: gridSize }, () =>
      Array<boolean>(gridSize).fill(false)
    );

    const isFinder = (r: number, c: number, top: number, left: number) => {
      const dr = r - top;
      const dc = c - left;
      if (dr < 0 || dr > 6 || dc < 0 || dc > 6) return null;
      if (dr === 0 || dr === 6 || dc === 0 || dc === 6) return true;
      if (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4) return true;
      return false;
    };

    let seed = Math.abs(hash) || 1234567;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Reserve center for logo
        if (r >= 8 && r <= 12 && c >= 8 && c <= 12) {
          matrix[r][c] = false;
          continue;
        }
        // Quiet zone around finders
        if (
          (r <= 7 && c <= 7) ||
          (r <= 7 && c >= gridSize - 8) ||
          (r >= gridSize - 8 && c <= 7)
        ) {
          const tl = isFinder(r, c, 0, 0);
          const tr = isFinder(r, c, 0, gridSize - 7);
          const bl = isFinder(r, c, gridSize - 7, 0);
          matrix[r][c] = Boolean(tl || tr || bl);
          continue;
        }

        seed = (seed * 1664525 + 1013904223) >>> 0;
        matrix[r][c] = (seed & 3) !== 0 && ((seed >> 3) & 1) === 1;
      }
    }
    return matrix;
  }, [value]);

  const cellPx = size / gridSize;

  return (
    <div className="inline-flex flex-col items-center">
      <div
        className="relative bg-white p-3.5 rounded-2xl border border-[#DCE0D4] shadow-sm"
        style={{ width: size + 28, height: size + 28 }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={label || "SEAFI Payment QR Code"}
        >
          <rect width={size} height={size} fill="#FFFFFF" rx={8} />
          {cells.map((row, r) =>
            row.map((filled, c) =>
              filled ? (
                <rect
                  key={`${r}-${c}`}
                  x={c * cellPx + 0.5}
                  y={r * cellPx + 0.5}
                  width={Math.max(1, cellPx - 1)}
                  height={Math.max(1, cellPx - 1)}
                  rx={2}
                  fill="#0B3B24"
                />
              ) : null
            )
          )}
        </svg>

        {/* Center SEAFI Badge */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 rounded-xl bg-[#0B3B24] border-2 border-white shadow-md flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#93E937] fill-[#93E937]" />
          </div>
        </div>
      </div>
      {label && (
        <span className="mt-2 font-mono text-[11px] text-[#525B68]">
          {label}
        </span>
      )}
    </div>
  );
}
