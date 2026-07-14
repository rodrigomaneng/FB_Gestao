# Ativar gravação na planilha (Apps Script) — ~5 minutos

Sem isso o site funciona normal para **ver** os dados, e as edições ficam salvas só no navegador de quem editou. Com isso, tudo que for editado no site **grava na planilha Google**, para todos.

## Passo a passo

1. Abra a planilha **Escolas Fundação Bradesco** no Google Sheets
2. Menu **Extensões → Apps Script**
3. Apague o conteúdo do editor e cole todo o código do arquivo **Code.gs**
4. Clique em **Implantar → Nova implantação**
5. Ícone de engrenagem → **App da web**
6. Configure:
   - Executar como: **Eu** (sua conta)
   - Quem pode acessar: **Qualquer pessoa**
7. **Implantar** → autorize com sua conta Google (vai pedir permissão para editar a planilha)
8. Copie a **URL do app da web** (termina em `/exec`)

## Colocar a URL no site

Opção A (só para você): abra o site → botão **⚙** no topo → cole a URL → Salvar.

Opção B (para todos, recomendado): me mande a URL aqui no chat que eu gravo dentro do `index.html` (campo `DEFAULT_SCRIPT_URL`) e republico — aí ninguém precisa configurar nada.

## Como saber que funcionou

- Edite qualquer campo numa escola → barra vermelha embaixo → **Salvar na planilha** → abra a planilha e veja a célula alterada.
- Na página **Chamados** → **+ Novo registro** → salvar → a aba "Chamados" aparece na planilha com o registro.

## Observações

- O botão OK/FALHA grava 1/0 na coluna D da aba da escola — as fórmulas de eficiência da própria planilha continuam funcionando.
- Se um dia trocar a implantação do Apps Script, é só atualizar a URL (⚙ ou me pedir).
