'use client'
import { formatTokens } from '@/lib/formatters'

interface TokenGaugeProps {
  input: number
  output: number
  cacheHit?: number
  size?: number
}

export function TokenGauge({ input, output, cacheHit = 0, size = 120 }: TokenGaugeProps) {
  const total = input + output
  const inputPct = total > 0 ? (input / total) * 100 : 50
  const outputPct = total > 0 ? (output / total) * 100 : 50

  const r = (size / 2) - 12
  const circ = 2 * Math.PI * r
  const cx = size / 2
  const cy = size / 2

  const inputArc = (inputPct / 100) * circ
  const outputArc = (outputPct / 100) * circ

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size}>
        {/* Background */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
        {/* Input tokens - blue */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="#007AFF"
          strokeWidth={8}
          strokeDasharray={`${inputArc} ${circ - inputArc}`}
          strokeDashoffset={circ * 0.25}
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 4px #007AFF60)' }}
        />
        {/* Output tokens - purple */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="#BF5AF2"
          strokeWidth={8}
          strokeDasharray={`${outputArc} ${circ - outputArc}`}
          strokeDashoffset={circ * 0.25 - inputArc}
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 4px #BF5AF260)' }}
        />
        {/* Center text */}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#e8e8f0" fontSize={11} fontWeight={600}>
          {formatTokens(total)}
        </text>
        <text x={cx} y={cy + 8} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={9}>
          total
        </text>
      </svg>
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-blue" />
          <span className="text-white/60">In</span>
          <span className="ml-auto font-mono font-medium">{formatTokens(input)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-purple" />
          <span className="text-white/60">Out</span>
          <span className="ml-auto font-mono font-medium">{formatTokens(output)}</span>
        </div>
        {cacheHit > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-accent-green" />
            <span className="text-white/60">Cache</span>
            <span className="ml-auto font-mono font-medium">{cacheHit}%</span>
          </div>
        )}
      </div>
    </div>
  )
}
