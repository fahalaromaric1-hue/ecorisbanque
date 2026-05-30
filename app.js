const ADMIN = {
  username: 'fahalaromaric1@gmail.com',
  pin: 'franc123',
};

const SESSION_KEY = 'ebank_session_v1';
const ACCOUNTS_KEY = 'ebank_accounts_v1';
const ACCOUNTS_API = '/api/accounts';

const MOBILE_BREAKPOINT = 900;
const MOBILE_PREVIEW_MOVEMENTS = 5;

const MIN_HISTORY_DAYS = 60;
const MIN_GAP_HOURS = 6;
const MAX_GAP_DAYS = 10;

const RELEVE_LABEL_IN = 'Régularisation relevé — entrée';
const RELEVE_LABEL_OUT = 'Régularisation relevé — sortie';

const MOVEMENT_LABEL_TRANSLATIONS = {
  deposit: 'Reçu',
  withdrawal: 'Dépense',
  [RELEVE_LABEL_IN]: 'Régularisation relevé — entrée',
  [RELEVE_LABEL_OUT]: 'Régularisation relevé — sortie',
};

const isMobileView = () =>
  window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;


const defaultAccounts = [
  {
    owner: 'Ingo Franc',
    username: 'ingofranc@gmail.com',
    pin: 'franc123',
    movements: [200000, 300000, 350000, 250000, -5000, -12000, 4500, -1400, 4800, -950, 14250, 30600],
    movementDates: [],
    interestRate: 1.2,
    locale: 'fr-FR',
    currency: 'EUR',
    notifications: { email: true, sms: false },
    beneficiaries: [],
    accountProducts: [
      { name: 'Compte courant', status: 'Actif' },
      { name: 'Livret épargne', status: 'Actif' },
    ],
    savings: [
      { name: 'Livret A', balance: 1200 },
      { name: 'Plan épargne', balance: 5400 },
    ],
    investments: [{ product: 'Actions', amount: 200, date: '2026-05-10' }],
    supportRequests: [
      {
        subject: 'Bloqué sur transfert',
        message: 'Impossible de finaliser le virement.',
        status: 'Ouvert',
        date: '2026-05-28',
      },
    ],
  },
  {
    owner: 'Marie Dubois',
    username: 'md',
    pin: '2222',
    movements: [500, 340, -300, -20, -460, 200, 190, 1000],
    movementDates: [],
    interestRate: 1.5,
    locale: 'fr-FR',
    currency: 'EUR',
    notifications: { email: true, sms: false },
    beneficiaries: [],
    accountProducts: [
      { name: 'Compte courant', status: 'Actif' },
      { name: 'Compte joint', status: 'Actif' },
    ],
    savings: [{ name: 'Livret A', balance: 900 }],
    investments: [{ product: 'Fonds', amount: 120, date: '2026-05-26' }],
    supportRequests: [],
  },
];



function loadAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return defaultAccounts.map(cloneAccount);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.length) return defaultAccounts.map(cloneAccount);
    return parsed;
  } catch {
    return defaultAccounts.map(cloneAccount);
  }
}

function saveAccounts(data) {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Impossible de sauvegarder les comptes', e);
  }
}

function replaceAccounts(nextAccounts) {
  accounts.length = 0;
  nextAccounts.forEach(account => {
    regularizeMovementHistory(account);
    accounts.push(account);
  });
}

let serverSyncAvailable = false;

async function syncAccountsFromServer() {
  try {
    const response = await fetch(ACCOUNTS_API, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const parsed = await response.json();
    if (!Array.isArray(parsed) || !parsed.length) throw new Error('Données invalides');
    replaceAccounts(parsed.map(cloneAccount));
    saveAccounts(accounts);
    serverSyncAvailable = true;
    rebindCurrentAccount();
    return true;
  } catch (error) {
    serverSyncAvailable = false;
    replaceAccounts(loadAccounts());
    rebindCurrentAccount();
    console.warn('Synchronisation serveur indisponible, cache local utilisé.', error);
    return false;
  }
}

function rebindCurrentAccount() {
  if (!currentAccount) return;
  const updated = accounts.find(acc => acc.username === currentAccount.username);
  if (updated) currentAccount = updated;
}

function cloneAccount(account) {
  return JSON.parse(JSON.stringify(account));
}


const formatCurrency = (value, locale = 'fr-FR', currency = 'EUR') =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);

const formatMovementTime = (date, locale) =>
  new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

const formatMovementDate = (date, locale) => {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  let dayLabel;
  if (daysPassed === 0) dayLabel = 'Aujourd’hui';
  else if (daysPassed === 1) dayLabel = 'Hier';
  else if (daysPassed <= 7) dayLabel = `Il y a ${daysPassed} jours`;
  else {
    dayLabel = new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  return `${dayLabel} · ${formatMovementTime(date, locale)}`;
};

const roundAmount = value => Math.round(Number(value) * 100) / 100;

const getMinGapMs = () => MIN_GAP_HOURS * 60 * 60 * 1000;
const getMinSpanMs = () => MIN_HISTORY_DAYS * 24 * 60 * 60 * 1000;

const getHistoryBounds = () => {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const minAgeMs = MIN_HISTORY_DAYS * dayMs;
  return {
    earliest: now - minAgeMs * 2,
    latest: now - minAgeMs,
  };
};

const jitterClock = (baseMs, index) => {
  const d = new Date(baseMs);
  const hours = 7 + ((index * 5 + Math.floor(Math.random() * 7)) % 14);
  const minutes = (index * 13 + Math.floor(Math.random() * 47)) % 60;
  d.setHours(hours, minutes, Math.floor(Math.random() * 59), Math.floor(Math.random() * 900));
  return d;
};

const clampMovementDate = (timeMs, index = 0) => {
  const { earliest, latest } = getHistoryBounds();
  const clamped = Math.min(latest, Math.max(earliest, timeMs));
  return jitterClock(clamped, index);
};

const ensureMovementDatesLength = account => {
  if (!account.movementDates) account.movementDates = [];
  while (account.movementDates.length < account.movements.length) {
    account.movementDates.push('');
  }
  if (account.movementDates.length > account.movements.length) {
    account.movementDates.length = account.movements.length;
  }
};

const ensureMovementLabels = account => {
  if (!account.movementLabels) {
    account.movementLabels = account.movements.map(() => '');
  }
  while (account.movementLabels.length < account.movements.length) {
    account.movementLabels.push('');
  }
  if (account.movementLabels.length > account.movements.length) {
    account.movementLabels.length = account.movements.length;
  }
};

const historySpanMs = account => {
  if (account.movementDates.length < 2) return 0;
  const times = account.movementDates.map(d => new Date(d).getTime());
  return Math.max(...times) - Math.min(...times);
};

const advanceMovementCursor = previousMs => {
  const minGapMs = getMinGapMs();
  const dayJump = 2 + Math.floor(Math.random() * MAX_GAP_DAYS);
  const hourJump = 1 + Math.floor(Math.random() * 9);
  const next =
    previousMs + dayJump * 24 * 60 * 60 * 1000 + hourJump * 60 * 60 * 1000;
  return Math.max(next, previousMs + minGapMs);
};

const movementDatesOutOfNorm = account => {
  const { earliest, latest } = getHistoryBounds();
  return account.movementDates.some(d => {
    const t = new Date(d).getTime();
    return Number.isNaN(t) || t < earliest || t > latest;
  });
};

const assignDateToNewMovement = account => {
  const idx = account.movements.length - 1;
  if (idx < 0) return;

  ensureMovementDatesLength(account);
  const { earliest, latest } = getHistoryBounds();
  const minGapMs = getMinGapMs();

  const previousTimes = account.movementDates
    .slice(0, idx)
    .map(d => new Date(d).getTime())
    .filter(t => !Number.isNaN(t));

  const lastTime = previousTimes.length ? Math.max(...previousTimes) : earliest;
  const candidate = advanceMovementCursor(lastTime);
  let nextDate;

  if (candidate <= latest) {
    nextDate = clampMovementDate(candidate, idx);
  } else {
    const d = jitterClock(latest, idx);
    if (previousTimes.length) {
      const prevMs = Math.max(...previousTimes);
      if (d.getTime() - prevMs < minGapMs) {
        d.setTime(Math.min(latest, prevMs + minGapMs));
      }
    }
    nextDate = clampMovementDate(d.getTime(), idx);
  }

  account.movementDates[idx] = nextDate.toISOString();

  if (
    movementDatesOutOfNorm(account) ||
    (account.movements.length > 1 && historySpanMs(account) < getMinSpanMs())
  ) {
    regularizeMovementHistory(account);
  }
};

const regularizeMovementHistory = account => {
  const count = account.movements.length;
  ensureMovementDatesLength(account);

  if (count === 0) {
    account.movementDates = [];
    return;
  }

  const { earliest, latest } = getHistoryBounds();
  const minSpanMs = getMinSpanMs();
  const minGapMs = getMinGapMs();
  const dates = [];
  let cursor = earliest;

  for (let i = 0; i < count; i++) {
    if (i > 0) cursor = advanceMovementCursor(dates[i - 1].getTime());

    const slotLatest = latest - (count - 1 - i) * minGapMs;
    if (cursor > slotLatest) {
      cursor = slotLatest - Math.floor(Math.random() * 4) * 60 * 60 * 1000;
    }

    dates.push(clampMovementDate(cursor, i));
    cursor = dates[i].getTime();
  }

  if (count > 1 && dates[count - 1].getTime() - dates[0].getTime() < minSpanMs) {
    const start = earliest;
    const step = minSpanMs / (count - 1);
    for (let i = 0; i < count; i++) {
      const t = Math.min(latest - (count - 1 - i) * minGapMs, start + step * i);
      dates[i] = clampMovementDate(t, i);
    }
  }

  if (count === 1) {
    dates[0] = clampMovementDate((earliest + latest) / 2, 0);
  }

  account.movementDates = dates.map(d => d.toISOString());
};

const isAdminAdjustmentLabel = label =>
  label.startsWith('Régularisation relevé') ||
  label === 'Régularisation — entrée' ||
  label === 'Régularisation — sortie';

const buildStatementLines = account => {
  ensureMovementDatesLength(account);
  ensureMovementLabels(account);

  return account.movements
    .map((amount, index) => ({
      amount,
      index,
      date: new Date(account.movementDates[index]),
      type: amount > 0 ? 'deposit' : 'withdrawal',
      label: account.movementLabels[index]?.trim() || '',
    }))
    .sort((a, b) => a.date - b.date || a.index - b.index);
};

const getAccountBalance = account =>
  account.movements.reduce((acc, mov) => acc + mov, 0);

const pushMovement = (account, amount, label = '') => {
  account.movements.push(amount);
  ensureMovementLabels(account);
  account.movementLabels.push(label);
  assignDateToNewMovement(account);
};

const stripAdminAdjustments = account => {
  ensureMovementLabels(account);
  ensureMovementDatesLength(account);

  const movements = [];
  const movementDates = [];
  const movementLabels = [];

  account.movements.forEach((amount, i) => {
    const label = account.movementLabels[i] || '';
    if (isAdminAdjustmentLabel(label)) return;
    movements.push(amount);
    movementDates.push(account.movementDates[i]);
    movementLabels.push(label);
  });

  account.movements = movements;
  account.movementDates = movementDates;
  account.movementLabels = movementLabels;
};

const fixStatementRounding = (account, targetBalance) => {
  const target = roundAmount(targetBalance);
  const drift = roundAmount(target - getAccountBalance(account));
  if (drift === 0 || account.movements.length === 0) return;

  const idx = account.movements.length - 1;
  account.movements[idx] = roundAmount(account.movements[idx] + drift);
};

const syncStatementToBalance = (account, targetBalance) => {
  const target = roundAmount(targetBalance);
  if (!Number.isFinite(target)) return { changed: false, diff: 0 };

  stripAdminAdjustments(account);

  let diff = roundAmount(target - getAccountBalance(account));
  if (diff === 0) {
    account.statementBalance = target;
    regularizeMovementHistory(account);
    return { changed: false, diff: 0 };
  }

  const label = diff > 0 ? RELEVE_LABEL_IN : RELEVE_LABEL_OUT;
  pushMovement(account, diff, label);
  fixStatementRounding(account, target);
  account.statementBalance = roundAmount(getAccountBalance(account));

  diff = roundAmount(target - account.statementBalance);
  return { changed: true, diff };
};

const ensureStatementCoherent = account => {
  const target = account.statementBalance ?? getAccountBalance(account);
  const current = getAccountBalance(account);
  if (roundAmount(target) !== roundAmount(current)) {
    syncStatementToBalance(account, current);
    account.statementBalance = roundAmount(getAccountBalance(account));
  }
};

const createAccount = (owner, username, pin) => ({
  owner,
  username,
  pin,
  movements: [0],
  movementDates: [],
  interestRate: 1.2,
  locale: 'fr-FR',
  currency: 'EUR',
  notifications: { email: true, sms: false },
  beneficiaries: [],
  accountProducts: [{ name: 'Compte courant', status: 'Actif' }],
  savings: [{ name: 'Livret A', balance: 0 }],
  investments: [],
  supportRequests: [],
});

const filterStatementLines = (lines, { filterType = 'all', searchQuery = '' }) => {
  let filtered = lines.filter(line => filterType === 'all' || line.type === filterType);

  const q = searchQuery.trim().toLowerCase();
  if (!q) return filtered;

  return filtered.filter(line => {
    const label = line.label || line.type;
    const amountStr = String(Math.abs(line.amount));
    const dateStr = line.date.toLocaleDateString('fr-FR');
    return (
      label.toLowerCase().includes(q) ||
      amountStr.includes(q) ||
      dateStr.includes(q)
    );
  });
};



const isAdminLogin = (username, pin) =>
  username === ADMIN.username && String(pin) === String(ADMIN.pin);

function saveSession(username, pin, role = 'user') {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ username, pin, role }));
  } catch (e) {
    console.warn('Could not save session', e);
  }
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}


let container = null;

function initToast() {
  container = document.getElementById('toastContainer');
}

function showToast(message, type = 'info', duration = 4000) {
  if (!container) initToast();
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('toast--visible'));

  setTimeout(() => {
    toast.classList.remove('toast--visible');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function showSuccess(message) {
  showToast(message, 'success');
}

function showError(message) {
  showToast(message, 'error', 5000);
}

function showInfo(message) {
  showToast(message, 'info');
}

async function withLoader(fn, message = 'Chargement…') {
  const loader = document.getElementById('appLoader');
  const loaderText = document.getElementById('appLoaderText');
  if (loader) {
    if (loaderText) loaderText.textContent = message;
    loader.classList.remove('hidden');
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 350));
    return await fn();
  } finally {
    if (loader) loader.classList.add('hidden');
  }
}



function exportStatement(account) {
  const lines = buildStatementLines(account);
  const balance = getAccountBalance(account);
  const totalIn = account.movements.filter(m => m > 0).reduce((s, m) => s + m, 0);
  const totalOut = account.movements.filter(m => m < 0).reduce((s, m) => s + m, 0);
  const now = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const rows = lines
    .map((line, i) => {
      const label =
        MOVEMENT_LABEL_TRANSLATIONS[line.label] ||
        MOVEMENT_LABEL_TRANSLATIONS[line.type] ||
        line.label ||
        line.type;
      return `
        <tr>
          <td>${i + 1}</td>
          <td>${formatMovementDate(line.date, account.locale)}</td>
          <td>${label}</td>
          <td>${formatCurrency(line.amount, account.locale, account.currency)}</td>
        </tr>`;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Relevé — ${account.owner}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 32px; color: #1a1a2e; }
    h1 { color: #1c7ed6; margin-bottom: 4px; }
    .meta { color: #5c6b7a; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border-bottom: 1px solid #dfe3eb; padding: 10px 8px; text-align: left; }
    th { background: #f4f7fb; }
    .totals { margin-top: 24px; display: grid; gap: 8px; max-width: 320px; }
    .totals div { display: flex; justify-content: space-between; }
    .balance { font-size: 1.2rem; font-weight: 700; color: #1c7ed6; margin-top: 12px; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <h1>Ecorise Banque</h1>
  <p class="meta">Relevé de compte — ${account.owner} (${account.username})<br/>Édité le ${now}</p>
  <table>
    <thead>
      <tr><th>#</th><th>Date</th><th>Opération</th><th>Montant</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="totals">
    <div><span>Total entrées</span><strong>${formatCurrency(totalIn, account.locale, account.currency)}</strong></div>
    <div><span>Total sorties</span><strong>${formatCurrency(totalOut, account.locale, account.currency)}</strong></div>
    <div class="balance"><span>Solde</span><span>${formatCurrency(balance, account.locale, account.currency)}</span></div>
  </div>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) {
    return false;
  }
  win.document.write(html);
  win.document.close();
  return true;
}

// --- État ---
let accounts = defaultAccounts.map(cloneAccount);

let currentAccount = null;
let isAdminSession = false;
let sorted = false;
let filter = 'all';
let movementsExpanded = false;
let movementSearch = '';
let chartExpanded = false;

// --- DOM ---
const labelWelcome = document.getElementById('welcomeMessage');
const labelDate = document.getElementById('currentDate');
const labelBalance = document.getElementById('balance');
const labelBalanceHero = document.getElementById('balanceHero');
const labelIncome = document.getElementById('income');
const labelOutcome = document.getElementById('outcome');
const labelInterest = document.getElementById('interest');
const containerDashboard = document.getElementById('dashboard');
const containerLogin = document.getElementById('loginSection');
const containerMovements = document.getElementById('movements');
const btnShowMoreMovements = document.getElementById('btnShowMoreMovements');
const statementFooter = document.getElementById('statementFooter');
const spendingChart = document.getElementById('spendingChart');
const chartSection = document.getElementById('chartSection');
const btnToggleChart = document.getElementById('btnToggleChart');
const movementSearchInput = document.getElementById('movementSearch');
const btnExportStatement = document.getElementById('btnExportStatement');

const btnLogout = document.getElementById('btnLogout');
const btnSort = document.getElementById('btnSort');
const btnMenu = document.getElementById('btnMenu');
const btnCloseSidebar = document.getElementById('btnCloseSidebar');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const filterButtons = document.querySelectorAll('.btn--filter');

const loginForm = document.getElementById('loginForm');
const inputUsername = document.getElementById('inputUsername');
const inputPin = document.getElementById('inputPin');
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const signupForm = document.getElementById('signupForm');
const signupName = document.getElementById('signupName');
const signupUsername = document.getElementById('signupUsername');
const signupPin = document.getElementById('signupPin');

const transferForm = document.getElementById('transferForm');
const loanForm = document.getElementById('loanForm');
const loanAmount = document.getElementById('loanAmount');

const serviceTabs = document.querySelectorAll('.service-tab');
const servicePanels = document.querySelectorAll('.service-panel');
const profileForm = document.getElementById('profileForm');
const serviceName = document.getElementById('serviceName');
const servicePin = document.getElementById('servicePin');
const notificationsForm = document.getElementById('notificationsForm');
const notifyEmail = document.getElementById('notifyEmail');
const notifySms = document.getElementById('notifySms');
const beneficiaryList = document.getElementById('beneficiaryList');
const addBeneficiaryForm = document.getElementById('addBeneficiaryForm');
const beneficiaryName = document.getElementById('beneficiaryName');
const beneficiaryEmail = document.getElementById('beneficiaryEmail');
const beneficiaryAccount = document.getElementById('beneficiaryAccount');
const beneficiaryBic = document.getElementById('beneficiaryBic');
const supportForm = document.getElementById('supportForm');
const supportSubject = document.getElementById('supportSubject');
const supportMessage = document.getElementById('supportMessage');

const accountTabs = document.querySelectorAll('.account-tab');
const accountPanels = document.querySelectorAll('.account-panel');
const accountProductList = document.getElementById('accountProductList');
const savingsList = document.getElementById('savingsList');
const newProductForm = document.getElementById('newProductForm');
const newProductName = document.getElementById('newProductName');
const closeProductForm = document.getElementById('closeProductForm');
const closeProductName = document.getElementById('closeProductName');

const investmentTabs = document.querySelectorAll('.investment-tab');
const investmentPanels = document.querySelectorAll('.investment-panel');
const investmentList = document.getElementById('investmentList');
const investForm = document.getElementById('investForm');
const investAmount = document.getElementById('investAmount');

const supportTabs = document.querySelectorAll('.support-tab');
const supportPanels = document.querySelectorAll('.support-panel');
const ticketList = document.getElementById('ticketList');
const ticketForm = document.getElementById('ticketForm');
const ticketSubject = document.getElementById('ticketSubject');
const ticketMessage = document.getElementById('ticketMessage');

const containerAdmin = document.getElementById('adminPanel');
const adminUserList = document.getElementById('adminUserList');
const adminEditForm = document.getElementById('adminEditForm');
const adminSelectUser = document.getElementById('adminSelectUser');
const adminEditName = document.getElementById('adminEditName');
const adminEditBalance = document.getElementById('adminEditBalance');
const adminCurrentBalance = document.getElementById('adminCurrentBalance');

async function persistAccounts() {
  saveAccounts(accounts);
  if (!serverSyncAvailable) return;

  try {
    const response = await fetch(ACCOUNTS_API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(accounts),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    console.warn('Impossible de synchroniser les comptes sur le serveur.', error);
    showError('Modification enregistrée localement. Vérifiez que le serveur Node est lancé.');
  }
}

function updateActiveFilter(type) {
  filterButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === type);
  });
}

function displayMovements(account, sort = false, filterType = 'all', searchQuery = '') {
  containerMovements.innerHTML = '';

  let lines = filterStatementLines(buildStatementLines(account), {
    filterType,
    searchQuery,
  });

  const totalLines = lines.length;

  const chronological = buildStatementLines(account);
  let running = 0;
  const balanceByIndex = new Map();
  chronological.forEach(line => {
    running = roundAmount(running + line.amount);
    balanceByIndex.set(line.index, running);
  });

  if (sort) {
    lines = lines.slice().sort((a, b) => a.amount - b.amount);
  } else if (isMobileView() && !movementsExpanded && totalLines > MOBILE_PREVIEW_MOVEMENTS) {
    lines = lines.slice(-MOBILE_PREVIEW_MOVEMENTS);
  }

  if (lines.length === 0) {
    containerMovements.innerHTML = '<p class="empty-state">Aucune opération disponible.</p>';
    updateMovementsToggle(0, 0, sort);
    if (statementFooter) statementFooter.classList.add('hidden');
    if (spendingChart) spendingChart.innerHTML = '';
    return;
  }

  lines.forEach((line, i) => {
    const operationLabel =
      MOVEMENT_LABEL_TRANSLATIONS[line.label] ||
      MOVEMENT_LABEL_TRANSLATIONS[line.type] ||
      line.label ||
      line.type;
    const balanceAfter = balanceByIndex.get(line.index);
    const balanceHtml =
      !sort && balanceAfter !== undefined
        ? `<p class="movement-balance">Solde : ${formatCurrency(balanceAfter, account.locale, account.currency)}</p>`
        : '';

    containerMovements.insertAdjacentHTML(
      'beforeend',
      `<div class="movement movement--${line.type}">
        <div>
          <span>#${i + 1} ${operationLabel}</span>
          <p>${formatCurrency(line.amount, account.locale, account.currency)}</p>
        </div>
        <div class="movement-meta">
          <p class="movement-datetime">${formatMovementDate(line.date, account.locale)}</p>
          ${balanceHtml}
          <span>${line.type === 'deposit' ? '+' : '-'}</span>
        </div>
      </div>`
    );
  });

  updateMovementsToggle(totalLines, lines.length, sort);
  renderStatementFooter(account);
  renderSpendingChart(account);
}

function updateMovementsToggle(total, shown, sort) {
  if (!btnShowMoreMovements) return;

  const onMobile = isMobileView();
  const hasMore = total > MOBILE_PREVIEW_MOVEMENTS;

  if (!onMobile || !hasMore || sort || movementSearch.trim()) {
    btnShowMoreMovements.classList.add('hidden');
    return;
  }

  btnShowMoreMovements.classList.remove('hidden');
  btnShowMoreMovements.textContent = movementsExpanded
    ? 'Montrer moins'
    : total - shown > 1
      ? `Montrer plus (${total - shown} opérations)`
      : 'Montrer plus (1 opération)';
}

function renderStatementFooter(account) {
  if (!statementFooter) return;

  const lines = buildStatementLines(account);
  if (!lines.length) {
    statementFooter.classList.add('hidden');
    return;
  }

  const totalIn = roundAmount(
    account.movements.filter(mov => mov > 0).reduce((sum, mov) => sum + mov, 0)
  );
  const totalOut = roundAmount(
    account.movements.filter(mov => mov < 0).reduce((sum, mov) => sum + mov, 0)
  );
  const statementBalance = getAccountBalance(account);

  statementFooter.classList.remove('hidden');
  statementFooter.innerHTML = `
    <div class="statement-footer__row">
      <span>Total entrées</span>
      <strong>${formatCurrency(totalIn, account.locale, account.currency)}</strong>
    </div>
    <div class="statement-footer__row">
      <span>Total sorties</span>
      <strong>${formatCurrency(totalOut, account.locale, account.currency)}</strong>
    </div>
    <div class="statement-footer__row statement-footer__row--total">
      <span>Solde du relevé</span>
      <strong>${formatCurrency(statementBalance, account.locale, account.currency)}</strong>
    </div>`;
}

function calcDisplayBalance(account) {
  const balance = getAccountBalance(account);
  account.balance = balance;
  const formatted = formatCurrency(balance, account.locale, account.currency);
  labelBalance.textContent = formatted;
  if (labelBalanceHero) labelBalanceHero.textContent = formatted;
}

function calcDisplaySummary(account) {
  const incomes = account.movements.filter(mov => mov > 0).reduce((sum, mov) => sum + mov, 0);
  const outcomes = account.movements.filter(mov => mov < 0).reduce((sum, mov) => sum + mov, 0);
  const interest = account.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((sum, int) => sum + int, 0);

  labelIncome.textContent = formatCurrency(incomes, account.locale, account.currency);
  labelOutcome.textContent = formatCurrency(Math.abs(outcomes), account.locale, account.currency);
  labelInterest.textContent = formatCurrency(interest, account.locale, account.currency);
}

function updateUI(account) {
  if (!account) return;
  ensureStatementCoherent(account);
  displayMovements(account, sorted, filter, movementSearch);
  calcDisplayBalance(account);
  calcDisplaySummary(account);
  account.statementBalance = roundAmount(getAccountBalance(account));
  updateChartVisibility();
}

function updateChartVisibility() {
  if (!chartSection || !btnToggleChart) return;
  const mobile = isMobileView();
  chartSection.classList.toggle('chart-section--collapsed', mobile && !chartExpanded);
  btnToggleChart.classList.toggle('hidden', !mobile);
  btnToggleChart.textContent = chartExpanded ? 'Masquer le graphique' : 'Afficher le graphique';
}

function renderSpendingChart(account) {
  if (!spendingChart) return;

  const chartData = account.movements
    .map((mov, i) => ({
      amount: Math.abs(mov),
      type: mov > 0 ? 'deposit' : 'withdrawal',
      label: new Date(account.movementDates[i]).toLocaleDateString(account.locale, {
        day: '2-digit',
        month: 'short',
      }),
    }))
    .slice(-6);

  if (!chartData.length) {
    spendingChart.innerHTML = '';
    return;
  }

  const maxValue = Math.max(...chartData.map(item => item.amount));

  spendingChart.innerHTML = chartData
    .map(
      item => `
        <div class="spending-bar">
          <div class="spending-bar__fill" style="height: ${item.amount > 0 ? (item.amount / maxValue) * 100 : 5}%; background: ${
            item.type === 'deposit'
              ? 'linear-gradient(180deg, #37b24d, #2f9e44)'
              : 'linear-gradient(180deg, #fa5252, #c92a2a)'
          };"></div>
          <div class="spending-bar__value">${formatCurrency(item.amount, account.locale, account.currency)}</div>
          <div class="spending-bar__label">${item.label}</div>
        </div>`
    )
    .join('');
}

const viewsMap = {
  dashboard: ['#dashboard'],
  transfer: ['#pageTransfer'],
  loan: ['#pageLoan'],
  cards: ['#pageCards'],
  services: ['#pageServices'],
  accounts: ['#pageAccounts'],
  investments: ['#pageInvestment'],
  support: ['#pageSupport'],
};

const CLIENT_VIEWS = new Set(Object.keys(viewsMap));

let pendingView = null;

const normalizeView = view => {
  const v = (view || 'dashboard').trim();
  return v === 'investment' ? 'investments' : v;
};

const isClientAuthenticated = () => !!currentAccount && !isAdminSession;

function showLoginPrompt(view) {
  const normalized = normalizeView(view);
  const alreadyPrompted =
    !containerLogin.classList.contains('hidden') && pendingView === normalized;
  pendingView = normalized;

  hideAllViews();
  containerDashboard.classList.add('hidden');
  hideAdminPanel();
  containerLogin.classList.remove('hidden');
  hideClientControls();
  closeSidebar();
  loginForm.classList.remove('hidden');
  signupForm.classList.add('hidden');
  loginTab.classList.add('active');
  signupTab.classList.remove('active');

  try {
    history.replaceState(null, '', `#${normalized}`);
  } catch {
    /* ignore */
  }

  if (!alreadyPrompted) {
    showInfo('Connectez-vous pour accéder à cette page.');
  }
}

function hideAllViews() {
  Object.values(viewsMap).flat().forEach(sel => {
    document.querySelectorAll(sel).forEach(el => el.classList.add('hidden'));
  });
}

function showView(view) {
  const normalized = normalizeView(view);

  if (isAdminSession) return;

  if (CLIENT_VIEWS.has(normalized) && !isClientAuthenticated()) {
    showLoginPrompt(normalized);
    return;
  }

  hideAllViews();
  const selectors = viewsMap[normalized] || viewsMap.dashboard;
  selectors.forEach(sel => document.querySelectorAll(sel).forEach(el => el.classList.remove('hidden')));

  if (normalized === 'services' && currentAccount) displayServices();
  if (normalized === 'accounts' && currentAccount) displayAccounts(currentAccount);
  if (normalized === 'investments' && currentAccount) displayInvestments(currentAccount);
  if (normalized === 'support' && currentAccount) displaySupportPage(currentAccount);
  if (normalized === 'dashboard' && currentAccount) updateUI(currentAccount);

  try {
    history.replaceState(null, '', `#${normalized}`);
  } catch {
    /* ignore */
  }
  closeSidebar();
}

function fillAdminEditForm(username) {
  const account = accounts.find(acc => acc.username === username);
  if (!account) {
    adminEditName.value = '';
    adminEditBalance.value = '';
    adminCurrentBalance.textContent = 'Solde actuel : —';
    return;
  }
  const balance = getAccountBalance(account);
  adminEditName.value = account.owner;
  adminEditBalance.value = balance.toFixed(2);
  adminCurrentBalance.textContent = `Solde actuel : ${formatCurrency(balance, account.locale, account.currency)}`;
}

function renderAdminUserList() {
  adminUserList.innerHTML = '';
  adminSelectUser.innerHTML = '<option value="">— Choisir un compte —</option>';

  accounts.forEach(account => {
    const balance = getAccountBalance(account);
    const li = document.createElement('li');
    li.dataset.username = account.username;
    li.innerHTML = `
      <strong>${account.owner}</strong>
      <span>${account.username} • ${formatCurrency(balance, account.locale, account.currency)}</span>`;
    li.addEventListener('click', () => {
      adminUserList.querySelectorAll('li').forEach(item => item.classList.remove('selected'));
      li.classList.add('selected');
      adminSelectUser.value = account.username;
      fillAdminEditForm(account.username);
    });
    adminUserList.appendChild(li);

    const option = document.createElement('option');
    option.value = account.username;
    option.textContent = `${account.owner} (${account.username})`;
    adminSelectUser.appendChild(option);
  });
}

function showAdminPanel() {
  isAdminSession = true;
  currentAccount = null;
  hideAllViews();
  containerLogin.classList.add('hidden');
  containerDashboard.classList.add('hidden');
  containerAdmin.classList.remove('hidden');
  labelWelcome.textContent = 'Espace administrateur';
  btnMenu.classList.add('hidden');
  btnLogout.classList.remove('hidden');
  closeSidebar();
  renderAdminUserList();
  adminSelectUser.value = '';
  fillAdminEditForm('');
}

function hideAdminPanel() {
  isAdminSession = false;
  containerAdmin.classList.add('hidden');
}

function showClientControls() {
  btnMenu.classList.remove('hidden');
  btnLogout.classList.remove('hidden');
}

function hideClientControls() {
  btnMenu.classList.add('hidden');
  btnLogout.classList.add('hidden');
}

function tryAutoLogin() {
  const session = readSession();
  if (!session) return false;

  const { username, pin, role } = session;
  if (role === 'admin' && isAdminLogin(username, pin)) {
    showAdminPanel();
    return true;
  }

  const acc = accounts.find(a => a.username === username && String(a.pin) === String(pin));
  if (acc) {
    currentAccount = acc;
    hideAdminPanel();
    showClientControls();
    containerLogin.classList.add('hidden');
    labelWelcome.textContent = `Bienvenue, ${currentAccount.owner.split(' ')[0]}`;
    displayDate(currentAccount.locale);
    return true;
  }
  return false;
}

function logout() {
  hideAllViews();
  containerDashboard.classList.add('hidden');
  hideAdminPanel();
  hideClientControls();
  containerLogin.classList.remove('hidden');
  labelWelcome.textContent = 'Connectez-vous pour accéder à votre compte';
  closeSidebar();
  clearSession();
  currentAccount = null;
  isAdminSession = false;
  pendingView = null;
  movementsExpanded = false;
  movementSearch = '';
  if (movementSearchInput) movementSearchInput.value = '';
  try {
    history.replaceState(null, '', location.pathname + location.search);
  } catch {
    /* ignore */
  }
}

function openSidebar() {
  sidebar.classList.remove('hidden');
  sidebar.classList.add('open');
  sidebarOverlay.classList.remove('hidden');
}

function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.add('hidden');
  sidebar.classList.add('hidden');
}

function displayDate(locale = 'fr-FR') {
  labelDate.textContent = new Date().toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function activateServicePanel(panelKey) {
  serviceTabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.panel === panelKey);
  });
  const panelId = `service${panelKey.charAt(0).toUpperCase() + panelKey.slice(1)}`;
  servicePanels.forEach(panel => {
    panel.classList.toggle('active', panel.id === panelId);
  });
}

function displayServices() {
  if (!currentAccount) return;
  activateServicePanel('profile');
  updateServiceForms(currentAccount);
}

function renderBeneficiaries(account) {
  beneficiaryList.innerHTML = '';
  if (!account.beneficiaries.length) {
    beneficiaryList.innerHTML = '<li class="empty-state">Aucun bénéficiaire enregistré.</li>';
    return;
  }

  account.beneficiaries.forEach((benef, index) => {
    const item = document.createElement('li');
    item.className = 'beneficiary-item';
    item.innerHTML = `
      <div>
        <strong>${benef.name}</strong>
        <p>${benef.email}</p>
        <small>${benef.account} • ${benef.bic}</small>
      </div>
      <button type="button" class="btn btn--danger btn--small" data-index="${index}">Supprimer</button>`;
    beneficiaryList.appendChild(item);
  });
}

function updateServiceForms(account) {
  serviceName.value = account.owner;
  servicePin.value = '';
  notifyEmail.checked = account.notifications?.email ?? true;
  notifySms.checked = account.notifications?.sms ?? false;
  renderBeneficiaries(account);
}

function activateTab(tabs, panels, panelKey, prefix) {
  tabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.panel === panelKey);
  });
  const panelId = `${prefix}${panelKey.charAt(0).toUpperCase() + panelKey.slice(1)}`;
  panels.forEach(panel => {
    panel.classList.toggle('active', panel.id === panelId);
  });
}

function renderAccountProducts(account) {
  accountProductList.innerHTML =
    account.accountProducts.map(p => `<li>${p.name} • ${p.status}</li>`).join('') ||
    '<li class="empty-state">Aucun produit actif.</li>';
}

function renderSavings(account) {
  savingsList.innerHTML =
    account.savings
      .map(item => `<li>${item.name} • ${formatCurrency(item.balance, account.locale, account.currency)}</li>`)
      .join('') || '<li class="empty-state">Aucun produit d’épargne.</li>';
}

function renderInvestments(account) {
  investmentList.innerHTML = account.investments.length
    ? account.investments
        .map(
          inv =>
            `<li>${inv.product} • ${formatCurrency(inv.amount, account.locale, account.currency)} • ${inv.date}</li>`
        )
        .join('')
    : '<li class="empty-state">Aucun investissement en portefeuille.</li>';
}

function renderTickets(account) {
  ticketList.innerHTML = account.supportRequests.length
    ? account.supportRequests
        .map(
          t =>
            `<li><strong>${t.subject}</strong><p>${t.message}</p><small>${t.status} • ${t.date}</small></li>`
        )
        .join('')
    : '<li class="empty-state">Aucun ticket en cours.</li>';
}

function displayAccounts(account) {
  activateTab(accountTabs, accountPanels, 'summary', 'account');
  renderAccountProducts(account);
  renderSavings(account);
}

function displayInvestments(account) {
  activateTab(investmentTabs, investmentPanels, 'portfolio', 'investment');
  renderInvestments(account);
}

function displaySupportPage(account) {
  activateTab(supportTabs, supportPanels, 'faq', 'support');
  renderTickets(account);
}

// --- Événements ---
initToast();

loginTab.addEventListener('click', () => {
  loginForm.classList.remove('hidden');
  signupForm.classList.add('hidden');
  loginTab.classList.add('active');
  signupTab.classList.remove('active');
});

signupTab.addEventListener('click', () => {
  loginForm.classList.add('hidden');
  signupForm.classList.remove('hidden');
  loginTab.classList.remove('active');
  signupTab.classList.add('active');
});

loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  const username = inputUsername.value.trim().toLowerCase();
  const pin = inputPin.value;

  await withLoader(async () => {
    await syncAccountsFromServer();

    if (isAdminLogin(username, pin)) {
      showAdminPanel();
      saveSession(username, pin, 'admin');
      showSuccess('Connexion administrateur réussie.');
      inputUsername.value = inputPin.value = '';
      return;
    }

    currentAccount = accounts.find(acc => acc.username === username);
    if (currentAccount?.pin === pin) {
      hideAdminPanel();
      showClientControls();
      containerLogin.classList.add('hidden');
      labelWelcome.textContent = `Bienvenue, ${currentAccount.owner.split(' ')[0]}`;
      displayDate(currentAccount.locale);
      saveSession(username, pin, 'user');
      inputUsername.value = inputPin.value = '';
      showSuccess('Connexion réussie.');
      const target = pendingView || 'dashboard';
      pendingView = null;
      showView(target);
    } else {
      showError('Identifiant ou mot de passe incorrect.');
    }
  }, 'Connexion en cours…');
});

adminEditForm.addEventListener('submit', async e => {
  e.preventDefault();
  if (!isAdminSession) return;

  await withLoader(async () => {
    const username = adminSelectUser.value;
    const account = accounts.find(acc => acc.username === username);
    if (!account) {
      showError('Sélectionnez un compte client.');
      return;
    }

    const newName = adminEditName.value.trim();
    const newBalance = Number(adminEditBalance.value);

    if (!newName) {
      showError('Le nom affiché est requis.');
      return;
    }
    if (!Number.isFinite(newBalance)) {
      showError('Indiquez un solde valide.');
      return;
    }

    const previousBalance = getAccountBalance(account);
    account.owner = newName;
    const { changed } = syncStatementToBalance(account, newBalance);
    account.statementBalance = roundAmount(getAccountBalance(account));
    await persistAccounts();

    renderAdminUserList();
    adminSelectUser.value = username;
    fillAdminEditForm(username);

    if (currentAccount?.username === username) updateUI(currentAccount);

    const finalBalance = getAccountBalance(account);
    showSuccess(
      `Compte mis à jour : ${newName} — solde ${formatCurrency(finalBalance, account.locale, account.currency)}` +
        (changed && newBalance > previousBalance
          ? ' (régularisation entrée ajoutée)'
          : changed && newBalance < previousBalance
            ? ' (régularisation sortie ajoutée)'
            : '')
    );
  }, 'Mise à jour du compte…');
});

signupForm.addEventListener('submit', e => {
  e.preventDefault();
  const owner = signupName.value.trim();
  const username = signupUsername.value.trim().toLowerCase();
  const pin = signupPin.value.trim();

  if (!owner || !username || !pin || pin.length < 6) {
    showError('Complétez tous les champs et utilisez un mot de passe d’au moins 6 caractères.');
    return;
  }
  if (username === ADMIN.username) {
    showError('Cet identifiant est réservé.');
    return;
  }
  if (accounts.some(acc => acc.username === username)) {
    showError('Cet email est déjà utilisé.');
    return;
  }

  const newAccount = createAccount(owner, username, pin);
  regularizeMovementHistory(newAccount);
  accounts.push(newAccount);
  persistAccounts();
  signupName.value = signupUsername.value = signupPin.value = '';
  showSuccess(`Compte créé : ${username}`);
  loginTab.click();
});

btnLogout.addEventListener('click', logout);
btnMenu.addEventListener('click', openSidebar);
btnCloseSidebar.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

adminSelectUser.addEventListener('change', function () {
  adminUserList.querySelectorAll('li').forEach(li => {
    li.classList.toggle('selected', li.dataset.username === this.value);
  });
  fillAdminEditForm(this.value);
});

serviceTabs.forEach(tab => {
  tab.addEventListener('click', () => activateServicePanel(tab.dataset.panel));
});

accountTabs.forEach(tab => {
  tab.addEventListener('click', () => activateTab(accountTabs, accountPanels, tab.dataset.panel, 'account'));
});

investmentTabs.forEach(tab => {
  tab.addEventListener('click', () => activateTab(investmentTabs, investmentPanels, tab.dataset.panel, 'investment'));
});

supportTabs.forEach(tab => {
  tab.addEventListener('click', () => activateTab(supportTabs, supportPanels, tab.dataset.panel, 'support'));
});

newProductForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!currentAccount) return;
  currentAccount.accountProducts.push({ name: newProductName.value.trim(), status: 'En attente' });
  newProductName.value = '';
  persistAccounts();
  showSuccess('Demande de nouveau produit enregistrée.');
  renderAccountProducts(currentAccount);
});

closeProductForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!currentAccount) return;
  const name = closeProductName.value.trim();
  currentAccount.accountProducts = currentAccount.accountProducts.filter(
    p => p.name.toLowerCase() !== name.toLowerCase()
  );
  closeProductName.value = '';
  persistAccounts();
  showInfo('Produit fermé ou supprimé.');
  renderAccountProducts(currentAccount);
});

investForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!currentAccount) return;
  const amount = Number(investAmount.value);
  const product = document.getElementById('investProduct').value;
  if (amount > 0 && currentAccount.balance >= amount) {
    currentAccount.investments.push({ product, amount, date: new Date().toISOString().slice(0, 10) });
    currentAccount.movements.push(-amount);
    ensureMovementLabels(currentAccount);
    assignDateToNewMovement(currentAccount);
    investAmount.value = '';
    persistAccounts();
    renderInvestments(currentAccount);
    updateUI(currentAccount);
    showSuccess('Investissement effectué.');
  } else {
    showError('Montant invalide ou solde insuffisant.');
  }
});

ticketForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!currentAccount) return;
  const subject = ticketSubject.value.trim();
  const message = ticketMessage.value.trim();
  if (!subject || !message) {
    showError('Veuillez remplir l’objet et le message.');
    return;
  }
  currentAccount.supportRequests.push({
    subject,
    message,
    status: 'Ouvert',
    date: new Date().toLocaleDateString(),
  });
  ticketSubject.value = ticketMessage.value = '';
  persistAccounts();
  renderTickets(currentAccount);
  showSuccess('Ticket de support envoyé.');
});

profileForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!currentAccount) return;
  const name = serviceName.value.trim();
  const pin = servicePin.value.trim();
  if (!name) {
    showError('Le nom est requis.');
    return;
  }
  currentAccount.owner = name;
  if (pin.length >= 4) currentAccount.pin = pin;
  servicePin.value = '';
  persistAccounts();
  showSuccess('Profil mis à jour.');
  updateUI(currentAccount);
});

notificationsForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!currentAccount) return;
  currentAccount.notifications = { email: notifyEmail.checked, sms: notifySms.checked };
  persistAccounts();
  showSuccess('Préférences de notification mises à jour.');
});

addBeneficiaryForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!currentAccount) return;
  const name = beneficiaryName.value.trim();
  const email = beneficiaryEmail.value.trim();
  const accountNum = beneficiaryAccount.value.trim();
  const bic = beneficiaryBic.value.trim();
  if (!name || !email || !accountNum || !bic) {
    showError('Complétez tous les champs bénéficiaire.');
    return;
  }
  currentAccount.beneficiaries.push({ name, email, account: accountNum, bic });
  beneficiaryName.value = beneficiaryEmail.value = beneficiaryAccount.value = beneficiaryBic.value = '';
  persistAccounts();
  renderBeneficiaries(currentAccount);
  showSuccess('Bénéficiaire ajouté.');
});

beneficiaryList.addEventListener('click', e => {
  if (!currentAccount) return;
  const btn = e.target.closest('button[data-index]');
  if (!btn) return;
  currentAccount.beneficiaries.splice(Number(btn.dataset.index), 1);
  persistAccounts();
  renderBeneficiaries(currentAccount);
  showInfo('Bénéficiaire supprimé.');
});

supportForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!currentAccount) return;
  if (!supportSubject.value.trim() || !supportMessage.value.trim()) {
    showError('Merci de préciser l’objet et le message.');
    return;
  }
  supportSubject.value = supportMessage.value = '';
  showSuccess('Votre demande a bien été envoyée au support.');
});

transferForm.addEventListener('submit', async e => {
  e.preventDefault();
  if (!currentAccount) return;
  await withLoader(async () => {
    showError('Virement impossible. Veuillez contacter le service bancaire.');
  }, 'Traitement du virement…');
});

loanForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!currentAccount) return;
  showError('Prêt indisponible.');
});

btnSort.addEventListener('click', () => {
  sorted = !sorted;
  movementsExpanded = false;
  btnSort.textContent = sorted ? 'Trier ◢' : 'Trier';
  updateUI(currentAccount);
});

if (btnShowMoreMovements) {
  btnShowMoreMovements.addEventListener('click', () => {
    movementsExpanded = !movementsExpanded;
    if (currentAccount) updateUI(currentAccount);
  });
}

filterButtons.forEach(btn =>
  btn.addEventListener('click', function () {
    filter = this.dataset.filter;
    movementsExpanded = false;
    updateActiveFilter(filter);
    updateUI(currentAccount);
  })
);

if (movementSearchInput) {
  movementSearchInput.addEventListener('input', () => {
    movementSearch = movementSearchInput.value;
    movementsExpanded = false;
    if (currentAccount) updateUI(currentAccount);
  });
}

if (btnExportStatement) {
  btnExportStatement.addEventListener('click', () => {
    if (!currentAccount) return;
    const ok = exportStatement(currentAccount);
    if (ok) showSuccess('Relevé ouvert — utilisez Imprimer ou Enregistrer en PDF.');
    else showError('Autorisez les pop-ups pour exporter le relevé.');
  });
}

if (btnToggleChart) {
  btnToggleChart.addEventListener('click', () => {
    chartExpanded = !chartExpanded;
    updateChartVisibility();
  });
}

document.querySelectorAll('.menu-card, .sidebar-link').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    const view = this.dataset.view || (this.getAttribute('href') || '').replace('#', '').trim();
    const map = {
      transfer: 'transfer',
      loan: 'loan',
      cards: 'cards',
      services: 'services',
      accounts: 'accounts',
      investments: 'investments',
      investment: 'investments',
      support: 'support',
      dashboard: 'dashboard',
    };
    showView(map[view] || view || 'dashboard');
  });
});

// --- Init ---
async function initApp() {
  await syncAccountsFromServer();

  tryAutoLogin();
  rebindCurrentAccount();

  const initialHash = normalizeView((location.hash || '').replace('#', '').trim() || 'dashboard');
  if (isAdminSession) {
    hideAllViews();
    renderAdminUserList();
  } else {
    showView(initialHash);
  }

  updateChartVisibility();
}

initApp();

window.addEventListener('hashchange', () => {
  const v = normalizeView((location.hash || '').replace('#', '').trim() || 'dashboard');
  showView(v);
});

let mobileLayout = isMobileView();
window.addEventListener('resize', () => {
  const nextMobile = isMobileView();
  if (nextMobile !== mobileLayout) {
    mobileLayout = nextMobile;
    movementsExpanded = false;
    chartExpanded = false;
    if (currentAccount) updateUI(currentAccount);
    else updateChartVisibility();
  }
});
