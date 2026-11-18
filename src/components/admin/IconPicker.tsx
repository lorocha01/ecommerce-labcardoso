import type { ArtTone } from '@/types'
import { DynamicIcon, ICONS } from '@/components/ui/Icon'
import { TONES } from '@/components/product/ProductArt'
import { cn } from '@/lib/utils'

export function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <span className="field-label">Ícone</span>
      <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10">
        {Object.entries(ICONS).map(([key, { label }]) => (
          <button key={key} type="button" title={label} onClick={() => onChange(key)} aria-pressed={value === key} className={cn('grid aspect-square place-items-center rounded-lg ring-1 ring-inset transition', value === key ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-ink-600 ring-ink-200 hover:ring-ink-300')}>
            <DynamicIcon name={key} className="h-[18px] w-[18px]" />
          </button>
        ))}
      </div>
    </div>
  )
}

export function TonePicker({ value, onChange }: { value: ArtTone; onChange: (v: ArtTone) => void }) {
  return (
    <div>
      <span className="field-label">Cor da ilustração</span>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(TONES) as ArtTone[]).map((t) => (
          <button key={t} type="button" onClick={() => onChange(t)} aria-pressed={value === t} className={cn('flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-3 text-xs font-semibold ring-1 ring-inset transition', value === t ? 'ring-2 ring-ink-900' : 'ring-ink-200 hover:ring-ink-300')}>
            <span className={cn('h-6 w-6 rounded-md bg-gradient-to-br', TONES[t].bg)} />
            {TONES[t].label}
          </button>
        ))}
      </div>
    </div>
  )
}
