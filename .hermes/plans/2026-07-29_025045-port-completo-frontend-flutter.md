# Port Completo do Frontend para Flutter — Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Entregar um app Flutter iOS/Android com paridade funcional de todas as 26 páginas, rotas, operações HTTP, papéis, estados de UI e integrações do frontend Next.js do Refact Bank.

**Architecture:** Repositório mobile recomendado `refactor-bank-mobile`, feature-first com camadas `presentation/domain/data`. Riverpod controla estado/DI, go_router controla navegação/guards, Dio consome um cliente OpenAPI `dart-dio` gerado, e credenciais são protegidas no Keychain/Keystore. O backend NestJS continua sendo a autoridade para identidade, tenant, valores, autorização, KYC, idempotência e assinaturas.

**Tech Stack:** Flutter stable via FVM, Dart, Riverpod, go_router, Dio, OpenAPI Generator, Freezed/json_serializable, flutter_secure_storage, local_auth, Decimal/intl, geolocator, file_picker, qr_flutter, share_plus, pdf/printing, app_links, GitHub Actions e Fastlane.

---

## Fontes e documentação detalhada

- Frontend auditado: `/Users/rafael/Desktop/projects/refactor-bank`
- Backend relacionado: `/Users/rafael/Desktop/projects/refact-bank`
- Plano mestre Obsidian: `/Users/rafael/Documents/notes/notes/Projects/Refactor Bank/13 - App Mobile Flutter - Plano Mestre.md`
- Inventário de 26 rotas/endpoints: `/Users/rafael/Documents/notes/notes/Projects/Refactor Bank/14 - App Mobile Flutter - Inventário de Paridade.md`
- Arquitetura/integrações: `/Users/rafael/Documents/notes/notes/Projects/Refactor Bank/15 - App Mobile Flutter - Arquitetura e Integrações.md`
- Roadmap/testes/lojas: `/Users/rafael/Documents/notes/notes/Projects/Refactor Bank/16 - App Mobile Flutter - Roadmap e Qualidade.md`

## Baseline verificada

- 26 `page.tsx`, 3 layouts, 1 handler NextAuth, 70 componentes.
- 39 operações em `lib/api.ts`, 9 em `lib/admin.api.ts` e 1 `fetch` direto de onboarding.
- Sem testes de aplicação e sem workflow de CI encontrado.
- `pnpm exec tsc --noEmit --incremental false --pretty false` falha com 7 erros: quatro incompatibilidades `string | number`, uma opção `html2pdf` e dois usos de `api.patch` inexistente.
- `next.config.mjs` ignora erros TypeScript.
- Fluxos incompletos: recovery mock, DIDIT de assinatura mock, onboarding assume sucesso, transferência cripto usa e-mail como ID, contratos usam token vazio/documentos fallback e command menu aponta duas rotas inexistentes.

## Regras de implementação

1. Não copiar mocks, bypasses ou falhas de autorização para o app.
2. Cada rota da matriz deve ter rota Flutter, guard, estados, API, testes e aceite iOS/Android.
3. Cada mutação financeira deve possuir idempotency key e reconciliação.
4. BRL usa minor units; cripto usa decimal string/Decimal, nunca `double` de domínio.
5. Nenhum token, PII, documento, chave Pix, boleto ou valor sensível em logs/analytics/crash.
6. Implementação por TDD: teste falha → código mínimo → teste passa → refactor → integração.
7. Commits pequenos por história, sem misturar domínios.

---

### Task 1: Fechar decisões e matriz de paridade

**Objective:** transformar a auditoria em backlog fechado e rastreável.

**Files:**
- Read: `app/**/page.tsx`, `components/**`, `lib/api.ts`, `lib/admin.api.ts`
- Create: `refactor-bank-mobile/docs/parity-matrix.md`
- Create: `refactor-bank-mobile/docs/decisions/*.md`

**Steps:**
1. Copiar as 26 rotas e 49 operações do inventário Obsidian para uma matriz versionada.
2. Marcar cada item como Paridade, Correção obrigatória, Adaptação nativa ou Pós-paridade.
3. Aprovar repo separado/monorepo, admin público/interno, observabilidade, tema, DIDIT, bundle IDs, versões mínimas, estratégia multi-tenant/white-label e API direta versus `/v2/mobile`/BFF.
4. Ligar cada linha a uma história, owner, teste e gate.
5. Verificar que não existe linha sem disposição explícita.

**Exit:** 26/26 rotas e 49/49 operações rastreáveis.

---

### Task 2: Corrigir contratos e bloqueadores do backend

**Objective:** fornecer contratos seguros para um cliente mobile não confiável.

**Files:**
- Modify: `refact-bank/src/iam/auth/auth.controller.ts`
- Modify: `refact-bank/src/iam/auth/auth.service.ts`
- Modify: `refact-bank/src/core/contracts/contracts.controller.ts`
- Modify: `refact-bank/src/core/contracts/contracts.service.ts`
- Modify: `refact-bank/src/core/account/account.controller.ts`
- Modify/Test: controllers/services de payments, crypto, credits, corporate e admin
- Generate: OpenAPI versionada

**Steps:**
1. Escrever contract/security tests que reproduzam acesso cross-tenant, spoof de identidade/papel/DIDIT, duplicate submit, refresh/recovery e webhook inválido.
2. Fazer os testes falharem.
3. Implementar access + refresh token rotacionável, logout e revogação por device.
4. Alterar recovery para envio out-of-band e token hash/uso único; não retornar token.
5. Proteger contratos por tenant/owner/convite e obter identidade/papel/DIDIT do servidor.
6. Rejeitar webhook DIDIT inválido em produção.
7. Implementar idempotência/status para pagamentos, cripto, crédito, voto e assinatura.
8. Definir units/enums/envelopes/erros/paginação na OpenAPI.
9. Adicionar lookup seguro do destinatário cripto e endpoints de PDF/status quando necessários.
10. Reconciliar a matriz completa de documentos PF/PJ e remover logs de tokens/dados sensíveis.
11. Definir CORS por allowlist e URLs curtas/pré-assinadas ou downloads autenticados para PDFs/documentos/KYC.
12. Rodar testes backend e validar spec sem `any` crítico.

**Exit:** nenhum P0; threat model e contract tests aprovados.

---

### Task 3: Criar bootstrap Flutter, flavors e CI

**Objective:** criar base reproduzível com quality gates antes das features.

**Files:**
- Create: `refactor-bank-mobile/.fvmrc`, `pubspec.yaml`, `analysis_options.yaml`, `build.yaml`
- Create: `lib/main_dev.dart`, `lib/main_staging.dart`, `lib/main_prod.dart`
- Create: `lib/app/bootstrap.dart`, `lib/app/refactor_bank_app.dart`, `lib/app/router.dart`
- Create: `lib/core/config/*`, `lib/core/error/*`, `lib/core/telemetry/*`
- Create: `packages/refactor_bank_api/*`
- Create: `.github/workflows/mobile-ci.yml`
- Test: `test/app/bootstrap_test.dart`

**Steps:**
1. Escrever teste do bootstrap/config inválida e fazer falhar.
2. Fixar Flutter via FVM e analyzer estrito.
3. Configurar flavors com IDs/endpoints distintos, sem segredos em `dart-define`.
4. Gerar cliente OpenAPI `dart-dio`; CI falha em drift.
5. Configurar format, analyze, tests, codegen, Android debug e iOS no-codesign.
6. Adicionar secret/dependency/license scan e SBOM.
7. Executar os gates em clone limpo.

**Verify:** `fvm dart format --output=none --set-exit-if-changed .`; `fvm flutter analyze --fatal-infos --fatal-warnings`; `fvm flutter test`.

---

### Task 4: Implementar design system e shell adaptativo

**Objective:** criar componentes acessíveis e navegação phone/tablet reutilizável.

**Files:**
- Create: `lib/core/design_system/tokens/*`
- Create: `lib/core/design_system/theme/refactor_bank_theme.dart`
- Create: `lib/core/design_system/widgets/*`
- Create: `lib/app/authenticated_shell.dart`
- Create: `test/golden/design_system/*`

**Steps:**
1. Escrever goldens para phone/tablet, dark e text scale 200%.
2. Migrar tokens de `app/globals.css`.
3. Implementar campos, MoneyField, buttons, cards, skeleton, banners, dialogs/sheets, error/empty e SensitiveValue.
4. Implementar bottom nav, rail, “Mais”, account switcher e action sheet global.
5. Adicionar ARB `pt_BR`, Semantics, foco e reduce motion.
6. Validar TalkBack/VoiceOver e contraste WCAG AA.

---

### Task 5: Implementar auth, sessão, cadastro, recovery e guards

**Objective:** substituir NextAuth por sessão mobile segura e controlar todas as rotas.

**Files:**
- Create: `lib/features/auth/{data,domain,presentation}/**`
- Create: `lib/core/network/auth_interceptor.dart`
- Create: `lib/core/security/secure_session_store.dart`
- Create: `lib/core/security/biometric_gate.dart`
- Test: `test/features/auth/**`, `integration_test/auth_onboarding_test.dart`

**Steps:**
1. Testar login/401/429/offline/timeout e refresh concorrente single-flight.
2. Implementar access token em memória e refresh token no secure storage.
3. Implementar logout/revogação e limpeza.
4. Implementar cadastro PF/PJ e aceite jurídico versionado.
5. Implementar forgot/reset por universal link.
6. Implementar guards visitor/onboarding/active/PJ/admin/superuser.
7. Implementar biometria local e step-up conforme contrato.
8. Testar cold/warm links, sessão expirada e retorno do background.

---

### Task 6: Implementar onboarding PF/PJ, documentos e DIDIT

**Objective:** concluir onboarding apenas com estado confirmado pelo backend.

**Files:**
- Create: `lib/features/onboarding/{data,domain,presentation}/**`
- Create: `lib/core/deep_links/didit_return_handler.dart`
- Test: `test/features/onboarding/**`

**Steps:**
1. Testar máquina de estados retomável.
2. Implementar formulários PF/PJ e validações.
3. Implementar a matriz completa de documentos PF/PJ com upload multipart, progresso/retry sem duplicação.
4. Criar sessão DIDIT, abrir integração suportada, tratar retorno e consultar status.
5. Tratar app encerrado, expiração, câmera/permissão e webhook atrasado.
6. Provar que callback do cliente não marca aprovação.

---

### Task 7: Implementar contas, home e configurações

**Objective:** entregar shell autenticado e isolamento por conta/papel.

**Files:**
- Create: `lib/features/accounts/**`, `lib/features/home/**`, `lib/features/settings/**`
- Test: `test/features/accounts/**`, `test/features/home/**`, `test/features/settings/**`

**Steps:**
1. Testar bootstrap `/users/me`, seleção e troca de conta.
2. Implementar saldo, hide/show, carteiras, transações recentes e quick actions.
3. Implementar pull-to-refresh, staleness, loading/empty/error.
4. Implementar perfil, status bancário, chaves Pix, sessões, segurança, privacidade e logout.
5. Testar invalidação completa na troca de conta e permissões.

---

### Task 8: Implementar Pix, cash-in e cash-out

**Objective:** portar todos os fluxos fiat com idempotência e recibos.

**Files:**
- Create: `lib/features/pix/**`, `lib/features/cash_in/**`, `lib/features/cash_out/**`, `lib/features/receipts/**`
- Create: `lib/core/network/idempotency_interceptor.dart`
- Test: `integration_test/pix_cashflow_test.dart`

**Steps:**
1. Chaves Pix e favoritos.
2. Cobrança Pix, QR, BR Code, clipboard/share e expiração.
3. Envio Pix com destinatário, preview, step-up, status e recibo.
4. Boleto de cobrança com pagador/endereço/PDF.
5. TED com banco/agência/conta/tipo/favorecido.
6. Pagamento de boleto com entrada manual e scanner opcional.
7. Testar tap duplo, timeout após aceite, 409/429, saldo/limite, pending approval e reconciliação.

**Exit:** nenhum efeito duplicado sob falha/retry.

---

### Task 9: Implementar extrato, detalhes, PDFs e compartilhamento

**Objective:** oferecer consulta paginada e documentos confiáveis.

**Files:**
- Create: `lib/features/statement/**`
- Create: `lib/features/documents/pdf_service.dart`
- Test: `test/features/statement/**`

**Steps:**
1. Testar paginação, filtros e datas limite.
2. Implementar busca, filtros, limpar, detalhe e refresh.
3. Gerar/obter recibo/PDF, abrir, salvar e compartilhar.
4. Validar totais, locale, timezone, grandes volumes e arquivos temporários.

---

### Task 10: Implementar contratos, assinatura, verificação e deep links

**Objective:** portar contratos com autorização e evidência seguras.

**Files:**
- Create: `lib/features/contracts/**`
- Create: `lib/features/document_verification/**`
- Create: `lib/core/deep_links/app_link_handler.dart`
- Test: `integration_test/contract_signature_test.dart`

**Steps:**
1. Testar RBAC/tenant/owner e convites públicos de escopo mínimo.
2. Implementar lista/busca/paginação/criação sem OS/documento mock.
3. Implementar detalhe, assinaturas, hash, compartilhar e PDF canônico.
4. Implementar assinatura do gestor com sessão/step-up.
5. Implementar assinatura pública com DIDIT real e geolocalização exata.
6. Implementar verificação por hash/QR.
7. Testar replay, spoof de papel/doc/DIDIT, link expirado, precisão e app lifecycle.

---

### Task 11: Implementar cripto, crédito e aprovações PJ

**Objective:** completar os domínios financeiros restantes.

**Files:**
- Create: `lib/features/crypto/**`, `lib/features/credit/**`, `lib/features/approvals/**`
- Test: `integration_test/crypto_credit_approval_test.dart`

**Steps:**
1. Implementar carteiras/cotações com validade, sem fallback inventado.
2. Implementar buy/sell com quote ID, fees, expiry, step-up e idempotência.
3. Implementar transferência por destinatário resolvido no backend.
4. Implementar produtos/simulação/crédito com CET e valores autoritativos.
5. Implementar aprovações/votos com step-up e concorrência.
6. Testar Decimal/rounding, quote expirada, limites e voto simultâneo.

---

### Task 12: Implementar administração completa

**Objective:** portar as cinco rotas admin com RBAC, step-up e auditoria.

**Files:**
- Create: `lib/features/admin/{review,users,accounts,statements,virtual_accounts}/**`
- Test: `integration_test/admin_test.dart`

**Steps:**
1. Testar matriz negativa admin/superuser.
2. Implementar revisão/aprovação de contas e documentos.
3. Implementar usuários, bloqueio, detalhe e LGPD.
4. Implementar contas, status e LGPD.
5. Implementar extratos/contas virtuais server-side.
6. Exigir resumo, motivo, reautenticação e auditoria em ações destrutivas.
7. Validar flavor/app interno se essa for a decisão de distribuição.

---

### Task 13: Hardening e release candidate

**Objective:** provar segurança, performance, acessibilidade e operação.

**Files:**
- Create: `docs/security/threat-model.md`, `docs/runbooks/**`, `docs/release-checklist.md`
- Update: testes/goldens/integration tests de todos os domínios

**Steps:**
1. Executar OWASP MASVS, pentest e corrigir P0/P1.
2. Auditar logs, crash, analytics, storage, clipboard, screenshot e temporários.
3. Profile release: cold start, jank, memória, listas, upload e PDF.
4. Executar device/OS/accessibility matrix.
5. Testar rede/background/kill/restart/low memory/storage.
6. Validar feature flags, kill switches, dashboards, alertas e runbooks.
7. Fazer UAT com PF, PJ, admin e superuser.

---

### Task 14: Configurar CI/CD, lojas e rollout

**Objective:** publicar iOS/Android com signing seguro e rollback operacional.

**Files:**
- Create: `.github/workflows/mobile-android-release.yml`
- Create: `.github/workflows/mobile-ios-release.yml`
- Create: `fastlane/Fastfile`, `fastlane/Appfile`, metadata/assets das lojas

**Steps:**
1. Configurar owners/MFA, IDs, certificates/profiles e service accounts no cofre do CI.
2. Criar pipelines por tag protegida com version/build number monotônico.
3. Produzir AAB/IPA, símbolos, checksums, SBOM e provenance.
4. Preencher Privacy Manifest, App Privacy, Data Safety, classificação, suporte e exclusão.
5. TestFlight interno/externo e Play internal/closed.
6. Executar staged rollout, dashboards e critérios de pausa.
7. Exercitar kill switch/rollback e janela de monitoramento.

---

## Verification final

Run:

```bash
fvm dart format --output=none --set-exit-if-changed .
fvm flutter analyze --fatal-infos --fatal-warnings
fvm flutter test --coverage
fvm flutter test test/golden --update-goldens=false
fvm flutter test integration_test -d <ios-device>
fvm flutter test integration_test -d <android-device>
fvm flutter build appbundle --flavor staging -t lib/main_staging.dart
fvm flutter build ipa --flavor staging -t lib/main_staging.dart --no-codesign
```

Expected:

- 26/26 rotas com teste/aceite.
- 49/49 operações com disposição, cliente tipado quando usadas e contract test.
- Nenhum mock/fallback de produção.
- Nenhuma duplicidade sob tap/retry/network failure.
- Nenhum P0/P1 de segurança/release.
- App aprovado em UAT, acessibilidade, device matrix, TestFlight e Play internal/closed.

## Open questions

1. Repositório separado ou monorepo?
2. Admin no app público ou app/flavor interno?
3. Sentry ou Firebase para crash/performance?
4. Tema dark-only ou system?
5. Qual integração DIDIT é oficialmente suportada na data de implementação?
6. Fonte canônica dos PDFs/recibos?
7. Países, versões mínimas, bundle IDs e titulares das contas Apple/Google?
8. Quais SLOs de latência, disponibilidade, crash-free e reconciliação serão gates de release?
