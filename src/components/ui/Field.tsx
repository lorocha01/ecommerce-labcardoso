import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface WrapProps {
  label?: string
  error?: string
  hint?: ReactNode
  className?: string
  children: ReactNode
  htmlFor?: string
  required?: boolean
}

export function FieldWrap({ label, error, hint, className, children, htmlFor, required }: WrapProps) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="field-label">
          {label}
          {required && <span className="ml-0.5 text-brand-600">*</span>}
        </label>
      )}
      {children}
      {error ? <p className="mt-1.5 text-xs font-medium text-brand-700">{error}</p> : hint ? <p className="mt-1.5 text-xs text-ink-500">{hint}</p> : null}
    </div>
  )
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; hint?: ReactNode; wrapClassName?: string; sizeVariant?: 'sm' | 'md' }

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, error, hint, wrapClassName, className, id, sizeVariant = 'md', required, ...rest }, ref) {
  const fid = id ?? rest.name
  return (
    <FieldWrap label={label} error={error} hint={hint} className={wrapClassName} htmlFor={fid} required={required}>
      <input ref={ref} id={fid} className={cn('field', sizeVariant === 'sm' && 'field-sm', error && 'field-error', className)} aria-invalid={!!error} {...rest} />
    </FieldWrap>
  )
})

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string; wrapClassName?: string; sizeVariant?: 'sm' | 'md' }

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ label, error, wrapClassName, className, id, children, sizeVariant = 'md', ...rest }, ref) {
  const fid = id ?? rest.name
  return (
    <FieldWrap label={label} error={error} className={wrapClassName} htmlFor={fid}>
      <select
        ref={ref}
        id={fid}
        className={cn(
          'field appearance-none bg-[length:16px] bg-[right_0.85rem_center] bg-no-repeat pr-10',
          "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23776B67' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")]",
          sizeVariant === 'sm' && 'field-sm pr-9',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
    </FieldWrap>
  )
})

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string; hint?: ReactNode; wrapClassName?: string }

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ label, error, hint, wrapClassName, className, id, rows = 4, ...rest }, ref) {
  const fid = id ?? rest.name
  return (
    <FieldWrap label={label} error={error} hint={hint} className={wrapClassName} htmlFor={fid}>
      <textarea ref={ref} id={fid} rows={rows} className={cn('field resize-y', error && 'field-error', className)} {...rest} />
    </FieldWrap>
  )
})
