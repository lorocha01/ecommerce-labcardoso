import { useEffect } from 'react'
import { useStore } from '@/store'

export function useDocumentTitle(title: string) {
  const name = useStore((s) => s.settings.storeName)
  useEffect(() => {
    document.title = title ? `${title} · ${name}` : name
  }, [title, name])
}
