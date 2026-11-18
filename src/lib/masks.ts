import { onlyDigits } from './utils'

export const maskCPF = (v: string) =>
  onlyDigits(v)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')

export const maskPhone = (v: string) => {
  const d = onlyDigits(v).slice(0, 11)
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2')
  return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2')
}

export const maskCEP = (v: string) => onlyDigits(v).slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2')
export const maskCard = (v: string) => onlyDigits(v).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
export const maskExpiry = (v: string) => onlyDigits(v).slice(0, 4).replace(/(\d{2})(\d)/, '$1/$2')

/** Mantém apenas os dois últimos dígitos — nunca armazenamos CPF completo. */
export const cpfToMasked = (v: string) => {
  const d = onlyDigits(v)
  return `***.***.***-${d.slice(-2).padStart(2, '0')}`
}

export function isValidCPFFormat(v: string) {
  return onlyDigits(v).length === 11
}
export function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
}
export function isValidPhone(v: string) {
  const d = onlyDigits(v)
  return d.length === 10 || d.length === 11
}
