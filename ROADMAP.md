# NeuroDeck — Roadmap

Este documento descreve a **evolução planejada** do NeuroDeck.

Ele existe para:
- deixar prioridades claras
- evitar crescimento desordenado de features
- proteger a ideia central do produto
- comunicar intenção, não promessas ou datas

O NeuroDeck é um projeto **experimental**.  
Estabilidade e fidelidade conceitual sempre vêm antes de novas funcionalidades.

---

## Princípio Guia

> **A pergunta é o produto.**

Qualquer feature que enfraqueça o momento da pergunta  
não deve ser implementada — mesmo que pareça útil ou comum em outros apps.

---

## Fase 0 — Estabilização do MVP (Prioridade Máxima)

**Objetivo:** Tornar o MVP atual confiável, previsível e sólido.

### Foco
- Correção de bugs críticos e de usabilidade
- Confiabilidade do scheduler (sleep, pause, resume)
- Garantir que a pergunta **sempre apareça no momento certo**
- Validação robusta de importação/exportação de JSON
- Garantir integridade dos arquivos locais (deck e progress)
- Ajustes no comportamento da janela (foco, always-on-top, fechamento)

### Fora de escopo
- Nenhuma nova mecânica de aprendizado
- Nenhuma expansão grande de UI
- Nenhuma feature experimental

> Se a interrupção falha, o produto falha.

---

## Fase 1 — MVP+ (Evoluções Incrementais)

**Objetivo:** Melhorar flexibilidade e robustez sem mudar o modelo mental do app.

### Funcionalidades planejadas
- Suporte a **mais de 4 alternativas por pergunta**
  - Remover limite fixo internamente
  - Manter navegação por teclado e clareza visual
- Exportação do progresso do usuário (JSON)
  - Backup
  - Migração entre máquinas
- Melhorias pontuais de UX
  - textos mais claros
  - mensagens de erro mais úteis
- Validação mais rígida de decks importados

### Restrições
- Ainda apenas perguntas de múltipla escolha
- Nenhuma gamificação
- Nenhum dashboard ou métricas visuais

---

## Fase 2 — Experimental (Perguntas Abertas + IA)

**Objetivo:** Explorar aprendizado ativo real via **recall**, não apenas reconhecimento.

### Ideia central
Introduzir **perguntas abertas**, onde o usuário escreve a resposta em texto livre  
e um modelo de linguagem ava
