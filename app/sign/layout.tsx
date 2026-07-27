export default function SignLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold font-mono">
              /
            </div>
            <span className="font-bold text-xl tracking-tight">Refactor</span>
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            Assinatura Digital Segura
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col py-8 px-4">
        {children}
      </main>
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        Protegido por Criptografia SHA-256 e Assinatura RSA Avançada.
      </footer>
    </div>
  )
}
