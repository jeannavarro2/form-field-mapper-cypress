# 🗺️ Form Field Mapper - Cypress

<div align="center">

![Cypress](https://img.shields.io/badge/Cypress-17202C?style=for-the-badge&logo=cypress&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

**Utilitário educativo para QA/Automation** que mapeia automaticamente campos de formulário em páginas web e gera um **pré-teste Cypress profissional** pronto para uso.

[Como Funciona](#-como-funciona) •
[Instalação](#-instalação-passo-a-passo) •
[Uso](#-como-usar) •
[Troubleshooting](#-troubleshooting---problemas-comuns)

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [O que o utilitário faz](#-o-que-o-utilitário-faz)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação Passo a Passo](#-instalação-passo-a-passo)
- [Como Usar](#-como-usar)
- [Estrutura dos Arquivos Gerados](#-estrutura-dos-arquivos-gerados)
- [Como Usar com Outras URLs](#-como-usar-com-outras-urls)
- [Troubleshooting](#-troubleshooting---problemas-comuns)
- [Aviso de Uso Ético](#%EF%B8%8F-aviso-de-uso-ético)
- [Licença](#-licença)
- [Contato](#-contato)

---

## 🎯 Sobre o Projeto

Este projeto foi criado com fins **educativos** para ajudar profissionais de QA e automação de testes a:

- Entender como mapear elementos de formulário automaticamente
- Aprender a gerar seletores confiáveis para testes
- Acelerar a criação de testes E2E com Cypress
- Documentar campos de formulários de forma estruturada

**Ideal para:** Estudantes de QA, profissionais em transição de carreira, e times que precisam documentar formulários rapidamente.

---

## ✨ O que o utilitário faz

Ao executar o teste, o script irá:

| Etapa | Descrição |
|-------|-----------|
| 1️⃣ | Visita a URL configurada |
| 2️⃣ | Mapeia **todos os campos** do formulário (input, select, textarea, checkbox, radio) |
| 3️⃣ | Extrai informações de cada campo (label, tipo, seletor, obrigatoriedade) |
| 4️⃣ | Gera um arquivo **JSON** com todos os dados mapeados |
| 5️⃣ | Gera um **pré-teste Cypress profissional** com comandos prontos |

### 📊 Informações extraídas de cada campo:

- ✅ **Label** associada ao campo
- ✅ **Tipo** do campo (text, email, password, select, checkbox, radio, textarea)
- ✅ **Seletor confiável** (prioridade: `data-testid` > `id` > `name` > `aria-label` > `placeholder`)
- ✅ **Obrigatoriedade** (required)
- ✅ **Opções** de selects, checkboxes e radio buttons (value + texto)
- ✅ **Placeholder** quando disponível

---

## 📌 Pré-requisitos

Antes de começar, você precisa ter instalado:

### 1. Node.js (versão 16 ou superior)

Verifique se já tem instalado:
```bash
node --version
```

Se não tiver, baixe em: https://nodejs.org/

> 💡 **Recomendado:** Node.js 18 LTS ou 20 LTS

### 2. npm (vem junto com o Node.js)

Verifique a versão:
```bash
npm --version
```

### 3. Git (opcional, para clonar o repositório)

```bash
git --version
```

Se não tiver, baixe em: https://git-scm.com/

---

## 🚀 Instalação Passo a Passo

### Opção 1: Clonando o repositório (recomendado)

```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/form-field-mapper-cypress.git

# 2. Entre na pasta do projeto
cd form-field-mapper-cypress

# 3. Instale as dependências
npm install
```

### Opção 2: Download manual

1. Clique em **"Code"** > **"Download ZIP"**
2. Extraia o arquivo
3. Abra o terminal na pasta extraída
4. Execute: `npm install`

### ✅ Verificando a instalação

Após o `npm install`, você deve ver uma mensagem similar a:
```
added 175 packages in 25s
```

Se houver erros, veja a seção [Troubleshooting](#-troubleshooting---problemas-comuns).

---

## ▶️ Como Usar

### Passo 1: Executar o mapeamento

Você tem duas opções:

#### Opção A: Modo Interativo (com interface do Cypress)
```bash
npm run cy:open
```
- Abrirá a interface do Cypress
- Clique em **"E2E Testing"**
- Selecione um navegador (Chrome, Edge ou Electron)
- Clique no teste **`form_mapper_public.cy.js`**

#### Opção B: Modo Direto (executa e fecha)
```bash
npm run cy:run
```
- Executa o teste automaticamente
- Mostra o resultado no terminal
- Gera os arquivos de output

### Passo 2: Verificar os arquivos gerados

Após a execução, dois arquivos serão criados em `cypress/output/`:

```
cypress/output/
├── campos_mapeados.json      # Dados estruturados de todos os campos
└── pretest_gerado.cy.js      # Teste Cypress pronto para usar
```

### Passo 3: Usar o pré-teste gerado

1. Abra o arquivo `cypress/output/pretest_gerado.cy.js`
2. Revise os comandos gerados
3. Ajuste os valores conforme necessário
4. Copie para seu projeto de testes

---

## 📁 Estrutura dos Arquivos Gerados

### 1️⃣ campos_mapeados.json

Arquivo JSON com todos os campos mapeados:

```json
{
  "url": "https://practice-automation.com/form-fields/",
  "dataExtracao": "2024-01-15T10:30:00.000Z",
  "totalCampos": 7,
  "campos": [
    {
      "label": "Name",
      "type": "text",
      "selector": "[data-testid=\"name-input\"]",
      "name": "name-input",
      "id": "name-input",
      "required": true,
      "options": [],
      "radioOptions": [],
      "checkboxOptions": []
    }
  ]
}
```

### 2️⃣ pretest_gerado.cy.js

Teste Cypress profissional com:

- ✅ Comentários explicativos em cada campo
- ✅ Opções reais extraídas de selects, radios e checkboxes
- ✅ Valores sugeridos baseados no tipo do campo
- ✅ Validações `.should('be.visible')` e `.should('be.checked')`
- ✅ Seção de submit e assertions comentadas para você ajustar

**Exemplo de código gerado:**

```javascript
/**
 * Campo: Name [OBRIGATÓRIO]
 * Tipo: text
 * Name: name-input | ID: name-input
 * 💡 Valor baseado na label real: "Name"
 */
cy.get('[data-testid="name-input"]')
  .should('be.visible')
  .clear()
  .type('Teste Name');

/**
 * Radio Group: fav_color
 * Opções disponíveis: "Red" (value: Red), "Blue" (value: Blue), "Yellow" (value: Yellow)
 * 💡 Selecionando: "Red"
 */
cy.get('[data-testid="color1"]')
  .check({ force: true })
  .should('be.checked');

// Outras opções disponíveis (descomente para usar):
// cy.get('[data-testid="color2"]').check({ force: true }); // Blue
// cy.get('[data-testid="color3"]').check({ force: true }); // Yellow
```

---

## 🔧 Como Usar com Outras URLs

Para mapear formulários de outras páginas:

### 1. Abra o arquivo de configuração

📄 `cypress/e2e/form_mapper_public.cy.js`

### 2. Altere a URL no objeto CONFIG

```javascript
const CONFIG = {
  URL: 'https://SUA-URL-AQUI.com/formulario/',  // ← Altere aqui
  TIMEOUT: 30000,
  ROOT_SELECTOR: 'form, main, body',
  OUTPUT_JSON: 'cypress/output/campos_mapeados.json',
  OUTPUT_PRETEST: 'cypress/output/pretest_gerado.cy.js'
};
```

### 3. (Opcional) Ajuste o ROOT_SELECTOR

Se o formulário estiver dentro de um container específico:

```javascript
ROOT_SELECTOR: '#meu-formulario'  // Busca apenas dentro deste elemento
ROOT_SELECTOR: '.form-container'  // Ou por classe
ROOT_SELECTOR: 'form'             // Apenas dentro de tags <form>
```

### 4. Execute novamente

```bash
npm run cy:run
```

---

## 🔍 Troubleshooting - Problemas Comuns

### ❌ Erro: "node is not recognized" ou "npm is not recognized"

**Causa:** Node.js não está instalado ou não está no PATH.

**Solução:**
1. Baixe e instale o Node.js: https://nodejs.org/
2. **Reinicie o terminal/computador**
3. Verifique novamente: `node --version`

---

### ❌ Erro: "Cannot find module 'cypress'"

**Causa:** Dependências não foram instaladas.

**Solução:**
```bash
npm install
```

---

### ❌ Erro: "EACCES permission denied" (Linux/Mac)

**Causa:** Problema de permissão no sistema.

**Solução:**
```bash
sudo npm install
```
Ou configure o npm para não precisar de sudo:
```bash
npm config set prefix ~/.npm-global
```

---

### ❌ Erro: "Cypress verification timed out"

**Causa:** Primeira execução do Cypress pode demorar para baixar o binário.

**Solução:**
```bash
npx cypress install
npx cypress verify
```

---

### ❌ Erro: "Your project does not contain a default supportFile"

**Causa:** Arquivo de suporte do Cypress não existe.

**Solução:** Crie o arquivo `cypress/support/e2e.js` com o conteúdo:
```javascript
// cypress/support/e2e.js
// Arquivo de suporte do Cypress
```

---

### ❌ Cypress abre mas não encontra campos

**Possíveis causas e soluções:**

1. **Página ainda carregando:** Aumente o timeout no CONFIG:
   ```javascript
   TIMEOUT: 60000  // 60 segundos
   ```

2. **Formulário carregado via JavaScript:** Aumente o `cy.wait()`:
   ```javascript
   cy.wait(5000);  // Espera 5 segundos
   ```

3. **ROOT_SELECTOR incorreto:** Ajuste para o container correto.

4. **Formulário dentro de iframe:** Este script não mapeia iframes automaticamente.

---

### ❌ Erro de CORS ou página não carrega

**Causa:** Algumas páginas bloqueiam acesso de origens diferentes.

**Solução:** Adicione no `cypress.config.js`:
```javascript
module.exports = defineConfig({
  e2e: {
    chromeWebSecurity: false,
  },
});
```

---

### ❌ Windows: "execution policy" bloqueando scripts

**Causa:** PowerShell bloqueando execução de scripts.

**Solução:** Execute no PowerShell como Administrador:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### ❌ Campos mapeados mas seletores não funcionam

**Possíveis causas:**

1. **Seletor não é único na página:** Ajuste manualmente no pré-teste.
2. **Elemento com Shadow DOM:** Requer configuração adicional.
3. **Campo dinâmico:** O ID/name muda a cada carregamento.

**Dica:** Use o DevTools (F12) do navegador para inspecionar o elemento e encontrar um seletor melhor.

---

## 🎯 Demo Target

Este projeto usa como exemplo o formulário público:

🔗 **URL:** https://practice-automation.com/form-fields/

Este site foi criado especificamente para prática de automação de testes e pode ser usado livremente para estudos.

---

## ⚠️ Aviso de Uso Ético

> **⚠️ IMPORTANTE: Use este utilitário de forma responsável e ética.**

### ✅ Uso PERMITIDO:
- Sites de prática de automação (como practice-automation.com)
- Ambientes de desenvolvimento/staging da sua empresa
- Seus próprios projetos e aplicações
- Projetos onde você tem autorização explícita para testar

### ❌ Uso NÃO PERMITIDO:
- Sites de terceiros sem autorização
- Tentativas de burlar sistemas de segurança
- Coleta de dados sem consentimento
- Qualquer atividade que viole termos de serviço

**O autor não se responsabiliza pelo uso indevido desta ferramenta.**

---

## 📁 Estrutura do Projeto

```
form-field-mapper-cypress/
├── cypress/
│   ├── e2e/
│   │   └── form_mapper_public.cy.js   # 🎯 Script principal
│   ├── output/                         # 📂 Arquivos gerados (após execução)
│   │   ├── campos_mapeados.json
│   │   └── pretest_gerado.cy.js
│   └── support/
│       └── e2e.js                      # Arquivo de suporte do Cypress
├── cypress.config.js                   # Configuração do Cypress
├── package.json                        # Dependências e scripts
├── package-lock.json                   # Lock das dependências
├── .gitignore                          # Arquivos ignorados pelo Git
├── LICENSE                             # Licença MIT
└── README.md                           # Este arquivo
```

---

## 🛠️ Tecnologias Utilizadas

- **[Cypress](https://www.cypress.io/)** - Framework de testes E2E
- **[Node.js](https://nodejs.org/)** - Runtime JavaScript
- **JavaScript** - Linguagem de programação

---

## 📝 Licença

Este projeto está sob a licença **MIT**. Isso significa que você pode:

- ✅ Usar comercialmente
- ✅ Modificar
- ✅ Distribuir
- ✅ Usar privativamente

Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer um **Fork** do projeto
2. Criar uma **branch** para sua feature (`git checkout -b feature/nova-feature`)
3. **Commit** suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. **Push** para a branch (`git push origin feature/nova-feature`)
5. Abrir um **Pull Request**

---

## 📬 Contato

- **Autor:** [Seu Nome]
- **LinkedIn:** [Seu LinkedIn]
- **GitHub:** [Seu GitHub]

---

## 🌍 English Summary

**Form Field Mapper** is an educational utility for QA/Automation engineers. It automatically maps form fields from any public webpage and generates a professional, ready-to-use Cypress test file.

**Features:**
- Maps inputs, selects, textareas, checkboxes, and radio buttons
- Extracts real labels, types, and reliable selectors
- Generates professional Cypress test with actual options from the form
- Outputs structured JSON with all mapped data

**Quick Start:**
```bash
git clone https://github.com/YOUR_USER/form-field-mapper-cypress.git
cd form-field-mapper-cypress
npm install
npm run cy:run
```

**Output files:** `cypress/output/campos_mapeados.json` and `cypress/output/pretest_gerado.cy.js`

---

<div align="center">

⭐ **Se este projeto te ajudou, deixe uma estrela!** ⭐

Feito com ❤️ para a comunidade de QA

</div>
