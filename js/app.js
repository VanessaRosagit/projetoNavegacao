/* TechFatec – protótipo navegável. Dados fictícios (data/db.json). */
(() => {
'use strict';
const KEY = 'techfatec_demo_v1';
const EXT_OK = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt'];
const ALUNO_MENU = [['Início', '#/aluno', ''], ['Explorar grupos', '#/aluno/grupos', 'grupos'], ['Agenda', '#/aluno/agenda', 'agenda'], ['Materiais', '#/aluno/materiais', 'materiais'], ['Atividades', '#/aluno/atividades', 'atividades'], ['Projetos', '#/aluno/projetos', 'projetos'], ['Videoaulas', '#/aluno/videoaulas', 'videoaulas'], ['Meus agentes', '#/aluno/agentes', 'agentes'], ['Enviar feedback', '#/aluno/feedback', 'feedback']];
const PROF_MENU = [['Dashboard', '#/prof', ''], ['Gerenciar grupos', '#/prof/grupos', 'grupos'], ['Gerenciar atividades', '#/prof/atividades', 'atividades'], ['Materiais', '#/prof/materiais', 'materiais'], ['Gerenciar projetos', '#/prof/projetos', 'projetos'], ['Publicar videoaula', '#/prof/videoaulas', 'videoaulas'], ['Relatórios', '#/prof/relatorios', 'relatorios']];

let DB = null;
const S = { uid: null, sim: false, fs: 0, hc: false, cal: { y: 2026, m: 10 }, chats: {}, read: {}, lock: { n: 0, until: 0 }, msg: null };

/* ---------- utilidades ---------- */
const h = (tag, props, ...kids) => {
  const e = document.createElement(tag);
  for (const k in props || {}) {
    const v = props[k];
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  kids.flat(9).forEach((c) => { if (c == null || c === false) return; e.append(c.nodeType ? c : document.createTextNode(String(c))); });
  return e;
};
const $ = (s, r = document) => r.querySelector(s);
const IC = {
  home: '<path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  grupos: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/>',
  agenda: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  materiais: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
  atividades: '<path d="M6 3h8l4 4v14H6z"/><path d="M9 13h6M9 17h6"/>',
  projetos: '<path d="M4 20V4M4 20h16M8 15l4-4 3 3 5-6"/>',
  videoaulas: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5l5 3.5-5 3.5z"/>',
  agentes: '<path d="M4 5h16v11H9l-5 4z"/>',
  feedback: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h8"/>',
  relatorios: '<path d="M5 20V10M12 20V4M19 20v-7"/>',
  sair: '<path d="M9 4H5v16h4"/><path d="M16 8l4 4-4 4M20 12H9"/>',
  bell: '<path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4zM10 21h4"/>',
  acess: '<circle cx="12" cy="5" r="1.8"/><path d="M5 8.5l7 1.5 7-1.5M12 10v5M9 21l3-6 3 6"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
};
const ico = (name, size = 16, sw = 1.8) => {
  const d = new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" aria-hidden="true">${IC[name]}</svg>`, 'image/svg+xml').documentElement;
  return document.importNode(d, true);
};
const GRAD = ['linear-gradient(120deg,#B20000,#C20000)', 'linear-gradient(120deg,#005C6D,#2BB8C9)', 'linear-gradient(120deg,#404040,#808080)'];
const ABR = (iso) => { const [, m, d] = iso.split('-'); return `${d} ${['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][+m - 1]}`; };
const gcard = (g, href, label, i, mem) => h('article', { class: 'gc' }, h('div', { class: 'gh', style: 'background:' + GRAD[i % 3] }, ico('grupos', 28, 1.6)),
  h('div', { class: 'gb' }, h('span', { class: 'chip' + (mem ? ' ok' : '') }, mem ? 'Você participa' : g.status), h('h3', null, g.nome), h('p', { class: 'm' }, `Prof. ${g.professor} · ${ativos(g)} participantes`), h('a', { class: 'btn sm', href }, label)));
const go = (hash) => { if (location.hash === hash) render(); else location.hash = hash; };
const fmt = (iso) => { const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; };
const hoje = () => DB.meta.hoje;
const me = () => DB.usuarios.find((u) => u.id === S.uid);
const ativos = (g) => g.participantes.filter((p) => p.situacao === 'Ativo').length;
const grupo = (id) => DB.grupos.find((g) => g.id === id);
const membro = (gid) => (DB.membroDe[S.uid] || []).includes(gid);
const entrega = (a) => a.entregas.find((e) => e.aluno === me().nome);
const nextId = (p) => p + Date.now().toString(36);

function save() {
  try { localStorage.setItem(KEY, JSON.stringify({ db: DB, uid: S.uid, fs: S.fs, hc: S.hc })); } catch (e) {}
}
async function load() {
  let base = null;
  try { const r = await fetch('data/db.json', { cache: 'no-store' }); if (r.ok) base = await r.json(); } catch (e) {}
  if (!base) base = JSON.parse(JSON.stringify(window.TF_DB));
  DB = base;
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (s && s.db) { DB = s.db; S.uid = s.uid || null; S.fs = s.fs || 0; S.hc = !!s.hc; }
  } catch (e) {}
  applyA11y();
}
function applyA11y() {
  const c = document.documentElement.classList;
  c.remove('fs1', 'fs2', 'fsm1'); c.toggle('hc', S.hc);
  if (S.fs === 1) c.add('fs1'); if (S.fs === 2) c.add('fs2'); if (S.fs === -1) c.add('fsm1');
}

/* ---------- modal / toast ---------- */
let lastFocus = null;
function modal({ eyebrow, title, body, actions = [], wide }) {
  lastFocus = document.activeElement;
  const ov = $('#overlay');
  const close = () => { ov.replaceChildren(); document.removeEventListener('keydown', esc); if (lastFocus && lastFocus.focus) lastFocus.focus(); };
  const esc = (e) => { if (e.key === 'Escape') close(); };
  const btns = actions.map((a) => h('button', { type: 'button', class: 'btn ' + (a.cls || ''), onclick: () => { if (a.keep) a.onclick(close); else { close(); a.onclick && a.onclick(); } } }, a.label));
  const box = h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'mt', style: wide ? 'width:min(720px,100%)' : null },
    eyebrow && h('p', { class: 'eyebrow' }, eyebrow), h('h2', { id: 'mt' }, title),
    typeof body === 'string' ? h('p', null, body) : body, h('div', { class: 'acts' }, btns));
  const wrap = h('div', { class: 'ov', onclick: (e) => { if (e.target === wrap) close(); } }, box);
  ov.replaceChildren(wrap);
  document.addEventListener('keydown', esc);
  (btns[btns.length - 1] || box).focus();
  return close;
}
function toast(msg, err) {
  const t = h('div', { class: 'toast' + (err ? ' err' : ''), role: 'status' }, msg);
  $('#toasts').append(t); setTimeout(() => t.remove(), 5200);
}

/* ---------- formulários ---------- */
function formView({ fields, submit, onSubmit, alertBox }) {
  const form = h('form', { class: 'f', novalidate: true });
  const alert = h('div', { role: 'alert' });
  const refs = {};
  fields.forEach((f) => {
    const id = 'f_' + f.name;
    let el;
    if (f.type === 'select') el = h('select', { id, name: f.name }, f.options.map((o) => h('option', { value: o, selected: o === f.value }, o)));
    else if (f.type === 'textarea') el = h('textarea', { id, name: f.name, placeholder: f.ph }, f.value || '');
    else if (f.type === 'file') el = h('input', { id, name: f.name, type: 'file', accept: f.accept });
    else el = h('input', { id, name: f.name, type: f.type || 'text', value: f.value || '', placeholder: f.ph, autocomplete: f.ac || 'off' });
    const err = h('div', { class: 'ferr', id: id + '_e' });
    el.setAttribute('aria-describedby', id + '_e');
    refs[f.name] = { el, err, f };
    form.append(h('div', null, h('label', { for: id }, f.label + (f.req ? ' *' : '')), el, f.hint && h('small', { class: 'm' }, f.hint), err));
  });
  const setErr = (name, msg) => { const r = refs[name]; r.el.classList.toggle('bad', !!msg); r.err.textContent = msg || ''; if (msg) r.el.setAttribute('aria-invalid', 'true'); else r.el.removeAttribute('aria-invalid'); };
  const msg = (kind, text) => alert.replaceChildren(text ? h('div', { class: 'alert ' + kind }, text) : '');
  form.append(h('div', { class: 'row' }, h('button', { class: 'btn pri', type: 'submit' }, submit)));
  form.prepend(alert);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const vals = {}; let n = 0, first = null;
    fields.forEach((f) => {
      const el = refs[f.name].el;
      const v = f.type === 'file' ? (el.files[0] ? el.files[0].name : '') : el.value.trim();
      vals[f.name] = v;
      let m = '';
      if (f.req && !v) m = 'Campo obrigatório.';
      else if (v && f.check) m = f.check(v) || '';
      setErr(f.name, m);
      if (m) { n++; if (!first) first = el; }
    });
    if (n) { msg('err', `Revise ${n} campo${n > 1 ? 's' : ''}: os dados digitados foram mantidos.`); first.focus(); return; }
    msg('', '');
    onSubmit(vals, msg, setErr);
  });
  return form;
}
const emailOk = (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Informe um e-mail válido.');
const extOk = (name) => EXT_OK.includes(name.split('.').pop().toLowerCase());

/* ---------- rodapé e janelas informativas ---------- */
function footer() {
  const info = (t, body) => () => modal({ eyebrow: 'TechFatec', title: t, body, actions: [{ label: 'Fechar', cls: 'pri', onclick() {} }] });
  const sobre = info('Sobre o TechFatec', h('p', null, 'Plataforma acadêmica para gestão de grupos de estudo, atividades, projetos e videoaulas na Fatec São Roque. Este protótipo é demonstrativo e usa dados fictícios.'));
  const ajuda = info('Central de ajuda', h('div', null, DB.faq.map((f) => h('div', null, h('h3', null, f.p), h('p', null, f.r)))));
  const acess = info('Recursos de acessibilidade', h('ul', null, h('li', null, 'Botão A: aumentar e reduzir fonte, alto contraste e restaurar.'), h('li', null, 'Atalho para pular ao conteúdo principal.'), h('li', null, 'Navegação por teclado com foco visível.'), h('li', null, 'Transcrição nas videoaulas.')));
  const fatec = info('Fatec São Roque', h('p', null, 'Faculdade de Tecnologia de São Roque – Centro Paula Souza. Contato do projeto: techfatec@fatec.sp.gov.br'));
  const lk = (t, fn) => h('button', { class: 'lk', type: 'button', onclick: fn }, t);
  return h('footer', null, h('div', { class: 'in' },
    h('div', null, h('div', { class: 'row' }, h('img', { src: 'assets/logo-fatec.png', alt: 'Fatec São Roque' }), h('img', { src: 'assets/logo-cps.png', alt: 'Centro Paula Souza' })), h('p', null, h('small', null, 'Fatec São Roque · Centro Paula Souza'), h('br'), h('small', null, '© 2026 TechFatec · Demonstração acadêmica.'))),
    h('div', null, h('h3', null, 'Plataforma'), lk('Sobre o TechFatec', sobre), lk('Grupos de estudo', () => { const r = me(); go(r ? (r.perfil === 'aluno' ? '#/aluno/grupos' : '#/prof/grupos') : '#/login'); })),
    h('div', null, h('h3', null, 'Suporte'), lk('Central de ajuda', ajuda), lk('Acessibilidade', acess)),
    h('div', null, h('h3', null, 'Contato'), lk('Fatec São Roque', fatec), h('small', null, 'techfatec@fatec.sp.gov.br'))));
}

/* ---------- barra de demonstração, a11y e assistente ---------- */
function demoBar() {
  return h('div', { class: 'demo' }, h('span', { class: 'full' }, '⚑ Protótipo demonstrativo · dados fictícios'),
    h('label', null, h('input', { type: 'checkbox', checked: S.sim, onchange: (e) => { S.sim = e.target.checked; toast(S.sim ? 'Falhas simuladas ativadas (entrega, vídeo e publicação).' : 'Falhas simuladas desativadas.'); } }), 'Simular falha'),
    h('button', { class: 'btn sm', type: 'button', onclick: () => { try { localStorage.removeItem(KEY); } catch (e) {} location.hash = '#/login'; location.reload(); } }, 'Restaurar dados de demonstração'));
}
let panelOpen = null;
function floaters() {
  const wrap = h('div', { class: 'fl' });
  const holder = h('div');
  const close = () => { holder.replaceChildren(); panelOpen = null; };
  const a11y = () => {
    if (panelOpen === 'a') return close(); close(); panelOpen = 'a';
    const b = (t, fn, l) => h('button', { type: 'button', class: 'btn sm', 'aria-label': l || t, onclick: fn, style: 'width:auto;border-radius:6px' }, t);
    holder.append(h('div', { class: 'pan', role: 'dialog', 'aria-label': 'Painel de acessibilidade' }, h('h3', null, 'Acessibilidade'),
      h('div', { class: 'row' }, b('A−', () => { S.fs = Math.max(-1, S.fs - 1); applyA11y(); save(); }, 'Diminuir fonte'), b('A+', () => { S.fs = Math.min(2, S.fs + 1); applyA11y(); save(); }, 'Aumentar fonte'), b(S.hc ? 'Contraste normal' : 'Alto contraste', () => { S.hc = !S.hc; applyA11y(); save(); close(); a11y(); })),
      h('p', null, h('button', { class: 'btn sm', type: 'button', onclick: () => { S.fs = 0; S.hc = false; applyA11y(); save(); close(); } }, 'Restaurar padrão'))));
  };
  const assist = () => {
    if (panelOpen === 's') return close(); close(); panelOpen = 's';
    const perfil = me() ? me().perfil : null;
    const log = h('div', { class: 'chat', style: 'min-height:120px;max-height:240px' }, h('div', { class: 'msg b' }, perfil === 'aluno' ? 'Olá! Posso orientar sobre grupos, atividades, materiais e videoaulas.' : perfil === 'professor' ? 'Olá! Posso orientar sobre gerenciar grupos, atividades, materiais e videoaulas.' : 'Olá! Posso orientar sobre o acesso ao TechFatec.'));
    const say = (q) => {
      log.append(h('div', { class: 'msg u' }, q));
      const t = q.toLowerCase();
      const R = [[/atividade|entreg|nota|avali/, perfil === 'professor' ? 'Em Gerenciar atividades você cria, edita e avalia entregas.' : 'Em Atividades, abra a atividade, anexe o arquivo e envie.'], [/sair|deixar/, 'Para sair de um grupo, abra o grupo e use Sair do grupo. Para sair da conta, use o item no fim do menu lateral. Ambos pedem confirmação.'], [/grupo/, perfil === 'professor' ? 'Em Gerenciar grupos você cria, edita e gerencia participantes.' : 'Em Explorar grupos você vê os grupos e participa.'], [/fonte|contraste|texto|acess/, 'Use o botão A, no canto da tela, para ajustar a fonte e o contraste.'], [/início|inicio|volta|home/, 'Clique no logotipo TechFatec no menu lateral ou use o caminho de navegação no topo.'], [/v[ií]deo|aula/, perfil === 'professor' ? 'Em Publicar videoaula você publica, edita e exclui aulas.' : 'Em Videoaulas, abra a aula para assistir e ler a transcrição.'], [/material/, 'Materiais reúne os arquivos de apoio publicados pelos professores.'], [/senha|login|entrar/, 'Na tela de login, use Esqueci minha senha para recuperar o acesso.']];
      const hit = R.find((r) => r[0].test(t));
      log.append(h('div', { class: 'msg b' }, hit ? hit[1] : 'Não encontrei uma resposta adequada. Tente os itens do menu lateral ou a Central de ajuda, no rodapé.'));
      log.scrollTop = log.scrollHeight;
    };
    const input = h('input', { type: 'text', 'aria-label': 'Digite sua dúvida', placeholder: 'Digite sua dúvida' });
    const form = h('form', { class: 'row', style: 'flex-wrap:nowrap;margin-top:8px', onsubmit: (e) => { e.preventDefault(); if (input.value.trim()) { say(input.value.trim()); input.value = ''; } } }, input, h('button', { class: 'btn pri sm', type: 'submit' }, 'Enviar'));
    const quick = (perfil === 'professor' ? ['Como publico uma videoaula?', 'Como avalio entregas?'] : perfil === 'aluno' ? ['Como entrego uma atividade?', 'Como saio de um grupo?'] : ['Esqueci minha senha']).map((q) => h('button', { type: 'button', class: 'btn sm', onclick: () => say(q) }, q));
    holder.append(h('div', { class: 'pan big', role: 'dialog', 'aria-label': 'Assistente' }, h('h3', null, 'Assistente'), log, h('div', { class: 'row', style: 'margin-top:8px' }, quick), form));
    input.focus();
  };
  wrap.append(h('button', { type: 'button', 'aria-label': 'Abrir painel de acessibilidade', onclick: a11y }, ico('acess', 20)), h('button', { type: 'button', 'aria-label': 'Abrir assistente', onclick: assist }, ico('chat', 20)));
  return [wrap, holder];
}

/* ---------- casca autenticada ---------- */
function crumbNav(items) {
  if (!items || !items.length) return null;
  return h('nav', { class: 'crumb', 'aria-label': 'Caminho de navegação' }, h('ol', null, items.map((c, i) => h('li', null, i === items.length - 1 ? h('span', { 'aria-current': 'page' }, c[0]) : h('a', { href: c[1] }, c[0])))));
}
function confirmExit() {
  modal({ title: 'Sair da conta?', body: 'Tem certeza de que deseja sair do TechFatec? Você será desconectado e retornará à tela de login.', actions: [{ label: 'Cancelar', onclick() {} }, { label: 'Sim, sair da conta', cls: 'pri', onclick() { S.uid = null; save(); go('#/login'); toast('Você saiu da conta.'); } }] });
}
function searchBox(perfil) {
  const input = h('input', { type: 'search', placeholder: 'Pesquisar...', 'aria-label': 'Pesquisar na plataforma' });
  const drop = h('div', { class: 'drop', hidden: true });
  const base = perfil === 'aluno' ? '#/aluno' : '#/prof';
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    drop.replaceChildren();
    if (!q) { drop.hidden = true; return; }
    const hits = [];
    DB.grupos.forEach((g) => { if ((g.nome + g.disciplina).toLowerCase().includes(q)) hits.push([`Grupo · ${g.nome}`, `${base}/grupos/${g.id}`]); });
    DB.atividades.forEach((a) => { if (a.titulo.toLowerCase().includes(q)) hits.push([`Atividade · ${a.titulo}`, `${base}/atividades/${a.id}`]); });
    DB.materiais.forEach((m) => { if (m.titulo.toLowerCase().includes(q)) hits.push([`Material · ${m.titulo}`, perfil === 'aluno' ? `#/aluno/materiais/${m.id}` : `#/prof/materiais/${m.id}/editar`]); });
    DB.videoaulas.forEach((v) => { if (v.titulo.toLowerCase().includes(q)) hits.push([`Videoaula · ${v.titulo}`, perfil === 'aluno' ? `#/aluno/videoaulas/${v.id}` : '#/prof/videoaulas']); });
    drop.hidden = false;
    if (!hits.length) drop.append(h('div', null, 'Nenhum resultado.'));
    hits.slice(0, 8).forEach((x) => drop.append(h('a', { href: x[1], onclick: () => { drop.hidden = true; input.value = ''; } }, x[0])));
  });
  return h('div', { class: 'search' }, input, drop);
}
function bell(perfil) {
  const list = DB.notificacoes[perfil] || [];
  const unread = list.filter((n) => !S.read[n.id]).length;
  const box = h('div', { class: 'drop notif', hidden: true });
  const btn = h('button', { class: 'btn ic bell', type: 'button', 'aria-label': `Notificações (${unread} novas)`, 'aria-expanded': 'false', onclick: () => {
    box.hidden = !box.hidden; btn.setAttribute('aria-expanded', String(!box.hidden));
  } }, ico('bell'), unread ? h('span', { class: 'n' }, unread) : null);
  list.forEach((n) => box.append(h('a', { href: n.rota, onclick: () => { S.read[n.id] = 1; } }, n.texto)));
  if (!list.length) box.append(h('div', null, 'Sem notificações.'));
  return h('div', { style: 'position:relative' }, btn, box);
}
function shell(menuKey, crumbs, content, backHref) {
  const u = me(); const aluno = u.perfil === 'aluno';
  const menu = aluno ? ALUNO_MENU : PROF_MENU;
  const home = aluno ? '#/aluno' : '#/prof';
  const sb = h('aside', { class: 'sb', id: 'sb', 'aria-label': 'Menu lateral' },
    h('a', { class: 'lg', href: home, 'aria-label': 'TechFatec — ir para o início', title: 'Ir para o início' }, h('span', { class: 'lgs' }, h('img', { src: 'assets/logo-fatec.png', alt: '' }), h('img', { src: 'assets/logo-cps.png', alt: '' })), h('b', null, 'TechFatec')),
    h('div', { class: 'area' }, aluno ? 'Área do aluno' : 'Área do professor'),
    h('nav', { 'aria-label': 'Menu principal' }, menu.map((m) => h('a', { class: 'ni' + (m[2] === menuKey ? ' on' : ''), href: m[1], 'aria-current': m[2] === menuKey ? 'page' : null, onclick: () => sb.classList.remove('open') }, ico(m[2] === '' ? 'home' : m[2]), m[0]))),
    h('div', { class: 'grow' }),
    h('button', { class: 'ni exit', type: 'button', onclick: confirmExit }, ico('sair'), 'Sair da conta'),
    h('div', { class: 'usr' }, h('div', { class: 'av' }, u.nome.split(' ').map((w) => w[0]).slice(0, 2).join('')), h('div', null, h('b', null, u.nome), h('small', null, aluno ? `Aluno · ${u.curso.split(' ').filter((w) => w[0] === w[0].toUpperCase()).map((w) => w[0]).join('')}` : 'Professor'))));
  const top = h('header', { class: 'top' }, h('button', { class: 'btn sm menu', type: 'button', 'aria-label': 'Abrir menu', 'aria-controls': 'sb', onclick: () => sb.classList.toggle('open') }, '☰'), searchBox(u.perfil), bell(u.perfil));
  const main = h('main', { id: 'main', tabindex: '-1' }, crumbNav(crumbs), backHref && h('button', { class: 'back', type: 'button', onclick: () => go(backHref[0]) }, '← ' + backHref[1]), content);
  return [demoBar(), h('div', { class: 'app' }, sb, h('div', { class: 'col' }, top, main)), footer(), ...floaters()];
}
function authShell(content) {
  return [demoBar(), h('div', { class: 'auth' }, h('div', { class: 'box' }, h('div', { class: 'logos' }, h('span', { class: 'lgs' }, h('img', { src: 'assets/logo-fatec.png', alt: 'Fatec São Roque' }), h('img', { src: 'assets/logo-cps.png', alt: 'Centro Paula Souza' })), h('b', null, 'TechFatec')), h('main', { id: 'main', tabindex: '-1' }, content))), footer(), ...floaters()];
}

/* ---------- acesso ---------- */
function vLogin() {
  const u = me(); if (u) return go(u.perfil === 'aluno' ? '#/aluno' : '#/prof');
  let tick = null;
  const lembrado = (() => { try { return localStorage.getItem('techfatec_email') || ''; } catch (e) { return ''; } })();
  const email = h('input', { id: 'em', type: 'email', value: lembrado, autocomplete: 'username' });
  const pass = h('input', { id: 'pw', type: 'password', autocomplete: 'current-password' });
  const rem = h('input', { id: 'rm', type: 'checkbox', style: 'width:auto', checked: !!lembrado });
  const alertBox = h('div', { role: 'alert' });
  const btn = h('button', { class: 'btn pri', type: 'submit', style: 'width:100%' }, 'Entrar →');
  const showErr = (t) => alertBox.replaceChildren(h('div', { class: 'alert err' }, t));
  const lockUI = () => {
    const left = Math.ceil((S.lock.until - Date.now()) / 1000);
    if (left > 0) { btn.disabled = true; btn.textContent = `Aguarde... ${left}s`; if (!tick) tick = setInterval(lockUI, 500); }
    else { btn.disabled = false; btn.textContent = 'Entrar →'; clearInterval(tick); tick = null; }
  };
  const form = h('form', { class: 'f', novalidate: true, style: 'max-width:none', onsubmit: (e) => {
    e.preventDefault();
    if (Date.now() < S.lock.until) return;
    const user = DB.usuarios.find((x) => x.email.toLowerCase() === email.value.trim().toLowerCase() && x.senha === pass.value);
    if (!user) {
      S.lock.n++;
      email.classList.add('bad'); pass.classList.add('bad');
      if (S.lock.n >= 3) { S.lock = { n: 0, until: Date.now() + 30000 }; showErr('Três tentativas inválidas. O acesso foi bloqueado por 30 segundos.'); lockUI(); }
      else showErr(`E-mail ou senha inválidos. Verifique os dados e tente novamente (tentativa ${S.lock.n} de 3).`);
      pass.focus(); return;
    }
    S.lock = { n: 0, until: 0 }; S.uid = user.id;
    try { if (rem.checked) localStorage.setItem('techfatec_email', user.email); else localStorage.removeItem('techfatec_email'); } catch (er) {}
    save(); go(user.perfil === 'aluno' ? '#/aluno' : '#/prof');
  } },
    alertBox,
    h('div', null, h('label', { for: 'em' }, 'E-mail institucional'), email),
    h('div', null, h('label', { for: 'pw' }, 'Senha'), pass),
    h('label', { style: 'display:flex;gap:8px;align-items:center;font-weight:400' }, rem, 'Lembrar de mim'), btn);
  const fill = (e, p) => () => { email.value = e; pass.value = p; pass.focus(); };
  const view = authShell([
    h('p', { class: 'eyebrow dk' }, 'Sua jornada acadêmica'), h('h1', null, 'Acesse sua conta'), h('p', { class: 'sub' }, 'Entre com seu e-mail institucional e senha.'), form,
    h('p', null, h('a', { href: '#/recuperar' }, 'Esqueci minha senha')),
    h('p', null, 'Ainda não tem conta? ', h('a', { href: '#/cadastro/aluno' }, 'Cadastro de aluno'), ' · ', h('a', { href: '#/cadastro/professor' }, 'Cadastro de professor')),
    h('div', { class: 'hint' }, h('b', null, 'Dados fictícios para a demonstração'), h('br'), 'Aluno: thiago.santos@fatec.sp.gov.br · Professor: camila.souza@fatec.sp.gov.br · senha demo123.', h('br'), h('div', { class: 'row' }, h('button', { class: 'btn sm', type: 'button', onclick: fill('thiago.santos@fatec.sp.gov.br', 'demo123') }, 'Preencher como aluno'), h('button', { class: 'btn sm', type: 'button', onclick: fill('camila.souza@fatec.sp.gov.br', 'demo123') }, 'Preencher como professor')), h('small', null, 'Em implantação futura, o acesso usará o e-mail e a senha já vinculados à conta da Fatec.'))]);
  setTimeout(lockUI, 0);
  return view;
}
function vCadastro(tipo) {
  const aluno = tipo === 'aluno';
  const fields = [{ name: 'nome', label: 'Nome completo', req: true, ac: 'name' }, { name: 'email', label: 'E-mail institucional', type: 'email', req: true, check: emailOk, ac: 'email' }, aluno ? { name: 'ra', label: 'RA', req: true, check: (v) => (/^\d{6,13}$/.test(v) ? '' : 'Informe de 6 a 13 números.') } : { name: 'mat', label: 'Matrícula', req: true }, aluno ? { name: 'curso', label: 'Curso', type: 'select', options: ['Sistemas para Internet', 'Análise e Desenvolvimento de Sistemas', 'Gestão Empresarial'], req: true } : null, { name: 'senha', label: 'Senha', type: 'password', req: true, check: (v) => (v.length >= 6 ? '' : 'Use ao menos 6 caracteres.'), ac: 'new-password' }].filter(Boolean);
  return authShell([h('h1', null, aluno ? 'Cadastro de aluno' : 'Cadastro de professor'), h('p', { class: 'sub' }, 'No protótipo, a senha é própria da plataforma. Em implantação futura, será a conta Fatec.'),
    formView({ fields, submit: 'Concluir cadastro', onSubmit(v, msg, setErr) {
      if (DB.usuarios.some((u) => u.email.toLowerCase() === v.email.toLowerCase())) { setErr('email', 'Este e-mail já está cadastrado.'); msg('err', 'Revise 1 campo: os dados digitados foram mantidos.'); return; }
      const u = { id: nextId('u'), perfil: aluno ? 'aluno' : 'professor', nome: v.nome, email: v.email, senha: v.senha, ...(aluno ? { ra: v.ra, curso: v.curso } : { matricula: v.mat }) };
      DB.usuarios.push(u); if (aluno) DB.membroDe[u.id] = []; S.uid = u.id; save(); go(aluno ? '#/aluno' : '#/prof'); toast('Cadastro concluído. Bem-vindo(a) ao TechFatec!');
    } }), h('p', null, h('a', { href: '#/login' }, '← Voltar ao login'))]);
}
function vRecuperar() {
  return authShell([h('h1', null, 'Recuperar senha'), h('p', { class: 'sub' }, 'Informe o e-mail institucional para receber as instruções.'),
    formView({ fields: [{ name: 'email', label: 'E-mail institucional', type: 'email', req: true, check: emailOk }], submit: 'Enviar instruções', onSubmit(v, msg) {
      if (!DB.usuarios.some((u) => u.email.toLowerCase() === v.email.toLowerCase())) { msg('err', h('span', null, 'E-mail não encontrado. Confira o endereço ou ', h('a', { href: '#/cadastro/aluno' }, 'crie uma conta'), '.')); return; }
      go('#/verifique');
    } }), h('p', null, h('a', { href: '#/login' }, '← Voltar ao login'))]);
}
const vVerifique = () => authShell([h('h1', null, 'Verifique seu e-mail'), h('p', { class: 'sub' }, 'Enviamos as instruções de recuperação. No protótipo, nenhuma mensagem real é enviada.'), h('a', { class: 'btn pri', href: '#/login' }, 'Voltar ao login')]);

/* ---------- aluno ---------- */
const A = '#/aluno';
function vAlunoInicio() {
  const u = me(); const gs = DB.membroDe[u.id] || [];
  const pend = DB.atividades.filter((a) => !entrega(a));
  const prox = proximos().slice(0, 4);
  return shell('', null, [
    h('p', { class: 'eyebrow' }, 'Área do aluno'), h('h1', null, `Olá, ${u.nome.split(' ')[0]}.`), h('p', { class: 'sub' }, 'Organize seus estudos e acompanhe suas atividades.'),
    h('div', { class: 'hero' }, h('div', null, h('div', { class: 'ey' }, 'TechFatec'), h('h2', null, 'Continue avançando nos seus estudos.'), h('p', null, `Você tem ${pend.length} atividade${pend.length === 1 ? '' : 's'} pendente${pend.length === 1 ? '' : 's'} e ${prox.length} compromisso${prox.length === 1 ? '' : 's'}.`)), h('a', { class: 'btn', href: A + '/atividades' }, 'Ver agora →')),
    h('div', { class: 'stats' }, [['Meus grupos', gs.length, 'neste semestre', A + '/grupos'], ['Compromissos', prox.length, 'próximos eventos', A + '/agenda'], ['Atividades pendentes', pend.length, 'aguardando entrega', A + '/atividades'], ['Projetos', DB.projetos.filter((p) => gs.includes((DB.grupos.find((g) => g.nome === p.grupo) || {}).id)).length, 'em andamento', A + '/projetos']].map((s) => h('a', { class: 'card stat', href: s[3] }, h('span', null, s[0]), h('b', null, s[1]), h('small', null, s[2])))),
    h('div', { class: 'two' },
      h('div', { class: 'card' }, h('h2', null, 'Atividades recentes'), h('ul', { class: 'list' }, DB.atividades.slice(0, 3).map((a) => h('li', null, h('div', null, h('div', { class: 't' }, a.titulo), h('div', { class: 'm' }, `${a.disciplina} · prazo ${fmt(a.prazo)}`)), h('a', { class: 'btn sm', href: `${A}/atividades/${a.id}` }, entrega(a) ? 'Ver' : 'Acessar'))))),
      h('div', { class: 'card' }, h('h2', null, 'Próximos compromissos'), h('ul', { class: 'list' }, prox.map((e) => h('li', null, h('div', null, h('div', { class: 't' }, e.titulo), h('div', { class: 'm' }, `${fmt(e.data)} · ${e.hora}`)))), !prox.length && h('li', null, 'Nenhum compromisso.'))))]);
}
function proximos() {
  const ev = DB.eventos.map((e) => ({ data: e.data, hora: e.hora, titulo: e.titulo }));
  DB.atividades.forEach((a) => ev.push({ data: a.prazo, hora: a.hora.replace(':', 'h'), titulo: 'Prazo: ' + a.titulo }));
  return ev.filter((e) => e.data >= hoje()).sort((a, b) => a.data.localeCompare(b.data));
}
function vGrupos() {
  return shell('grupos', [['Início', A], ['Explorar grupos']], [h('p', { class: 'eyebrow' }, 'Colaboração'), h('h1', null, 'Explorar grupos'), h('p', { class: 'sub' }, 'Encontre espaços para estudar e colaborar.'),
    h('div', { class: 'grid g3' }, DB.grupos.map((g, i) => gcard(g, `${A}/grupos/${g.id}`, 'Ver grupo', i, membro(g.id))))]);
}
function vGrupo(id) {
  const g = grupo(id); if (!g) return vNotFound();
  const mem = membro(id);
  const sair = () => modal({ title: 'Sair do grupo?', eyebrow: g.nome, body: 'Tem certeza de que deseja sair deste grupo de estudos? Após confirmar, você deixará de participar das atividades, projetos e comunicações vinculadas a este grupo.', actions: [{ label: 'Cancelar', onclick() {} }, { label: 'Sim, sair do grupo', cls: 'pri', onclick() {
    DB.membroDe[S.uid] = (DB.membroDe[S.uid] || []).filter((x) => x !== id);
    g.participantes = g.participantes.filter((p) => p.nome !== me().nome); save(); go(A + '/grupos'); toast('Você saiu do grupo de estudos com sucesso.');
  } }] });
  const participar = () => { (DB.membroDe[S.uid] = DB.membroDe[S.uid] || []).push(id); g.participantes.push({ nome: me().nome, curso: 'SI', situacao: 'Ativo' }); save(); render(); toast('Você agora participa deste grupo.'); };
  return shell('grupos', [['Início', A], ['Explorar grupos', A + '/grupos'], ['Detalhes do grupo']], [
    h('div', { class: 'hero' }, h('div', null, h('span', { class: 'chip w' }, g.status), h('h1', null, g.nome), h('p', null, `Prof. ${g.professor} · ${ativos(g)} participantes`)), mem ? h('button', { class: 'btn', type: 'button', onclick: sair }, 'Sair do grupo') : h('button', { class: 'btn', type: 'button', onclick: participar }, 'Participar do grupo')),
    h('div', { class: 'alert info' }, mem ? 'Você já participa deste grupo e receberá as próximas atualizações.' : 'Você ainda não participa deste grupo.'),
    h('div', { class: 'card' }, h('h3', null, 'Sobre o grupo'), h('p', { class: 'm2' }, g.descricao)),
    h('div', { class: 'stats' }, [['Professor responsável', g.professor], ['Participantes', ativos(g)], ['Encontro', g.encontro], ['Local', g.local]].map((s) => h('div', { class: 'card' }, h('small', { class: 'm' }, s[0]), h('div', { class: 't', style: 'font-weight:700' }, s[1])))),
    h('h3', null, 'Conteúdos abordados'), h('p', { class: 'row' }, g.topicos.map((t) => h('span', { class: 'tag' }, t))),
    h('div', { class: 'two' }, h('div', { class: 'card' }, h('h3', null, 'Participantes'), h('ul', { class: 'list' }, g.participantes.map((p) => h('li', null, h('div', { class: 'row' }, h('span', { class: 'av2' }, p.nome.split(' ').map((w) => w[0]).slice(0, 2).join('')), h('span', null, p.nome)), h('span', { class: 'm' }, p.situacao))))),
      h('div', { class: 'card' }, h('h3', null, 'Materiais do grupo'), h('ul', { class: 'list' }, g.materiais.map((mid) => { const m = DB.materiais.find((x) => x.id === mid); return m && h('li', null, h('span', null, m.titulo), h('a', { class: 'btn sm', href: `${A}/materiais/${m.id}` }, 'Abrir')); }), !g.materiais.length && h('li', null, 'Nenhum material.')))),
    h('div', { class: 'row', style: 'margin-top:16px' }, h('a', { class: 'btn', href: A + '/grupos' }, 'Voltar'))],
  [A + '/grupos', 'Explorar grupos']);
}
function vAgenda() {
  const { y, m } = S.cal; const nomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const evs = proximos(); const all = DB.eventos.map((e) => ({ data: e.data, t: e.titulo })).concat(DB.atividades.map((a) => ({ data: a.prazo, t: 'Prazo: ' + a.titulo })));
  const first = new Date(y, m, 1).getDay(); const days = new Date(y, m + 1, 0).getDate();
  const rows = []; let d = 1 - first;
  for (let r = 0; r < 6; r++) { const tr = []; for (let c = 0; c < 7; c++, d++) {
    const dt = new Date(y, m, d); const iso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    tr.push(h('td', { class: (d < 1 || d > days ? 'out ' : '') + (iso === hoje() ? 'today' : '') }, dt.getDate(), all.filter((e) => e.data === iso).map((e) => h('span', { class: 'dot', title: e.t }, e.t)))); }
    rows.push(h('tr', null, tr)); if (d > days) break; }
  const step = (n) => () => { const dt = new Date(y, m + n, 1); S.cal = { y: dt.getFullYear(), m: dt.getMonth() }; render(); };
  return shell('agenda', [['Início', A], ['Agenda']], [h('p', { class: 'eyebrow' }, 'Organização'), h('h1', null, 'Agenda acadêmica'),
    h('div', { class: 'two', style: 'grid-template-columns:2fr 1fr' }, h('div', { class: 'card' }, h('div', { class: 'row between' }, h('button', { class: 'btn sm', type: 'button', 'aria-label': 'Mês anterior', onclick: step(-1) }, '‹'), h('h2', { 'aria-live': 'polite' }, `${nomes[m]} de ${y}`), h('button', { class: 'btn sm', type: 'button', 'aria-label': 'Próximo mês', onclick: step(1) }, '›')),
      h('table', { class: 'cal' }, h('thead', null, h('tr', null, ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((x) => h('th', null, x)))), h('tbody', null, rows))),
      h('div', { class: 'card' }, h('h2', null, 'Próximos compromissos'), h('ul', { class: 'list' }, evs.map((e) => h('li', null, h('div', null, h('div', { class: 't' }, e.titulo), h('div', { class: 'm' }, `${fmt(e.data)} · ${e.hora}`)))))))]);
}
function vMateriais() {
  const sel = h('select', { 'aria-label': 'Filtrar por disciplina', onchange: () => draw() }, h('option', { value: '' }, 'Todas as disciplinas'), DB.disciplinas.map((d) => h('option', { value: d }, d)));
  const box = h('div', { class: 'grid' });
  const draw = () => { box.replaceChildren(...DB.materiais.filter((m) => !sel.value || m.disciplina === sel.value).map((m) => h('article', { class: 'card' }, h('span', { class: 'tag' }, m.tipo), h('h3', null, m.titulo), h('p', { class: 'm' }, `${m.disciplina} · ${fmt(m.data)}`), h('a', { class: 'btn sm', href: `${A}/materiais/${m.id}` }, 'Abrir')))); if (!box.children.length) box.append(h('p', null, 'Nenhum material encontrado.')); };
  draw();
  return shell('materiais', [['Início', A], ['Materiais']], [h('p', { class: 'eyebrow' }, 'Conteúdo acadêmico'), h('h1', null, 'Materiais'), h('div', { style: 'max-width:320px;margin-bottom:16px' }, sel), box]);
}
function vMaterial(id) {
  const m = DB.materiais.find((x) => x.id === id); if (!m) return vNotFound();
  return shell('materiais', [['Início', A], ['Materiais', A + '/materiais'], ['Visualizar material']], [h('p', { class: 'eyebrow' }, `${m.tipo} · ${m.disciplina}`), h('h1', null, m.titulo), h('p', { class: 'sub' }, m.descricao),
    h('div', { class: 'viewer', role: 'img', 'aria-label': 'Visualização demonstrativa do material' }, h('h3', null, m.titulo), [1, 2, 3, 4, 5, 6, 7].map((i) => h('div', { class: 'ln', style: `width:${100 - ((i * 13) % 35)}%` })), h('small', { class: 'm' }, 'Visualização demonstrativa: o conteúdo real do arquivo não é carregado no protótipo.')),
    h('div', { class: 'row', style: 'margin-top:12px' }, h('button', { class: 'btn pri', type: 'button', onclick: () => toast('Download demonstrativo: nenhum arquivo real é gerado.') }, 'Baixar material'))], [A + '/materiais', 'Materiais']);
}
function vAtividades() {
  return shell('atividades', [['Início', A], ['Atividades']], [h('p', { class: 'eyebrow' }, 'Conteúdo acadêmico'), h('h1', null, 'Atividades'), h('p', { class: 'sub' }, 'Consulte os recursos disponíveis e seu contexto.'),
    h('div', { class: 'card' }, h('ul', { class: 'list' }, DB.atividades.map((a) => h('li', null, h('div', { class: 'row', style: 'flex:1;flex-wrap:nowrap' }, h('span', { class: 'ic' }, ico('materiais')), h('div', null, h('div', { class: 't' }, a.titulo), h('div', { class: 'm' }, a.disciplina))), h('div', { class: 'row' }, h('span', { class: 'm' }, 'Entrega ' + ABR(a.prazo)), h('span', { class: 'chip ' + (entrega(a) ? 'ok' : 'wn') }, entrega(a) ? 'Entregue' : 'Pendente'), h('a', { class: 'btn sm', href: `${A}/atividades/${a.id}` }, 'Acessar'))))))]);
}
function vAtividade(id) {
  const a = DB.atividades.find((x) => x.id === id); if (!a) return vNotFound();
  const ent = entrega(a);
  return shell('atividades', [['Início', A], ['Atividades', A + '/atividades'], ['Entrega de atividade']], [h('p', { class: 'eyebrow' }, a.disciplina), h('h1', null, a.titulo, ' ', h('span', { class: 'tag ' + (ent ? 'ok' : 'warn') }, ent ? 'Entregue' : 'Pendente')), h('p', { class: 'sub' }, `Entrega até ${fmt(a.prazo)} · ${a.hora} · ${a.pontos} pontos`),
    h('div', { class: 'two' }, h('div', { class: 'card' }, h('h2', null, 'Instruções'), h('p', null, a.instrucoes)),
      h('div', { class: 'card' }, h('h2', null, 'Sua entrega'), ent && h('div', { class: 'alert ok' }, `Entrega registrada: ${ent.arquivo}.`, ent.nota != null ? ` Nota: ${ent.nota}.` : ''),
        formView({ fields: [{ name: 'arq', label: 'Arquivo da entrega', type: 'file', req: true, accept: '.pdf,.doc,.docx,.ppt,.pptx,.txt', hint: 'PDF, DOC, DOCX, PPT, PPTX ou TXT.', check: (v) => (extOk(v) ? '' : 'Formato não aceito. Use PDF, DOC, DOCX, PPT, PPTX ou TXT.') }, { name: 'com', label: 'Comentário (opcional)', type: 'textarea', ph: 'Escreva um recado para o professor.' }], submit: ent ? 'Reenviar atividade' : 'Enviar atividade',
          onSubmit(v, msg) {
            if (S.sim) { msg('err', 'Não foi possível enviar a entrega agora. O anexo e o comentário foram mantidos; tente novamente.'); return; }
            a.entregas = a.entregas.filter((e) => e.aluno !== me().nome); a.entregas.push({ aluno: me().nome, arquivo: v.arq, comentario: v.com, nota: null, retorno: '' }); save(); render(); toast('Entrega enviada com sucesso.');
          } })))], [A + '/atividades', 'Atividades']);
}
function vProjetos() {
  return shell('projetos', [['Início', A], ['Projetos']], [h('p', { class: 'eyebrow' }, 'Acompanhamento'), h('h1', null, 'Projetos'), h('div', { class: 'grid' }, DB.projetos.map((p) => h('article', { class: 'card' }, h('h3', null, p.nome), h('p', { class: 'm' }, p.grupo), h('div', { class: 'prog', role: 'progressbar', 'aria-valuenow': p.progresso, 'aria-valuemin': 0, 'aria-valuemax': 100 }, h('i', { style: `width:${p.progresso}%` })), h('p', { class: 'm' }, `${p.progresso}% concluído`), h('a', { class: 'btn sm', href: `${A}/projetos/${p.id}` }, 'Abrir painel'))))]);
}
function painelProjeto(p, base, menu, root, label) {
  if (!p) return vNotFound();
  return shell(menu, [['Início', root], [label, base], ['Painel do projeto']], [h('p', { class: 'eyebrow' }, p.grupo), h('h1', null, p.nome), h('div', { class: 'prog' }, h('i', { style: `width:${p.progresso}%` })), h('p', { class: 'm' }, `${p.progresso}% concluído`),
    h('div', { class: 'two' }, h('div', { class: 'card' }, h('h2', null, 'Etapas'), h('ul', { class: 'list' }, p.etapas.map((e) => h('li', null, h('span', null, e.nome), h('span', { class: 'tag ' + (e.feito ? 'ok' : 'warn') }, e.feito ? 'Concluída' : 'Em aberto'))))), h('div', { class: 'card' }, h('h2', null, 'Orientações'), h('p', null, p.orientacoes), h('h3', null, 'Equipe'), h('p', { class: 'row' }, p.equipe.map((n) => h('span', { class: 'tag' }, n)))))], [base, label]);
}
const vProjeto = (id) => painelProjeto(DB.projetos.find((x) => x.id === id), A + '/projetos', 'projetos', A, 'Projetos');
function vVideoaulas() {
  return shell('videoaulas', [['Início', A], ['Videoaulas']], [h('p', { class: 'eyebrow' }, 'Conteúdo acadêmico'), h('h1', null, 'Videoaulas'), h('div', { class: 'grid' }, DB.videoaulas.filter((v) => v.visivel).map((v) => h('article', { class: 'card' }, h('span', { class: 'tag' }, v.duracao), h('h3', null, v.titulo), h('p', { class: 'm' }, v.disciplina), h('a', { class: 'btn sm', href: `${A}/videoaulas/${v.id}` }, 'Assistir'))))]);
}
function vVideo(id) {
  const v = DB.videoaulas.find((x) => x.id === id); if (!v) return vNotFound();
  let timer = null, pct = 0;
  const bar = h('i'); const pp = h('button', { class: 'pp', type: 'button', 'aria-label': 'Reproduzir' }, '▶');
  pp.onclick = () => { if (timer) { clearInterval(timer); timer = null; pp.textContent = '▶'; return; } pp.textContent = '❚❚'; timer = setInterval(() => { pct = Math.min(100, pct + 2); bar.style.width = pct + '%'; if (pct >= 100) { clearInterval(timer); timer = null; pp.textContent = '▶'; } }, 300); };
  const player = S.sim ? h('div', { class: 'player' }, h('div', { role: 'alert', style: 'text-align:center;padding:16px' }, h('p', null, 'Não foi possível carregar o vídeo.'), h('button', { class: 'btn', type: 'button', style: 'color:#fff;border-color:#fff;background:none', onclick: () => { S.sim = false; render(); toast('Vídeo carregado.'); } }, 'Tentar novamente')))
    : h('div', { class: 'player' }, h('span', { style: 'position:absolute;top:12px;left:14px;font-size:.85rem;opacity:.8' }, 'Reprodução demonstrativa'), pp, h('div', { class: 'pb' }, h('span', null, v.duracao), h('div', { class: 'bar' }, bar)));
  return shell('videoaulas', [['Início', A], ['Videoaulas', A + '/videoaulas'], ['Assistir aula']], [h('p', { class: 'eyebrow' }, v.disciplina), h('h1', null, v.titulo), player, h('p', null, v.descricao), h('div', { class: 'card' }, h('h3', null, 'Transcrição'), h('p', null, v.transcricao))], [A + '/videoaulas', 'Videoaulas']);
}
function vAgentes() {
  return shell('agentes', [['Início', A], ['Meus agentes']], [h('p', { class: 'eyebrow' }, 'Apoio ao estudo'), h('h1', null, 'Meus agentes'), h('p', { class: 'sub' }, 'Um agente por disciplina. As respostas são demonstrativas.'),
    h('div', { class: 'grid' }, DB.agentes.map((g, i) => h('article', { class: 'card' }, h('h3', null, g.disciplina), h('p', { class: 'm' }, `${g.materiais.length} material(is) anexado(s)`), h('a', { class: 'btn sm', href: `${A}/agentes/${i}` }, 'Abrir agente'))))]);
}
function vAgente(i) {
  const ag = DB.agentes[i]; if (!ag) return vNotFound();
  const chat = (S.chats[ag.disciplina] = S.chats[ag.disciplina] || [{ b: true, t: `Olá! Sou o agente de ${ag.disciplina}. Escolha um atalho ou digite uma pergunta.` }]);
  const log = h('div', { class: 'chat', 'aria-live': 'polite' }, chat.map((c) => h('div', { class: 'msg ' + (c.b ? 'b' : 'u') }, c.t)));
  const post = (u, key) => { chat.push({ t: u }); chat.push({ b: true, t: DB.respostasAgente[key] }); render(); };
  const input = h('input', { type: 'text', 'aria-label': 'Pergunta ao agente', placeholder: 'Digite uma pergunta' });
  const err = h('div', { role: 'alert' });
  const file = h('input', { type: 'file', 'aria-label': 'Anexar material', accept: '.pdf,.doc,.docx,.ppt,.pptx,.txt', onchange: () => { const f = file.files[0]; if (!f) return; if (!extOk(f.name)) { err.replaceChildren(h('div', { class: 'alert err' }, 'Formato não aceito. Use PDF, DOC, DOCX, PPT, PPTX ou TXT.')); file.value = ''; return; } ag.materiais.push(f.name); save(); render(); toast('Material anexado ao agente.'); } });
  return shell('agentes', [['Início', A], ['Meus agentes', A + '/agentes'], [ag.disciplina]], [h('p', { class: 'eyebrow' }, 'Agente de estudo'), h('h1', null, ag.disciplina),
    h('div', { class: 'two' }, h('div', { class: 'card' }, h('h3', null, 'Materiais da disciplina'), h('ul', { class: 'list' }, ag.materiais.map((m) => h('li', null, m)), !ag.materiais.length && h('li', null, 'Nenhum material anexado.')), err, h('label', null, 'Anexar material'), file),
      h('div', null, log, h('div', { class: 'row', style: 'margin:10px 0' }, [['Resumir materiais', 'resumir'], ['Criar questões', 'questoes'], ['Explicar conceitos', 'explicar']].map((s) => h('button', { class: 'btn sm', type: 'button', onclick: () => post(s[0], s[1]) }, s[0]))),
        h('form', { class: 'row', style: 'flex-wrap:nowrap', onsubmit: (e) => { e.preventDefault(); if (input.value.trim()) post(input.value.trim(), 'livre'); } }, input, h('button', { class: 'btn pri', type: 'submit' }, 'Enviar'))))], [A + '/agentes', 'Meus agentes']);
}
function vFeedback() {
  return shell('feedback', [['Início', A], ['Enviar feedback']], [h('p', { class: 'eyebrow' }, 'Sua opinião'), h('h1', null, 'Enviar feedback'), h('p', { class: 'sub' }, 'Conte o que podemos melhorar.'),
    formView({ fields: [{ name: 'tipo', label: 'Tipo', type: 'select', options: ['Sugestão', 'Problema', 'Elogio'] }, { name: 'msg', label: 'Mensagem', type: 'textarea', req: true }], submit: 'Enviar feedback', onSubmit(v) { DB.feedbacks.push({ ...v, aluno: me().nome }); save(); go(A + '/feedback/enviado'); } })]);
}
const vFeedbackOk = () => shell('feedback', [['Início', A], ['Enviar feedback', A + '/feedback'], ['Feedback enviado']], [h('h1', null, 'Feedback enviado'), h('div', { class: 'alert ok' }, 'Obrigado! Seu feedback foi enviado.'), h('div', { class: 'row' }, h('a', { class: 'btn pri', href: A }, 'Voltar ao início'), h('a', { class: 'btn', href: A + '/feedback' }, 'Enviar outro')) ]);

/* ---------- professor ---------- */
const P = '#/prof';
function vProfDash() {
  const u = me(); const aval = DB.atividades.reduce((n, a) => n + a.entregas.filter((e) => e.nota == null).length, 0);
  return shell('', null, [h('p', { class: 'eyebrow' }, 'Área do professor'), h('h1', null, 'Dashboard acadêmico'), h('p', { class: 'sub' }, 'Gerencie conteúdos e acompanhe suas turmas.'), h('div', { class: 'hero' }, h('div', null, h('div', { class: 'ey' }, 'TechFatec'), h('h2', null, 'Tudo pronto para orientar suas turmas.'), h('p', null, `Você tem ${aval} entrega${aval === 1 ? '' : 's'} para avaliar.`)), h('a', { class: 'btn', href: P + '/atividades' }, 'Ver agora →')),
    h('div', { class: 'stats' }, [['Grupos ativos', DB.grupos.filter((g) => g.professor === u.nome).length, 'neste semestre', P + '/grupos'], ['Atividades', DB.atividades.length, 'abertas e em revisão', P + '/atividades'], ['Entregas a avaliar', aval, 'aguardando nota', P + '/atividades'], ['Projetos', DB.projetos.length, 'em andamento', P + '/projetos']].map((s) => h('a', { class: 'card stat', href: s[3] }, h('span', null, s[0]), h('b', null, s[1]), h('small', null, s[2])))),
    h('div', { class: 'card' }, h('h2', null, 'Relatórios'), h('p', null, 'Consulte participação, entregas e engajamento por disciplina e período.'), h('a', { class: 'btn pri', href: P + '/relatorios' }, 'Abrir relatórios'))]);
}
function vProfGrupos() {
  return shell('grupos', [['Início', P], ['Gerenciar Grupos']], [h('div', { class: 'row between' }, h('div', null, h('p', { class: 'eyebrow' }, 'Comunidade'), h('h1', null, 'Gerenciar grupos')), h('a', { class: 'btn pri', href: P + '/grupos/novo' }, 'Novo grupo')),
    h('div', { class: 'grid g3' }, DB.grupos.map((g, i) => gcard(g, `${P}/grupos/${g.id}`, 'Gerenciar grupo', i, false)))]);
}
function grupoForm(g) {
  const novo = !g;
  return formView({ fields: [{ name: 'nome', label: 'Nome do grupo', req: true, value: g && g.nome }, { name: 'disc', label: 'Disciplina', type: 'select', options: DB.disciplinas, value: g && g.disciplina }, { name: 'enc', label: 'Encontro', req: true, value: g && g.encontro, ph: 'Ex.: Terça-feira, das 19h às 21h' }, { name: 'loc', label: 'Local', req: true, value: g && g.local }, { name: 'desc', label: 'Descrição', type: 'textarea', req: true, value: g && g.descricao }], submit: novo ? 'Criar grupo' : 'Salvar alterações',
    onSubmit(v) {
      if (novo) DB.grupos.push({ id: nextId('g'), nome: v.nome, disciplina: v.disc, professor: me().nome, status: 'Inscrições abertas', encontro: v.enc, local: v.loc, descricao: v.desc, topicos: [], participantes: [], materiais: [] });
      else Object.assign(g, { nome: v.nome, disciplina: v.disc, encontro: v.enc, local: v.loc, descricao: v.desc });
      save(); go(novo ? P + '/grupos' : `${P}/grupos/${g.id}`); toast(novo ? 'Grupo criado com sucesso.' : 'Alterações salvas.');
    } });
}
const vProfGrupoNovo = () => shell('grupos', [['Início', P], ['Gerenciar Grupos', P + '/grupos'], ['Novo registro']], [h('h1', null, 'Novo grupo'), grupoForm(null)], [P + '/grupos', 'Gerenciar grupos']);
function vProfGrupoEditar(id) { const g = grupo(id); if (!g) return vNotFound(); return shell('grupos', [['Início', P], ['Gerenciar Grupos', P + '/grupos'], ['Editar grupo']], [h('h1', null, 'Editar grupo'), grupoForm(g)], [`${P}/grupos/${id}`, 'Detalhes do grupo']); }
function vProfGrupo(id) {
  const g = grupo(id); if (!g) return vNotFound();
  const remover = (p) => modal({ title: p.situacao === 'Ativo' ? 'Remover aluno?' : 'Cancelar convite?', body: `${p.nome} ${p.situacao === 'Ativo' ? 'deixará de participar deste grupo.' : 'não receberá mais o convite.'}`, actions: [{ label: 'Voltar', onclick() {} }, { label: 'Confirmar', cls: 'pri', onclick() { g.participantes = g.participantes.filter((x) => x !== p); save(); render(); toast('Participante atualizado.'); } }] });
  const convidar = () => { const inp = h('input', { type: 'text', 'aria-label': 'Nome do aluno', placeholder: 'Nome do aluno' }); const e = h('div', { role: 'alert' }); modal({ title: 'Convidar aluno', body: h('div', null, e, inp), actions: [{ label: 'Cancelar', onclick() {} }, { label: 'Enviar convite', cls: 'pri', keep: true, onclick(close) { if (!inp.value.trim()) { e.replaceChildren(h('div', { class: 'alert err' }, 'Informe o nome do aluno.')); return; } g.participantes.push({ nome: inp.value.trim(), curso: 'SI', situacao: 'Convite pendente' }); save(); close(); render(); toast('Convite enviado (demonstrativo).'); } }] }); };
  return shell('grupos', [['Início', P], ['Gerenciar Grupos', P + '/grupos'], ['Detalhes do Grupo']], [h('div', { class: 'row between' }, h('div', null, h('p', { class: 'eyebrow' }, 'Gerenciamento'), h('h1', null, g.nome), h('p', { class: 'sub' }, `Prof. ${g.professor} · ${ativos(g)} participantes · ${g.status}`)), h('div', { class: 'row' }, h('a', { class: 'btn', href: `${P}/grupos/${id}/editar` }, 'Editar grupo'), h('button', { class: 'btn pri', type: 'button', onclick: convidar }, 'Convidar aluno'))),
    h('div', { class: 'card' }, h('h2', null, 'Participantes'), h('ul', { class: 'list' }, g.participantes.map((p) => h('li', null, h('div', null, h('div', { class: 't' }, p.nome), h('div', { class: 'm' }, `Aluno · ${p.curso}`)), h('div', { class: 'row' }, h('span', { class: 'm' }, p.situacao), h('button', { class: 'btn sm', type: 'button', onclick: () => remover(p) }, p.situacao === 'Ativo' ? 'Remover' : 'Cancelar convite')))), !g.participantes.length && h('li', null, 'Nenhum participante ainda.')))], [P + '/grupos', 'Gerenciar grupos']);
}
function vProfAtividades() {
  return shell('atividades', [['Início', P], ['Gerenciar Atividades']], [h('div', { class: 'row between' }, h('h1', null, 'Gerenciar atividades'), h('a', { class: 'btn pri', href: P + '/atividades/nova' }, 'Nova atividade')),
    h('div', { class: 'tbw' }, h('table', { class: 'tb' }, h('thead', null, h('tr', null, ['Atividade', 'Disciplina', 'Prazo', 'Entregas', ''].map((x) => h('th', null, x)))), h('tbody', null, DB.atividades.map((a) => h('tr', null, h('td', null, a.titulo), h('td', null, a.disciplina), h('td', null, fmt(a.prazo)), h('td', null, a.entregas.length), h('td', null, h('a', { class: 'btn sm', href: `${P}/atividades/${a.id}` }, 'Abrir')))))))]);
}
function ativForm(a) {
  const novo = !a;
  return formView({ fields: [{ name: 'titulo', label: 'Título', req: true, value: a && a.titulo }, { name: 'disc', label: 'Disciplina', type: 'select', options: DB.disciplinas, value: a && a.disciplina }, { name: 'prazo', label: 'Prazo', type: 'date', req: true, value: a && a.prazo }, { name: 'instr', label: 'Instruções', type: 'textarea', req: true, value: a && a.instrucoes }], submit: novo ? 'Publicar atividade' : 'Salvar alterações',
    onSubmit(v) {
      if (novo) DB.atividades.push({ id: nextId('a'), titulo: v.titulo, disciplina: v.disc, prazo: v.prazo, hora: '23:59', pontos: 10, instrucoes: v.instr, entregas: [] });
      else Object.assign(a, { titulo: v.titulo, disciplina: v.disc, prazo: v.prazo, instrucoes: v.instr });
      save(); go(P + '/atividades'); toast(novo ? 'Atividade publicada com sucesso.' : 'Atividade atualizada.');
    } });
}
const vProfAtivNova = () => shell('atividades', [['Início', P], ['Gerenciar Atividades', P + '/atividades'], ['Nova atividade']], [h('h1', null, 'Nova atividade'), ativForm(null)], [P + '/atividades', 'Gerenciar atividades']);
function vProfAtivEditar(id) { const a = DB.atividades.find((x) => x.id === id); if (!a) return vNotFound(); return shell('atividades', [['Início', P], ['Gerenciar Atividades', P + '/atividades'], ['Editar atividade']], [h('h1', null, 'Editar atividade'), ativForm(a)], [`${P}/atividades/${id}`, 'Detalhes da atividade']); }
function vProfAtiv(id) {
  const a = DB.atividades.find((x) => x.id === id); if (!a) return vNotFound();
  const avaliar = (e) => { const nota = h('input', { type: 'number', min: 0, max: a.pontos, step: '0.5', value: e.nota == null ? '' : e.nota, 'aria-label': 'Nota' }); const ret = h('textarea', { 'aria-label': 'Retorno ao aluno' }, e.retorno || ''); const er = h('div', { role: 'alert' });
    modal({ eyebrow: e.aluno, title: 'Avaliar entrega', body: h('div', null, h('p', null, `Arquivo: ${e.arquivo}`), er, h('label', null, `Nota (0 a ${a.pontos})`), nota, h('label', { style: 'margin-top:10px' }, 'Retorno ao aluno'), ret), actions: [{ label: 'Cancelar', onclick() {} }, { label: 'Salvar avaliação', cls: 'pri', keep: true, onclick(close) { const n = parseFloat(nota.value); if (isNaN(n) || n < 0 || n > a.pontos) { er.replaceChildren(h('div', { class: 'alert err' }, `Informe uma nota entre 0 e ${a.pontos}.`)); return; } e.nota = n; e.retorno = ret.value.trim(); save(); close(); render(); toast('Avaliação registrada.'); } }] }); };
  return shell('atividades', [['Início', P], ['Gerenciar Atividades', P + '/atividades'], ['Detalhes da atividade']], [h('div', { class: 'row between' }, h('div', null, h('p', { class: 'eyebrow' }, a.disciplina), h('h1', null, a.titulo), h('p', { class: 'sub' }, `Prazo ${fmt(a.prazo)} · ${a.pontos} pontos`)), h('div', { class: 'row' }, h('a', { class: 'btn', href: `${P}/atividades/${id}/editar` }, 'Editar atividade'), h('button', { class: 'btn', type: 'button', onclick: () => { DB.atividades.push({ ...a, id: nextId('a'), titulo: a.titulo + ' (cópia)', entregas: [] }); save(); go(P + '/atividades'); toast('Cópia criada.'); } }, 'Criar cópia'))),
    h('p', null, a.instrucoes), h('div', { class: 'tbw' }, h('table', { class: 'tb' }, h('thead', null, h('tr', null, ['Aluno', 'Arquivo', 'Nota', ''].map((x) => h('th', null, x)))), h('tbody', null, a.entregas.map((e) => h('tr', null, h('td', null, e.aluno), h('td', null, e.arquivo), h('td', null, e.nota == null ? 'Aguardando' : e.nota), h('td', null, h('button', { class: 'btn sm', type: 'button', onclick: () => avaliar(e) }, 'Avaliar')))), !a.entregas.length && h('tr', null, h('td', { colspan: 4 }, 'Nenhuma entrega recebida.')))))], [P + '/atividades', 'Gerenciar atividades']);
}
function vProfMateriais() {
  const rem = (m) => modal({ title: 'Remover material?', body: `“${m.titulo}” deixará de aparecer para os alunos.`, actions: [{ label: 'Cancelar', onclick() {} }, { label: 'Sim, remover', cls: 'pri', onclick() { DB.materiais = DB.materiais.filter((x) => x !== m); DB.grupos.forEach((g) => { g.materiais = g.materiais.filter((x) => x !== m.id); }); save(); render(); toast('Material removido.'); } }] });
  return shell('materiais', [['Início', P], ['Materiais']], [h('div', { class: 'row between' }, h('h1', null, 'Materiais publicados'), h('a', { class: 'btn pri', href: P + '/materiais/novo' }, 'Publicar material')),
    h('div', { class: 'tbw' }, h('table', { class: 'tb' }, h('thead', null, h('tr', null, ['Título', 'Disciplina', 'Tipo', ''].map((x) => h('th', null, x)))), h('tbody', null, DB.materiais.map((m) => h('tr', null, h('td', null, m.titulo), h('td', null, m.disciplina), h('td', null, m.tipo), h('td', null, h('div', { class: 'row' }, h('a', { class: 'btn sm', href: `${P}/materiais/${m.id}/editar` }, 'Editar'), h('button', { class: 'btn sm', type: 'button', onclick: () => rem(m) }, 'Remover'))))), !DB.materiais.length && h('tr', null, h('td', { colspan: 4 }, 'Nenhum material publicado.')))))]);
}
function matForm(m) {
  const novo = !m;
  return formView({ fields: [{ name: 'titulo', label: 'Título', req: true, value: m && m.titulo }, { name: 'disc', label: 'Disciplina', type: 'select', options: DB.disciplinas, value: m && m.disciplina }, { name: 'tipo', label: 'Tipo', type: 'select', options: ['PDF', 'DOCX', 'PPTX', 'TXT'], value: m && m.tipo }, { name: 'desc', label: 'Descrição', type: 'textarea', req: true, value: m && m.descricao }], submit: novo ? 'Publicar material' : 'Salvar alterações',
    onSubmit(v) { if (novo) DB.materiais.push({ id: nextId('m'), titulo: v.titulo, disciplina: v.disc, tipo: v.tipo, data: hoje(), descricao: v.desc }); else Object.assign(m, { titulo: v.titulo, disciplina: v.disc, tipo: v.tipo, descricao: v.desc }); save(); go(P + '/materiais'); toast(novo ? 'Material publicado.' : 'Material atualizado.'); } });
}
const vProfMatNovo = () => shell('materiais', [['Início', P], ['Materiais', P + '/materiais'], ['Publicar material']], [h('h1', null, 'Publicar material'), matForm(null)], [P + '/materiais', 'Materiais']);
function vProfMatEditar(id) { const m = DB.materiais.find((x) => x.id === id); if (!m) return vNotFound(); return shell('materiais', [['Início', P], ['Materiais', P + '/materiais'], ['Editar material']], [h('h1', null, 'Editar material'), matForm(m)], [P + '/materiais', 'Materiais']); }
const vProfProjetos = () => shell('projetos', [['Início', P], ['Gerenciar Projetos']], [h('h1', null, 'Gerenciar projetos'), h('div', { class: 'grid' }, DB.projetos.map((p) => h('article', { class: 'card' }, h('h3', null, p.nome), h('p', { class: 'm' }, p.grupo), h('div', { class: 'prog' }, h('i', { style: `width:${p.progresso}%` })), h('p', { class: 'm' }, `${p.progresso}% concluído`), h('a', { class: 'btn sm', href: `${P}/projetos/${p.id}` }, 'Abrir painel'))))]);
const vProfProjeto = (id) => painelProjeto(DB.projetos.find((x) => x.id === id), P + '/projetos', 'projetos', P, 'Gerenciar Projetos');
function vProfVideos(editId) {
  const v = editId && DB.videoaulas.find((x) => x.id === editId); if (editId && !v) return vNotFound();
  const confirmar = (vals, msg) => modal({ title: 'Salvar este conteúdo?', body: 'A videoaula ficará disponível para os alunos após a confirmação.', actions: [{ label: 'Cancelar', onclick() {} }, { label: 'Sim, salvar', cls: 'pri', onclick() {
    if (S.sim) { msg('err', 'Não foi possível publicar a videoaula agora. Os dados foram mantidos; tente novamente.'); return; }
    if (v) { Object.assign(v, { titulo: vals.titulo, disciplina: vals.disc, descricao: vals.desc, transcricao: vals.tr }); save(); go(`${P}/videoaulas/publicada/${v.id}`); toast('Videoaula atualizada.'); }
    else { const nv = { id: nextId('v'), titulo: vals.titulo, disciplina: vals.disc, duracao: '00:00', descricao: vals.desc, transcricao: vals.tr, visivel: true }; DB.videoaulas.push(nv); save(); go(`${P}/videoaulas/publicada/${nv.id}`); toast('Videoaula publicada com sucesso.'); }
  } }] });
  const form = formView({ fields: [{ name: 'titulo', label: 'Título', req: true, value: v && v.titulo }, { name: 'disc', label: 'Disciplina', type: 'select', options: DB.disciplinas, value: v && v.disciplina }, { name: 'arq', label: 'Arquivo de vídeo', type: 'file', req: !v, accept: 'video/*', hint: 'No protótipo, o arquivo não é enviado.' }, { name: 'desc', label: 'Descrição', type: 'textarea', req: true, value: v && v.descricao }, { name: 'tr', label: 'Transcrição', type: 'textarea', req: true, value: v && v.transcricao }], submit: v ? 'Salvar alterações' : 'Publicar videoaula', onSubmit: confirmar });
  const del = (x) => modal({ title: 'Excluir videoaula?', body: `“${x.titulo}” será removida e deixará de aparecer para os alunos.`, actions: [{ label: 'Cancelar', onclick() {} }, { label: 'Sim, excluir', cls: 'pri', onclick() { DB.videoaulas = DB.videoaulas.filter((y) => y !== x); save(); go(P + '/videoaulas'); toast('Videoaula excluída.'); } }] });
  const crumbs = v ? [['Início', P], ['Publicar Videoaula', P + '/videoaulas'], ['Editar videoaula']] : [['Início', P], ['Publicar Videoaula']];
  return shell('videoaulas', crumbs, [h('h1', null, v ? 'Editar videoaula' : 'Publicar videoaula'), form,
    !v && h('div', null, h('h2', { style: 'margin-top:28px' }, 'Videoaulas publicadas'), h('div', { class: 'grid' }, DB.videoaulas.map((x) => h('article', { class: 'card' }, h('h3', null, x.titulo), h('p', { class: 'm' }, x.disciplina), h('div', { class: 'row' }, h('a', { class: 'btn sm', href: `${P}/videoaulas/${x.id}/editar` }, 'Editar'), h('button', { class: 'btn sm', type: 'button', onclick: () => del(x) }, 'Excluir'))))))], v ? [P + '/videoaulas', 'Publicar videoaula'] : null);
}
function vProfVideoOk(id) { const v = DB.videoaulas.find((x) => x.id === id); if (!v) return vNotFound(); return shell('videoaulas', [['Início', P], ['Publicar Videoaula', P + '/videoaulas'], ['Videoaula publicada']], [h('h1', null, 'Videoaula publicada'), h('div', { class: 'alert ok' }, `“${v.titulo}” está disponível para os alunos.`), h('div', { class: 'row' }, h('a', { class: 'btn pri', href: P + '/videoaulas' }, 'Voltar para Publicar videoaula'), h('a', { class: 'btn', href: `${P}/videoaulas/${id}/editar` }, 'Editar'))]); }
function vProfRel() {
  const sd = h('select', { id: 'rd', 'aria-label': 'Disciplina', onchange: () => draw() }, h('option', { value: '' }, 'Todas as disciplinas'), DB.disciplinas.map((d) => h('option', { value: d }, d)));
  const sp = h('select', { id: 'rp', 'aria-label': 'Período', onchange: () => draw() }, h('option', { value: '' }, 'Todos os períodos'), ['2026-2', '2026-1'].map((d) => h('option', { value: d }, d)));
  const out = h('div', { 'aria-live': 'polite' }); let cur = [];
  const draw = () => {
    cur = DB.relatorios.filter((r) => (!sd.value || r.disciplina === sd.value) && (!sp.value || r.periodo === sp.value));
    out.replaceChildren();
    if (!cur.length) { out.append(h('div', { class: 'alert info' }, 'Nenhum dado para os filtros escolhidos.')); return; }
    const avg = (k) => Math.round(cur.reduce((n, r) => n + r[k], 0) / cur.length);
    out.append(h('div', { class: 'stats' }, [['Participação média', avg('participacao') + '%'], ['Atividades entregues', cur.reduce((n, r) => n + r.entregues, 0)], ['Engajamento', avg('engajamento') + '%']].map((s) => h('div', { class: 'card stat' }, h('b', null, s[1]), s[0]))),
      h('div', { class: 'tbw' }, h('table', { class: 'tb' }, h('thead', null, h('tr', null, ['Disciplina', 'Período', 'Participação', 'Entregues', 'Engajamento'].map((x) => h('th', null, x)))), h('tbody', null, cur.map((r) => h('tr', null, h('td', null, r.disciplina), h('td', null, r.periodo), h('td', null, r.participacao + '%'), h('td', null, r.entregues), h('td', null, r.engajamento + '%')))))));
  };
  const exportar = () => { if (!cur.length) { toast('Sem dados para exportar.', true); return; } const csv = 'Disciplina;Período;Participação;Entregues;Engajamento\n' + cur.map((r) => [r.disciplina, r.periodo, r.participacao, r.entregues, r.engajamento].join(';')).join('\n'); const a = h('a', { href: URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' })), download: 'relatorio-techfatec.csv' }); document.body.append(a); a.click(); a.remove(); toast('Relatório exportado.'); };
  draw();
  return shell('relatorios', [['Início', P], ['Relatórios']], [h('div', { class: 'row between' }, h('h1', null, 'Relatórios'), h('button', { class: 'btn pri', type: 'button', onclick: exportar }, 'Exportar CSV')), h('div', { class: 'row', style: 'margin:12px 0' }, h('div', null, h('label', { for: 'rd' }, 'Disciplina'), sd), h('div', null, h('label', { for: 'rp' }, 'Período'), sp)), out]);
}

/* ---------- 404 e roteador ---------- */
function vNotFound() {
  const u = me();
  const content = [h('h1', null, 'Página não encontrada'), h('p', null, 'O endereço não existe ou não está disponível para o seu perfil.'), h('a', { class: 'btn pri', href: u ? (u.perfil === 'aluno' ? A : P) : '#/login' }, u ? 'Voltar ao início' : 'Ir para o login')];
  return u ? shell('x', null, content) : authShell(content);
}
const ROUTES = [
  [/^\/login$/, null, vLogin], [/^\/cadastro\/(aluno|professor)$/, null, (m) => vCadastro(m[1])], [/^\/recuperar$/, null, vRecuperar], [/^\/verifique$/, null, vVerifique],
  [/^\/aluno$/, 'aluno', vAlunoInicio], [/^\/aluno\/grupos$/, 'aluno', vGrupos], [/^\/aluno\/grupos\/(\w+)$/, 'aluno', (m) => vGrupo(m[1])], [/^\/aluno\/agenda$/, 'aluno', vAgenda],
  [/^\/aluno\/materiais$/, 'aluno', vMateriais], [/^\/aluno\/materiais\/(\w+)$/, 'aluno', (m) => vMaterial(m[1])], [/^\/aluno\/atividades$/, 'aluno', vAtividades], [/^\/aluno\/atividades\/(\w+)$/, 'aluno', (m) => vAtividade(m[1])],
  [/^\/aluno\/projetos$/, 'aluno', vProjetos], [/^\/aluno\/projetos\/(\w+)$/, 'aluno', (m) => vProjeto(m[1])], [/^\/aluno\/videoaulas$/, 'aluno', vVideoaulas], [/^\/aluno\/videoaulas\/(\w+)$/, 'aluno', (m) => vVideo(m[1])],
  [/^\/aluno\/agentes$/, 'aluno', vAgentes], [/^\/aluno\/agentes\/(\d+)$/, 'aluno', (m) => vAgente(+m[1])], [/^\/aluno\/feedback$/, 'aluno', vFeedback], [/^\/aluno\/feedback\/enviado$/, 'aluno', vFeedbackOk],
  [/^\/prof$/, 'professor', vProfDash], [/^\/prof\/grupos$/, 'professor', vProfGrupos], [/^\/prof\/grupos\/novo$/, 'professor', vProfGrupoNovo], [/^\/prof\/grupos\/(\w+)$/, 'professor', (m) => vProfGrupo(m[1])], [/^\/prof\/grupos\/(\w+)\/editar$/, 'professor', (m) => vProfGrupoEditar(m[1])],
  [/^\/prof\/atividades$/, 'professor', vProfAtividades], [/^\/prof\/atividades\/nova$/, 'professor', vProfAtivNova], [/^\/prof\/atividades\/(\w+)$/, 'professor', (m) => vProfAtiv(m[1])], [/^\/prof\/atividades\/(\w+)\/editar$/, 'professor', (m) => vProfAtivEditar(m[1])],
  [/^\/prof\/materiais$/, 'professor', vProfMateriais], [/^\/prof\/materiais\/novo$/, 'professor', vProfMatNovo], [/^\/prof\/materiais\/(\w+)\/editar$/, 'professor', (m) => vProfMatEditar(m[1])],
  [/^\/prof\/projetos$/, 'professor', vProfProjetos], [/^\/prof\/projetos\/(\w+)$/, 'professor', (m) => vProfProjeto(m[1])],
  [/^\/prof\/videoaulas$/, 'professor', () => vProfVideos(null)], [/^\/prof\/videoaulas\/publicada\/(\w+)$/, 'professor', (m) => vProfVideoOk(m[1])], [/^\/prof\/videoaulas\/(\w+)\/editar$/, 'professor', (m) => vProfVideos(m[1])],
  [/^\/prof\/relatorios$/, 'professor', vProfRel],
];
function render() {
  const path = (location.hash || '#/').slice(1).replace(/\/+$/, '') || '/';
  const u = me();
  if (path === '/') return go(u ? (u.perfil === 'aluno' ? A : P) : '#/login');
  let out = null, matched = false;
  for (const [re, role, fn] of ROUTES) {
    const m = path.match(re); if (!m) continue; matched = true;
    if (role && !u) return go('#/login');
    if (role && u.perfil !== role) return go(u.perfil === 'aluno' ? A : P);
    out = fn(m); break;
  }
  if (!matched) out = vNotFound();
  if (!out) return; // redirecionou
  const root = $('#root'); root.replaceChildren(...out); panelOpen = null;
  document.title = (($('h1', root) || {}).textContent || 'TechFatec') + ' · TechFatec';
  window.scrollTo(0, 0);
  const mn = $('#main'); if (mn && S.focus !== false) mn.focus({ preventScroll: true });
}
window.addEventListener('hashchange', render);
load().then(render);
})();
