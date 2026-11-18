import { motion, type HTMLMotionProps } from 'framer-motion'

type Props = HTMLMotionProps<'div'> & { delay?: number; y?: number; as?: 'div' | 'li' | 'section' | 'article' }

/** Animação de entrada discreta quando o elemento entra na tela. */
export function Reveal({ delay = 0, y = 18, as = 'div', className, children, ...rest }: Props) {
  const Cmp = motion[as] as typeof motion.div
  return (
    <Cmp
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </Cmp>
  )
}
