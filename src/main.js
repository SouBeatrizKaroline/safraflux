import { api } from "./api.js";
import { mergeBackup, MAX_BACKUP_BYTES } from "./backup.js";
import "./style.css";
import QRCode from "qrcode";
import {
  units,
  decimal,
  calculateSplit,
  invoiceStatus,
  csv,
  appendReceipt,
  formatAmount,
} from "./domain.js";
import {
  CHAINS,
  validateAddress,
  balances,
  createReference,
  paymentURI,
  verifyReceipt,
  solanaWallets,
  connectSolana,
  evmProviders,
  connectEVM,
  explorerTx,
} from "./chains.js";

const KEY = "safraflux-v1";
let state={wallets:[],invoices:[],producers:[],lots:[],splits:[],endpoints:{}}, revision=0, ready=false, loadError="";
let legacyBackup=null;
try { legacyBackup=localStorage.getItem(KEY); state.endpoints=JSON.parse(localStorage.getItem('safraflux-rpc')||'{}'); } catch {}
async function loadRemote() {
  const result=await api('state');
  const endpoints=state.endpoints;
  state={...result.state,endpoints};revision=result.revision;ready=true;
}
async function mutate(action,payload) {
  if(!ready)throw new Error('Carregue os registros antes de salvar.');
  let result;try {result=await api('action',{revision,action,payload});}catch(error){if(error.status===409)error.message+=' Seus campos foram preservados; exporte ou copie o rascunho antes de atualizar.';throw error;}
  const endpoints=state.endpoints;
  const cached=new Map(state.wallets.map(w=>[w.id,{balance:w.balance,error:w.error}]));
  state={...result.state,endpoints};revision=result.revision;
  for(const w of state.wallets)Object.assign(w,cached.get(w.id)||{});
}
let view = "overview";
let activeInvoice = null;
let splitResult = null;
const $ = (selector) => document.querySelector(selector);
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (x) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        x
      ],
  );
const short = (s) => `${s.slice(0, 5)}…${s.slice(-5)}`;
const fmt = formatAmount;
const when = (iso) =>
  new Date(iso).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
const save = () => localStorage.setItem('safraflux-rpc',JSON.stringify(state.endpoints));
const chainOptions = (solanaOnly = false) =>
  Object.entries(CHAINS)
    .filter(([, c]) => !solanaOnly || c.family === "solana")
    .map(
      ([id, c]) =>
        `<option value="${id}" ${id === "solana-devnet" ? "selected" : ""}>${c.name}${c.test ? " · sem valor financeiro" : " · rede principal"}</option>`,
    )
    .join("");

function notice(text, error = false) {
  const n = $("#notice");
  n.textContent = text;
  n.className = `notice ${error ? "error" : ""}`;
  n.hidden = false;
}
async function run(button, action) {
  const original = button?.textContent;
  if (button) {
    button.disabled = true;
    button.textContent = "Aguarde…";
  }
  try {
    await action();
  } catch (e) {
    notice(e.message || "Não foi possível concluir.", true);
  } finally {
    if (button?.isConnected) {
      button.disabled = false;
      button.textContent = original;
    }
  }
}
function download(name, content, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
function navigate(next) {
  view = next;
  render();
  $("#content").focus();
}

function render() {
  const menu = [
    ["overview", "Visão geral", "01"],
    ["wallets", "Carteiras", "02"],
    ["invoices", "Lotes e cobranças", "03"],
    ["split", "Rateio por produtor", "04"],
    ["research", "Pesquisa e projeto", "05"],
    ["settings", "Configurações", "06"],
    ["operations", "Operação agrícola", "07"],
    ["history", "Histórico", "08"],
  ];
  $("#app").innerHTML =
    `<a class="skip" href="#content">Pular para o conteúdo</a><aside class="sidebar"><a class="brand" href="#" aria-label="SafraFlux início"><span class="brand-mark">S</span>SafraFlux<span class="beta">LAB</span></a><div class="workspace-label">OPERAÇÃO AGRÍCOLA</div><nav aria-label="Principal">${menu.map(([id, label, n]) => `<button class="nav ${view === id ? "active" : ""}" data-nav="${id}" ${view === id ? 'aria-current="page"' : ""}><span>${n}</span>${label}</button>`).join("")}</nav><div class="sidebar-bottom"><span class="network-mark">◎</span><div>Solana primeiro<small>Conectado ao campo.</small></div></div></aside><div class="page"><header class="topbar"><span>COOPERATIVAS & EXPORTADORES <span class="slash">/</span> CAFÉ</span><a href="https://github.com/SouBeatrizKaroline/safraflux" target="_blank" rel="noreferrer">Projeto aberto ↗</a></header><main id="content" tabindex="-1"><div id="notice" class="notice" role="status" aria-live="polite" hidden></div>${!ready ? '<p class="notice error">Conectando ao armazenamento. Os dados ainda não foram carregados.</p>' : ''}${{ overview: overview, wallets: walletsView, invoices: invoicesView, split: splitView, research: researchView, settings: settingsView, operations: operationsView, history: historyView }[view]()}</main><footer>Registros protegidos por conta e salvos no servidor. <strong>Não há custódia nem repasse automático.</strong></footer></div><dialog id="dialog"><div id="dialog-content"></div><button class="dialog-close secondary" id="close-dialog">Fechar</button></dialog>`;
  document
    .querySelectorAll("[data-nav]")
    .forEach((b) => b.addEventListener("click", () => navigate(b.dataset.nav)));
  $(".brand").addEventListener("click", (e) => {
    e.preventDefault();
    navigate("overview");
  });
  $("#close-dialog").addEventListener("click", () => $("#dialog").close());
  bind();
  if (loadError) {
    notice(loadError, true);
    loadError = "";
  }
}
function heading(eyebrow, title, description, action = "") {
  return `<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${description}</p></div>${action}</div>`;
}
function overview() {
  const live = state.wallets.filter(
    (w) => !CHAINS[w.chain]?.test && w.balance && !w.error,
  );
  const usdc = live.reduce((sum, w) => sum + BigInt(w.balance.usdc), 0n);
  const pending = state.invoices.filter(
    (i) =>
      invoiceStatus(i).status === "Pendente" ||
      invoiceStatus(i).status === "Parcial",
  ).length;
  return `${heading("DO LOTE AO RECEBIMENTO", "Cada recebimento, no seu lote.", "Acompanhe carteiras e transforme entradas em uma memória de repasse.", '<button class="primary" data-nav="invoices">+ Criar cobrança</button>')}<section class="stats" aria-label="Resumo"><article class="stat dark"><span>USDC em carteiras consultadas</span><strong>${live.length ? fmt(decimal(usdc)) : "—"} <small>USDC</small></strong><p>${live.length}/${state.wallets.filter((w) => !CHAINS[w.chain]?.test).length} carteiras principais com consulta válida · sem conversão em reais</p></article><article class="stat"><span>Carteiras acompanhadas</span><strong>${state.wallets.length.toString().padStart(2, "0")}</strong><p>Endereços públicos · até quatro redes</p></article><article class="stat"><span>Cobranças em aberto</span><strong>${pending.toString().padStart(2, "0")}</strong><p>Inclui cobranças de teste, identificadas por rede</p></article></section><div class="columns"><section class="panel"><div class="section-title"><h2>Seus lotes</h2><button class="text-button" data-nav="invoices">Ver cobranças ↗</button></div>${invoiceList(3)}</section><aside class="panel journey"><div class="eyebrow">COMO O DINHEIRO ENCONTRA O LOTE</div><h2>Um caminho verificável.</h2><ol><li><span>1</span><div><strong>Identifique a cobrança</strong><p>Lote, valor, destinatário e referência única.</p></div></li><li><span>2</span><div><strong>Confira o recebimento</strong><p>Valide a transação finalizada na Solana.</p></div></li><li><span>3</span><div><strong>Calcule o rateio</strong><p>Quantidade e prêmio de qualidade, com memória de cálculo.</p></div></li></ol><button class="secondary" data-nav="split">Experimentar o cálculo</button></aside></div><section class="panel wallet-preview"><div class="section-title"><h2>Carteiras da operação</h2><button class="text-button" data-nav="wallets">Gerenciar ↗</button></div>${state.wallets.length ? walletTable() : '<div class="empty compact"><span class="empty-icon">◎</span><div><h3>Adicione sua primeira carteira</h3><p>Consulte um endereço público ou conecte uma carteira compatível.</p></div><button class="secondary" data-nav="wallets">Adicionar carteira</button></div>'}</section>`;
}
function walletTable() {
  return `<div class="table-wrap"><table><thead><tr><th>Carteira / rede</th><th>Endereço</th><th>USDC</th><th>Moeda da rede</th><th>Consulta</th><th>Ações</th></tr></thead><tbody>${state.wallets.map((w) => `<tr><td><strong>${esc(w.name)}</strong><small>${CHAINS[w.chain].name}${CHAINS[w.chain].test ? " · TESTE" : ""}</small></td><td class="mono" title="${esc(w.address)}">${short(w.address)}</td><td>${w.balance && !w.error ? fmt(decimal(w.balance.usdc)) : "—"}</td><td>${w.balance && !w.error ? fmt(decimal(w.balance.native, CHAINS[w.chain].decimals)) : "—"}<small>${CHAINS[w.chain].symbol}</small></td><td>${w.error ? `<span class="error-text">${esc(w.error)}</span>` : w.balance ? `<small>${when(w.balance.at)}</small>` : "Ainda não consultada"}</td><td><button class="text-button" data-refresh="${w.id}">Atualizar</button><button class="text-button muted" data-remove-wallet="${w.id}" aria-label="Remover ${esc(w.name)}">Remover</button></td></tr>`).join("")}</tbody></table></div>`;
}
function walletsView() {
  return `${heading("TESOURARIA MULTICARTEIRAS", "Carteiras da operação", "SOL e USDC na Solana. ETH e USDC na Base, Ethereum e Arbitrum.")}<div class="columns form-columns"><section class="panel"><h2>Acompanhar um endereço</h2><form id="wallet-form"><label>Nome da carteira<input name="name" placeholder="Ex.: Recebimentos da cooperativa" maxlength="60" required></label><label>Rede<select name="chain">${chainOptions()}</select></label><label>Endereço público<input name="address" placeholder="Cole o endereço da carteira" autocomplete="off" required></label><button class="primary">Adicionar carteira</button></form></section><section class="panel connection"><div class="eyebrow">CONEXÃO OPCIONAL</div><h2>Use a carteira que já tem.</h2><p>Autorize o acesso ao endereço. O SafraFlux não pede frase de recuperação nem assina transferências.</p><label>Rede da conexão<select id="connect-chain">${chainOptions()}</select></label><button id="connect-wallet" class="secondary">Escolher carteira</button><p class="subtle">Carteiras Solana com Wallet Standard e carteiras EVM com EIP-6963. A disponibilidade depende da extensão instalada.</p></section></div><section class="panel"><div class="section-title"><h2>Endereços acompanhados</h2><button class="secondary" id="refresh-all" ${!state.wallets.length ? "disabled" : ""}>Atualizar saldos</button></div>${state.wallets.length ? walletTable() : '<div class="empty"><p>Nenhuma carteira adicionada. Os saldos serão consultados diretamente na rede.</p></div>'}</section>`;
}
function invoiceList(limit = 100) {
  return state.invoices.length
    ? `<div class="table-wrap"><table><thead><tr><th>Lote / rede</th><th>Cobrança</th><th>Recebido</th><th>Situação</th><th></th></tr></thead><tbody>${state.invoices
        .slice(0, limit)
        .map((i) => {
          const s = invoiceStatus(i);
          return `<tr><td><strong>${esc(i.lot)}</strong><small>${CHAINS[i.chain].name}${CHAINS[i.chain].test ? " · TESTE" : ""}</small></td><td>${fmt(i.amount)} <small>USDC</small></td><td>${fmt(s.received)} <small>USDC</small></td><td><span class="badge ${s.status === "Recebido" ? "paid" : ""}">${s.status}</span></td><td><button class="text-button" data-invoice="${i.id}">Abrir ↗</button></td></tr>`;
        })
        .join("")}</tbody></table></div>`
    : '<div class="empty"><div class="empty-lines" aria-hidden="true">≡</div><h3>Nenhum lote cadastrado ainda</h3><p>Crie uma cobrança para reunir os recebimentos<br>e começar a conciliação.</p><button class="secondary" data-nav="invoices">Cadastrar primeiro lote</button></div>';
}
function invoicesView() {
  return `${heading("CONCILIAÇÃO", "Lotes e cobranças", "Uma referência por cobrança. Cada entrada conferida na rede.")}<section class="panel"><h2>Nova cobrança em USDC</h2><form id="invoice-form" class="grid-form"><label>Identificação do lote<input name="lot" placeholder="Ex.: CAF-2026-014" maxlength="60" required></label><label>Valor em USDC<input name="amount" inputmode="decimal" placeholder="Ex.: 1250,50" required></label><label>Rede<select name="chain">${chainOptions(true)}</select></label><label>Carteira de recebimento<input name="recipient" placeholder="Endereço público Solana" required></label><label class="wide">Referência interna do contrato (opcional)<input name="contract" maxlength="80" placeholder="Use um código; não inclua dados pessoais"></label><p class="form-note wide">A cobrança é salva na sua conta e gera um pedido Solana Pay. O recebimento só muda de status após consulta de uma transação finalizada. A entrega do café deve ser comprovada fora da blockchain.</p><button class="primary">Criar cobrança</button></form></section><section class="panel"><div class="section-title"><h2>Cobranças cadastradas</h2><button class="text-button" id="export-invoices">Exportar CSV ↓</button></div>${invoiceList()}</section>`;
}
function splitView() {
  return `${heading("MEMÓRIA DE CÁLCULO", "Rateio por produtor", "Distribua o valor-base por quantidade e o prêmio por quantidade × pontos.")}<section class="panel"><div class="section-title"><h2>Dados do rateio</h2><button class="text-button" id="fill-example">Preencher exemplo fictício</button></div><form id="split-form"><div class="form-row"><label>Origem do valor<select name="source" id="split-source"><option value="manual">Valor informado manualmente</option>${state.invoices.map((i) => `<option value="${i.id}">${esc(i.lot)} · recebido ${invoiceStatus(i).received} USDC${CHAINS[i.chain].test ? " de teste" : ""}</option>`).join("")}</select></label><label>Valor a distribuir (USDC)<input name="total" inputmode="decimal" required placeholder="0,00"></label><label>Parte destinada ao prêmio (%)<input name="premium" inputmode="decimal" value="0" required></label></div><label>Produtores, um por linha: código; quantidade em kg; pontos de qualidade<textarea name="producers" rows="6" placeholder="PROD-01; 600; 80&#10;PROD-02; 400; 90" required></textarea></label><div class="split-explainer"><strong>Critério transparente</strong><p>O valor-base segue a participação em kg. O prêmio segue kg × pontos (0 a 100), definidos no contrato. Pontos são informações declaradas, sem certificação automática. O arredondamento preserva o total até a sexta casa decimal.</p></div><button class="primary">Calcular rateio</button><span id="split-mode" class="subtle">Cálculo local. Nenhum pagamento será enviado.</span></form><div id="split-result" aria-live="polite"></div></section>`;
}

function operationsView() {
  const stages={cadastrado:'Cadastrado',beneficiamento:'Em beneficiamento',pronto:'Pronto para envio',expedido:'Expedido',entregue:'Entregue',cancelado:'Cancelado'};
  const transitions={cadastrado:['beneficiamento','cancelado'],beneficiamento:['pronto','cancelado'],pronto:['expedido','cancelado'],expedido:['entregue'],entregue:[],cancelado:[]};
  return heading('DO CAMPO AO REPASSE','Operação agrícola','Cadastros e etapas declaradas pela operação. A blockchain não certifica a entrega física.') +
  '<div class="columns"><section class="panel"><h2>Cadastrar produtor</h2><form id="producer-form"><label>Código<input name="code" maxlength="60" required placeholder="PROD-01"></label><label>Nome de identificação<input name="name" maxlength="120" required></label><button class="primary">Salvar produtor</button></form></section><section class="panel"><h2>Cadastrar lote</h2><form id="lot-form"><label>Código do lote<input name="code" maxlength="60" required placeholder="CAF-2026-001"></label><label>Produto<input name="crop" maxlength="80" required placeholder="Café arábica"></label><label>Safra<input name="harvest" maxlength="30" required placeholder="2026/2027"></label><label>Quantidade (kg)<input name="kg" inputmode="decimal" required></label><button class="primary">Salvar lote</button></form></section></div>' +
  '<section class="panel"><h2>Produtores cadastrados</h2>'+ (state.producers.length ? '<div class="table-wrap"><table><thead><tr><th>Código</th><th>Identificação</th><th>Situação</th></tr></thead><tbody>'+state.producers.map(p=>'<tr><td>'+esc(p.code)+'</td><td>'+esc(p.name)+'</td><td>'+(p.archived?'Arquivado':'Ativo <button class="text-button" data-archive-producer="'+p.id+'">Arquivar</button>')+'</td></tr>').join('')+'</tbody></table></div>':'<p>Nenhum produtor cadastrado.</p>')+'</section>' +
  '<section class="panel"><h2>Lotes da operação</h2>'+(state.lots.length?'<div class="table-wrap"><table><thead><tr><th>Lote</th><th>Produto / safra</th><th>Kg</th><th>Etapa declarada</th><th>Ações</th></tr></thead><tbody>'+state.lots.map(l=>'<tr><td>'+esc(l.code)+'</td><td>'+esc(l.crop)+' / '+esc(l.harvest)+'</td><td>'+fmt(l.kg)+'</td><td>'+stages[l.status]+'</td><td>'+transitions[l.status].map(status=>'<button class="text-button" data-stage="'+status+'" data-lot="'+l.id+'">'+stages[status]+'</button>').join('')+'<button class="text-button" data-bill-lot="'+l.id+'">Criar cobrança</button></td></tr>').join('')+'</tbody></table></div>':'<p>Nenhum lote cadastrado.</p>')+'</section>' +
  '<section class="panel"><h2>Rateios salvos</h2><p>Versões preservadas. Um rateio salvo não executa pagamentos.</p>'+(state.splits.length?state.splits.map(x=>'<article class="saved-split"><h3>'+esc(x.lot)+' · '+fmt(x.total)+' USDC</h3><p>'+esc(x.sourceLabel)+' · '+when(x.createdAt)+' · regra '+esc(x.rule)+'</p><button class="secondary" data-export-saved="'+x.id+'">Exportar memória CSV</button><div class="table-wrap"><table><thead><tr><th>Produtor</th><th>Kg</th><th>Base</th><th>Prêmio</th><th>Total USDC</th></tr></thead><tbody>'+x.rows.map(r=>'<tr><td>'+esc(r.name)+'</td><td>'+fmt(r.kg)+'</td><td>'+fmt(r.base)+'</td><td>'+fmt(r.premium)+'</td><td>'+fmt(r.total)+'</td></tr>').join('')+'</tbody></table></div></article>').join(''):'<p>Calcule um rateio e escolha Salvar rateio no histórico.</p>')+'</section>';
}
function historyView() {
  return heading('REGISTRO DE ALTERAÇÕES','Histórico da conta','Cada gravação recebe uma revisão. O histórico não pode ser editado pela interface.')+'<section class="panel"><button id="load-history" class="primary">Consultar histórico</button><div id="history-results" aria-live="polite"></div></section>';
}
function bindOperations() {
  $('#reload-data')?.addEventListener('click',e=>run(e.target,async()=>{await loadRemote();render();notice('Dados atualizados do servidor.');}));
  $('#migrate-local')?.addEventListener('click',e=>run(e.target,async()=>{
    const data=JSON.parse(legacyBackup);await mutate('backup.import',{...data,version:1});legacyBackup=null;render();notice('Registros antigos importados. Pagamentos precisam de nova conferência. A cópia local original foi preservada.');
  }));
  for(const [selector,action] of [['#producer-form','producer.add'],['#lot-form','lot.add']])$(selector)?.addEventListener('submit',e=>{
    e.preventDefault();const payload=Object.fromEntries(new FormData(e.target));run(e.submitter,async()=>{await mutate(action,payload);render();notice('Cadastro salvo no servidor.');});
  });
  document.querySelectorAll('[data-archive-producer]').forEach(b=>b.addEventListener('click',()=>run(b,async()=>{await mutate('producer.archive',{id:b.dataset.archiveProducer});render();})));
  document.querySelectorAll('[data-stage]').forEach(b=>b.addEventListener('click',()=>run(b,async()=>{await mutate('lot.status',{id:b.dataset.lot,status:b.dataset.stage});render();})));
  document.querySelectorAll('[data-bill-lot]').forEach(b=>b.addEventListener('click',()=>{const lot=state.lots.find(l=>l.id===b.dataset.billLot);navigate('invoices');$('#invoice-form').elements.lot.value=lot.code;}));
  document.querySelectorAll('[data-export-saved]').forEach(b=>b.addEventListener('click',()=>{const x=state.splits.find(s=>s.id===b.dataset.exportSaved);download('safraflux-rateio-'+x.id+'.csv',csv([['Lote',x.lot],['Origem',x.sourceLabel],['Regra',x.rule],['Data',x.createdAt],['Produtor','Kg','Pontos','Base USDC','Prêmio USDC','Total USDC'],...x.rows.map(r=>[r.name,r.kg,r.points,r.base,r.premium,r.total])]),'text/csv;charset=utf-8');}));
  $('#load-history')?.addEventListener('click',e=>run(e.target,async()=>{
    const labels={'wallet.add':'Carteira cadastrada','wallet.remove':'Carteira removida','invoice.add':'Cobrança criada','invoice.verify':'Recebimento verificado','backup.import':'Backup importado','producer.add':'Produtor cadastrado','producer.archive':'Produtor arquivado','lot.add':'Lote cadastrado','lot.status':'Etapa do lote alterada','split.save':'Rateio salvo'};
    const result=await api('history');$('#history-results').innerHTML=result.events.length?'<div class="table-wrap"><table><thead><tr><th>Revisão</th><th>Operação</th><th>Data</th></tr></thead><tbody>'+result.events.map(x=>'<tr><td>'+x.revision+'</td><td>'+esc(labels[x.action]||x.action)+'</td><td>'+when(x.at)+'</td></tr>').join('')+'</tbody></table></div>':'<p>Nenhuma alteração registrada.</p>';
  }));
}

function researchView() {
  return `${heading("DECISÕES DOCUMENTADAS", "Um problema de operação.", "Pesquisa, critérios e limites da proposta em acesso aberto.")}<div class="columns"><section class="panel"><div class="eyebrow">HIPÓTESE CENTRAL</div><h2>Receber não encerra o trabalho.</h2><p>Uma venda pode reunir a produção de várias famílias. Depois do recebimento, ainda é preciso identificar o lote, conferir pagamentos parciais e explicar o valor devido a cada produtor.</p><p>O recorte inicial são cooperativas e pequenas exportadoras de café especial com compradores dispostos a pagar em stablecoins.</p><p><strong>Validação comercial pendente:</strong> nenhuma entrevista, parceria, venda ou economia foi comprovada.</p></section><section class="panel"><h2>O que orienta o projeto</h2><p>AgriDex já conecta agro e blockchain. Request Finance já organiza operações em cripto. Nossa hipótese é que conciliação por lote e prêmio por produtor merecem um fluxo próprio.</p><p>Solana é a integração principal. Outras redes entram primeiro na consulta de saldos; recebimento entre redes e crédito ficam fora desta versão.</p></section></div><section class="panel"><h2>Leia a pesquisa completa</h2><div class="research-links"><a href="https://github.com/SouBeatrizKaroline/safraflux/blob/main/docs/pesquisa-de-mercado.md" target="_blank" rel="noreferrer"><span>01</span><div><strong>Mercado e concorrentes</strong><small>Fontes primárias, público, preço e hipóteses.</small></div>↗</a><a href="https://github.com/SouBeatrizKaroline/safraflux/blob/main/docs/hackathon-e-benchmarks.md" target="_blank" rel="noreferrer"><span>02</span><div><strong>Hackathon e premiados</strong><small>Regras oficiais e dez referências de produto.</small></div>↗</a><a href="https://github.com/SouBeatrizKaroline/safraflux#readme" target="_blank" rel="noreferrer"><span>03</span><div><strong>README do projeto</strong><small>Arquitetura, execução e próximos passos.</small></div>↗</a></div></section>`;
}
function settingsView() {
  return `${heading("SEU AMBIENTE", "Configurações", "Consultas de saldo e cópia dos registros da sua conta.")}<section class="panel"><h2>Endpoints RPC</h2><p>Provedores públicos podem limitar consultas. Informe somente URLs HTTPS de sua confiança. As URLs ficam neste navegador; não use chaves secretas de servidor.</p><form id="settings-form">${Object.entries(
    CHAINS,
  )
    .map(
      ([id, c]) =>
        `<label>${c.name}<input name="${id}" type="url" value="${esc(state.endpoints[id] || "")}" placeholder="${c.rpc}"></label>`,
    )
    .join(
      "",
    )}<button class="primary">Salvar provedores</button></form></section><section class="panel"><h2>Seus registros</h2><button id="reload-data" class="secondary">Atualizar dados do servidor</button>${legacyBackup ? `<button id="migrate-local" class="secondary">Importar registros antigos deste navegador</button>` : ""}<p>Carteiras, cobranças, produtores, lotes e rateios ficam vinculados à sua conta no servidor. Exporte uma cópia privada regularmente. A exportação não inclui URLs de provedores.</p><button class="secondary" id="backup">Exportar registros JSON</button><label>Restaurar backup JSON<input id="restore-file" type="file" accept=".json,application/json"></label><p id="restore-preview" role="status"></p><button class="primary" id="restore-confirm" disabled>Importar registros validados</button><p class="subtle">Importe um backup para reunir registros neste navegador. Os pagamentos importados precisam de nova verificação na rede. Abra a aplicação em outro dispositivo com a mesma conta para acessar os registros.</p></section>`;
}

async function refreshWallet(id) {
  const w = state.wallets.find((w) => w.id === id);
  if (!w) return;
  try {
    w.balance = await balances(w, state.endpoints);
    delete w.error;
  } catch (e) {
    w.error = e.message;
  }
  save();
}
async function addWallet(name,chain,address) {
  await mutate('wallet.add',{name,chain,address});
  return state.wallets.at(-1).id;
}
function bind() {
  bindOperations();
  $("#wallet-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    run(e.submitter, async () => {
      const d = Object.fromEntries(new FormData(e.target));
      const id = await addWallet(d.name, d.chain, d.address);
      await refreshWallet(id);
      render();
      notice(
        "Carteira adicionada. Consulte o resultado e o horário na tabela.",
      );
    });
  });
  document.querySelectorAll("[data-refresh]").forEach((b) =>
    b.addEventListener("click", () =>
      run(b, async () => {
        await refreshWallet(b.dataset.refresh);
        render();
      }),
    ),
  );
  document.querySelectorAll("[data-remove-wallet]").forEach((b) =>
    b.addEventListener("click", () => {
      run(b, async()=>{
        await mutate('wallet.remove',{id:b.dataset.removeWallet});render();notice('Carteira removida do acompanhamento. Cobranças preservadas.');
      });
    }),
  );
  $("#refresh-all")?.addEventListener("click", (e) =>
    run(e.target, async () => {
      for (const w of state.wallets) await refreshWallet(w.id);
      render();
      notice("Consultas concluídas. Falhas aparecem em cada carteira.");
    }),
  );
  $("#connect-wallet")?.addEventListener("click", (e) =>
    run(e.target, chooseWallet),
  );
  $("#invoice-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    run(e.submitter, async () => {
      const d = Object.fromEntries(new FormData(e.target));
      await mutate('invoice.add',d);
      const invoice=state.invoices[0];
      render();await openInvoice(invoice.id);
    });
  });
  document
    .querySelectorAll("[data-invoice]")
    .forEach((b) =>
      b.addEventListener("click", () =>
        run(b, () => openInvoice(b.dataset.invoice)),
      ),
    );
  $("#export-invoices")?.addEventListener("click", () =>
    download(
      "safraflux-cobrancas.csv",
      csv([
        [
          "Lote",
          "Contrato",
          "Rede",
          "Valor USDC",
          "Recebido USDC",
          "Situação",
          "Referência",
          "Destinatário",
          "Assinaturas verificadas",
        ],
        ...state.invoices.map((i) => [
          i.lot,
          i.contract,
          i.chain,
          i.amount,
          invoiceStatus(i).received,
          invoiceStatus(i).status,
          i.reference,
          i.recipient,
          i.receipts.map((r) => r.signature).join("|"),
        ]),
      ]),
      "text/csv;charset=utf-8",
    ),
  );
  for (const event of ["input", "change"])
    $("#split-form")?.addEventListener(event, () => {
      splitResult = null;
      $("#split-result").innerHTML = "";
    });
  $("#fill-example")?.addEventListener("click", () => {
    const f = $("#split-form");
    f.elements.source.value = "manual";
    f.elements.total.readOnly = false;
    f.elements.total.value = "1000";
    f.elements.premium.value = "10";
    f.elements.producers.value = "PROD-01; 600; 80\nPROD-02; 400; 90";
    $("#split-mode").textContent =
      "Exemplo fictício para testar o cálculo. Sem pagamento ou cliente real.";
  });
  $("#split-source")?.addEventListener("change", (e) => {
    const i = state.invoices.find((i) => i.id === e.target.value);
    const f = $("#split-form");
    f.elements.total.readOnly = !!i;
    f.elements.total.value = i ? invoiceStatus(i).received : "";
    $("#split-mode").textContent = i
      ? `Valor de entradas verificadas em ${CHAINS[i.chain].name}. Nenhum repasse enviado.`
      : "Valor informado manualmente. Não comprova recebimento.";
  });
  $("#split-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    run(e.submitter, async () => {
      const d = Object.fromEntries(new FormData(e.target));
      const producers = d.producers
        .trim()
        .split(/\r?\n/)
        .map((line) => {
          const parts = line.split(";").map((v) => v.trim());
          if (parts.length !== 3 || !parts[0])
            throw new Error("Use três campos por linha: código; kg; pontos.");
          return { name: parts[0], kg: parts[1], points: parts[2] };
        });
      if (
        new Set(producers.map((p) => p.name.toLowerCase())).size !==
        producers.length
      )
        throw new Error("Cada produtor deve ter um código único.");
      const source = state.invoices.find((i) => i.id === d.source);
      const total = source ? invoiceStatus(source).received : d.total;
      splitResult = {
        producers, sourceId:d.source,
        rows: calculateSplit(total, producers, d.premium),
        total,
        source: source
          ? `${source.lot} / ${CHAINS[source.chain].name}`
          : "Valor manual / sem comprovação",
        premium: d.premium,
      };
      $("#split-result").innerHTML =
        `<div class="section-title result-title"><div><div class="eyebrow">TOTAL PRESERVADO · ${fmt(total)} USDC</div><h2>Memória do rateio</h2></div><button id="save-split" class="primary">Salvar rateio no histórico</button><button id="export-split" class="secondary">Exportar CSV ↓</button></div><p class="subtle">${esc(splitResult.source)} · Prêmio: ${esc(d.premium)}% · Valores calculados; repasses não executados.</p><div class="table-wrap"><table><thead><tr><th>Produtor</th><th>Quantidade</th><th>Base USDC</th><th>Prêmio USDC</th><th>Total USDC</th></tr></thead><tbody>${splitResult.rows.map((r) => `<tr><td><strong>${esc(r.name)}</strong></td><td>${esc(r.kg)} kg</td><td>${fmt(r.base)}</td><td>${fmt(r.premium)}</td><td><strong>${fmt(r.total)}</strong></td></tr>`).join("")}</tbody></table></div>`;
      $("#save-split").addEventListener('click',event=>run(event.target,async()=>{
        await mutate('split.save',{lot:source?.lot||'Avulso',source:splitResult.sourceId,total:splitResult.total,premium:splitResult.premium,producers:splitResult.producers});
        render();notice('Rateio salvo com sua regra e memória de cálculo. Consulte Operação agrícola.');
      }));
      $("#export-split").addEventListener("click", () =>
        download(
          "safraflux-rateio.csv",
          csv([
            ["Origem", splitResult.source],
            ["Prêmio %", splitResult.premium],
            [
              "Produtor",
              "kg",
              "Pontos",
              "Base USDC",
              "Prêmio USDC",
              "Total USDC",
            ],
            ...splitResult.rows.map((r) => [
              r.name,
              r.kg,
              r.points,
              r.base,
              r.premium,
              r.total,
            ]),
          ]),
          "text/csv;charset=utf-8",
        ),
      );
    });
  });
  $("#settings-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    run(e.submitter, async () => {
      const d = Object.fromEntries(new FormData(e.target));
      const endpoints = {};
      for (const [id, value] of Object.entries(d)) {
        if (!value.trim()) continue;
        const u = new URL(value);
        if (u.protocol !== "https:" || u.username || u.password)
          throw new Error("Use URLs HTTPS sem usuário e senha.");
        endpoints[id] = u.toString();
      }
      state.endpoints = endpoints;
      save();
      notice("Provedores salvos neste navegador.");
    });
  });
  let pendingBackup = null;
  $("#restore-file")?.addEventListener("change", async (event) => {
    pendingBackup = null;
    $("#restore-confirm").disabled = true;
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > MAX_BACKUP_BYTES)
        throw new Error("O backup deve ter até 2 MB.");
      const raw = await file.text();
      if (!event.target.isConnected || event.target.files?.[0] !== file) return;
      const result = mergeBackup(state, raw);
      pendingBackup = raw;
      $("#restore-preview").textContent =
        result.walletsAdded +
        " carteira(s), " +
        result.invoicesAdded +
        " cobrança(s) e " +
        result.signaturesAdded +
        " assinatura(s) para conferir. Os registros atuais serão preservados.";
      $("#restore-confirm").disabled = false;
    } catch (error) {
      if($("#restore-preview"))$("#restore-preview").textContent = error.message;
    }
  });
  $("#restore-confirm")?.addEventListener("click", async () => {
    try {
      if (!pendingBackup) return;
      await mutate("backup.import",JSON.parse(pendingBackup));
      render();
      notice(
        "Backup importado. Abra as cobranças para conferir os pagamentos na rede.",
      );
    } catch (error) {
      $("#restore-preview").textContent = error.message;
    }
  });
  $("#backup")?.addEventListener("click", () =>
    download(
      "safraflux-registros.json",
      JSON.stringify(
        {
          version: 1,
          exportedAt: new Date().toISOString(),
          wallets: state.wallets,
          invoices: state.invoices,
          producers: state.producers, lots: state.lots, splits: state.splits,
        },
        null,
        2,
      ),
      "application/json",
    ),
  );
}

async function chooseWallet() {
  const chain = $("#connect-chain").value;
  const isSolana = CHAINS[chain].family === "solana";
  const wallets = isSolana ? solanaWallets() : [...evmProviders.values()];
  if (!wallets.length)
    throw new Error(
      "Nenhuma carteira compatível detectada. Abra este endereço no navegador com sua extensão ou acompanhe um endereço público.",
    );
  $("#dialog-content").innerHTML =
    `<div class="eyebrow">${CHAINS[chain].name}</div><h2>Escolha sua carteira</h2><div class="wallet-choice">${wallets.map((w, i) => `<button class="secondary" data-wallet="${i}">${esc(isSolana ? w.name : w.info.name)}</button>`).join("")}</div><p class="subtle">Somente acesso ao endereço. Nenhuma transferência será solicitada.</p><p id="wallet-error" role="alert"></p>`;
  $("#dialog").showModal();
  document.querySelectorAll("[data-wallet]").forEach((b) =>
    b.addEventListener("click", async () => {
      b.disabled = true;
      try {
        const w = wallets[Number(b.dataset.wallet)];
        const account = isSolana
          ? await connectSolana(w, chain)
          : { address: await connectEVM(w.provider, chain), name: w.info.name };
        const id = addWallet(account.name, chain, account.address);
        $("#dialog").close();
        await refreshWallet(id);
        render();
        notice("Endereço autorizado e adicionado ao acompanhamento.");
      } catch (e) {
        $("#wallet-error").textContent = e.message;
        b.disabled = false;
      }
    }),
  );
}
async function openInvoice(id) {
  const i = state.invoices.find((i) => i.id === id);
  if (!i) return;
  activeInvoice = id;
  const s = invoiceStatus(i);
  const uri = paymentURI(i);
  const test = CHAINS[i.chain].test;
  $("#dialog-content").innerHTML =
    `<div class="eyebrow">${CHAINS[i.chain].name}${test ? " · TOKENS SEM VALOR FINANCEIRO" : ""}</div><h2>${esc(i.lot)}</h2><p>${fmt(i.amount)} USDC · <span class="badge">${s.status}</span></p><div class="payment-grid"><canvas id="qr" aria-label="QR da solicitação de pagamento Solana Pay"></canvas><div><strong>Pedido Solana Pay</strong><p>${test ? "Selecione Devnet na carteira antes de usar." : "Esta cobrança usa USDC real na Solana Mainnet."} O link não seleciona a rede na carteira. Confira rede, token, valor e destinatário.</p><button class="secondary" id="copy-payment">Copiar solicitação</button></div></div><dl class="invoice-details"><dt>Destinatário</dt><dd class="mono">${esc(i.recipient)}</dd><dt>Referência única</dt><dd class="mono">${esc(i.reference)}</dd><dt>Recebido / falta / excedente</dt><dd>${s.received} / ${s.outstanding} / ${s.excess} USDC</dd><dt>Contrato</dt><dd>${esc(i.contract || "Não informado")}</dd></dl><div class="pending-receipts">${(i.pendingSignatures || []).map((signature, index) => `<p>Pagamento importado, ainda não conferido: <button class="secondary" data-pending="${index}">${esc(short(signature))}</button></p>`).join("")}</div><form id="verify-form"><label>Assinatura da transação<input name="signature" placeholder="Cole a assinatura do pagamento" required autocomplete="off"></label><button class="primary">Verificar recebimento</button></form><p id="verify-result" role="status"></p><div class="receipts">${i.receipts.map((r) => `<p><a href="${explorerTx(i.chain, r.signature)}" target="_blank" rel="noreferrer">${short(r.signature)} ↗</a> · ${decimal(r.amount)} USDC · finalizada</p>`).join("")}</div><p class="subtle">A verificação confirma a entrada de USDC com esta referência. Não certifica comprador, contrato, qualidade ou entrega física.</p>`;
  $("#dialog").showModal();
  await QRCode.toCanvas($("#qr"), uri, {
    width: 190,
    margin: 1,
    color: { dark: "#092f27" },
  });
  $("#copy-payment").addEventListener("click", (e) =>
    run(e.target, async () => {
      await navigator.clipboard.writeText(uri);
      $("#verify-result").textContent =
        "Solicitação copiada. Confira a rede antes de compartilhar.";
    }),
  );
  document.querySelectorAll("[data-pending]").forEach((button) =>
    button.addEventListener("click", () => {
      $("#verify-form input[name=signature]").value =
        i.pendingSignatures[Number(button.dataset.pending)];
    }),
  );
  $("#verify-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const button = e.submitter;
    button.disabled = true;
    button.textContent = "Consultando a rede…";
    $("#verify-result").textContent = "";
    try {
      const signature = new FormData(e.target).get("signature").trim();
      if (
        state.invoices.some(
          (other) =>
            other.chain === i.chain &&
            other.receipts.some((r) => r.signature === signature),
        )
      )
        throw new Error("Esta transação já foi conciliada neste navegador.");
      await mutate('invoice.verify',{id,signature});
      $("#dialog").close();
      render();
      await openInvoice(id);
      $("#verify-result").textContent =
        "Recebimento finalizado verificado e registrado.";
    } catch (e) {
      $("#verify-result").textContent = e.message;
      $("#verify-result").className = "error-text";
    } finally {
      if (button.isConnected) {
        button.disabled = false;
        button.textContent = "Verificar recebimento";
      }
    }
  });
}

render();
loadRemote().then(()=>render()).catch(error=>{ready=false;notice(error.message+' Use Atualizar dados do servidor em Configurações.',true);});

if (document.modelContext?.registerTool) {
  const lifecycle = new AbortController();
  try {
    Promise.resolve(
      document.modelContext.registerTool(
        {
          name: "read_safraflux_summary",
          title: "Ler resumo da operação",
          description:
            "Lê a quantidade de carteiras e o estado das cobranças carregadas do servidor; não consulta a rede nem movimenta fundos.",
          inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
          annotations: { readOnlyHint: true, untrustedContentHint: true },
          execute(input) {
            if (
              !input ||
              typeof input !== "object" ||
              Array.isArray(input) ||
              Object.keys(input).length
            )
              throw new Error("Informe um objeto vazio.");
            return {
              wallets: state.wallets.length,
              invoices: state.invoices.map((i) => ({
                lot: i.lot,
                chain: i.chain,
                ...invoiceStatus(i),
              })),
              storage: "authenticated_server", revision, available:ready,
              transfersExecuted: false,
            };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => {});
  } catch {}
  window.addEventListener("pagehide", () => lifecycle.abort(), { once: true });
}
