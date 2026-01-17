# NeuroDeck 🧠

**Active Learning through Strategic Interruptions.**

NeuroDeck é uma ferramenta de estudo baseada em evidências que utiliza o conceito de **Interrupção Espaçada**. Ao contrário de apps de flashcards tradicionais onde você precisa se lembrar de abrir o app, o NeuroDeck interrompe seu fluxo de trabalho em intervalos configuráveis para te desafiar com uma questão rápida.

---

## ✨ Funcionalidades (Beta)

- **Interrupções Inteligentes**: O app te desafia enquanto você trabalha/estuda.
- **Algoritmo de Pesos**: Questões que você erra aparecem com maior frequência.
- **Editor de Decks Premium**: Gerencie centenas de perguntas com uma interface técnica e minimalista.
- **Modo Dark Nativo**: Design focado em reduzir a fadiga visual.
- **Privacidade Total**: Seus dados nunca saem do seu computador. Tudo é salvo em arquivos JSON locais.

---

## 🚀 Tech Stack

- **Frontend**: React + Material UI + Vite
- **Desktop**: Electron
- **Validation**: Zod
- **Testes**: Vitest + React Testing Library

---

## 🛠️ Como Rodar o Projeto

### Pré-requisitos

- Node.js (v18 ou superior)
- npm

### Instalação

1.  Clone o repositório:
    ```bash
    git clone https://github.com/seu-usuario/NeuroDeck.git
    cd NeuroDeck
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```

### Desenvolvimento

Para rodar o app em modo de desenvolvimento (com Hot Reload):

```bash
npm run dev
```

### Testes

Para rodar a suíte de testes unitários:

```bash
npm test
```

### Build

Para gerar o executável final:

```bash
npm run build
npm run dist
```

---

## 📂 Formato de Importação (JSON)

Para importar seus próprios decks, crie um arquivo `.json` seguindo a estrutura abaixo. O NeuroDeck é inteligente: **campos como `id` e datas são opcionais** e serão gerados automaticamente se você não os fornecer.

```json
{
  "deck": {
    "name": "Nome do seu Deck",
    "description": "Uma breve descrição",
    "tags": ["estudo", "dev"]
  },
  "questions": [
    {
      "topic": "JavaScript",
      "question": "Qual o resultado de 1 + '1'?",
      "choices": ["11", "2", "NaN", "undefined"],
      "answerIndex": 0,
      "explanation": "No JS, o operador + realiza concatenação se um dos operandos for string."
    }
  ]
}
```

### 📦 Importação de Múltiplos Decks (Array)
Você também pode importar uma lista de decks de uma só vez. Este é o formato gerado pelo botão **Exportar** do app:

```json
[
  { "deck": { "name": "Deck 1", ... }, "questions": [...] },
  { "deck": { "name": "Deck 2", ... }, "questions": [...] }
]
```

> **Dica**: Você pode copiar o JSON acima, colar no **Terminal de Importação** do app e ele funcionará perfeitamente!
> 
> **Nota**: O campo `choices` deve ter exatamente **4 opções** e o `answerIndex` deve ser de **0 a 3**.

---

## 🤖 AI-First Development

Este projeto é um experimento de aprendizado e engenharia de software **100% desenvolvido por Inteligência Artificial**.

- **Método**: Utilização de prompts ricos em contexto, manifestos de design estritos e definições arquiteturais prévias.
- **Objetivo**: Demonstrar como uma colaboração entre humano (Product Owner/Junior) e IA (Senior Developer) pode resultar em um projeto desktop completo, testado e com alto padrão de qualidade em poucas horas.

---

## 🛡️ Regras de Engenharia

As diretrizes que guiaram a IA estão na pasta `/ai`, incluindo:

- **Design Manifesto**: Regras estéticas e de UX.
- **Technical Prompt**: Definições de arquitetura e persistência.

---

## 📝 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.
