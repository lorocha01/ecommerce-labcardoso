import { useRef, useState } from 'react'
import { ImagePlus, Link2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { fileToCompressedDataUrl } from '@/lib/image'

/** Campo de imagem: URL externa ou upload (convertido para Data URL local). */
export function ImageField({ value, onChange, label = 'Imagem', maxSize = 900 }: { value?: string; onChange: (v: string | undefined) => void; label?: string; maxSize?: number }) {
  const input = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState(value && !value.startsWith('data:') ? value : '')
  return (
    <div>
      <span className="field-label">{label}</span>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="grid h-24 w-full shrink-0 place-items-center overflow-hidden rounded-xl bg-ink-50 ring-1 ring-inset ring-ink-200 sm:w-32">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-6 w-6 text-ink-300" />}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <label className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={() => url.trim() && onChange(url.trim())}
                placeholder="https://… (URL da imagem)"
                className="field field-sm pl-9"
              />
            </label>
            <button type="button" onClick={() => url.trim() && onChange(url.trim())} className="h-10 rounded-lg bg-ink-900 px-3 text-xs font-bold text-white">
              Usar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => input.current?.click()} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-ink-700 ring-1 ring-inset ring-ink-200 hover:bg-ink-50">
              <ImagePlus className="h-3.5 w-3.5" /> Enviar arquivo
            </button>
            {value && (
              <button type="button" onClick={() => (onChange(undefined), setUrl(''))} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200 hover:bg-brand-50">
                <Trash2 className="h-3.5 w-3.5" /> Remover imagem
              </button>
            )}
          </div>
          <p className="text-xs text-ink-400">Sem imagem, a ilustração padrão (ícone + cor) é exibida. Arquivos são comprimidos e salvos no navegador.</p>
        </div>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (!file) return
          try {
            const data = await fileToCompressedDataUrl(file, maxSize)
            if (data.length > 1_200_000) return toast.error('Imagem muito grande mesmo após compressão. Use uma imagem menor.')
            onChange(data)
            setUrl('')
          } catch (err) {
            toast.error((err as Error).message)
          }
        }}
      />
    </div>
  )
}
