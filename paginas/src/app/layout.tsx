import type { Metadata } from 'next'
import '../styles/globals.css'
import { ToastProvider } from '@/components/ui/Toast'

export const metadata: Metadata = {
    title: 'LF Aluguel - Admin',
    description: 'Sistema administrativo LF de Aluguel de Máquinas',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="pt-BR">
            <body>
                <ToastProvider>
                    {children}
                </ToastProvider>
            </body>
        </html>
    )
}
