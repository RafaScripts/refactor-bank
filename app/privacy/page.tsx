import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Política de Privacidade - Refact Bank',
}

export default function PrivacyPage() {
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
            <CardTitle className="text-2xl">Política de Privacidade</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-muted-foreground">
            <p className="text-foreground font-medium">Última atualização: 28 de maio de 2026</p>

            <h3 className="text-foreground font-semibold mt-6 mb-2">1. Introdução</h3>
            <p>
              O Refact Bank está comprometido com a proteção de sua privacidade. Esta política
              descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais.
            </p>

            <h3 className="text-foreground font-semibold mt-6 mb-2">2. Informações Coletadas</h3>
            <p>Coletamos as seguintes informações:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Dados de identificação (nome, CPF/CNPJ, data de nascimento)</li>
              <li>Informações de contato (e-mail, telefone, endereço)</li>
              <li>Dados bancários e financeiros</li>
              <li>Documentos de verificação de identidade</li>
              <li>Dados de transações e operações</li>
            </ul>

            <h3 className="text-foreground font-semibold mt-6 mb-2">3. Uso das Informações</h3>
            <p>Utilizamos suas informações para:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Fornecer e melhorar nossos serviços</li>
              <li>Processar transações e operações</li>
              <li>Cumprir obrigações legais e regulatórias</li>
              <li>Prevenir fraudes e atividades ilícitas</li>
              <li>Enviar comunicações sobre nossos serviços</li>
            </ul>

            <h3 className="text-foreground font-semibold mt-6 mb-2">4. Compartilhamento de Dados</h3>
            <p>
              Podemos compartilhar suas informações com parceiros estratégicos, instituições
              financeiras e autoridades reguladoras, sempre em conformidade com a legislação
              aplicável.
            </p>

            <h3 className="text-foreground font-semibold mt-6 mb-2">5. Segurança</h3>
            <p>
              Implementamos medidas técnicas e organizacionais para proteger suas informações
              contra acesso não autorizado, alteração, divulgação ou destruição.
            </p>

            <h3 className="text-foreground font-semibold mt-6 mb-2">6. Seus Direitos</h3>
            <p>Você tem o direito de:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Acessar suas informações pessoais</li>
              <li>Solicitar correção de dados incompletos ou desatualizados</li>
              <li>Solicitar a exclusão de seus dados</li>
              <li>Revogar consentimento para uso de dados</li>
            </ul>

            <h3 className="text-foreground font-semibold mt-6 mb-2">7. Contato</h3>
            <p>
              Para exercer seus direitos ou esclarecer dúvidas, entre em contato pelo e-mail
              privacidade@refactbank.com.br.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
