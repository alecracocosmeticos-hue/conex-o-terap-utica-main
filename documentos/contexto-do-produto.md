# 149Psi — Product Context (for Trae Agent)

## 1. O que é o 149Psi
149Psi é uma plataforma HealthTech de **acompanhamento terapêutico contínuo**. O produto **não substitui terapia** e **não realiza diagnóstico**. Ele estende o cuidado entre sessões, transformando registros subjetivos dos pacientes em **dados clínicos organizados**, acessíveis apenas a profissionais vinculados.

O foco do sistema é **registro, organização, visualização e síntese** — nunca decisão clínica automatizada.

---

## 2. Princípios Inegociáveis (guardrails)

- ❌ Não diagnosticar
- ❌ Não sugerir tratamento
- ❌ Não classificar transtornos
- ❌ Não gerar insights prescritivos

- ✅ Apenas registrar dados
- ✅ Apenas organizar padrões
- ✅ Apenas resumir informações já existentes
- ✅ Linguagem neutra, descritiva e ética

Qualquer IA no sistema atua **exclusivamente como ferramenta de síntese e organização**, nunca como autoridade clínica.

---

## 3. Perfis de Usuário (RBAC)

### Paciente
- Registra emoções, pensamentos e vivências
- Visualiza sua própria evolução
- Recebe comentários do terapeuta

### Terapeuta / Psicólogo
- Visualiza apenas pacientes vinculados
- Analisa registros longitudinais
- Comenta registros
- Recebe alertas descritivos (quando habilitados)

### Super Admin
- Gestão da plataforma
- Auditoria
- Visualização controlada (read-only)

---

## 4. Escopo Atual (MVP concluído)

### Funcionalidades Centrais
- Autenticação multi-papel
- Vínculo paciente-terapeuta por código
- Registro emocional estruturado
- Diário livre
- Check-in diário
- Histórico longitudinal
- Gráficos de evolução
- Comentários clínicos assíncronos
- Painel administrativo com auditoria
- Modo "Visualizar como"

O MVP está **estável e completo**. Novas funcionalidades devem respeitar esse núcleo.

---

## 5. Modelo Mental do Produto

- O **registro do paciente é a fonte primária** de dados
- O terapeuta **observa padrões**, não eventos isolados
- O sistema **não interpreta**, apenas **organiza e evidencia**
- Alertas indicam *ocorrência de padrão*, nunca *significado clínico*

---

## 6. Dados Sensíveis e Segurança

- Produto em conformidade com LGPD
- Supabase Auth
- PostgreSQL com Row Level Security (RLS)
- Funções `SECURITY DEFINER` para ações críticas
- Logs de auditoria obrigatórios

Nunca quebrar:
- isolamento entre pacientes
- vínculo terapeuta–paciente
- leitura mínima necessária (least privilege)

---

## 7. Stack Técnica (não alterar sem justificativa)

- Frontend: React + TypeScript + Vite
- Estilização: Tailwind + shadcn/ui
- Estado: TanStack React Query
- Gráficos: Recharts
- Backend: Supabase
- Banco: PostgreSQL

---

## 8. Convenções Importantes

- Componentes reutilizáveis
- Hooks customizados para acesso a dados
- Nada de lógica clínica no frontend
- Nada de regras clínicas hardcoded

---

## 9. Escopo Futuro (referência, não executar automaticamente)

### Fase 2
- Alertas inteligentes (descritivos)
- Relatórios em PDF
- Exportação de dados
- Notificações de inatividade

### Fase 3
- IA para **resumo clínico** (texto neutro)
- App mobile
- Integrações

Esses itens **só devem ser implementados quando explicitamente solicitados**.

---

## 10. Como o Trae deve atuar neste projeto

Sempre assumir:
- Você é um **engenheiro**, não um clínico
- Você implementa **exatamente o que foi pedido**, nada além
- Em caso de dúvida ética ou de escopo, **pare e sinalize**

Toda funcionalidade nova virá acompanhada de um **mini-PRD específico**.

---

## 11. Frase-guia do produto

> "149Psi organiza o que o paciente vive, para que o terapeuta compreenda melhor — sem substituir o cuidado humano."

