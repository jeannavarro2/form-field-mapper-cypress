/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🗺️ FORM FIELD MAPPER - Utilitário de Mapeamento Automático de Formulários
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Este script mapeia automaticamente campos de formulário e gera um pré-teste
 * Cypress com comandos base para cada campo encontrado.
 * 
 * COMO USAR:
 * 1. Altere CONFIG.URL para a página que deseja mapear
 * 2. Execute: npm run cy:open ou npm run cy:run
 * 3. Veja o output em cypress/output/
 * 
 * ⚠️  USE APENAS EM SITES QUE VOCÊ TEM AUTORIZAÇÃO PARA TESTAR
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ CONFIGURAÇÃO - Altere aqui para usar com outras URLs                      ║
// ╚═══════════════════════════════════════════════════════════════════════════╝
const CONFIG = {
  URL: 'https://practice-automation.com/form-fields/',    //Config.url <<<
  TIMEOUT: 30000,
  ROOT_SELECTOR: 'form, main, body',
  OUTPUT_JSON: 'cypress/output/campos_mapeados.json',
  OUTPUT_PRETEST: 'cypress/output/pretest_gerado.cy.js'
};

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ FUNÇÕES AUXILIARES                                                        ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Limpa texto removendo espaços extras, quebras de linha e caracteres especiais
 */
function clean(text) {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')
    .replace(/[\n\r\t]/g, ' ')
    .trim()
    .substring(0, 100);
}

/**
 * Gera o seletor mais confiável para um elemento
 * Prioridade: data-testid > id > name > aria-label > placeholder
 */
function gerarSeletor(el) {
  const testId = el.getAttribute('data-testid') || el.getAttribute('data-test-id') || el.getAttribute('data-cy');
  if (testId) return `[data-testid="${testId}"]`;
  if (el.id) return `#${el.id}`;
  if (el.name) {
    const tag = el.tagName.toLowerCase();
    const type = el.type ? `[type="${el.type}"]` : '';
    return `${tag}[name="${el.name}"]${type}`;
  }
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel) return `[aria-label="${ariaLabel}"]`;
  const placeholder = el.getAttribute('placeholder');
  if (placeholder) return `[placeholder="${placeholder}"]`;
  const tag = el.tagName.toLowerCase();
  const type = el.type ? `[type="${el.type}"]` : '';
  return `${tag}${type}`;
}

/**
 * Encontra a label associada a um campo de formulário
 */
function encontrarLabel(inputEl, doc) {
  if (inputEl.id) {
    const labelFor = doc.querySelector(`label[for="${inputEl.id}"]`);
    if (labelFor) return clean(labelFor.textContent);
  }
  const labelPai = inputEl.closest('label');
  if (labelPai) {
    const clone = labelPai.cloneNode(true);
    clone.querySelectorAll('input, select, textarea').forEach(inp => inp.remove());
    const texto = clean(clone.textContent);
    if (texto) return texto;
  }
  const container = inputEl.closest('div, fieldset, li, p, td, tr');
  if (container) {
    const labelNoContainer = container.querySelector('label');
    if (labelNoContainer) return clean(labelNoContainer.textContent);
    const spanOuStrong = container.querySelector('span, strong, b');
    if (spanOuStrong) {
      const texto = clean(spanOuStrong.textContent);
      if (texto && texto.length < 50) return texto;
    }
  }
  const ariaLabel = inputEl.getAttribute('aria-label');
  if (ariaLabel) return clean(ariaLabel);
  const placeholder = inputEl.getAttribute('placeholder');
  if (placeholder) return `[${clean(placeholder)}]`;
  const name = inputEl.getAttribute('name');
  if (name) return `[name: ${name}]`;
  const title = inputEl.getAttribute('title');
  if (title) return clean(title);
  return '[Sem label]';
}

/**
 * Extrai opções de um elemento select
 */
function extrairOpcoes(selectEl) {
  const opcoes = [];
  selectEl.querySelectorAll('option').forEach(opt => {
    const value = opt.value;
    const text = clean(opt.textContent);
    if (value && value.trim() !== '' && text) {
      opcoes.push({ value, text });
    }
  });
  return opcoes;
}

/**
 * Extrai todas as opções de um radio group pelo name
 */
function extrairRadioGroup(doc, name, rootElement) {
  const radios = rootElement.querySelectorAll(`input[type="radio"][name="${name}"]`);
  const opcoes = [];
  radios.forEach(radio => {
    const label = encontrarLabel(radio, doc);
    const value = radio.value;
    opcoes.push({ value, label, selector: gerarSeletor(radio) });
  });
  return opcoes;
}

/**
 * Extrai todas as opções de checkboxes com mesmo name
 */
function extrairCheckboxGroup(doc, name, rootElement) {
  const checkboxes = rootElement.querySelectorAll(`input[type="checkbox"][name="${name}"]`);
  const opcoes = [];
  checkboxes.forEach(cb => {
    const label = encontrarLabel(cb, doc);
    const value = cb.value;
    opcoes.push({ value, label, selector: gerarSeletor(cb) });
  });
  return opcoes;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ TESTE PRINCIPAL                                                           ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

describe('🗺️ Form Field Mapper - Mapeamento Automático', () => {
  
  before(() => {
    Cypress.on('uncaught:exception', () => false);
  });

  it('Mapeia campos do formulário e gera pré-teste Cypress', () => {
    
    cy.visit(CONFIG.URL, { timeout: CONFIG.TIMEOUT });
    cy.wait(2000);

    cy.document().then((doc) => {
      const items = [];
      const seletoresProcessados = new Set();
      const radioGroupsProcessados = new Set();
      const checkboxGroupsProcessados = new Set();

      // Encontra o container raiz
      let rootElement = null;
      for (const sel of CONFIG.ROOT_SELECTOR.split(',').map(s => s.trim())) {
        rootElement = doc.querySelector(sel);
        if (rootElement) break;
      }
      if (!rootElement) rootElement = doc.body;

      console.log('🔍 Buscando campos em:', rootElement.tagName);

      // ─────────────────────────────────────────────────────────────────────
      // MAPEAR INPUTS
      // ─────────────────────────────────────────────────────────────────────
      const inputs = rootElement.querySelectorAll(
        'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"])'
      );

      inputs.forEach((input) => {
        const tipo = input.type || 'text';
        const name = input.name || '';
        
        // Para radio buttons, agrupa todas as opções
        if (tipo === 'radio' && name) {
          if (radioGroupsProcessados.has(name)) return;
          radioGroupsProcessados.add(name);
          
          const radioOptions = extrairRadioGroup(doc, name, rootElement);
          const primeiroRadio = rootElement.querySelector(`input[type="radio"][name="${name}"]`);
          
          items.push({
            label: `Radio Group: ${name}`,
            type: 'radio',
            selector: gerarSeletor(primeiroRadio),
            name,
            id: primeiroRadio.id || '',
            value: '',
            placeholder: '',
            required: primeiroRadio.required || primeiroRadio.hasAttribute('required'),
            options: [],
            optionsCount: 0,
            radioOptions,
            checkboxOptions: [],
            element: 'input'
          });
          return;
        }

        // Para checkboxes com mesmo name, agrupa
        if (tipo === 'checkbox' && name) {
          const checkboxesComMesmoNome = rootElement.querySelectorAll(`input[type="checkbox"][name="${name}"]`);
          if (checkboxesComMesmoNome.length > 1) {
            if (checkboxGroupsProcessados.has(name)) return;
            checkboxGroupsProcessados.add(name);
            
            const checkboxOptions = extrairCheckboxGroup(doc, name, rootElement);
            
            items.push({
              label: `Checkbox Group: ${name}`,
              type: 'checkbox-group',
              selector: gerarSeletor(input),
              name,
              id: input.id || '',
              value: '',
              placeholder: '',
              required: input.required || input.hasAttribute('required'),
              options: [],
              optionsCount: 0,
              radioOptions: [],
              checkboxOptions,
              element: 'input'
            });
            return;
          }
        }

        const selector = gerarSeletor(input);
        if (seletoresProcessados.has(selector)) return;
        seletoresProcessados.add(selector);

        const label = encontrarLabel(input, doc);

        items.push({
          label,
          type: tipo,
          selector,
          name,
          id: input.id || '',
          value: input.value || '',
          placeholder: input.placeholder || '',
          required: input.required || input.hasAttribute('required'),
          options: [],
          optionsCount: 0,
          radioOptions: [],
          checkboxOptions: [],
          element: 'input'
        });
      });

      // ─────────────────────────────────────────────────────────────────────
      // MAPEAR SELECTS
      // ─────────────────────────────────────────────────────────────────────
      rootElement.querySelectorAll('select').forEach((select) => {
        const selector = gerarSeletor(select);
        if (seletoresProcessados.has(selector)) return;
        seletoresProcessados.add(selector);

        const label = encontrarLabel(select, doc);
        const opcoes = extrairOpcoes(select);

        items.push({
          label,
          type: select.type || 'select',
          selector,
          name: select.name || '',
          id: select.id || '',
          value: select.value || '',
          placeholder: '',
          required: select.required || select.hasAttribute('required'),
          options: opcoes,
          optionsCount: opcoes.length,
          radioOptions: [],
          checkboxOptions: [],
          element: 'select'
        });
      });

      // ─────────────────────────────────────────────────────────────────────
      // MAPEAR TEXTAREAS
      // ─────────────────────────────────────────────────────────────────────
      rootElement.querySelectorAll('textarea').forEach((textarea) => {
        const selector = gerarSeletor(textarea);
        if (seletoresProcessados.has(selector)) return;
        seletoresProcessados.add(selector);

        items.push({
          label: encontrarLabel(textarea, doc),
          type: 'textarea',
          selector,
          name: textarea.name || '',
          id: textarea.id || '',
          value: textarea.value || '',
          placeholder: textarea.placeholder || '',
          required: textarea.required || textarea.hasAttribute('required'),
          options: [],
          optionsCount: 0,
          radioOptions: [],
          checkboxOptions: [],
          element: 'textarea'
        });
      });

      // ═══════════════════════════════════════════════════════════════════════
      // IMPRIMIR NO CONSOLE
      // ═══════════════════════════════════════════════════════════════════════
      
      console.log('\n═══════════════════════════════════════════════════════════════════');
      console.log('📋 CAMPOS MAPEADOS');
      console.log(`   URL: ${CONFIG.URL}`);
      console.log(`   Total: ${items.length} campos/grupos`);
      console.log('═══════════════════════════════════════════════════════════════════');
      
      items.forEach((item, i) => {
        let linha = `${i + 1}. ${item.label} → ${item.type} → ${item.selector}`;
        if (item.required) linha += ' [REQUIRED]';
        if (item.optionsCount > 0) {
          linha += ` [${item.optionsCount} opções: ${item.options.slice(0, 3).map(o => o.text).join(', ')}...]`;
        }
        if (item.radioOptions.length > 0) {
          linha += ` [${item.radioOptions.length} opções: ${item.radioOptions.map(o => o.label).join(', ')}]`;
        }
        if (item.checkboxOptions.length > 0) {
          linha += ` [${item.checkboxOptions.length} opções: ${item.checkboxOptions.map(o => o.label).join(', ')}]`;
        }
        console.log(linha);
      });

      console.table(items.map(item => ({
        label: item.label.substring(0, 25),
        type: item.type,
        selector: item.selector.substring(0, 35),
        name: item.name || '-',
        required: item.required ? '✓' : '-',
        options: item.optionsCount || item.radioOptions.length || item.checkboxOptions.length || '-'
      })));

      // ═══════════════════════════════════════════════════════════════════════
      // SALVAR JSON
      // ═══════════════════════════════════════════════════════════════════════
      
      const jsonOutput = {
        url: CONFIG.URL,
        dataExtracao: new Date().toISOString(),
        totalCampos: items.length,
        campos: items
      };
      
      cy.writeFile(CONFIG.OUTPUT_JSON, jsonOutput);

      // ═══════════════════════════════════════════════════════════════════════
      // GERAR PRÉ-TESTE PROFISSIONAL
      // ═══════════════════════════════════════════════════════════════════════
      
      const dataGeracao = new Date().toISOString();
      const urlSimplificada = CONFIG.URL.replace(/https?:\/\//, '').replace(/\/$/, '');
      
      let pretest = `/**
 * ════════════════════════════════════════════════════════════════════════════════
 * 🧪 TESTE E2E - FORMULÁRIO
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * 📍 URL: ${CONFIG.URL}
 * 📅 Gerado em: ${dataGeracao}
 * 📊 Total de campos mapeados: ${items.length}
 * 
 * ════════════════════════════════════════════════════════════════════════════════
 * ⚠️  IMPORTANTE: Este é um PRÉ-TESTE gerado automaticamente.
 *     Revise os valores e ajuste conforme a regra de negócio do seu projeto.
 * ════════════════════════════════════════════════════════════════════════════════
 */

describe('Formulário - ${urlSimplificada}', () => {

  // ══════════════════════════════════════════════════════════════════════════
  // CONFIGURAÇÃO
  // ══════════════════════════════════════════════════════════════════════════

  const BASE_URL = '${CONFIG.URL}';

  beforeEach(() => {
    cy.visit(BASE_URL);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TESTE: Preenchimento completo do formulário
  // ══════════════════════════════════════════════════════════════════════════

  it('Deve preencher todos os campos do formulário com sucesso', () => {
`;

      // Agrupa campos por tipo
      const textInputs = items.filter(i => ['text', 'email', 'password', 'tel', 'url', 'number', 'date', 'search'].includes(i.type));
      const selects = items.filter(i => ['select', 'select-one', 'select-multiple'].includes(i.type));
      const checkboxGroups = items.filter(i => i.type === 'checkbox-group');
      const singleCheckboxes = items.filter(i => i.type === 'checkbox');
      const radios = items.filter(i => i.type === 'radio');
      const textareas = items.filter(i => i.type === 'textarea');

      // ═══════════════════════════════════════════════════════════════════════
      // CAMPOS DE TEXTO
      // ═══════════════════════════════════════════════════════════════════════
      if (textInputs.length > 0) {
        pretest += `
    // ────────────────────────────────────────────────────────────────────────
    // 📝 CAMPOS DE TEXTO (${textInputs.length} campos)
    // ────────────────────────────────────────────────────────────────────────
`;
        textInputs.forEach(campo => {
          const selectorEsc = campo.selector.replace(/'/g, "\\'");
          const req = campo.required ? ' [OBRIGATÓRIO]' : '';
          
          let valorSugerido = '';
          let comentarioValor = '';
          
          switch(campo.type) {
            case 'email':
              valorSugerido = 'teste.automation@email.com';
              comentarioValor = 'Email válido';
              break;
            case 'password':
              valorSugerido = 'SenhaForte@2024';
              comentarioValor = 'Senha com maiúscula, número e caractere especial';
              break;
            case 'tel':
              valorSugerido = '11999887766';
              comentarioValor = 'Telefone brasileiro';
              break;
            case 'url':
              valorSugerido = 'https://www.teste.com.br';
              comentarioValor = 'URL com protocolo HTTPS';
              break;
            case 'number':
              valorSugerido = '25';
              comentarioValor = 'Valor numérico';
              break;
            case 'date':
              valorSugerido = '2024-06-15';
              comentarioValor = 'Formato ISO: YYYY-MM-DD';
              break;
            default:
              // Usa info REAL do campo
              if (campo.label && !campo.label.startsWith('[')) {
                valorSugerido = `Teste ${campo.label}`;
                comentarioValor = `Valor baseado na label real: "${campo.label}"`;
              } else if (campo.placeholder) {
                valorSugerido = `Teste ${campo.placeholder}`;
                comentarioValor = `Valor baseado no placeholder real: "${campo.placeholder}"`;
              } else if (campo.name) {
                valorSugerido = `Teste ${campo.name}`;
                comentarioValor = `Valor baseado no name real: "${campo.name}"`;
              } else {
                valorSugerido = 'Valor de Teste';
                comentarioValor = 'Valor genérico';
              }
          }

          pretest += `
    /**
     * Campo: ${campo.label}${req}
     * Tipo: ${campo.type}
     * Name: ${campo.name || 'N/A'} | ID: ${campo.id || 'N/A'}
     * 💡 ${comentarioValor}
     */
    cy.get('${selectorEsc}')
      .should('be.visible')
      .clear()
      .type('${valorSugerido.replace(/'/g, "\\'")}');
`;
        });
      }

      // ═══════════════════════════════════════════════════════════════════════
      // SELECTS - USANDO OPÇÕES REAIS
      // ═══════════════════════════════════════════════════════════════════════
      if (selects.length > 0) {
        pretest += `
    // ────────────────────────────────────────────────────────────────────────
    // 📋 CAMPOS SELECT (${selects.length} campos)
    // ────────────────────────────────────────────────────────────────────────
`;
        selects.forEach(campo => {
          const selectorEsc = campo.selector.replace(/'/g, "\\'");
          const req = campo.required ? ' [OBRIGATÓRIO]' : '';
          
          // OPÇÕES REAIS DO SELECT
          let opcoesComentario = 'Nenhuma opção encontrada';
          let valorSelecionado = 'SELECIONE_UMA_OPCAO';
          
          if (campo.options.length > 0) {
            opcoesComentario = campo.options.map(o => `"${o.value}" → ${o.text}`).join('\n     *        ');
            valorSelecionado = campo.options[0].value;
          }

          pretest += `
    /**
     * Campo: ${campo.label}${req}
     * Opções disponíveis (${campo.options.length}):
     *        ${opcoesComentario}
     */
    cy.get('${selectorEsc}')
      .should('be.visible')
      .select('${valorSelecionado}'); // ← Altere para a opção desejada
`;
        });
      }

      // ═══════════════════════════════════════════════════════════════════════
      // CHECKBOX GROUPS - USANDO OPÇÕES REAIS
      // ═══════════════════════════════════════════════════════════════════════
      if (checkboxGroups.length > 0) {
        pretest += `
    // ────────────────────────────────────────────────────────────────────────
    // ☑️ GRUPOS DE CHECKBOXES (${checkboxGroups.length} grupos)
    // ────────────────────────────────────────────────────────────────────────
`;
        checkboxGroups.forEach(campo => {
          const opcoesInfo = campo.checkboxOptions.map(o => `"${o.label}" (value: ${o.value})`).join(', ');
          
          pretest += `
    /**
     * Grupo: ${campo.name}
     * Opções disponíveis: ${opcoesInfo}
     * 💡 Selecionando a primeira opção. Ajuste conforme necessário.
     */
`;
          // Seleciona apenas a primeira opção como exemplo
          if (campo.checkboxOptions.length > 0) {
            const primeiraOpcao = campo.checkboxOptions[0];
            const selectorEsc = primeiraOpcao.selector.replace(/'/g, "\\'");
            pretest += `    cy.get('${selectorEsc}') // ${primeiraOpcao.label}
      .check({ force: true })
      .should('be.checked');

    // Outras opções disponíveis (descomente se necessário):
`;
            campo.checkboxOptions.slice(1).forEach(opcao => {
              const selEsc = opcao.selector.replace(/'/g, "\\'");
              pretest += `    // cy.get('${selEsc}').check({ force: true }); // ${opcao.label}\n`;
            });
          }
        });
      }

      // ═══════════════════════════════════════════════════════════════════════
      // CHECKBOXES INDIVIDUAIS
      // ═══════════════════════════════════════════════════════════════════════
      if (singleCheckboxes.length > 0) {
        pretest += `
    // ────────────────────────────────────────────────────────────────────────
    // ☑️ CHECKBOXES INDIVIDUAIS (${singleCheckboxes.length} campos)
    // ────────────────────────────────────────────────────────────────────────
`;
        singleCheckboxes.forEach(campo => {
          const selectorEsc = campo.selector.replace(/'/g, "\\'");
          const valorInfo = campo.value ? `value: "${campo.value}"` : 'sem value definido';
          
          pretest += `
    /**
     * Checkbox: ${campo.label}
     * ${valorInfo}
     */
    cy.get('${selectorEsc}')
      .check({ force: true })
      .should('be.checked');
`;
        });
      }

      // ═══════════════════════════════════════════════════════════════════════
      // RADIO BUTTONS - USANDO OPÇÕES REAIS
      // ═══════════════════════════════════════════════════════════════════════
      if (radios.length > 0) {
        pretest += `
    // ────────────────────────────────────────────────────────────────────────
    // 🔘 RADIO BUTTONS (${radios.length} grupos)
    // ────────────────────────────────────────────────────────────────────────
`;
        radios.forEach(campo => {
          if (campo.radioOptions.length > 0) {
            const opcoesInfo = campo.radioOptions.map(o => `"${o.label}" (value: ${o.value})`).join(', ');
            const primeiraOpcao = campo.radioOptions[0];
            const selectorEsc = primeiraOpcao.selector.replace(/'/g, "\\'");
            
            pretest += `
    /**
     * Radio Group: ${campo.name}
     * Opções disponíveis: ${opcoesInfo}
     * 💡 Selecionando: "${primeiraOpcao.label}"
     */
    cy.get('${selectorEsc}')
      .check({ force: true })
      .should('be.checked');

    // Outras opções disponíveis (descomente para usar):
`;
            campo.radioOptions.slice(1).forEach(opcao => {
              const selEsc = opcao.selector.replace(/'/g, "\\'");
              pretest += `    // cy.get('${selEsc}').check({ force: true }); // ${opcao.label}\n`;
            });
          }
        });
      }

      // ═══════════════════════════════════════════════════════════════════════
      // TEXTAREAS
      // ═══════════════════════════════════════════════════════════════════════
      if (textareas.length > 0) {
        pretest += `
    // ────────────────────────────────────────────────────────────────────────
    // 📄 TEXTAREAS (${textareas.length} campos)
    // ────────────────────────────────────────────────────────────────────────
`;
        textareas.forEach(campo => {
          const selectorEsc = campo.selector.replace(/'/g, "\\'");
          const req = campo.required ? ' [OBRIGATÓRIO]' : '';
          const placeholderInfo = campo.placeholder ? `Placeholder: "${campo.placeholder}"` : 'Sem placeholder';
          
          // Texto baseado na label REAL
          const textoSugerido = campo.label && !campo.label.startsWith('[') 
            ? `Texto de teste para o campo ${campo.label}. Gerado automaticamente.`
            : 'Texto de teste para validação do formulário. Gerado automaticamente pelo Form Field Mapper.';
          
          pretest += `
    /**
     * Textarea: ${campo.label}${req}
     * ${placeholderInfo}
     */
    cy.get('${selectorEsc}')
      .should('be.visible')
      .clear()
      .type('${textoSugerido.replace(/'/g, "\\'")}');
`;
        });
      }

      // ═══════════════════════════════════════════════════════════════════════
      // SUBMIT E ASSERTIONS
      // ═══════════════════════════════════════════════════════════════════════
      pretest += `
    // ────────────────────────────────────────────────────────────────────────
    // 🚀 SUBMIT DO FORMULÁRIO
    // ────────────────────────────────────────────────────────────────────────
    
    // TODO: Descomente e ajuste o seletor do botão de submit conforme a página
    // cy.get('button[type="submit"]').click();
    // cy.get('input[type="submit"]').click();
    // cy.contains('button', 'Enviar').click();
    // cy.contains('button', 'Submit').click();

    // ────────────────────────────────────────────────────────────────────────
    // ✅ VALIDAÇÕES PÓS-SUBMIT
    // ────────────────────────────────────────────────────────────────────────
    
    // TODO: Adicione as validações conforme o comportamento esperado
    // cy.url().should('include', '/sucesso');
    // cy.contains('Enviado com sucesso').should('be.visible');
    // cy.get('.success-message').should('exist');
    // cy.get('.error').should('not.exist');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TESTE: Validação de campos obrigatórios
  // ══════════════════════════════════════════════════════════════════════════

  it('Deve validar campos obrigatórios ao submeter formulário vazio', () => {
    // TODO: Clique no submit sem preencher nada
    // cy.get('button[type="submit"]').click();
    
    // TODO: Valide as mensagens de erro
    // cy.contains('Campo obrigatório').should('be.visible');
    // cy.get(':invalid').should('have.length.at.least', 1);
  });

});
`;

      cy.writeFile(CONFIG.OUTPUT_PRETEST, pretest);

      console.log('\n═══════════════════════════════════════════════════════════════════');
      console.log('✅ ARQUIVOS GERADOS COM SUCESSO!');
      console.log(`   📄 ${CONFIG.OUTPUT_JSON}`);
      console.log(`   📄 ${CONFIG.OUTPUT_PRETEST}`);
      console.log('═══════════════════════════════════════════════════════════════════');

      expect(items.length).to.be.greaterThan(0);
      cy.log(`✅ Mapeados ${items.length} campos com sucesso!`);
    });
  });
});
