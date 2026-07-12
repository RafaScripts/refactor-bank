'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { accountApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Upload, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  ArrowLeft,
  FileText,
  User,
  Building2,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { DiditSdk } from '@didit-protocol/sdk-web'

type Step = 'type' | 'data' | 'documents' | 'review'

interface DocumentFile {
  file: File | null
  preview: string | null
}

interface Documents {
  socialContract: DocumentFile
  cnpjCard: DocumentFile
}

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const token = session?.user?.accessToken
  
  const [currentStep, setCurrentStep] = useState<Step>('type')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [accountType, setAccountType] = useState<'PF' | 'PJ' | null>(null)
  const [doc, setDoc] = useState('')
  const [pixKey, setPixKey] = useState('')

  const [documents, setDocuments] = useState<Documents>({
    socialContract: { file: null, preview: null },
    cnpjCard: { file: null, preview: null }
  })

  useEffect(() => {
    if (!token) {
      window.location.href = '/login'
    }
  }, [token])

  const steps = [
    { id: 'type', label: 'Tipo de Conta', icon: <User className="h-4 w-4" /> },
    { id: 'data', label: 'Dados', icon: <FileText className="h-4 w-4" /> },
    ...(accountType === 'PJ' ? [{ id: 'documents', label: 'Documentos Empresa', icon: <Building2 className="h-4 w-4" /> }] : []),
    { id: 'review', label: 'Revisão e KYC', icon: <CheckCircle2 className="h-4 w-4" /> }
  ]

  const handleFileChange = (docType: keyof Documents, file: File | null) => {
    if (file) {
      const preview = URL.createObjectURL(file)
      setDocuments(prev => ({
        ...prev,
        [docType]: { file, preview }
      }))
    }
  }

  const handleNextStep = () => {
    if (currentStep === 'type' && accountType) {
      setCurrentStep('data')
    } else if (currentStep === 'data' && doc && pixKey) {
      setCurrentStep(accountType === 'PJ' ? 'documents' : 'review')
    } else if (currentStep === 'documents') {
      setCurrentStep('review')
    }
  }

  const handlePrevStep = () => {
    if (currentStep === 'data') {
      setCurrentStep('type')
    } else if (currentStep === 'documents') {
      setCurrentStep('data')
    } else if (currentStep === 'review') {
      setCurrentStep(accountType === 'PJ' ? 'documents' : 'data')
    }
  }

  const handleSubmit = async () => {
    if (!token) return

    setIsLoading(true)
    setError('')

    try {
      // 1. Initialize pending bank account
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/core/account/onboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: accountType,
          doc,
          pixKey
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao iniciar onboarding da conta.')
      }

      const result = await response.json();

      // 2. Upload PJ documents if applicable
      if (accountType === 'PJ') {
        const uploadPromises: Promise<any>[] = []
        if (documents.socialContract.file) {
          uploadPromises.push(accountApi.uploadDocument(documents.socialContract.file, 'CONTRATO_SOCIAL', token))
        }
        if (documents.cnpjCard.file) {
          uploadPromises.push(accountApi.uploadDocument(documents.cnpjCard.file, 'CARTAO_CNPJ', token))
        }
        await Promise.all(uploadPromises)
      }

      // 3. Start Didit KYC
      const sessionUrl = result.data?.diditSessionUrl || result.diditSessionUrl;
      if (sessionUrl) {
        DiditSdk.shared.startVerification({ url: sessionUrl });
        
        // Assume completion for UI demonstration (in real app, listen to Didit event or check status)
        setSuccess(true)
        
        // Wait a few seconds for user to see the success screen behind modal, then redirect
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 15000)
      } else {
        throw new Error('Sessão do Didit não retornada pelo servidor.')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar dados. Tente novamente.')
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Quase lá!</h2>
            <p className="text-muted-foreground mb-4">
              Por favor, conclua a verificação de identidade no modal que se abriu.
            </p>
            <p className="text-sm text-muted-foreground">
              Você será redirecionado para o dashboard em breve...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Abra sua Conta</h1>
          <p className="text-muted-foreground">
            Complete os dados e faça a verificação facial
          </p>
        </div>

        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                  currentStep === step.id
                    ? 'bg-primary text-primary-foreground'
                    : steps.findIndex(s => s.id === currentStep) > index
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {steps.findIndex(s => s.id === currentStep) > index ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : currentStep === step.id ? (
                  step.icon
                ) : (
                  <Circle className="h-4 w-4" />
                )}
                <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div className="w-8 sm:w-16 h-px bg-border mx-2" />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Card>
          {currentStep === 'type' && (
            <>
              <CardHeader>
                <CardTitle>Tipo de Conta</CardTitle>
                <CardDescription>
                  Selecione o tipo de conta que deseja abrir.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setAccountType('PF')}
                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-3 ${
                      accountType === 'PF' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <User className="w-6 h-6" />
                    <p className="font-medium">Pessoa Física</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('PJ')}
                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-3 ${
                      accountType === 'PJ' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Building2 className="w-6 h-6" />
                    <p className="font-medium">Pessoa Jurídica</p>
                  </button>
                </div>
              </CardContent>
            </>
          )}

          {currentStep === 'data' && (
            <>
              <CardHeader>
                <CardTitle>Dados Básicos</CardTitle>
                <CardDescription>
                  Informe os dados para a sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="doc">{accountType === 'PJ' ? 'CNPJ' : 'CPF'}</Label>
                    <Input
                      id="doc"
                      placeholder={accountType === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                      value={doc}
                      onChange={(e) => setDoc(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pixKey">Chave Pix para Retirada</Label>
                    <Input
                      id="pixKey"
                      placeholder="Sua chave Pix de outro banco"
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {currentStep === 'documents' && accountType === 'PJ' && (
            <>
              <CardHeader>
                <CardTitle>Documentos da Empresa</CardTitle>
                <CardDescription>
                  Envie os documentos da sua empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DocumentUpload
                    label="Contrato Social / Estatuto"
                    icon={<FileText className="h-6 w-6" />}
                    file={documents.socialContract}
                    onChange={(file) => handleFileChange('socialContract', file)}
                  />
                  <DocumentUpload
                    label="Cartão CNPJ"
                    icon={<FileText className="h-6 w-6" />}
                    file={documents.cnpjCard}
                    onChange={(file) => handleFileChange('cnpjCard', file)}
                  />
                </div>
              </CardContent>
            </>
          )}

          {currentStep === 'review' && (
            <>
              <CardHeader>
                <CardTitle>Pronto para o KYC!</CardTitle>
                <CardDescription>
                  Iniciaremos uma validação facial de segurança.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    Ao continuar, você autoriza a verificação da sua identidade pelo sistema Didit e declara que as informações são verdadeiras.
                  </p>
                </div>
              </CardContent>
            </>
          )}

          <div className="flex items-center justify-between p-6 pt-0">
            <Button
              variant="ghost"
              onClick={handlePrevStep}
              disabled={currentStep === 'type'}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>

            {currentStep === 'review' ? (
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  <>
                    Iniciar Verificação
                    <CheckCircle2 className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNextStep}
                disabled={
                  (currentStep === 'type' && !accountType) ||
                  (currentStep === 'data' && (!doc || !pixKey))
                }
              >
                Continuar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

function DocumentUpload({
  label,
  icon,
  file,
  onChange
}: {
  label: string
  icon: React.ReactNode
  file: DocumentFile
  onChange: (file: File | null) => void
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    onChange(selectedFile)
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <label className="block cursor-pointer">
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleChange}
          className="hidden"
        />
        {file.preview ? (
          <div className="relative aspect-video rounded-lg overflow-hidden border border-border bg-muted group">
            <img
              src={file.preview}
              alt={label}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Upload className="h-6 w-6 text-white" />
            </div>
          </div>
        ) : (
          <div className="aspect-video rounded-lg border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-muted transition-colors">
            <div className="text-muted-foreground">{icon}</div>
            <span className="text-xs text-muted-foreground">Clique para enviar</span>
          </div>
        )}
      </label>
    </div>
  )
}
