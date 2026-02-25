import type { Metadata } from 'next'
import '../styles/globals.css'

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
            <body>{children}</body>
        </html>
    )
}
