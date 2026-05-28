import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Termos de Uso - Refact Bank',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto py-8">
        <Link href="/login">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Termos de Uso</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-muted-foreground">
            <p className="text-foreground font-medium">Última atualização: 28 de maio de 2026</p>

            <h3 className="text-foreground font-semibold mt-6 mb-2">1. Aceitação dos Termos</h3>
            <p>
              Ao acessar e utilizar os serviços do Refact Bank, você concorda em cumprir e estar
              vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos,
              não deverá utilizar nossos serviços.
            </p>

            <h3 className="text-foreground font-semibold mt-6 mb-2">2. Descrição dos Serviços</h3>
            <p>
              O Refact Bank é uma plataforma de Banking as a Service (BaaS) que oferece serviços
              financeiros digitais, incluindo conta corrente, transferências, pagamentos via Pix,
              boletos, e operações com criptomoedas.
            </p>

            <h3 className="text-foreground font-semibold mt-6 mb-2">3. Cadastro e Segurança</h3>
            <p>
              Para utilizar nossos serviços, você deve criar uma conta fornecendo informações
              verdadeiras, completas e atualizadas. Você é responsável por manter a confidencialidade
              de suas credenciais de acesso.
            </p>

            <h3 className="text-foreground font-semibold mt-6 mb-2">4. Privacidade</h3>
            <p>
              Suas informações pessoais são tratadas de acordo com nossa Política de Privacidade.
              Ao utilizar nossos serviços, você consente com a coleta e uso de suas informações
              conforme descrito nessa política.
            </p>

            <h3 className="text-foreground font-semibold mt-6 mb-2">5. Limitação de Responsabilidade</h3>
            <p>
              O Refact Bank não será responsável por danos indiretos, incidentais, especiais ou
              consequenciais resultantes do uso ou incapacidade de uso dos serviços.
            </p>

            <h3 className="text-foreground font-semibold mt-6 mb-2">6. Alterações nos Termos</h3>
            <p>
              Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações
              entrarão em vigor imediatamente após sua publicação na plataforma.
            </p>

            <h3 className="text-foreground font-semibold mt-6 mb-2">7. Contato</h3>
            <p>
              Para dúvidas sobre estes termos, entre em contato através do suporte@refactbank.com.br.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
