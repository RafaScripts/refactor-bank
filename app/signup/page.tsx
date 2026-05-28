'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { authApi, type SignupRequest } from '@/lib/api'
import { validateCPF, validateCNPJ } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Loader2, Building2, User, ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type AccountType = 'PF' | 'PJ'

const companyTypes = [
  { value: 'LIMITED', label: 'Sociedade Limitada (LTDA)' },
  { value: 'INDIVIDUAL', label: 'Empresa Individual (EI)' },
  { value: 'SOLE_PROPRIETORSHIP', label: 'MEI' },
  { value: 'ASSOCIATION', label: 'Associação' },
]

export default function SignupPage() {
  const router = useRouter()
  
  const [step, setStep] = useState(1)
  const [accountType, setAccountType] = useState<AccountType | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // PF Fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [cpf, setCpf] = useState('')
  const [phone, setPhone] = useState('')

  // PJ Fields
  const [companyName, setCompanyName] = useState('')
  const [tradingName, setTradingName] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [companyType, setCompanyType] = useState('')
  const [cnae, setCnae] = useState('')
  const [monthlyRevenue, setMonthlyRevenue] = useState('')

  const formatCPFInput = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 11)
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const formatCNPJInput = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 14)
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  const formatPhoneInput = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 11)
    if (cleaned.length > 6) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    } else if (cleaned.length > 2) {
      return cleaned.replace(/(\d{2})(\d+)/, '($1) $2')
    }
    return cleaned
  }

  const validateStep1 = () => {
    if (!accountType) {
      setError('Selecione o tipo de conta')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (accountType === 'PF') {
      if (!name || !email || !cpf || !phone) {
        setError('Preencha todos os campos obrigatórios')
        return false
      }
      if (!validateCPF(cpf)) {
        setError('CPF inválido')
        return false
      }
    } else {
      if (!companyName || !cnpj || !companyType) {
        setError('Preencha todos os campos obrigatórios')
        return false
      }
      if (!validateCNPJ(cnpj)) {
        setError('CNPJ inválido')
        return false
      }
    }
    return true
  }

  const validateStep3 = () => {
    if (accountType === 'PJ') {
      if (!name || !email || !cpf || !phone) {
        setError('Preencha os dados do sócio administrador')
        return false
      }
      if (!validateCPF(cpf)) {
        setError('CPF do sócio inválido')
        return false
      }
    }
    return true
  }

  const validateStep4 = () => {
    if (!password || !confirmPassword) {
      setError('Preencha a senha')
      return false
    }
    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres')
      return false
    }
    if (password !== confirmPassword) {
      setError('As senhas não conferem')
      return false
    }
    return true
  }

  const handleNext = () => {
    setError('')
    
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      if (accountType === 'PF') {
        setStep(4) // Skip step 3 for PF
      } else {
        setStep(3)
      }
    } else if (step === 3 && validateStep3()) {
      setStep(4)
    }
  }

  const handleBack = () => {
    setError('')
    if (step === 4 && accountType === 'PF') {
      setStep(2)
    } else {
      setStep(step - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateStep4()) return

    setIsLoading(true)

    try {
      const signupData: SignupRequest = {
        name,
        email,
        password,
        doc: accountType === 'PF' ? cpf.replace(/\D/g, '') : cnpj.replace(/\D/g, ''),
        type: accountType!,
        withBankAccount: false,
        businessAccount: accountType === 'PJ',
      }

      if (accountType === 'PJ') {
        signupData.companyName = companyName
        signupData.tradingName = tradingName
        signupData.companyType = companyType
        signupData.cnae = cnae
      }

      const response = await authApi.signup(signupData)
      
      // Auto-login after signup using NextAuth
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      
      if (result?.ok) {
        router.push('/dashboard')
        router.refresh()
      } else {
        // Signup succeeded but auto-login failed, redirect to login
        router.push('/login')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const totalSteps = accountType === 'PJ' ? 4 : 3

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4">
            <span className="text-primary-foreground font-bold text-2xl">R</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Refact Bank</h1>
          <p className="text-muted-foreground text-sm">Crie sua conta digital</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3, 4].slice(0, totalSteps + 1).map((s) => (
            <div
              key={s}
              className={cn(
                'w-8 h-1 rounded-full transition-colors',
                s <= step ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>

        <Card className="border-border/50">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">
              {step === 1 && 'Tipo de conta'}
              {step === 2 && (accountType === 'PF' ? 'Seus dados' : 'Dados da empresa')}
              {step === 3 && 'Dados do sócio'}
              {step === 4 && 'Criar senha'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Escolha entre Pessoa Física ou Jurídica'}
              {step === 2 && (accountType === 'PF' ? 'Preencha suas informações pessoais' : 'Preencha os dados da sua empresa')}
              {step === 3 && 'Dados do sócio administrador ou representante legal'}
              {step === 4 && 'Crie uma senha segura para sua conta'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              {/* Step 1: Account Type */}
              {step === 1 && (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setAccountType('PF')}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-3',
                      accountType === 'PF'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center',
                      accountType === 'PF' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    )}>
                      <User className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Pessoa Física</p>
                      <p className="text-xs text-muted-foreground">CPF</p>
                    </div>
                    {accountType === 'PF' && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccountType('PJ')}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-3',
                      accountType === 'PJ'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center',
                      accountType === 'PJ' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    )}>
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Pessoa Jurídica</p>
                      <p className="text-xs text-muted-foreground">CNPJ</p>
                    </div>
                    {accountType === 'PJ' && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                </div>
              )}

              {/* Step 2: Personal/Company Data */}
              {step === 2 && accountType === 'PF' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                      id="cpf"
                      value={cpf}
                      onChange={(e) => setCpf(formatCPFInput(e.target.value))}
                      placeholder="000.000.000-00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Celular *</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                      placeholder="(00) 00000-0000"
                      required
                    />
                  </div>
                </>
              )}

              {step === 2 && accountType === 'PJ' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Razão Social *</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Nome da empresa LTDA"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tradingName">Nome Fantasia</Label>
                    <Input
                      id="tradingName"
                      value={tradingName}
                      onChange={(e) => setTradingName(e.target.value)}
                      placeholder="Nome fantasia"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      value={cnpj}
                      onChange={(e) => setCnpj(formatCNPJInput(e.target.value))}
                      placeholder="00.000.000/0000-00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyType">Tipo Societário *</Label>
                    <select
                      id="companyType"
                      value={companyType}
                      onChange={(e) => setCompanyType(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      required
                    >
                      <option value="">Selecione...</option>
                      {companyTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cnae">CNAE</Label>
                      <Input
                        id="cnae"
                        value={cnae}
                        onChange={(e) => setCnae(e.target.value)}
                        placeholder="0000-0/00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthlyRevenue">Faturamento Mensal</Label>
                      <Input
                        id="monthlyRevenue"
                        value={monthlyRevenue}
                        onChange={(e) => setMonthlyRevenue(e.target.value)}
                        placeholder="R$ 0,00"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Step 3: Partner Data (PJ only) */}
              {step === 3 && accountType === 'PJ' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Nome do Sócio *</Label>
                    <Input
                      id="ownerName"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nome completo do sócio"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerEmail">E-mail *</Label>
                    <Input
                      id="ownerEmail"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="socio@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerCpf">CPF do Sócio *</Label>
                    <Input
                      id="ownerCpf"
                      value={cpf}
                      onChange={(e) => setCpf(formatCPFInput(e.target.value))}
                      placeholder="000.000.000-00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerPhone">Celular *</Label>
                    <Input
                      id="ownerPhone"
                      value={phone}
                      onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                      placeholder="(00) 00000-0000"
                      required
                    />
                  </div>
                </>
              )}

              {/* Step 4: Password */}
              {step === 4 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar senha *</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a senha"
                      required
                    />
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className={cn(password.length >= 8 && 'text-primary')}>
                      {password.length >= 8 ? '✓' : '○'} Mínimo de 8 caracteres
                    </p>
                    <p className={cn(/[A-Z]/.test(password) && 'text-primary')}>
                      {/[A-Z]/.test(password) ? '✓' : '○'} Uma letra maiúscula
                    </p>
                    <p className={cn(/[0-9]/.test(password) && 'text-primary')}>
                      {/[0-9]/.test(password) ? '✓' : '○'} Um número
                    </p>
                  </div>
                </>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-2">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                )}
                
                {step < 4 ? (
                  <Button type="button" onClick={handleNext} className="flex-1">
                    Continuar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      'Criar conta'
                    )}
                  </Button>
                )}
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Já tem uma conta?{' '}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Fazer login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
