'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { accountApi, AccountRequest } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Upload, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  ArrowLeft,
  FileText,
  Camera,
  Home,
  Building2,
  Loader2,
  AlertCircle
} from 'lucide-react'

type Step = 'address' | 'documents' | 'review'

interface AddressData {
  postalCode: string
  address: string
  addressNumber: string
  complement: string
  province: string
  city: string
  state: string
}

interface DocumentFile {
  file: File | null
  preview: string | null
}

interface Documents {
  rgFront: DocumentFile
  rgBack: DocumentFile
  selfie: DocumentFile
  proofOfAddress: DocumentFile
  // PJ docs
  socialContract: DocumentFile
  cnpjCard: DocumentFile
}

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user
  const token = session?.user?.accessToken
  const [currentStep, setCurrentStep] = useState<Step>('address')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [addressData, setAddressData] = useState<AddressData>({
    postalCode: '',
    address: '',
    addressNumber: '',
    complement: '',
    province: '',
    city: '',
    state: ''
  })

  const [documents, setDocuments] = useState<Documents>({
    rgFront: { file: null, preview: null },
    rgBack: { file: null, preview: null },
    selfie: { file: null, preview: null },
    proofOfAddress: { file: null, preview: null },
    socialContract: { file: null, preview: null },
    cnpjCard: { file: null, preview: null }
  })

  const isPJ = user?.type === 'PJ'

  useEffect(() => {
    if (!token) {
      router.push('/login')
    }
  }, [token, router])

  const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: 'address', label: 'Endereço', icon: <Home className="h-4 w-4" /> },
    { id: 'documents', label: 'Documentos', icon: <FileText className="h-4 w-4" /> },
    { id: 'review', label: 'Revisão', icon: <CheckCircle2 className="h-4 w-4" /> }
  ]

  const handleAddressChange = (field: keyof AddressData, value: string) => {
    setAddressData(prev => ({ ...prev, [field]: value }))
  }

  const handleCEPBlur = async () => {
    const cep = addressData.postalCode.replace(/\D/g, '')
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
        const data = await response.json()
        if (!data.erro) {
          setAddressData(prev => ({
            ...prev,
            address: data.logradouro || '',
            province: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || ''
          }))
        }
      } catch {
        // Ignore CEP lookup errors
      }
    }
  }

  const handleFileChange = (docType: keyof Documents, file: File | null) => {
    if (file) {
      const preview = URL.createObjectURL(file)
      setDocuments(prev => ({
        ...prev,
        [docType]: { file, preview }
      }))
    }
  }

  const isAddressValid = () => {
    return (
      addressData.postalCode.replace(/\D/g, '').length === 8 &&
      addressData.address.trim() !== '' &&
      addressData.addressNumber.trim() !== '' &&
      addressData.province.trim() !== '' &&
      addressData.city.trim() !== '' &&
      addressData.state !== ''
    )
  }

  const isDocumentsValid = () => {
    const baseValid = 
      documents.rgFront.file !== null &&
      documents.rgBack.file !== null &&
      documents.selfie.file !== null &&
      documents.proofOfAddress.file !== null

    if (isPJ) {
      return baseValid &&
        documents.socialContract.file !== null &&
        documents.cnpjCard.file !== null
    }

    return baseValid
  }

  const handleNextStep = () => {
    if (currentStep === 'address' && isAddressValid()) {
      setCurrentStep('documents')
    } else if (currentStep === 'documents' && isDocumentsValid()) {
      setCurrentStep('review')
    }
  }

  const handlePrevStep = () => {
    if (currentStep === 'documents') {
      setCurrentStep('address')
    } else if (currentStep === 'review') {
      setCurrentStep('documents')
    }
  }

  const handleSubmit = async () => {
    if (!token || !user) return

    setIsLoading(true)
    setError('')

    try {
      // 1. Create account request
      const accountData: AccountRequest = {
        type: user.type as 'PF' | 'PJ',
        name: user.name || undefined,
        email: user.email || undefined,
        doc: user.doc || undefined,
        postalCode: addressData.postalCode.replace(/\D/g, ''),
        address: addressData.address,
        addressNumber: addressData.addressNumber,
        complement: addressData.complement,
        province: addressData.province,
        city: addressData.city,
        state: addressData.state
      }

      await accountApi.requestAccount(accountData, token)

      // 2. Upload documents
      const formData = new FormData()
      
      if (documents.rgFront.file) {
        formData.append('rgFront', documents.rgFront.file)
      }
      if (documents.rgBack.file) {
        formData.append('rgBack', documents.rgBack.file)
      }
      if (documents.selfie.file) {
        formData.append('selfie', documents.selfie.file)
      }
      if (documents.proofOfAddress.file) {
        formData.append('proofOfAddress', documents.proofOfAddress.file)
      }
      
      if (isPJ) {
        if (documents.socialContract.file) {
          formData.append('socialContract', documents.socialContract.file)
        }
        if (documents.cnpjCard.file) {
          formData.append('cnpjCard', documents.cnpjCard.file)
        }
      }

      await accountApi.uploadDocuments(formData, token)

      setSuccess(true)
      
      // Redirect to dashboard after success with full page reload
      // to force NextAuth session refresh with updated account status
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 3000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar dados. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 5) return numbers
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Cadastro Enviado!</h2>
            <p className="text-muted-foreground mb-4">
              Seus documentos foram enviados para análise. Você será notificado quando sua conta for aprovada.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecionando para o dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Complete seu Cadastro</h1>
          <p className="text-muted-foreground">
            Preencha as informações abaixo para ativar sua conta bancária
          </p>
        </div>

        {/* Progress Steps */}
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

        {/* Step Content */}
        <Card>
          {currentStep === 'address' && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Endereço
                </CardTitle>
                <CardDescription>
                  Informe seu endereço residencial completo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">CEP</Label>
                    <Input
                      id="postalCode"
                      placeholder="00000-000"
                      value={formatCEP(addressData.postalCode)}
                      onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                      onBlur={handleCEPBlur}
                      maxLength={9}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Select
                      value={addressData.state}
                      onValueChange={(value) => handleAddressChange('state', value)}
                    >
                      <SelectTrigger id="state">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {BRAZILIAN_STATES.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Logradouro</Label>
                  <Input
                    id="address"
                    placeholder="Rua, Avenida, etc."
                    value={addressData.address}
                    onChange={(e) => handleAddressChange('address', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="addressNumber">Número</Label>
                    <Input
                      id="addressNumber"
                      placeholder="123"
                      value={addressData.addressNumber}
                      onChange={(e) => handleAddressChange('addressNumber', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="complement">Complemento</Label>
                    <Input
                      id="complement"
                      placeholder="Apto, Bloco, etc. (opcional)"
                      value={addressData.complement}
                      onChange={(e) => handleAddressChange('complement', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="province">Bairro</Label>
                    <Input
                      id="province"
                      placeholder="Bairro"
                      value={addressData.province}
                      onChange={(e) => handleAddressChange('province', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      placeholder="Cidade"
                      value={addressData.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {currentStep === 'documents' && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentos
                </CardTitle>
                <CardDescription>
                  Envie fotos dos documentos solicitados para verificação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Documents */}
                <div className="space-y-4">
                  <h3 className="font-medium text-foreground">Documentos Pessoais</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DocumentUpload
                      label="RG/CNH (Frente)"
                      icon={<FileText className="h-6 w-6" />}
                      file={documents.rgFront}
                      onChange={(file) => handleFileChange('rgFront', file)}
                    />
                    <DocumentUpload
                      label="RG/CNH (Verso)"
                      icon={<FileText className="h-6 w-6" />}
                      file={documents.rgBack}
                      onChange={(file) => handleFileChange('rgBack', file)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DocumentUpload
                      label="Selfie com Documento"
                      icon={<Camera className="h-6 w-6" />}
                      file={documents.selfie}
                      onChange={(file) => handleFileChange('selfie', file)}
                    />
                    <DocumentUpload
                      label="Comprovante de Residência"
                      icon={<Home className="h-6 w-6" />}
                      file={documents.proofOfAddress}
                      onChange={(file) => handleFileChange('proofOfAddress', file)}
                    />
                  </div>
                </div>

                {/* PJ Documents */}
                {isPJ && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <h3 className="font-medium text-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Documentos da Empresa
                    </h3>
                    
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
                  </div>
                )}
              </CardContent>
            </>
          )}

          {currentStep === 'review' && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Revisão
                </CardTitle>
                <CardDescription>
                  Confira seus dados antes de enviar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Address Review */}
                <div className="space-y-2">
                  <h3 className="font-medium text-foreground flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Endereço
                  </h3>
                  <div className="bg-muted/50 rounded-lg p-4 text-sm">
                    <p className="text-foreground">
                      {addressData.address}, {addressData.addressNumber}
                      {addressData.complement && ` - ${addressData.complement}`}
                    </p>
                    <p className="text-muted-foreground">
                      {addressData.province}, {addressData.city} - {addressData.state}
                    </p>
                    <p className="text-muted-foreground">
                      CEP: {formatCEP(addressData.postalCode)}
                    </p>
                  </div>
                </div>

                {/* Documents Review */}
                <div className="space-y-2">
                  <h3 className="font-medium text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Documentos Enviados
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {documents.rgFront.preview && (
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img
                          src={documents.rgFront.preview}
                          alt="RG Frente"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {documents.rgBack.preview && (
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img
                          src={documents.rgBack.preview}
                          alt="RG Verso"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {documents.selfie.preview && (
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img
                          src={documents.selfie.preview}
                          alt="Selfie"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {documents.proofOfAddress.preview && (
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img
                          src={documents.proofOfAddress.preview}
                          alt="Comprovante"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  
                  {isPJ && (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {documents.socialContract.preview && (
                        <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                          <img
                            src={documents.socialContract.preview}
                            alt="Contrato Social"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      {documents.cnpjCard.preview && (
                        <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                          <img
                            src={documents.cnpjCard.preview}
                            alt="Cartão CNPJ"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    Ao enviar, você declara que as informações fornecidas são verdadeiras e concorda com os termos de uso e política de privacidade do Refact Bank.
                  </p>
                </div>
              </CardContent>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between p-6 pt-0">
            <Button
              variant="ghost"
              onClick={handlePrevStep}
              disabled={currentStep === 'address'}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>

            {currentStep === 'review' ? (
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar Cadastro
                    <CheckCircle2 className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNextStep}
                disabled={
                  (currentStep === 'address' && !isAddressValid()) ||
                  (currentStep === 'documents' && !isDocumentsValid())
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

// Document Upload Component
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
