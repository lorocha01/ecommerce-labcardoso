import type { User } from '@/types'

/**
 * Usuários FICTÍCIOS para a área do paciente.
 * ⚠️ Autenticação apenas demonstrativa — senhas em texto, sem criptografia.
 */
export const DEMO_USER_EMAIL = 'paciente@demo.test'
export const DEMO_USER_PASSWORD = 'demo1234'

export const users: User[] = [
  {
    id: 'user-demo',
    name: 'Paciente Demonstração',
    email: DEMO_USER_EMAIL,
    password: DEMO_USER_PASSWORD,
    phone: '(16) 90000-0000',
    birthDate: '1988-05-14',
    cpfMasked: '***.***.***-00',
    cep: '14470-000',
    address: 'Rua Exemplo, 100',
    city: 'Pedregulho/SP',
    createdAt: '2026-02-03T13:00:00.000Z',
  },
]

/** Credenciais do painel administrativo (somente demonstração). */
export const ADMIN_CREDENTIALS = { user: 'admin', password: 'Cardoso@2026', name: 'Administrador' }
