import { createRandom } from '@/lib/random'

/**
 * QR Code puramente ILUSTRATIVO (padrão aleatório determinístico).
 * Não codifica nenhum dado e não pode ser pago.
 */
export function FakeQr({ seed, size = 200 }: { seed: string; size?: number }) {
  const n = 29
  const rand = createRandom([...seed].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0)
  const cells: [number, number][] = []
  const inFinder = (x: number, y: number) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9)
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!inFinder(x, y) && rand.next() > 0.52) cells.push([x, y])
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width="7" height="7" rx="1.6" fill="#1C1514" />
      <rect x={x + 1} y={y + 1} width="5" height="5" rx="1.1" fill="#fff" />
      <rect x={x + 2} y={y + 2} width="3" height="3" rx=".8" fill="#BB2026" />
    </g>
  )
  return (
    <div className="relative inline-block rounded-2xl bg-white p-3 ring-1 ring-ink-100" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${n} ${n}`} className="h-full w-full" role="img" aria-label="QR Code ilustrativo, sem valor de pagamento">
        {cells.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x + 0.08} y={y + 0.08} width=".84" height=".84" rx=".22" fill="#1C1514" />
        ))}
        {finder(0, 0)}
        {finder(n - 7, 0)}
        {finder(0, n - 7)}
      </svg>
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-md bg-brand-600 px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-brand">Demonstrativo</span>
    </div>
  )
}
