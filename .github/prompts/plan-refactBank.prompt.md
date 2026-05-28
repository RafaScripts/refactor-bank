# Plano de Implementacao: Frontend do Refact Bank

## Resumo Executivo
O frontend Next.js do Refact Bank possui a estrutura visual completa mas esta com erros criticos de runtime (variaveis indefinidas), dados mockados em todas as paginas, fluxo de onboarding quebrado (loop de redirect), e paginas faltantes. Este plano cobre correcoes criticas, integracao completa com a API backend, e implementacao de funcionalidades pendentes.

---

## FASE 1: Correcoes Criticas (Bloqueantes)

### 1.1 Corrigir Variavel `bankAccount` Indefinida
**Problema:** `app/dashboard/cashout/page.tsx`, `app/dashboard/credit/page.tsx`, e `app/dashboard/approvals/page.tsx` referenciam `bankAccount` que nao existe no escopo. Deve ser `session?.user?.bankAccount`. (olhe a documentação e os schemas para entender como o bankAccount funciona `reafct-bank/src/schemas`), a api retornara esses dados no login:
```json
{
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        cpfCnpj: user.doc,
        verified: user.verified
      },
      bankAccount: bankAccountData
}
```

**Arquivos:**
- `app/dashboard/cashout/page.tsx` ~linha 55: `const balance = bankAccount?.balance || 0` -> `session?.user?.bankAccount?.balance || 0`
- `app/dashboard/credit/page.tsx` ~linha 55: `const isBusinessAccount = bankAccount?.businessAccount` -> `session?.user?.businessAccount`
- `app/dashboard/approvals/page.tsx` ~linha 95: `const isAdmin = bankAccount?.businessAccount` -> `session?.user?.businessAccount`

### 1.2 Adicionar Tipos Faltantes em `lib/api.ts`
**Problema:** Tipos importados por paginas mas nao definidos: `CreditProduct`, `CreditRequest`, `CreditResponse`, `PendingApproval`, `ApprovalResponse`.

essa parte se refere a possibilidade de produtos de credito (emprestimos) (no front vamos chamar de mercado de credito), o usuario pode simular e solicitar emprestimos, e os administradores podem aprovar ou rejeitar essas solicitacoes. Esses tipos sao necessarios para implementar as paginas de credito e aprovacao.

**Arquivo:** `lib/api.ts` — adicionar interfaces:
```typescript
export interface CreditProduct {
  id: string
  name: string
  description: string
  minAmount: number
  maxAmount: number
  minInstallments: number
  maxInstallments: number
  interestRate: number
  type: 'PERSONAL' | 'BUSINESS'
}

export interface CreditRequest {
  productId: string
  amount: number
  installments: number
}

export interface CreditResponse {
  _id: string
  status: string
  amount: number
  installmentsCount: number
  totalPayable: number
  installments: Array<{
    number: number
    amount: number
    dueDate: string
    status: string
  }>
}

export interface PendingApproval {
  id: string
  transactionId: string
  amount: number
  type: string
  method: string
  createdBy: string
  createdAt: string
  requiredVotes: number
  currentVotes: number
}

export interface ApprovalResponse {
  success: boolean
  message: string
}
```

### 1.3 Corrigir Classe Tailwind Deprecada
**Arquivo:** `app/dashboard/approvals/page.tsx` ~linha 261: `flex-shrink-0` -> `shrink-0`

### 1.4 Corrigir Envio de `x-access-key` no Login
**Problema:** O `authorize` callback em `lib/auth.ts` faz fetch para `/v1/iam/auth/login` mas **nao envia o header `x-access-key`**. O backend requer este header para resolver o tenant via `TenantInterceptor`.

**Arquivo:** `lib/auth.ts` — adicionar `'x-access-key': process.env.NEXT_PUBLIC_ACCESS_KEY` no headers do fetch de login.

### 1.5 Corrigir Loop de Onboarding
**Problema:** Apos onboarding completar, o usuario e redirecionado para `/dashboard` mas a sessao NextAuth ainda contem o status antigo (`PENDING`), causando o banner de onboarding aparecer novamente.

**Arquivo:** `app/dashboard/onboarding/page.tsx` — apos sucesso do submit:
1. Chamar `accountApi.getStatus(token)` para obter status atualizado
2. Forcar refresh da sessao: usar `router.refresh()` ou redirecionar com `window.location.href = '/dashboard'` para forcar recriacao da sessao
3. Alternativa: implementar endpoint de refresh de token ou atualizar o JWT callback para buscar status atualizado

**Arquivo:** `lib/auth.ts` — no callback `jwt`, adicionar logica para refresh do `bankAccount` status quando o token expirar ou em intervalos.

---

## FASE 2: Integracao de Dados Reais com API

### 2.1 Dashboard Principal (`app/dashboard/page.tsx`)
**Atual:** Todos os dados sao mockados (`mockTransactions`, `mockWallets`, `BalanceCard` com valores 0).

**Implementar:**
- Usar `useEffect` para buscar dados em paralelo:
  - `balanceApi.getBalance(token)` -> passar para `BalanceCard`
  - `balanceApi.getStatement(token, { limit: '5' })` -> passar transacoes reais para `RecentTransactions`
  - `balanceApi.getWallets(token)` -> passar para `CryptoWallets`
- Adicionar estados de loading (skeletons)
- Tratar erros de API

### 2.2 Extrato Completo (`app/dashboard/statement/page.tsx`)
**Atual:** Dados mockados, sem integracao real.

**Implementar:**
- Integrar `balanceApi.getStatement(token, params)` com paginacao real
- Filtros por data, tipo (`CASH_IN`/`CASH_OUT`), metodo (`PIX`/`TED`/`BOLETO`)
- Paginacao com botoes "Anterior"/"Proxima"
- Modal de detalhes da transacao ao clicar

### 2.3 Cash In — Receber Dinheiro (`app/dashboard/cashin/page.tsx`)
**Atual:** UI pronta mas sem chamadas API reais.

**Implementar:**
- **Pix:** `paymentsApi.createPixCharge({ amount, description }, token)` -> exibir QR Code (usar biblioteca `qrcode.react` ou similar) e botao "Copiar Codigo" (`brCode`)
- **Boleto:** `paymentsApi.createBoletoCharge({ amount, dueDate, payer: { name, doc } }, token)` -> exibir codigo de barras, linha digitavel, e link para PDF

### 2.4 Cash Out — Enviar Dinheiro (`app/dashboard/cashout/page.tsx`)
**Atual:** Formularios prontos mas sem chamadas API reais (apenas mock). Variavel `bankAccount` quebrada.

**Implementar:**
- **Pix:** `paymentsApi.sendPix({ key, keyType, amount, description }, token)` -> detectar tipo de chave automaticamente, validar saldo, mostrar confirmacao
- **TED/Transfer:** `paymentsApi.sendTransfer({ bankCode, branch, accountNumber, accountDigit, accountType, doc, name, amount }, token)` -> busca inteligente de banco
- **Boleto:** `paymentsApi.payBoleto({ barCode }, token)` -> pagamento de contas
- Mostrar mensagem de "Aguardando aprovacao" quando `status === 'PENDING_APPROVAL'` (fluxo PJ)

### 2.5 Crypto Assets (`app/dashboard/crypto/page.tsx`)
**Atual:** Precos e saldos hardcoded.

**Implementar:**
- Buscar saldo real: `balanceApi.getWallets(token)`
- **Cotacao:** `cryptoApi.getQuote({ currency: 'BTC' }, token)` e ETH
- **Compra:** `cryptoApi.buy({ bankAccountId, symbol, amountBrl }, token)`
- **Venda:** `cryptoApi.sell({ bankAccountId, symbol, amountCrypto }, token)`
- **Transferencia P2P:** `cryptoApi.transfer({ receiverUserId, symbol, amount }, token)`
- Interface com slider de quantidade, preview de taxas

### 2.6 Credito e Emprestimos (`app/dashboard/credit/page.tsx`)
**Atual:** Dados mockados, variavel `bankAccount` quebrada.

**Implementar:**
- `creditsApi.getProducts(token)` -> listar produtos disponiveis
- Simulador interativo com slider de valor e parcelas
- `creditsApi.requestCredit({ productId, amount, installments }, token)`
- Exibir CET e valor da parcela calculados

### 2.7 Aprovacoes Corporativas (`app/dashboard/approvals/page.tsx`)
**Atual:** Dados mockados, variavel `bankAccount` quebrada.

**Implementar:**
- `approvalsApi.getPending(token)` -> listar transacoes pendentes
- `approvalsApi.approve(id, token)` / `approvalsApi.reject(id, token)`
- Mostrar apenas para contas PJ (`businessAccount === true`)
- Cards com info do solicitante, valor, destino, votos atuais

---

## FASE 3: Novas Paginas e Funcionalidades

### 3.1 Pagina de Pix Dedicada (`app/dashboard/pix/page.tsx`)
- Receber via Pix (gerar QR Code)
- Enviar via Pix (por chave)
- Gerenciar chaves Pix (listar, criar, deletar)
- Integrar endpoints: `paymentsApi.createPixCharge`, `paymentsApi.sendPix`, + endpoints de chaves Pix

### 3.2 Configuracoes (`app/dashboard/settings/page.tsx`)
- Dados do perfil (nome, email, telefone)
- Gerenciamento de chaves Pix
- Dados da conta bancaria (agencia, conta)
- Preferencias de notificacao

### 3.3 Esqueci Minha Senha (`app/forgot-password/page.tsx`)
- Formulario de recuperacao por email
- Integrar com endpoint de reset de senha do backend (se existir; senao, criar fluxo de solicitacao)

### 3.4 Termos e Privacidade
- `app/terms/page.tsx` — Termos de Uso
- `app/privacy/page.tsx` — Politica de Privacidade
- Conteudo estatico ou buscar do tema do parceiro (`termsAndConditions`)

### 3.5 Middleware de Protecao de Rotas
**Arquivo:** `middleware.ts` (raiz do projeto)
- Proteger todas as rotas `/dashboard/*` no servidor
- Redirecionar para `/login` se nao autenticado
- Evitar flash de conteudo nao autorizado
- Adicionar headers de seguranca

---

## FASE 4: Melhorias e Polish

### 4.1 Tratamento de Erros Global
- Toast notifications para erros de API (usar `use-toast.ts` ja existente)
- Estados de erro em todas as paginas
- Retry automatico em falhas de rede

### 4.2 Loading States
- Skeletons em todas as paginas de dashboard
- Spinners em botoes de acao
- Estados de loading no `BalanceCard`, `RecentTransactions`, etc.

### 4.3 White-Label Dinamico (Tema por Parceiro)
- No `app/layout.tsx`, buscar tema via `tenantApi.getTheme(integrationKey)`
- Aplicar cores dinamicamente via CSS variables
- Carregar logo e favicon do parceiro
- *Nota: Usuario indicou prioridade baixa para esta funcionalidade*

### 4.4 Validacoes e UX
- Validacao de CPF/CNPJ no frontend
- Mascaras de input (telefone, CEP, CPF, CNPJ)
- Formatacao de moeda em todos os inputs de valor
- Confirmacao antes de transacoes (modal de confirmacao)

---

## Dependencias entre Passos

```
FASE 1 (Correcoes Criticas)
├── 1.1 bankAccount fix ──┬──> 2.4 Cash Out
├── 1.2 Tipos faltantes ──┤    ├──> 2.6 Credit
├── 1.3 Tailwind fix      │    └──> 2.7 Approvals
├── 1.4 x-access-key fix ─┤──> TODAS as chamadas API
└── 1.5 Onboarding fix    └──> 2.1 Dashboard

FASE 2 (Integracao) — pode rodar em paralelo apos FASE 1
├── 2.1 Dashboard
├── 2.2 Statement
├── 2.3 Cash In
├── 2.4 Cash Out
├── 2.5 Crypto
├── 2.6 Credit
└── 2.7 Approvals

FASE 3 (Novas Paginas) — depende de FASE 1
├── 3.1 Pix Page
├── 3.2 Settings
├── 3.3 Forgot Password
├── 3.4 Terms/Privacy
└── 3.5 Middleware

FASE 4 (Melhorias) — depende de FASE 2
├── 4.1 Error Handling
├── 4.2 Loading States
├── 4.3 White-Label
└── 4.4 Validations
```

---

## Arquivos Criticos para Modificacao

| Arquivo | O que fazer |
|---------|-------------|
| `lib/auth.ts` | Adicionar `x-access-key` no login; melhorar refresh de sessao |
| `lib/api.ts` | Adicionar tipos faltantes; garantir headers corretos |
| `app/dashboard/layout.tsx` | Adicionar verificacao de status da conta para redirect ao onboarding |
| `app/dashboard/page.tsx` | Integrar dados reais da API (balance, statement, wallets) |
| `app/dashboard/cashout/page.tsx` | Corrigir `bankAccount`; integrar API de pagamentos |
| `app/dashboard/credit/page.tsx` | Corrigir `bankAccount`; integrar API de credito |
| `app/dashboard/approvals/page.tsx` | Corrigir `bankAccount`; integrar API de aprovacoes |
| `app/dashboard/onboarding/page.tsx` | Corrigir redirect apos sucesso; atualizar sessao |
| `app/dashboard/statement/page.tsx` | Integrar API de extrato com filtros e paginacao |
| `app/dashboard/cashin/page.tsx` | Integrar API de Pix e Boleto |
| `app/dashboard/crypto/page.tsx` | Integrar API de crypto (quote, buy, sell, transfer) |
| `middleware.ts` | Criar protecao de rotas no servidor |
| `app/dashboard/pix/page.tsx` | Criar pagina dedicada de Pix |
| `app/dashboard/settings/page.tsx` | Criar pagina de configuracoes |
| `app/forgot-password/page.tsx` | Criar pagina de recuperacao de senha |

---

## Decisoes e Escopo

### Incluido
- Correcao de todos os erros criticos de runtime
- Integracao completa com todas as APIs documentadas no Swagger
- Todas as paginas de dashboard com dados reais
- Novas paginas: Pix, Settings, Forgot Password, Terms, Privacy
- Middleware de protecao de rotas
- Tratamento de erros e loading states

### Excluido (futuro)
- White-label dinamico completo (prioridade baixa conforme usuario)
- Testes automatizados (E2E, unit)
- PWA / Service Workers
- Notificacoes push
- Chat de suporte

---

## Verificacao

1. **Login funciona:** Usuario consegue fazer login e e redirecionado ao dashboard
2. **Onboarding completo:** Usuario novo consegue preencher endereco, upload de documentos, e ser aprovado sem loop
3. **Dashboard com dados reais:** Saldo, extrato e carteiras crypto mostram dados da API
4. **Pagamentos funcionam:** Pix (enviar/receber), TED, Boleto funcionam end-to-end
5. **Crypto funciona:** Cotacao, compra, venda, transferencia P2P
6. **Credito funciona:** Listagem de produtos e solicitacao de emprestimo
7. **Aprovacoes PJ:** Administradores conseguem aprovar/rejeitar transacoes pendentes
8. **Navegacao protegida:** Rotas `/dashboard/*` exigem autenticacao
9. **Build sem erros:** `next build` completa sem erros de TypeScript ou runtime
