# Refactor Bank — Plano Único de Implementação de Invoices, Cripto, Exchanges e Taxas

> **Para o Hermes:** usar o skill `subagent-driven-development` para executar este plano tarefa por tarefa, com revisão de aderência à especificação e revisão de qualidade após cada tarefa.

**Objetivo:** transformar a base atual em uma plataforma financeira auditável que suporte invoices integrais, recebimento por Pix/boleto/cripto, conversão via Carteira Master ou exchanges OKX/Kraken, pagamento de Pix/boleto financiado por cripto e cobrança obrigatória de taxas configuradas no banco de dados em toda operação financeira.

**Arquitetura:** monólito modular NestJS orientado a eventos, com MongoDB transacional, Redis/BullMQ, ledger de dupla entrada, sagas persistidas, transactional outbox/inbox e integrações externas atrás de ports/adapters. O frontend Next.js consome contratos OpenAPI versionados e exibe apenas estados de negócio simplificados; detalhes financeiros e operacionais permanecem no backend e no painel administrativo.

**Stack:** NestJS 10, TypeScript, MongoDB/Mongoose, Redis/BullMQ, OpenAPI/Swagger, Next.js 16, React 19, pnpm, Jest/Supertest e uma suíte frontend a ser adicionada com Vitest/Testing Library e Playwright.

**Status deste documento:** planejamento somente. Nenhum código do produto deve ser implementado durante esta etapa.

---

## 1. Fontes consolidadas

Este plano unifica as notas do vault Obsidian em `Projects/Refactor Bank/`:

- `00 - Visão Geral.md`;
- `01 - Arquitetura Frontend.md`;
- `02 - Arquitetura Backend.md`;
- `03 - Integração e Contratos.md`;
- `04 - Riscos e Débitos Técnicos.md`;
- `05 - Roadmap.md`;
- `07 - Arquitetura de Invoices e Recebimento Cripto.md`;
- `08 - Pagamento de Pix e Boleto com Cripto.md`;
- `09 - Orquestração, Estados e Fallbacks Cripto.md`;
- `10 - Painel Administrativo e Operação Cripto.md`;
- `11 - Segurança, Compliance e Conciliação Cripto.md`;
- `12 - Decisões e Questões Abertas Cripto.md`.

Também considera a inspeção atual dos dois repositórios:

- frontend: `/Users/rafael/Desktop/projects/refactor-bank`;
- backend: `/Users/rafael/Desktop/projects/refact-bank`.

### Novas decisões incorporadas

1. **Exchanges parceiras:** implementar adapters para **OKX** e **Kraken**.
2. **Taxas:** todas as operações financeiras devem atravessar um motor de taxas configurado e versionado no banco de dados.
3. **Regra de cobertura:** “toda operação” não significa necessariamente taxa maior que zero. Operações gratuitas precisam de uma regra explícita `ZERO_RATED`; ausência de configuração deve bloquear a operação, e não assumir taxa zero silenciosamente.
4. **Roteamento:** OKX/Kraken não serão hardcoded dentro do domínio. A política escolhe o provider antes da emissão da instrução de funding; após o recebimento de fundos, o provider fica fixado no snapshot da operação.
5. **Fallback entre exchanges:** troca automática de OKX para Kraken, ou vice-versa, só pode ocorrer antes de qualquer depósito/ordem/saque externo. Depois de um efeito externo, migração de provider vira operação de resgate separada, auditada e aprovada.

### Referências oficiais das exchanges

- OKX API v5: https://www.okx.com/docs-v5/en/
  - a documentação expõe APIs para endereço/histórico de depósito, ordens/fills e solicitação/histórico de saques;
  - domínio regional, permissões de API e IP allowlist precisam ser definidos por ambiente/conta.
- Kraken Spot REST: https://docs.kraken.com/api-reference/market-data/get-server-time
  - Add Order: https://docs.kraken.com/api-reference/trading/add-order
  - Deposit Addresses: https://docs.kraken.com/api-reference/funding/get-deposit-addresses
  - Deposit Status: https://docs.kraken.com/api-reference/funding/get-status-of-recent-deposits
  - Withdrawal Information: https://docs.kraken.com/api-reference/funding/get-withdrawal-information
  - Withdraw Funds: https://docs.kraken.com/api-reference/funding/withdraw-funds
  - Withdrawal Status: https://docs.kraken.com/api-reference/funding/get-status-of-recent-withdrawals

> A presença de endpoints genéricos não comprova suporte institucional a BRL, pares, redes, limites ou saques bancários na conta contratada. Isso é um gate comercial/técnico da Fase 0.

---

## 2. Evidências e gaps da base atual

### Backend

- `src/core/fee/fee.service.ts` consulta `FeeConfig`, mas o Gortex não encontrou consumidores do `FeeService`.
- Existem duas modelagens concorrentes, `src/schemas/fee.schema.ts` e `src/schemas/fee-config.schema.ts`, além de configurações de taxa em `User.pixFeePercentage`, `Config` e `BankAccount.fee`.
- `src/payments/providers/services/woovi-provider.service.ts` calcula uma taxa Pix diretamente no adapter, com default de `0,8%` e mínimo de `R$ 0,51`; isso mistura regra comercial com provider.
- `src/schemas/transaction.schema.ts` possui `fee?: number`, porém o campo não aparece como fonte confiável nem como snapshot reproduzível.
- Criações/alterações de transações estão espalhadas por pelo menos:
  - `src/payments/cash-in/cash-in.service.ts`;
  - `src/payments/cash-out/cash-out.service.ts`;
  - `src/payments/webhooks/delfinance-webhook.service.ts`;
  - `src/payments/webhooks/woovi-webhook.service.ts`;
  - `src/crypto-assets/exchange/crypto-exchange.service.ts`;
  - `src/crypto-assets/transfer/crypto-transfer.service.ts`;
  - `src/credits/credits.service.ts`;
  - `src/credits/loan-cron.service.ts`;
  - `src/core/corporate/approval/approval.service.ts`.
- `src/core/statement/statement.service.ts:76` calcula saldo a partir do último extrato e atualiza `BankAccount.balance` sem journal de dupla entrada nem transação atômica.
- Serviços de cash-out e cripto alteram saldos e chamam providers em sequência síncrona, sem saga durável.
- `CryptoExchangeService` é uma conversão interna de saldos; não representa OKX/Kraken.
- `CryptoTransferService` ainda usa `parseFloat` e cria transações sem uma conta bancária obrigatória, divergindo do schema atual.
- `ContractsService.signContract` apenas muda o contrato para `SIGNED`; não existe outbox/invoice.
- `OsContract` não possui os vínculos suficientes de tenant, emissor, subconta e wallet profile.
- `ProviderFactory` atualmente retorna Delfinance de forma fixa, ignorando o provider solicitado.
- Webhooks não possuem um inbox unificado, assinatura/replay protection e idempotência financeira central.
- `src/main.ts` ainda contém credenciais default de Swagger e CORS `origin: true`.

### Frontend

- `lib/api.ts` contém transporte, contratos e todos os domínios em um único arquivo.
- `lib/admin.api.ts` chama `api.patch`, mas `ApiClient` não implementa `patch`.
- `lib/api.ts` ainda possui fallback para a API de produção e envia `NEXT_PUBLIC_ACCESS_KEY` pelo navegador.
- `CryptoPage` mostra estimativas locais e não trabalha com quote executável, fee snapshot ou saga.
- `CashOutPage` chama diretamente os endpoints fiat; não existe escolha “Pagar usando cripto”.
- O detalhe do contrato não exibe invoice nem estado de pagamento.
- Não existem páginas dedicadas para invoices, settlement, fees, treasury, reconciliation, providers ou alerts.
- Não há framework de testes frontend configurado no `package.json` atual.

---

## 3. Princípios e invariantes obrigatórios

1. Uma origem `CONTRACT`/`SERVICE_ORDER` gera no máximo uma invoice ativa.
2. Uma invoice e um payout são liquidados no máximo uma vez.
3. Toda transação financeira possui `feeAssessmentId`; gratuidade usa assessment explícito com total zero.
4. Nenhum módulo calcula taxa comercial por conta própria.
5. Nenhum adapter externo define o que o cliente paga; ele apenas informa custos/regras do provider.
6. Taxa, quote, política, rota e provider usados ficam congelados em snapshots imutáveis.
7. Nenhuma operação altera `Wallet.balance` ou `BankAccount.balance` diretamente depois do cutover do ledger.
8. Saldo e extrato são projeções reconstruíveis do ledger.
9. Todo journal é balanceado, append-only e persistido atomicamente.
10. Correções são lançamentos reversos; nunca edição/delete de histórico financeiro.
11. BRL usa `amountMinor` inteiro em centavos.
12. Cripto usa `atomicAmount` como string inteira com decimals explícitos.
13. Preço, percentual e taxa usam decimal string + escala; nunca `number`/`parseFloat` em domínio financeiro.
14. Toda mutação financeira aceita `Idempotency-Key` e preserva o mesmo resultado em repetição.
15. Webhook nunca é prova única: validar assinatura, replay, payload normalizado e consultar o provider quando necessário.
16. Job duplicado não pode duplicar depósito, ordem, saque, crédito, taxa ou payout.
17. Fundos confirmados nunca terminam simplesmente em `FAILED`; permanecem como obrigação em estado explícito.
18. Policy desabilitada bloqueia novas operações, mas workers continuam tratando obrigações existentes.
19. Telegram é apenas alerta; ações financeiras ocorrem no painel autenticado.
20. A exchange escolhida fica “sticky” após emissão de endereço/funding para evitar venda/saque duplicado entre OKX e Kraken.

---

## 4. Arquitetura-alvo

```text
Frontend Next.js
  ├── Cliente/beneficiário: contratos, invoices, quotes e payouts
  └── Admin: fees, policies, providers, settlement, treasury, reconciliação
                    │
                    ▼
Backend NestJS modular monolith
  ├── IAM / RBAC / MFA / Tenant
  ├── Billing (Invoice + PaymentIntent)
  ├── Pricing (ExecutableQuote)
  ├── Fees (FeePolicy + FeeRule + FeeAssessment)
  ├── Ledger (accounts + journals + holds + projections)
  ├── Crypto Funding (deposit instruction + watcher)
  ├── Exchange Integration (ExchangePort)
  │     ├── OKX adapter
  │     └── Kraken adapter
  ├── Treasury & Liquidity
  ├── Settlement (sagas + policies + fallback)
  ├── Payout (Pix/boleto)
  ├── Reconciliation
  └── Admin & Alerts
                    │
                    ▼
MongoDB + transactional outbox/inbox | Redis/BullMQ | Vault/HSM/MPC
                    │
                    ▼
Blockchain/RPC | OKX | Kraken | BaaS | KYT | Telegram
```

### Fronteiras principais

- **Domain/application:** decide regras, estados, fees, idempotência e journals.
- **Adapters:** traduz autenticação, payloads, precision, min notional, rate limits e erros externos.
- **Workers:** executam efeitos externos e retomam do estado persistido.
- **Ledger:** único ponto autorizado a reconhecer movimentação financeira.
- **FeeEngine:** único ponto autorizado a selecionar/calcular taxas cobradas do cliente.
- **Reconciliation:** compara fatos externos com ledger, sem corrigir automaticamente fora de tolerâncias aprovadas.

---

## 5. Modelo único de taxas

### 5.1 Entidades persistidas

#### `FeePolicy`

- `id`, `tenantId`, `partnerId` e escopo global opcional;
- `name`, `version`, `status`: `DRAFT | PENDING_APPROVAL | ACTIVE | SUPERSEDED | DISABLED`;
- `validFrom`, `validUntil`;
- `createdBy`, `submittedBy`, `approvedBy`, timestamps e justificativa;
- índice que impeça duas versões ativas conflitantes no mesmo escopo/período.

#### `FeeRule`

- referência à `FeePolicy`;
- `operationType`: cash-in, cash-out, transfer, crypto buy/sell/transfer, invoice, settlement, payout, credit, installment, maintenance, refund e demais tipos aprovados;
- filtros: método, tenant/partner/account, PF/PJ, provider, rota, exchange, asset, network, faixa de valor e canal;
- `calculationType`: `ZERO_RATED | FIXED | PERCENTAGE | FIXED_PLUS_PERCENTAGE | TIERED`;
- valor fixo, percentual decimal string, mínimo, máximo, moeda e rounding mode;
- `chargeBearer`: pagador, beneficiário, remetente, recebedor, plataforma ou compartilhado;
- `chargeMode`: adicional ao principal, deduzido do crédito, deduzido do ativo, separado ou absorvido;
- `chargeMoment`: na autorização, funding confirmado, settlement, payout, fechamento mensal ou estorno;
- regra para taxa estimada versus real e limite de diferença autorizado.

#### `FeeAssessment`

Snapshot imutável produzido para cada operação:

- `operationId`, `operationType`, `feePolicyId`, `policyVersion` e regras selecionadas;
- `grossAmount`, componentes, `totalFee`, `netAmount` e moedas/escalas;
- custos estimados: rede/gas, exchange/trade, saque, BaaS;
- receita de plataforma: fixa, percentual, spread e outros componentes aprovados;
- `estimatedAt`, `expiresAt`, `settledAt`;
- valores estimados e reais separados;
- justificativa explícita para `ZERO_RATED`;
- hash do snapshot para reprodução/auditoria.

#### `FeeCharge`

- vínculo único com `FeeAssessment`, operação, componente e journal;
- `status`: `PENDING | RECOGNIZED | REVERSED | WAIVED`;
- valor/currency, conta de receita ou despesa e referência externa;
- chave única para impedir dupla cobrança.

### 5.2 Precedência

1. regra específica da conta;
2. regra específica do tenant/partner;
3. regra global;
4. dentro do mesmo nível, escolher a regra mais específica por método/provider/rota/ativo/faixa;
5. empate é erro de configuração e bloqueia publicação;
6. ausência de regra é `FEE_POLICY_NOT_CONFIGURED`, nunca taxa zero implícita.

### 5.3 Cobrança por fluxo

| Fluxo | Base de cálculo | Forma padrão proposta | Momento |
|---|---|---|---|
| Cash-in Pix/boleto | valor bruto recebido | deduzir do crédito líquido do beneficiário | confirmação + conciliação |
| Cash-out Pix/boleto/TED | principal | debitar principal + taxa do remetente | autorização/reserva |
| Compra cripto | BRL informado | debitar BRL total; creditar cripto líquida conforme quote | execução/fills |
| Venda cripto | cripto vendida/BRL recebido | creditar BRL líquido | execução/fills |
| Transferência cripto interna | quantidade enviada | taxa de plataforma explícita; zero permitido por regra | autorização |
| Transferência on-chain | quantidade + gas/rede | reservar estimativa e reconciliar custo real | broadcast/confirmação |
| Invoice BRL | valor integral da invoice | payer-paid ou dedução do beneficiário conforme policy | criação do intent/settlement |
| Invoice cripto direto | atomic amount | taxa de plataforma/rede explicitada; sem conversão | confirmação |
| Cripto convertida | valor bruto cripto/BRL | rede + exchange + saque + BaaS + plataforma + spread | quote e settlement |
| Payout financiado por cripto | valor do título/Pix | cripto total cobre principal e todas as taxas | quote/settlement |
| Crédito/liberação/parcela | principal/parcela | regra explícita, inclusive zero | liberação/débito |
| Manutenção mensal | conta/plano | valor fixo versionado | scheduler idempotente |
| Reembolso/reversão | assessment original | aplicar política de reversão; não recalcular com regra atual | saga de refund |

### 5.4 Garantia de aplicação em toda transação

A garantia não pode depender de lembrar de injetar `FeeService` em cada controller. Serão usadas três barreiras:

1. cada comando financeiro chama `FeeEngine.assess(...)` antes de reservar/mover valor;
2. `LedgerService.postJournal(...)` rejeita journals de operação sem `feeAssessmentId`, inclusive quando total é zero;
3. `Transaction`/projeções exigem `grossAmountMinor`, `feeAmountMinor`, `netAmountMinor`, `feeAssessmentId` e `policySnapshotId`.

Adapters recebem valores já definidos pelo application service e retornam custos reais; eles não podem alterar silenciosamente a taxa comercial.

### 5.5 Migração das taxas legadas

Consolidar, sem perda histórica:

- `src/schemas/fee.schema.ts`;
- `src/schemas/fee-config.schema.ts`;
- `User.pixFeePercentage`;
- `BankAccount.fee`;
- `Config.WOOVI_PIX_FEE_PERCENTAGE`;
- defaults hardcoded no adapter Woovi;
- `Transaction.fee` e `Statement.isFee`.

Estratégia:

1. inventariar registros e conflitos;
2. gerar uma política inicial versionada por partner/tenant;
3. executar shadow calculation e comparar com o comportamento legado;
4. ativar por feature flag/tenant;
5. backfill apenas de referências históricas conhecidas, sem recalcular valores passados;
6. remover leituras legadas somente após reconciliação e janela de observação.

---

## 6. Sequência única de implementação

As tarefas abaixo são sequenciais. Cada uma deve terminar com testes, evidência e um commit pequeno. Nenhuma fase financeira avança se o gate anterior falhar.

### Tarefa 0 — Fechar decisões e contratos externos

**Objetivo:** remover decisões que mudariam o modelo de dados ou inviabilizariam as rotas.

**Arquivos/documentos:**

- Criar no backend: `docs/adr/0001-financial-foundation.md`;
- Criar: `docs/adr/0002-global-fee-engine.md`;
- Criar: `docs/adr/0003-okx-kraken-routing.md`;
- Criar: `docs/provider-capability-matrix.md`;
- Atualizar as notas de produto/arquitetura apenas depois da aprovação.

**Passos:**

1. Confirmar redes/tokens do piloto e respectivos contratos/decimals.
2. Confirmar contas institucionais OKX/Kraken, região, permissões, IP allowlist, subcontas e SLA.
3. Validar por conta real/sandbox: pares executáveis, depósito por rede, client order ID, fills, withdrawal, tarifas e suporte a BRL.
4. Definir qual fluxo transforma o resultado da venda em BRL caso a exchange não ofereça saque BRL direto.
5. Definir policy de seleção inicial OKX/Kraken e se ambas são ativas no piloto.
6. Definir quem paga cada componente de taxa, regras de mínimo/máximo, arredondamento, isenções, spread e reversão.
7. Definir conta master, forma de crédito da subconta e BaaS do piloto.
8. Aprovar custódia HSM/MPC/custodiante, KYT, jurídico/regulatório e modelo contábil.
9. Definir quote TTL, slippage, limites, confirmações, SLA, fallback e tolerâncias de reconciliação.

**Gate:** capability matrix e ADRs aprovados por produto, tesouraria, contabilidade, segurança, compliance/jurídico e engenharia.

**Commit sugerido:** `docs: approve financial and exchange architecture decisions`.

### Tarefa 1 — Conter riscos críticos da base

**Objetivo:** impedir que novos módulos sejam construídos sobre configurações inseguras.

**Arquivos:**

- Backend: `src/main.ts`, `src/config/vault.service.ts` e testes novos em `src/main.spec.ts`;
- Frontend: `lib/api.ts`, configuração de ambiente documentada em `README.md`;
- CI: workflows existentes em `.github/workflows/` ou criar os necessários.

**Passos:**

1. Remover defaults do Swagger e falhar startup quando credenciais obrigatórias não existirem.
2. Rotacionar credenciais fora do repositório.
3. Trocar CORS refletido por allowlist por ambiente.
4. Remover fallback frontend para produção.
5. Tratar `x-access-key` apenas como identificador público e garantir autorização por identidade/tenant no backend.
6. Corrigir o boundary HTTP, incluindo o método `patch` usado por `lib/admin.api.ts`.
7. Adicionar timeout, erro tipado e propagação de correlation ID.
8. Ativar secret scan, dependency scan e SAST no CI.

**Validação:** testes de startup, CORS, autenticação/tenancy e chamadas admin; frontend `pnpm run lint && pnpm run build`; backend `pnpm test && pnpm run build`.

**Commit sugerido:** `fix: harden runtime configuration and api transport`.

### Tarefa 2 — Versionar contratos e gerar o cliente frontend

**Objetivo:** impedir drift durante a expansão da API.

**Arquivos:**

- Backend: `src/main.ts`, DTOs em cada módulo e `docs/swagger.json` como artefato de CI;
- Frontend: criar `lib/api/client.ts`, `lib/api/generated/`, `lib/api/errors.ts` e adapters por domínio;
- Modificar gradualmente `lib/api.ts` até virar facade temporária e depois removê-la.

**Passos:**

1. Padronizar envelopes de sucesso/erro.
2. Publicar OpenAPI versionado no CI do backend.
3. Adicionar diff de OpenAPI como quality gate.
4. Gerar tipos/client TypeScript no frontend.
5. Criar modules `auth`, `accounts`, `payments`, `contracts`, `billing`, `crypto`, `settlement` e `admin` sobre o client gerado.
6. Configurar workspace Gortex compartilhado para os dois repositórios e validar contratos provider/consumer.
7. Criar smoke test frontend ↔ backend em ambiente efêmero.

**Gate:** qualquer breaking change de rota/DTO falha antes do merge.

**Commit sugerido:** `build: enforce versioned api contracts`.

### Tarefa 3 — Padronizar valores monetários e transações MongoDB

**Objetivo:** eliminar `number`/`parseFloat` e permitir atomicidade financeira.

**Arquivos:**

- Criar `src/financial/money/money.ts`;
- Criar `src/financial/money/crypto-amount.ts`;
- Criar `src/financial/money/decimal-value.ts`;
- Criar `src/financial/money/rounding.ts`;
- Modificar schemas financeiros em `src/schemas/`;
- Atualizar configuração Mongo/ambientes para replica set e sessões.

**Passos:**

1. Formalizar `amountMinor`, `atomicAmount`, decimal string, scale e rounding mode.
2. Adicionar validadores/serializadores de DTO.
3. Garantir Mongo replica set e transações em dev, test, staging e produção.
4. Criar testes de arredondamento, overflow, min unit, decimals e conversões de adapter.
5. Migrar primeiro os novos módulos; criar plano separado e controlado para campos legados.

**Gate:** nenhum novo schema/DTO financeiro aceita `number` para valores persistidos de domínio.

**Commit sugerido:** `feat: add precise monetary value objects`.

### Tarefa 4 — Implementar ledger de dupla entrada

**Objetivo:** criar a fonte contábil autoritativa antes de novos fluxos.

**Arquivos:**

- Criar `src/ledger/ledger.module.ts`;
- Criar `src/ledger/ledger.service.ts`;
- Criar `src/ledger/ledger.controller.ts` apenas para consultas autorizadas;
- Criar `src/schemas/ledger-account.schema.ts`;
- Criar `src/schemas/ledger-journal.schema.ts`;
- Criar `src/schemas/ledger-entry.schema.ts`;
- Criar `src/schemas/balance-hold.schema.ts`;
- Criar `src/ledger/projections/balance-projection.service.ts`;
- Modificar `src/core/statement/statement.service.ts`, `src/schemas/statement.schema.ts`, `src/schemas/bank-account.schema.ts` e `src/schemas/wallet.schema.ts`.

**Passos:**

1. Definir chart of accounts: clientes, master, custódia, exchange, trânsito, obrigações, receita de taxas, despesas de rede/exchange/BaaS e suspense.
2. Implementar journal balanceado e idempotente em uma transação Mongo.
3. Implementar holds/reservas e compare-and-swap.
4. Produzir projeções de saldo e extrato.
5. Impedir atualização direta de balances após feature flag de cutover.
6. Criar auditoria de invariantes e rebuild de projeções.
7. Migrar um tenant piloto e comparar ledger versus saldos legados.

**Testes:** débito/crédito balanceado, journal duplicado, concorrência de duas reservas, reversão, reconstrução de projeção e rollback de transação Mongo.

**Gate:** soma das partidas por journal é zero e duas operações concorrentes não consomem o mesmo saldo.

**Commit sugerido:** `feat: add transactional double-entry ledger`.

### Tarefa 5 — Criar idempotência, outbox, inbox e efeitos externos

**Objetivo:** tornar eventos, webhooks e workers repetíveis com segurança.

**Arquivos:**

- Criar `src/infra/idempotency/idempotency.module.ts` e `idempotency.service.ts`;
- Criar `src/infra/outbox/outbox.module.ts`, `outbox.service.ts` e `outbox.processor.ts`;
- Criar `src/infra/inbox/inbox.service.ts`;
- Criar `src/schemas/outbox-event.schema.ts`;
- Criar `src/schemas/inbox-message.schema.ts`;
- Criar `src/schemas/idempotency-record.schema.ts`;
- Criar `src/schemas/external-effect.schema.ts`;
- Modificar `src/infra/infra.module.ts` e webhooks atuais.

**Passos:**

1. Persistir mudança de agregado + outbox na mesma transação.
2. Deduplicar requests por tenant + endpoint + `Idempotency-Key` + hash do payload.
3. Deduplicar webhooks por provider/event ID/hash e janela anti-replay.
4. Registrar tentativa, request hash, external ID e resultado de cada efeito externo.
5. Consultar o provider antes de repetir efeitos com resultado desconhecido.
6. Versionar envelope de evento com correlation/causation IDs.

**Testes:** mesma request retorna o mesmo resultado; webhook duplicado não duplica journal; worker reiniciado continua do checkpoint.

**Commit sugerido:** `feat: add durable idempotency and event delivery`.

### Tarefa 6 — Construir o motor global de taxas no banco

**Objetivo:** substituir configurações fragmentadas por uma política única, versionada e auditável.

**Arquivos:**

- Criar `src/fees/fees.module.ts`;
- Criar `src/fees/fee-engine.service.ts`;
- Criar `src/fees/fee-policy.service.ts`;
- Criar `src/fees/fee-validation.service.ts`;
- Criar `src/fees/fee.controller.ts` para quote/consulta autorizada;
- Criar `src/fees/admin-fee.controller.ts` para gestão administrativa;
- Criar `src/schemas/fee-policy.schema.ts`;
- Criar `src/schemas/fee-rule.schema.ts`;
- Criar `src/schemas/fee-assessment.schema.ts`;
- Criar `src/schemas/fee-charge.schema.ts`;
- Criar script `scripts/migrations/migrate-fees-to-policies.ts`;
- Deprecar gradualmente `src/core/fee/`, `src/schemas/fee.schema.ts` e `src/schemas/fee-config.schema.ts`.

**Passos:**

1. Implementar seleção determinística por precedência e data de vigência.
2. Implementar cálculos fixo, percentual, combinado, tiered, min/max e zero-rated.
3. Implementar rounding explícito por moeda.
4. Implementar snapshot imutável e hash reproduzível.
5. Bloquear policy com overlap, lacunas ou empate.
6. Publicar policy somente com dupla aprovação.
7. Gerar journals separados para receita de plataforma e despesa externa.
8. Migrar configurações legadas e executar shadow calculation.
9. Adicionar feature flags por tenant e rollback para a policy anterior.

**Testes:** tabela de precedência, faixas de valor, vigência, timezone, arredondamento, min/max, policy inexistente, zero-rated, duplicidade de charge e reversão.

**Gate:** toda operação de teste produz exatamente um `FeeAssessment`, inclusive as gratuitas.

**Commit sugerido:** `feat: add database-backed global fee engine`.

### Tarefa 7 — Aplicar o motor de taxas a todos os fluxos existentes

**Objetivo:** fechar os caminhos que hoje criam transações sem fee assessment.

**Arquivos:**

- `src/payments/cash-in/cash-in.service.ts`;
- `src/payments/cash-out/cash-out.service.ts`;
- `src/payments/webhooks/delfinance-webhook.service.ts`;
- `src/payments/webhooks/woovi-webhook.service.ts`;
- `src/payments/providers/services/woovi-provider.service.ts`;
- `src/crypto-assets/exchange/crypto-exchange.service.ts`;
- `src/crypto-assets/transfer/crypto-transfer.service.ts`;
- `src/credits/credits.service.ts`;
- `src/credits/loan-cron.service.ts`;
- `src/core/corporate/approval/approval.service.ts`;
- `src/schemas/transaction.schema.ts`;
- respectivos módulos e testes `.spec.ts`.

**Passos:**

1. Remover cálculo comercial de taxa do adapter Woovi.
2. Calcular assessment antes de autorização/reserva.
3. Fazer limites e aprovações considerarem o total debitado, não só o principal.
4. Persistir gross, fee, net, policy e assessment na transação/projeção.
5. Registrar custo real retornado pelo provider sem alterar cobrança fora da tolerância autorizada.
6. Aplicar fee policy a crédito, parcelas, transferências internas e operações administrativas; isenção deve ser explícita.
7. Fazer refund/reversal referenciar o assessment original.
8. Impedir que qualquer um desses serviços atualize saldo diretamente após o cutover.
9. Adicionar teste de cobertura que liste todo `TransactionType` e exija uma fee rule/estratégia.

**Gate:** suíte por tipo de transação comprova principal, taxa, líquido, journals e idempotência.

**Commit sugerido:** `refactor: enforce fee assessment on every financial flow`.

### Tarefa 8 — Criar registry de ativos, redes e providers

**Objetivo:** tornar tokens, redes, exchanges e contas operacionais configuráveis sem aceitar símbolos livres.

**Arquivos:**

- Criar `src/registry/registry.module.ts`;
- Criar `src/registry/asset-registry.service.ts`;
- Criar `src/registry/provider-registry.service.ts`;
- Criar `src/schemas/asset-network.schema.ts`;
- Criar `src/schemas/external-provider.schema.ts`;
- Criar `src/schemas/provider-account.schema.ts`;
- Criar `src/schemas/withdrawal-allowlist.schema.ts`;
- Criar APIs administrativas em `src/admin/providers/`.

**Passos:**

1. Persistir chain ID, token contract, decimals, gas token, dust, confirmação/finality e status.
2. Persistir capacidades por OKX/Kraken: depósito, trade, withdrawal, pares, redes, limites e ambiente.
3. Guardar apenas secret references; nunca credenciais no Mongo/log.
4. Validar conta, rede, endereço e allowlist antes de ativar provider.
5. Implementar health/capability checks e cache com validade curta.

**Gate:** nenhuma operação é criada com asset/network/provider fora do registry ativo.

**Commit sugerido:** `feat: add versioned asset and provider registry`.

### Tarefa 9 — Definir `ExchangePort` e roteamento OKX/Kraken

**Objetivo:** criar contrato interno único sem vazar payloads específicos das exchanges.

**Arquivos:**

- Criar `src/exchange/exchange.module.ts`;
- Criar `src/exchange/ports/exchange.port.ts`;
- Criar `src/exchange/exchange-router.service.ts`;
- Criar `src/exchange/exchange-capability.service.ts`;
- Criar `src/exchange/exchange-error.mapper.ts`;
- Criar DTOs normalizados em `src/exchange/dto/`;
- Criar `src/schemas/exchange-deposit.schema.ts`;
- Criar `src/schemas/exchange-order.schema.ts`;
- Criar `src/schemas/exchange-fill.schema.ts`;
- Criar `src/schemas/fiat-withdrawal.schema.ts`.

**Métodos mínimos do port:**

- obter instrumentos/capabilities;
- obter endereço de depósito por asset/network;
- consultar depósitos;
- obter balance disponível;
- criar ordem com chave idempotente;
- consultar ordem e fills;
- cancelar restante quando permitido;
- obter custos/fees;
- solicitar e consultar saque;
- obter statements/bills para reconciliação.

**Passos:**

1. Definir erros normalizados: retryable, permanent, manual review e unknown outcome.
2. Definir precision/min notional/lot size no boundary.
3. Definir provider stickiness e failover apenas antes de funding.
4. Persistir `provider`, `providerAccountId`, `external IDs` e payload hashes em cada etapa.
5. Criar contract test reutilizável que qualquer adapter deve passar.

**Commit sugerido:** `feat: define exchange port and routing policy`.

### Tarefa 10 — Implementar adapter OKX

**Objetivo:** integrar depósitos, ordens, fills e saques OKX com segurança e reconciliação.

**Arquivos:**

- Criar `src/exchange/adapters/okx/okx-exchange.adapter.ts`;
- Criar `src/exchange/adapters/okx/okx-auth.service.ts`;
- Criar `src/exchange/adapters/okx/okx-client.ts`;
- Criar `src/exchange/adapters/okx/okx.mapper.ts`;
- Criar fixtures/testes em `src/exchange/adapters/okx/*.spec.ts`.

**Passos:**

1. Implementar assinatura, timestamp UTC e domínio regional configurável.
2. Implementar time sync e tratamento de clock skew.
3. Integrar currencies/capabilities, depósito, histórico, order/fills e withdrawal/history.
4. Mapear `clOrdId`/IDs externos para a idempotência interna, após validar limites do provider.
5. Implementar rate limit, timeout, retry seguro e circuit breaker.
6. Separar API keys por `read`, `trade` e `withdraw`; usar IP allowlist e secret manager.
7. Validar contra demo/sandbox e depois conta institucional controlada.

**Gate:** contract tests do `ExchangePort`, cenários de ordem parcial, timeout com resultado desconhecido e saque pendente.

**Commit sugerido:** `feat: add OKX exchange adapter`.

### Tarefa 11 — Implementar adapter Kraken

**Objetivo:** oferecer a mesma capacidade normalizada usando Kraken.

**Arquivos:**

- Criar `src/exchange/adapters/kraken/kraken-exchange.adapter.ts`;
- Criar `src/exchange/adapters/kraken/kraken-auth.service.ts`;
- Criar `src/exchange/adapters/kraken/kraken-client.ts`;
- Criar `src/exchange/adapters/kraken/kraken.mapper.ts`;
- Criar fixtures/testes em `src/exchange/adapters/kraken/*.spec.ts`.

**Passos:**

1. Implementar nonce/assinatura e serialização conforme API Kraken.
2. Integrar asset pairs, deposit methods/addresses/status, orders/trades e withdrawal info/status.
3. Confirmar e mapear mecanismo de client reference/idempotência suportado na conta contratada.
4. Normalizar nomes internos de asset/network e não usar símbolo da exchange como identidade.
5. Implementar rate limit, timeout, retry seguro e circuit breaker.
6. Validar conta institucional, permissões e capacidade BRL real.

**Gate:** mesma suíte de contrato do adapter OKX, sem branches especiais no domínio.

**Commit sugerido:** `feat: add Kraken exchange adapter`.

### Tarefa 12 — Implementar pricing, blockchain, custódia e KYT ports

**Objetivo:** obter quotes executáveis e confirmar fundos on-chain sem acoplar domínio a fornecedor.

**Arquivos:**

- Criar `src/pricing/` com `pricing.module.ts`, `quote.service.ts` e `price-source.port.ts`;
- Criar `src/schemas/executable-quote.schema.ts`;
- Criar `src/blockchain/ports/blockchain.port.ts` e watcher/normalizadores;
- Criar `src/custody/ports/custody.port.ts` e `signing-request.service.ts`;
- Criar `src/compliance/ports/kyt.port.ts`;
- Criar `src/schemas/blockchain-transaction.schema.ts`;
- Criar `src/schemas/wallet-profile.schema.ts`;
- Criar `src/schemas/crypto-deposit-instruction.schema.ts`.

**Passos:**

1. Separar quote indicativo de quote executável.
2. Incluir fonte, timestamp, profundidade, spread, fees, TTL, slippage e rota no quote.
3. Consultar OKX/Kraken como fontes executáveis conforme policy; usar fonte independente para circuit breaker.
4. Implementar detecção, receipt/status, confirmações/finality e reorg handling.
5. Criar signing requests; chaves privadas nunca entram no NestJS/Mongo.
6. Bloquear settlement em `COMPLIANCE_HOLD` quando KYT exigir.

**Gate:** quote stale/divergente é bloqueado; transação errada de token/rede/endereço não credita saldo.

**Commit sugerido:** `feat: add executable pricing and crypto funding ports`.

### Tarefa 13 — Implementar políticas e saga de settlement

**Objetivo:** criar o motor compartilhado por invoice convertida e payout financiado por cripto.

**Arquivos:**

- Criar `src/settlement/settlement.module.ts`;
- Criar `src/settlement/settlement-orchestrator.service.ts`;
- Criar `src/settlement/settlement-policy.service.ts`;
- Criar `src/settlement/workers/settlement.processor.ts`;
- Criar `src/schemas/settlement-policy.schema.ts`;
- Criar `src/schemas/settlement-operation.schema.ts`;
- Criar `src/schemas/settlement-transition.schema.ts`;
- Criar `src/schemas/policy-snapshot.schema.ts`.

**Passos:**

1. Persistir estados e compare-and-swap.
2. Implementar `MASTER_WALLET | EXCHANGE` e `NONE | NOTIFY_ONLY | AUTO_EXCHANGE`.
3. Copiar policy, fee, quote, provider e confirmation rules para snapshot.
4. Criar handlers pequenos por etapa, sem grande `switch` monolítico.
5. Implementar retries/timeouts/compensações consultando efeitos externos.
6. Implementar pause/resume e manual review sem apagar obrigação.
7. Propagar correlation/causation IDs.

**Testes:** todos os caminhos do state machine, job duplicado, crash entre efeito externo e persistência, fallback, provider sticky e ação manual.

**Commit sugerido:** `feat: add durable settlement orchestration`.

### Tarefa 14 — Implementar invoice integral para Pix e boleto

**Objetivo:** entregar primeiro o fluxo de invoice sem cripto sobre a fundação financeira.

**Arquivos:**

- Criar `src/billing/billing.module.ts`;
- Criar `src/billing/invoice.service.ts`;
- Criar `src/billing/payment-intent.service.ts`;
- Criar `src/billing/invoice.controller.ts`;
- Criar `src/billing/workers/contract-signed.processor.ts`;
- Criar `src/schemas/invoice.schema.ts`;
- Criar `src/schemas/payment-intent.schema.ts`;
- Modificar `src/core/contracts/contracts.service.ts`;
- Modificar `src/core/contracts/schemas/os-contract.schema.ts`;
- Modificar `src/payments/cash-in/` para associação/reconciliação da invoice.

**Passos:**

1. Adicionar tenant, emissor, beneficiário, subconta e wallet profile à origem.
2. Gravar `SIGNED` + `contract.signed.v1` na mesma transação/outbox.
3. Criar invoice idempotente por `(tenantId, sourceType, sourceId)`.
4. Implementar payment intents Pix/boleto com fee assessment e prazo.
5. Associar external charge à invoice e reconciliar via inbox + polling.
6. Fechar a invoice com a primeira intent liquidada; cancelar concorrentes.
7. Projetar `paymentStatus` para contrato/O.S.
8. Enviar under/over/late payment para revisão.

**Testes:** assinatura duplicada, evento duplicado, duas intents pagas concorrentes, webhook duplicado e pagamento tardio.

**Commit sugerido:** `feat: add full-value invoice billing`.

### Tarefa 15 — Implementar `CRYPTO_DIRECT`

**Objetivo:** permitir pagamento direto na wallet aprovada do beneficiário, sem conversão fiat.

**Arquivos:**

- Expandir `src/billing/payment-intent.service.ts`;
- Criar `src/blockchain/crypto-direct.service.ts`;
- Criar `src/blockchain/workers/blockchain-watcher.processor.ts`;
- Usar `wallet-profile`, `crypto-deposit-instruction` e `blockchain-transaction` schemas.

**Passos:**

1. Aprovar WalletProfile por rede/token.
2. Emitir endereço exclusivo por xpub ou memo/tag; registrar risco de endereço compartilhado.
3. Calcular fee assessment e atomic amount esperado.
4. Detectar e validar token contract, rede, endereço, valor, tx hash e log index.
5. Aguardar confirmação/finality da policy.
6. Marcar invoice paga sem custódia da chave do beneficiário.
7. Tratar under/overpayment, reorg e token/rede incorretos.

**Gate:** uma tx on-chain não financia duas operações.

**Commit sugerido:** `feat: add direct crypto invoice payments`.

### Tarefa 16 — Implementar rota Carteira Master

**Objetivo:** converter economicamente o recebimento usando liquidez própria, sem venda imediata.

**Arquivos:**

- Criar `src/treasury/treasury.module.ts`;
- Criar `src/treasury/liquidity.service.ts`;
- Criar `src/treasury/reservation.service.ts`;
- Criar `src/schemas/liquidity-reservation.schema.ts`;
- Criar `src/schemas/treasury-position.schema.ts`;
- Integrar `settlement`, `fees`, `ledger`, `custody` e `billing`.

**Passos:**

1. Confirmar depósito na master.
2. Calcular gross/fees/net e registrar ativo cripto recebido.
3. Reservar BRL atomicamente considerando obrigações e buffer.
4. Criar obrigação e crédito restrito da subconta.
5. Liberar crédito e fechar invoice apenas após journals válidos.
6. Manter inventário cripto para rebalanceamento posterior.
7. Aplicar fallback do snapshot quando liquidez for insuficiente.

**Testes:** corrida de reservas, liquidez insuficiente, taxa maior que gross, compliance hold e reorg pós-crédito.

**Commit sugerido:** `feat: add master-wallet settlement route`.

### Tarefa 17 — Implementar rota Exchange e fallback Master → Exchange

**Objetivo:** liquidar por OKX/Kraken e habilitar resgate manual antes do automático.

**Arquivos:**

- Expandir `src/settlement/` e `src/exchange/`;
- Criar handlers de depósito, venda, fills, saque e reconciliação;
- Integrar `src/schemas/exchange-*` e `fiat-withdrawal`.

**Passos:**

1. Selecionar OKX/Kraken por policy e capabilities antes de gerar instrução.
2. Persistir o provider escolhido no snapshot.
3. Aguardar depósito creditado pela exchange, não apenas confirmação on-chain.
4. Criar ordem idempotente; acompanhar fills e fees.
5. Tratar fill parcial até limiar/timeout; cancelar restante ou revisar.
6. Solicitar saque/transferência fiat aprovada pelo modelo da conta.
7. Conciliar crédito na conta master antes de provisionar subconta.
8. Implementar fallback manual `EXECUTE_EXCHANGE_FALLBACK`.
9. Ativar `AUTO_EXCHANGE` somente após piloto manual, dupla aprovação e chaos tests.
10. Proibir repetição cega de ordem/saque e failover de exchange após funding.

**Gate:** cadeia `depósito → ordem/fills → saque → banco master → subconta` totalmente conciliada.

**Commit sugerido:** `feat: add exchange settlement and controlled fallback`.

### Tarefa 18 — Implementar Pix/boleto financiado por cripto

**Objetivo:** permitir pagar Pix ou boleto usando cripto com crédito BRL restrito.

**Arquivos:**

- Criar `src/crypto-funded-payout/crypto-funded-payout.module.ts`;
- Criar `src/crypto-funded-payout/crypto-funded-payout.service.ts`;
- Criar `src/crypto-funded-payout/crypto-funded-payout.controller.ts`;
- Criar `src/crypto-funded-payout/workers/payout.processor.ts`;
- Criar `src/schemas/crypto-funded-payout.schema.ts`;
- Criar `src/schemas/payout-request.schema.ts`;
- Modificar `src/payments/cash-out/` e `IBaasProvider` para consulta/normalização completa.

**Passos:**

1. Consultar chave Pix e validar boleto antes do funding.
2. Criar executable quote com todas as taxas e valor mínimo garantido.
3. Criar operação idempotente e reservar/receber cripto.
4. Executar rota Master ou Exchange.
5. Provisionar crédito BRL restrito ao payout.
6. Reaplicar aprovações corporativas e step-up MFA.
7. Enviar Pix/boleto e confirmar via webhook + polling.
8. Tratar rejeição, devolução, vencimento, refund e manual review.

**Gate:** cliente nunca consegue gastar o crédito provisionado antes do payout.

**Commit sugerido:** `feat: add crypto-funded pix and boleto payouts`.

### Tarefa 19 — Implementar painel administrativo e governança

**Objetivo:** operar policies, fees, providers, liquidity e exceções sem editar código.

**Backend — arquivos:**

- Separar o crescimento de `src/admin/admin.controller.ts` em módulos sob `src/admin/settlement/`, `fees/`, `treasury/`, `reconciliation/`, `providers/` e `alerts/`;
- Criar `src/admin/guards/financial-role.guard.ts`;
- Criar `src/admin/approvals/admin-action-approval.service.ts`;
- Criar `src/schemas/admin-action.schema.ts`;
- Criar `src/schemas/admin-action-approval.schema.ts`;
- Criar `src/schemas/audit-event.schema.ts`.

**Frontend — criar:**

- `app/dashboard/admin/fees/page.tsx`;
- `app/dashboard/admin/settlement/policies/page.tsx`;
- `app/dashboard/admin/settlement/operations/page.tsx`;
- `app/dashboard/admin/settlement/operations/[id]/page.tsx`;
- `app/dashboard/admin/treasury/page.tsx`;
- `app/dashboard/admin/reconciliation/page.tsx`;
- `app/dashboard/admin/providers/page.tsx`;
- `app/dashboard/admin/alerts/page.tsx`;
- atualizar `components/dashboard/sidebar.tsx` e clients admin.

**Passos:**

1. Implementar roles granulares: viewer, crypto operator, treasury operator/approver, compliance, policy admin/approver, auditor e super admin.
2. Exigir dupla aprovação para policy, provider, allowlist, fallback, crédito manual e refund acima do limite.
3. Exibir fee policy diff, vigência e impacto antes da publicação.
4. Exibir timeline completa, fee/quote snapshot, journals, webhooks, external effects e reconciliação.
5. Implementar ações idempotentes: retry, refresh, pause/resume, reconcile, fallback e refund.
6. Implementar kill switches por módulo, provider, rede, token e efeito externo.
7. Nunca oferecer “marcar concluído” sem evidência e journal.

**Gate:** solicitante e aprovador são distintos; toda ação possui motivo, MFA/step-up, audit event e resultado.

**Commit sugerido:** `feat: add governed financial operations console`.

### Tarefa 20 — Implementar alertas confiáveis

**Objetivo:** alertar operações sem misturar comunicação com execução financeira.

**Arquivos:**

- Criar `src/alerts/alerts.module.ts`;
- Criar `src/alerts/alert.service.ts`;
- Criar `src/alerts/channels/telegram.adapter.ts`;
- Criar `src/alerts/workers/alert.processor.ts`;
- Criar `src/schemas/alert-event.schema.ts`;
- Criar `src/schemas/alert-delivery.schema.ts`.

**Passos:**

1. Persistir AlertEvent e publicar via outbox.
2. Configurar canal por ambiente/severidade com secret refs.
3. Mascarar valores/dados conforme papel e política.
4. Implementar retry, escalonamento, silêncio e canal secundário.
5. Manter alertas no painel mesmo se Telegram falhar.
6. Cobrir liquidez, SLA, fallback, provider outage, fill parcial, slippage, saque, payout, reconciliação e policy crítica.

**Commit sugerido:** `feat: add durable operational alerts`.

### Tarefa 21 — Implementar UX de invoices, quotes e fees

**Objetivo:** permitir que cliente/pagador autorize conhecendo valor, taxas, prazo e estado real.

**Frontend — arquivos:**

- Criar `app/invoices/[publicId]/page.tsx` para acesso público com token assinado e escopo mínimo;
- Criar `app/dashboard/invoices/page.tsx`;
- Criar `app/dashboard/invoices/[id]/page.tsx`;
- Modificar `app/dashboard/contracts/[id]/page.tsx` para mostrar invoice e payment status;
- Modificar `app/dashboard/crypto/page.tsx` para quote executável e fee breakdown;
- Modificar `app/dashboard/cashout/page.tsx` para opção fiat/cripto;
- Modificar `app/dashboard/statement/page.tsx` para gross/fee/net e journals projetados;
- Criar componentes `components/fees/fee-breakdown.tsx`, `components/settlement/status-timeline.tsx` e `components/crypto/deposit-instructions.tsx`;
- Atualizar `components/dashboard/sidebar.tsx`;
- Criar clients em `lib/api/billing.ts`, `lib/api/fees.ts`, `lib/api/settlement.ts` e `lib/api/admin-financial.ts`.

**Passos:**

1. Mostrar valor principal, cada taxa, total, líquido, fonte do preço, slippage e expiração antes da autorização.
2. Requisitar nova quote quando expirar; nunca estimar localmente com fallback fixo.
3. Exibir métodos Pix, boleto, cripto direto e cripto convertida conforme policy.
4. Exibir estados simplificados sem ocultar manual review.
5. Confirmar recebedor Pix e boleto antes do funding.
6. Não expor IDs/segredos/payloads operacionais.
7. Adicionar acessibilidade, loading, retry seguro e prevenção de double submit.

**Gate:** nenhum submit financeiro ocorre sem quote/fee snapshot vigente e confirmação explícita.

**Commit sugerido:** `feat: add invoice and crypto-funded payment experiences`.

### Tarefa 22 — Implementar reconciliação multinível

**Objetivo:** provar cada obrigação usando fatos independentes.

**Arquivos:**

- Criar `src/reconciliation/reconciliation.module.ts`;
- Criar reconciliadores `blockchain`, `exchange`, `bank-master`, `baas` e `end-to-end`;
- Criar workers em `src/reconciliation/workers/`;
- Criar `src/schemas/reconciliation-run.schema.ts`;
- Criar `src/schemas/reconciliation-entry.schema.ts`;
- Criar `src/schemas/reconciliation-exception.schema.ts`.

**Passos:**

1. Conciliar blockchain ↔ ledger.
2. Conciliar OKX/Kraken ↔ ledger, incluindo depósitos, fills, fees, balances e withdrawals.
3. Conciliar banco master ↔ ledger.
4. Conciliar BaaS/subcontas ↔ ledger.
5. Conciliar ponta a ponta por settlement.
6. Criar suspense e fila operacional para divergências.
7. Executar near-real-time, intraday, fechamento diário e mensal.
8. Assinar snapshots de fechamento e manter evidências exportáveis.

**Gate:** nenhuma diferença é “corrigida” sem tolerância versionada ou journal corretivo aprovado.

**Commit sugerido:** `feat: add multi-source financial reconciliation`.

### Tarefa 23 — Observabilidade, segurança e disaster recovery

**Objetivo:** tornar falhas detectáveis, contidas e recuperáveis.

**Arquivos:**

- Instrumentação nos módulos novos;
- dashboards/alerts na stack existente;
- runbooks em `docs/runbooks/`;
- threat model em `docs/security/crypto-settlement-threat-model.md`;
- plano DR em `docs/operations/disaster-recovery.md`.

**Passos:**

1. Métricas por estado, provider, route, fee component, latency, retry e divergência.
2. Tracing ponta a ponta com correlation ID.
3. Logs estruturados e mascarados.
4. Circuit breakers por OKX/Kraken/BaaS/RPC/KYT.
5. Backup/restore testado, RPO/RTO, outbox/inbox recovery e worker resume.
6. Threat model, pentest, DAST, dependency/secret scan.
7. Chaos tests: reorg, order partial, timeout unknown, withdrawal atrasado, provider outage, Pix devolvido e Telegram indisponível.
8. Runbooks por estado preso e kill switch.

**Gate:** tabletop e simulação técnica demonstram recuperação sem dupla movimentação.

**Commit sugerido:** `chore: harden financial operations and recovery`.

### Tarefa 24 — Piloto, migração e rollout gradual

**Objetivo:** ativar o sistema por etapas, com rollback e limites conservadores.

**Passos:**

1. Rodar shadow ledger e shadow fees nos fluxos existentes.
2. Comparar gross/fee/net e saldos diariamente.
3. Ativar primeiro invoice Pix/boleto para tenant interno.
4. Ativar cripto direto com uma rede/token e limites baixos.
5. Ativar Carteira Master com reserva conservadora.
6. Ativar uma exchange por vez para operações manuais; depois habilitar a segunda.
7. Habilitar fallback manual; só depois `AUTO_EXCHANGE`.
8. Ativar payout financiado por cripto por último.
9. Manter kill switches e suporte operacional 24x7 compatível com o produto.
10. Expandir tenants, ativos, redes e limites somente após SLO/reconciliação estáveis.

**Critérios de saída:** zero duplicidade financeira, reconciliação dentro da tolerância, fees reproduzíveis, ledger balanceado, runbooks validados e aprovação formal das áreas de controle.

**Commit sugerido:** `chore: enable controlled financial pilot`.

---

## 7. Estratégia de testes

### Backend

- Unitários Jest por value object, fee rule, state transition, policy e mapper.
- Contract tests reutilizáveis para OKX e Kraken.
- Integration tests com Mongo replica set e Redis reais/efêmeros.
- E2E Supertest para APIs, RBAC, idempotência e webhooks.
- Property-based ou tabelas exaustivas para valores/rounding/fee tiers.
- Testes concorrentes para holds, journals e primeira intent liquidada.
- Fixtures sanitizadas de providers; nunca gravar credenciais/payloads sensíveis.
- Chaos/fault injection nos boundaries externos.

### Frontend

Adicionar ao `package.json` uma suíte com:

- Vitest + Testing Library + jsdom para componentes e hooks;
- Playwright para fluxos críticos ponta a ponta;
- mocks gerados a partir do OpenAPI.

Cobrir:

- quote e fee expiry;
- double submit;
- troca de método;
- invoice pública com token inválido/expirado;
- Pix/boleto financiado por cripto;
- estados de manual review;
- RBAC das páginas administrativas;
- modal de dupla aprovação;
- acessibilidade e navegação por teclado.

### Matriz mínima de cenários financeiros

Para cada fluxo: sucesso, duplicidade, timeout antes do efeito, timeout depois do efeito, erro permanente, valor insuficiente, taxa mínima/máxima, gratuidade explícita, reversal/refund, provider indisponível e reconciliação divergente.

### Comandos de verificação

Frontend, em `/Users/rafael/Desktop/projects/refactor-bank`:

```bash
pnpm run lint
pnpm run build
pnpm test
pnpm exec playwright test
```

Backend, em `/Users/rafael/Desktop/projects/refact-bank`:

```bash
pnpm test
pnpm run test:e2e
pnpm run test:cov
pnpm run build
```

> O script backend atual de lint usa `--fix`; no CI deve existir uma variante não mutante para verificação.

---

## 8. Quality gates por fase

| Gate | Condição para avançar |
|---|---|
| G0 — Decisões | OKX/Kraken, BRL, custódia, fees, jurídico e contabilidade aprovados |
| G1 — Segurança | sem credenciais default, CORS restrito, tenancy/autorização validados |
| G2 — Contratos | OpenAPI diff e client gerado ativos |
| G3 — Fundação | Mongo transacional, ledger balanceado e idempotência comprovados |
| G4 — Taxas | 100% dos `TransactionType` com assessment ou zero-rated explícito |
| G5 — Providers | OKX/Kraken passam a mesma suíte de contract tests |
| G6 — Invoice | Pix/boleto integral reconciliado e idempotente |
| G7 — Cripto | blockchain/custódia/KYT e reorg tests aprovados |
| G8 — Settlement | Master e Exchange conciliam ponta a ponta |
| G9 — Operação | RBAC, dupla aprovação, alerts, runbooks e kill switches testados |
| G10 — Produção | pentest, chaos, DR, piloto e sign-off das áreas de controle |

---

## 9. Riscos e mitigação

| Risco | Mitigação no plano |
|---|---|
| OKX/Kraken sem BRL/saque compatível | capability matrix e gate antes do adapter/rota |
| Taxa não aplicada em algum fluxo | assessment obrigatório no ledger + teste por `TransactionType` |
| Regra de taxa conflitante | validação de overlap/precedência antes de publicar |
| Mudança de taxa durante operação | snapshot imutável por operação |
| Diferença entre taxa estimada e real | componentes estimado/real + limite autorizado + suspense |
| Dupla ordem/saque | external effect + idempotência + consulta antes de retry |
| Failover cruzado após depósito | provider sticky; resgate separado e aprovado |
| Corrida de saldo/liquidez | journal transacional + holds + compare-and-swap |
| Webhook falso/duplicado | assinatura, anti-replay, inbox e polling independente |
| Reorg blockchain | confirmation policy, freeze e journal corretivo |
| Chave privada/segredo exposto | HSM/MPC, secret refs, IP allowlist e logs mascarados |
| Painel vira bypass de controles | RBAC granular, MFA, dupla aprovação e ações idempotentes |
| Migração quebra saldo | shadow ledger/fees, reconciliação e rollout por tenant |
| Frontend exibe estimativa diferente | quote/fees somente do backend e client OpenAPI gerado |

---

## 10. Questões ainda abertas e responsáveis necessários

### Produto

- redes/tokens do piloto;
- nome final de “Cripto Converse”;
- expiração de invoice/quote;
- under/overpayment/dust;
- regra de late payment e refund;
- SLA e mensagem de manual review.

### Taxas/financeiro

- pagador de cada componente;
- percentuais/fixos/faixas/mínimos/máximos;
- spread por tenant/rota/asset;
- absorção de diferença estimado versus real;
- política de isenção, waiver e reversão;
- tratamento fiscal e demonstrativo ao cliente.

### Exchanges/tesouraria

- papel inicial de OKX e Kraken;
- contas/subcontas/limites e regiões;
- pares e redes disponíveis;
- mecanismo real de saque/conversão para BRL;
- reserva mínima e limite de antecipação;
- rebalanceamento e hedge;
- plano para insolvência/indisponibilidade da exchange.

### Segurança/compliance

- custodiante/HSM/MPC;
- KYT/sanções/Travel Rule;
- limites de hot wallet;
- política de allowlist e rotação;
- retenção/LGPD;
- RPO/RTO e suporte operacional.

---

## 11. Definição global de pronto

O projeto só estará pronto quando:

- todos os fluxos financeiros usarem ledger e fee assessment;
- não houver atualização direta de saldos nas rotas migradas;
- OKX e Kraken passarem os mesmos contratos internos e reconciliação;
- invoices e payouts forem idempotentes e auditáveis;
- fees exibidas ao cliente forem reproduzíveis pelo snapshot;
- gross, fee, net e custos externos forem contabilizados separadamente;
- webhooks, workers e retries não duplicarem efeitos;
- painel tiver RBAC, MFA, dupla aprovação, audit trail e kill switches;
- reconciliação provar a cadeia ponta a ponta;
- testes unitários, integração, E2E, segurança, chaos e DR passarem;
- jurídico, compliance, contabilidade, tesouraria, segurança e operações aprovarem o piloto.

---

## 12. Ordem executiva resumida

1. decisões e capabilities OKX/Kraken;
2. segurança e contratos;
3. precisão monetária e Mongo transacional;
4. ledger;
5. idempotência/outbox/inbox;
6. fees globais no banco;
7. migração dos fluxos existentes para ledger + fees;
8. registry e ports;
9. adapters OKX/Kraken;
10. pricing/blockchain/custódia/KYT;
11. settlement policy/saga;
12. invoice Pix/boleto;
13. cripto direto;
14. Carteira Master;
15. Exchange e fallback;
16. Pix/boleto financiado por cripto;
17. painel, alertas e reconciliação;
18. frontend completo;
19. hardening e piloto gradual.
