const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const ACCOUNTS_FILE = path.join(ROOT, 'accounts.json');
const PAGES_DIR = path.join(ROOT, 'comptes');

function roundAmount(value) {
  return Math.round(Number(value) * 100) / 100;
}

function accountPageSlug(username) {
  const base = String(username || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'compte';
}

function accountPagePath(username) {
  return `comptes/${accountPageSlug(username)}.html`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatMoney(value) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(roundAmount(value));
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function statementRows(account) {
  const movements = Array.isArray(account.movements) ? account.movements : [];
  const labels = Array.isArray(account.movementLabels) ? account.movementLabels : [];
  const dates = Array.isArray(account.movementDates) ? account.movementDates : [];
  let running = 0;
  return movements.map((amount, index) => {
    const numeric = roundAmount(amount);
    running = roundAmount(running + numeric);
    const label = String(labels[index] || '').trim() || (numeric >= 0 ? 'Virement reçu' : 'Virement émis');
    return { amount: numeric, label, date: dates[index] || '', balance: running };
  });
}

function renderAccountPage(account) {
  const rows = statementRows(account);
  const sum = rows.length ? rows[rows.length - 1].balance : 0;
  const balance = roundAmount(account.balance);
  if (sum !== balance || roundAmount(account.statementBalance) !== balance) {
    throw new Error(`Le relevé de ${account.owner} ne correspond pas au solde`);
  }

  const body = rows
    .map(
      (row, index) => `<tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(formatDate(row.date))}</td>
        <td>${escapeHtml(row.label)}</td>
        <td class="${row.amount < 0 ? 'out' : 'in'}">${escapeHtml(formatMoney(row.amount))}</td>
        <td>${escapeHtml(formatMoney(row.balance))}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Compte de ${escapeHtml(account.owner)} — Ecorise Banque</title>
  <style>
    :root { color-scheme: light; }
    body { margin: 0; font-family: "Segoe UI", system-ui, sans-serif; background: #f4f7fb; color: #1a1a2e; }
    main { max-width: 880px; margin: 0 auto; padding: 32px 20px 64px; }
    header { display: flex; justify-content: space-between; gap: 16px; align-items: end; margin-bottom: 24px; }
    h1 { margin: 0 0 4px; font-size: 1.6rem; }
    .brand { color: #1c7ed6; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; font-size: 0.78rem; }
    .balance { font-size: 1.8rem; font-weight: 700; color: #1c7ed6; margin: 0; }
    .card { background: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 8px 24px rgba(26, 26, 46, 0.06); }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { padding: 10px 8px; border-bottom: 1px solid #e6ebf2; text-align: left; vertical-align: top; }
    th { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em; color: #5c6b7a; }
    td:nth-child(4), td:nth-child(5), th:nth-child(4), th:nth-child(5) { text-align: right; white-space: nowrap; }
    .out { color: #c92a2a; }
    .in { color: #2b8a3e; }
    .check { margin-top: 16px; color: #2b8a3e; font-weight: 600; }
    a { color: #1c7ed6; }
    @media (max-width: 700px) {
      header { flex-direction: column; align-items: start; }
      table { font-size: 0.92rem; }
    }
  </style>
</head>
<body>
  <main>
    <p class="brand">Ecorise Banque</p>
    <header>
      <div>
        <h1>Compte de ${escapeHtml(account.owner)}</h1>
        <p>Identifiant de connexion : ${escapeHtml(account.username)}</p>
      </div>
      <p class="balance">${escapeHtml(formatMoney(balance))}</p>
    </header>
    <section class="card">
      <h2>Relevé</h2>
      <table>
        <thead>
          <tr><th>#</th><th>Date</th><th>Opération</th><th>Montant</th><th>Solde</th></tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
      <p class="check">Somme des ${rows.length} opérations : ${escapeHtml(formatMoney(sum))}. Ce montant est le solde du compte.</p>
      <p><a href="../index.html">Se connecter à ce compte</a></p>
    </section>
  </main>
</body>
</html>
`;
}

function publishAccountPages(accounts) {
  if (!Array.isArray(accounts) || !accounts.length) {
    throw new Error('Aucun compte à publier');
  }
  fs.mkdirSync(PAGES_DIR, { recursive: true });
  const expected = new Set();
  for (const account of accounts) {
    const fileName = `${accountPageSlug(account.username)}.html`;
    expected.add(fileName);
    fs.writeFileSync(path.join(PAGES_DIR, fileName), renderAccountPage(account));
  }
  for (const fileName of fs.readdirSync(PAGES_DIR)) {
    if (fileName.endsWith('.html') && !expected.has(fileName)) {
      fs.rmSync(path.join(PAGES_DIR, fileName));
    }
  }
}

function writeAccountsFile(accounts) {
  fs.writeFileSync(ACCOUNTS_FILE, `${JSON.stringify(accounts, null, 2)}\n`);
}

module.exports = {
  accountPageSlug,
  accountPagePath,
  publishAccountPages,
  writeAccountsFile,
};
