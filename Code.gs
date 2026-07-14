/**
 * FB Gestão — Apps Script de gravação
 * Recebe edições do site (rodrigomaneng.github.io/FB_Gestao) e grava na planilha.
 *
 * AÇÕES:
 *  - write:  edita células das abas das escolas
 *            campos: a=Ambiente(B), e=Equipamento(C), st=Status(D),
 *                    pend=Pendência(E), btu=BTU(H), fab=Fabricante(I),
 *                    mod=Modelo(J), obs=Observações(K)
 *  - append: adiciona uma linha numa aba de seção (Chamados, Propostas,
 *            Preventivas...); cria a aba com cabeçalho se não existir.
 */
var FIELD_COL = { a: 2, e: 3, st: 4, pend: 5, btu: 8, fab: 9, mod: 10, obs: 11 }; // B..K

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, app: 'FB Gestão', hora: new Date().toISOString() })
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var out = { ok: false };
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var body = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (body.action === 'write') out = doWrite(ss, body.edits || []);
    else if (body.action === 'append') out = doAppend(ss, body);
    else out.erro = 'ação desconhecida';
  } catch (err) {
    out.erro = String(err);
  } finally {
    lock.releaseLock();
  }
  return ContentService.createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

/* Grava edições nas abas das escolas.
   O índice ri conta apenas linhas de equipamento (coluna C preenchida),
   depois do cabeçalho AMBIENTE/EQUIPAMENTO e antes do RESUMO — exatamente
   como o site enumera. */
function doWrite(ss, edits) {
  var okCount = 0, erros = [];
  var cache = {}; // por aba: lista de números de linha dos equipamentos
  edits.forEach(function (ed) {
    try {
      var sh = ss.getSheetByName(ed.sh);
      if (!sh) throw 'aba não encontrada: ' + ed.sh;
      if (!cache[ed.sh]) cache[ed.sh] = mapEquipRows(sh);
      var rows = cache[ed.sh];
      if (ed.ri < 0 || ed.ri >= rows.length) throw 'índice fora da aba ' + ed.sh + ': ' + ed.ri;
      var col = FIELD_COL[ed.field];
      if (!col) throw 'campo desconhecido: ' + ed.field;
      var val = ed.val;
      if (ed.field === 'st') val = (val === '1' || val === 1) ? 1 : 0;
      sh.getRange(rows[ed.ri], col).setValue(val);
      okCount++;
    } catch (err) { erros.push(String(err)); }
  });
  return { ok: erros.length === 0, gravadas: okCount, erros: erros };
}

function mapEquipRows(sh) {
  var data = sh.getRange(1, 2, sh.getLastRow(), 2).getValues(); // colunas B e C
  var rows = [], started = false;
  for (var i = 0; i < data.length; i++) {
    var a = String(data[i][0] || '').replace(/#REF!\s*/gi, '').trim();
    var eq = String(data[i][1] || '').trim();
    var na = a.toUpperCase(), ne = eq.toUpperCase();
    if (!started) {
      if (na.indexOf('AMBIENTE') > -1 && ne.indexOf('EQUIPAMENTO') > -1) started = true;
      continue;
    }
    if (na === 'RESUMO STATUS' || na === 'SISTEMAS' || na === 'TOTAL' ||
        na === 'FUNCIONANDO' || na === 'CIRCUITOS PARADOS' || ne === 'QUANT') break;
    if (!eq) continue;            // linhas de ambiente ou vazias não contam
    rows.push(i + 1);             // número real da linha na planilha
  }
  return rows;
}

/* Adiciona registro numa aba de seção; cria a aba se não existir. */
function doAppend(ss, body) {
  var sh = ss.getSheetByName(body.tab);
  if (!sh) {
    sh = ss.insertSheet(body.tab);
    var hdr = body.headers && body.headers.length ? body.headers : ['Data', 'Escola', 'Descrição'];
    sh.getRange(1, 1, 1, hdr.length).setValues([hdr])
      .setFontWeight('bold').setBackground('#CC0000').setFontColor('#FFFFFF');
    sh.setFrozenRows(1);
  }
  var vals = body.values || [];
  sh.appendRow(vals.length ? vals : ['']);
  return { ok: true, aba: body.tab, linha: sh.getLastRow() };
}
