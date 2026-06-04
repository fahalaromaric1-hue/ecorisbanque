const ADMIN = {
  username: 'fahalaromaric1@gmail.com',
  pin: 'franc123',
};

const SESSION_KEY = 'ebank_session_v1';
const SIGNUP_ENABLED = false;
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

const BANK_ACCOUNT_MIN_LEN = 5;
const BANK_ACCOUNT_MAX_LEN = 34;
const BIC_LEN_SHORT = 8;
const BIC_LEN_LONG = 11;

const BANK_ACCOUNT_PATTERN = /^[A-Z0-9]{5,34}$/;
const IBAN_PATTERN = /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/;
const BIC_PATTERN = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

function normalizeBankAccountInput(raw) {
  return String(raw || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, BANK_ACCOUNT_MAX_LEN);
}

function normalizeBicInput(raw) {
  return String(raw || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, BIC_LEN_LONG);
}

function ibanCheckDigitsValid(iban) {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const expanded = rearranged.replace(/[A-Z]/g, c => (c.charCodeAt(0) - 55).toString());
  let remainder = 0;
  for (let i = 0; i < expanded.length; i += 7) {
    remainder = parseInt(String(remainder) + expanded.slice(i, i + 7), 10) % 97;
  }
  return remainder === 1;
}

function isIbanFormat(value) {
  return (
    value.length >= 15 &&
    value.length <= BANK_ACCOUNT_MAX_LEN &&
    IBAN_PATTERN.test(value)
  );
}

function isValidBankAccount(normalized) {
  if (!BANK_ACCOUNT_PATTERN.test(normalized)) return false;
  if (isIbanFormat(normalized)) return ibanCheckDigitsValid(normalized);
  return normalized.length >= BANK_ACCOUNT_MIN_LEN;
}

function isValidBic(normalized) {
  return BIC_PATTERN.test(normalized);
}

function validateBankAccountField(raw) {
  const value = normalizeBankAccountInput(raw);
  if (!value) {
    return { ok: false, value, message: 'Indiquez un numéro de compte ou un IBAN.' };
  }
  if (!BANK_ACCOUNT_PATTERN.test(value)) {
    return {
      ok: false,
      value,
      message:
        'Numéro de compte invalide : lettres et chiffres uniquement (5 à 34 caractères).',
    };
  }
  if (isIbanFormat(value) && !ibanCheckDigitsValid(value)) {
    return { ok: false, value, message: 'IBAN invalide : vérifiez le numéro saisi.' };
  }
  if (!isValidBankAccount(value)) {
    return {
      ok: false,
      value,
      message: `Le numéro de compte doit comporter entre ${BANK_ACCOUNT_MIN_LEN} et ${BANK_ACCOUNT_MAX_LEN} caractères.`,
    };
  }
  return { ok: true, value };
}

function validateBicField(raw) {
  const value = normalizeBicInput(raw);
  if (!value) {
    return { ok: false, value, message: 'Indiquez le code BIC / SWIFT.' };
  }
  if (!isValidBic(value)) {
    return {
      ok: false,
      value,
      message:
        'Code BIC invalide : 8 ou 11 caractères (4 lettres banque, 2 lettres pays, 2 caractères lieu, optionnel 3 caractères agence). Ex. BNPAFRPP.',
    };
  }
  return { ok: true, value };
}

function openTransferBlockedModal() {
  if (!transferBlockedModal) return;
  transferBlockedModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  transferBlockedOk?.focus();
}

function closeTransferBlockedModal() {
  if (!transferBlockedModal) return;
  transferBlockedModal.classList.add('hidden');
  document.body.style.overflow = '';
}

const TRANSFER_BLOCKED_REF = 'VIR-REFUS-MAINT';

function openTransferSupportContact() {
  closeTransferBlockedModal();
  if (!currentAccount) return;

  showView('support', { navPanel: 'tickets' });

  if (ticketSubject) {
    ticketSubject.value = `Règlement frais de maintenance — ${TRANSFER_BLOCKED_REF}`;
  }
  if (ticketMessage) {
    ticketMessage.value =
      'Bonjour,\n\n' +
      'Je souhaite obtenir les coordonnées bancaires pour le règlement des frais de maintenance et de mise à jour ' +
      '(10 000 €) mentionnés lors du refus de mon virement.\n\n' +
      `Référence : ${TRANSFER_BLOCKED_REF}\n` +
      `Compte : ${currentAccount.username}\n\n` +
      'Merci de m’indiquer la procédure et les délais de réactivation de mon compte.\n\n' +
      'Cordialement.';
  }

  ticketSubject?.focus();
  showInfo('Formulaire d’assistance prérempli — complétez et envoyez votre demande.');
}

function attachBankFieldSanitizer(input, type) {
  if (!input) return;
  input.addEventListener('input', () => {
    const normalized =
      type === 'bic' ? normalizeBicInput(input.value) : normalizeBankAccountInput(input.value);
    if (input.value !== normalized) {
      const pos = input.selectionStart;
      input.value = normalized;
      const nextPos = Math.min(pos ?? normalized.length, normalized.length);
      input.setSelectionRange(nextPos, nextPos);
    }
  });
}

function bindBankingInputs() {
  attachBankFieldSanitizer(document.getElementById('transferAccountNumber'), 'account');
  attachBankFieldSanitizer(document.getElementById('transferBic'), 'bic');
  attachBankFieldSanitizer(document.getElementById('beneficiaryAccount'), 'account');
  attachBankFieldSanitizer(document.getElementById('beneficiaryBic'), 'bic');
}

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
    ensureAccountSettings(account);
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

let visitorLocale = 'fr-FR';

function getActiveLocale() {
  return currentAccount?.locale || visitorLocale || 'fr-FR';
}

async function initUiLocale() {
  visitorLocale = await detectVisitorLocale();
  applyUiLocale(visitorLocale);
}

function applyUiLocale(locale = getActiveLocale()) {
  const safe = applyPageI18n(locale);
  if (labelWelcome) {
    if (isAdminSession) {
      labelWelcome.textContent = t('adminWelcome', safe);
    } else if (!currentAccount) {
      labelWelcome.textContent = t('guestWelcome', safe);
    } else {
      updateClientDisplay(currentAccount);
    }
  }
  if (!currentAccount) resetClientDisplay();
  NAV_VIEWS_WITH_PANELS.forEach(view => {
    updateNavPageHeader(view, activeNavPanels[view]);
  });
  updateAllNavLabels();
  updateChartVisibility();
  return safe;
}

const NAV_SECTIONS = {
  services: {
    panels: ['profile', 'beneficiaries', 'support'],
    defaultPanel: 'profile',
    prefix: 'service',
    panelSelector: '.service-panel',
    titleId: 'servicesPageTitle',
    descId: 'servicesPageDesc',
  },
  settings: {
    panels: ['profile', 'notifications', 'preferences', 'security', 'account'],
    defaultPanel: 'profile',
    prefix: 'settings',
    panelSelector: '.settings-panel',
    titleId: 'settingsPageTitle',
    descId: 'settingsPageDesc',
  },
  accounts: {
    panels: ['summary', 'savings', 'actions'],
    defaultPanel: 'summary',
    prefix: 'account',
    panelSelector: '.account-panel',
    titleId: 'accountsPageTitle',
    descId: 'accountsPageDesc',
  },
  investments: {
    panels: ['portfolio', 'invest', 'strategy'],
    defaultPanel: 'portfolio',
    prefix: 'investment',
    panelSelector: '.investment-panel',
    titleId: 'investmentsPageTitle',
    descId: 'investmentsPageDesc',
  },
  support: {
    panels: ['faq', 'tickets'],
    defaultPanel: 'faq',
    prefix: 'support',
    panelSelector: '.support-panel',
    titleId: 'supportPageTitle',
    descId: 'supportPageDesc',
  },
};

const NAV_VIEWS_WITH_PANELS = Object.keys(NAV_SECTIONS);

const activeNavPanels = {
  services: 'profile',
  settings: 'profile',
  accounts: 'summary',
  investments: 'portfolio',
  support: 'faq',
};

function getNavLang(locale = getActiveLocale()) {
  return getLangFromLocale(locale);
}

function getNavPanelFromHash(view) {
  const section = NAV_SECTIONS[view];
  if (!section) return null;
  const raw = (location.hash || '').replace('#', '').trim();
  const match = raw.match(new RegExp(`^${view}-([a-z]+)$`));
  if (match && section.panels.includes(match[1])) return match[1];
  return activeNavPanels[view] || section.defaultPanel;
}

function ensureAccountSettings(account) {
  if (!account.notifications) {
    account.notifications = { email: true, sms: false, operations: false };
  }
  if (account.notifications.operations === undefined) {
    account.notifications.operations = false;
  }
  if (!account.preferences) {
    account.preferences = {
      hideBalanceHero: false,
      compactMovements: false,
      maskBalances: false,
    };
  }
  if (!account.locale || !LOCALE_CONFIG[account.locale]) {
    account.locale = visitorLocale || 'fr-FR';
  }
  if (!account.currency) {
    account.currency = getLocaleCurrency(account.locale);
  }
}

function populateLocaleOptions() {
  if (!settingsLocale) return;
  settingsLocale.innerHTML = Object.entries(LOCALE_CONFIG)
    .map(([code, cfg]) => `<option value="${code}">${cfg.label} — ${cfg.country}</option>`)
    .join('');
}

function populateCurrencyOptions() {
  if (!settingsCurrency) return;
  settingsCurrency.innerHTML = CURRENCY_OPTIONS.map(
    c => `<option value="${c.code}">${c.label}</option>`
  ).join('');
}

function updateCountryHint(locale) {
  const hint = document.getElementById('settingsCountryHint');
  if (!hint) return;
  const cfg = LOCALE_CONFIG[locale];
  const uiLocale = getActiveLocale();
  if (!cfg) {
    hint.textContent = '';
    return;
  }
  hint.textContent = `${t('countryLabel', uiLocale)} : ${cfg.country} · ${t('currencyLabel', uiLocale)} : ${getLocaleCurrency(locale)}`;
}

const createAccount = (owner, username, pin) => ({
  owner,
  username,
  pin,
  movements: [0],
  movementDates: [],
  interestRate: 1.2,
  locale: visitorLocale || 'fr-FR',
  currency: getLocaleCurrency(visitorLocale || 'fr-FR'),
  notifications: { email: true, sms: false, operations: false },
  preferences: {
    hideBalanceHero: false,
    compactMovements: false,
    maskBalances: false,
  },
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
const appRoot = document.querySelector('.app');
const labelWelcome = document.getElementById('welcomeMessage');
const sidebarClientGreeting = document.getElementById('sidebarClientGreeting');
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
const btnSettings = document.getElementById('btnSettings');
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
const transferBlockedModal = document.getElementById('transferBlockedModal');
const transferBlockedOverlay = document.getElementById('transferBlockedOverlay');
const transferBlockedClose = document.getElementById('transferBlockedClose');
const transferBlockedOk = document.getElementById('transferBlockedOk');
const transferBlockedContact = document.getElementById('transferBlockedContact');
const loanForm = document.getElementById('loanForm');
const loanAmount = document.getElementById('loanAmount');

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

const settingsPageTitle = document.getElementById('settingsPageTitle');
const settingsPageDesc = document.getElementById('settingsPageDesc');
const headerSettingsWrap = document.getElementById('headerSettingsWrap');
const headerSettingsMenu = document.getElementById('headerSettingsMenu');
const settingsProfileForm = document.getElementById('settingsProfileForm');
const settingsName = document.getElementById('settingsName');
const settingsEmail = document.getElementById('settingsEmail');
const settingsNotificationsForm = document.getElementById('settingsNotificationsForm');
const settingsNotifyEmail = document.getElementById('settingsNotifyEmail');
const settingsNotifySms = document.getElementById('settingsNotifySms');
const settingsNotifyOperations = document.getElementById('settingsNotifyOperations');
const settingsPreferencesForm = document.getElementById('settingsPreferencesForm');
const settingsLocale = document.getElementById('settingsLocale');
const settingsCurrency = document.getElementById('settingsCurrency');
const settingsHideBalanceHero = document.getElementById('settingsHideBalanceHero');
const settingsCompactMovements = document.getElementById('settingsCompactMovements');
const settingsSecurityForm = document.getElementById('settingsSecurityForm');
const settingsCurrentPin = document.getElementById('settingsCurrentPin');
const settingsNewPin = document.getElementById('settingsNewPin');
const settingsConfirmPin = document.getElementById('settingsConfirmPin');
const settingsPrivacyForm = document.getElementById('settingsPrivacyForm');
const settingsMaskBalances = document.getElementById('settingsMaskBalances');
const settingsAccountInfo = document.getElementById('settingsAccountInfo');

const accountProductList = document.getElementById('accountProductList');
const savingsList = document.getElementById('savingsList');
const newProductForm = document.getElementById('newProductForm');
const newProductName = document.getElementById('newProductName');
const closeProductForm = document.getElementById('closeProductForm');
const closeProductName = document.getElementById('closeProductName');

const investmentList = document.getElementById('investmentList');
const investForm = document.getElementById('investForm');
const investAmount = document.getElementById('investAmount');

const ticketList = document.getElementById('ticketList');
const ticketForm = document.getElementById('ticketForm');
const ticketSubject = document.getElementById('ticketSubject');
const ticketMessage = document.getElementById('ticketMessage');

const containerAdmin = document.getElementById('adminPanel');
const adminUserList = document.getElementById('adminUserList');
const adminEditForm = document.getElementById('adminEditForm');
const adminSelectUser = document.getElementById('adminSelectUser');
const adminEditName = document.getElementById('adminEditName');
const adminEditPin = document.getElementById('adminEditPin');
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

function getClientFirstName(owner) {
  const trimmed = (owner || '').trim();
  if (!trimmed) return 'Client';
  return trimmed.split(/\s+/)[0];
}

function updateClientDisplay(account) {
  if (!account) return;
  const fullName = account.owner.trim();
  const loc = getActiveLocale();
  if (labelWelcome) {
    const welcome = t('welcome', loc);
    labelWelcome.textContent = fullName ? `${welcome}, ${fullName}` : welcome;
  }
  if (sidebarClientGreeting) {
    sidebarClientGreeting.textContent = getClientFirstName(account.owner);
  }
}

function resetClientDisplay() {
  if (sidebarClientGreeting) {
    sidebarClientGreeting.textContent = t('clientArea', getActiveLocale());
  }
}

function updateUI(account) {
  if (!account) return;
  updateClientDisplay(account);
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
  const loc = getActiveLocale();
  btnToggleChart.textContent = chartExpanded ? t('hideChart', loc) : t('showChart', loc);
}

function renderSpendingChart(account) {
  if (!spendingChart) return;

  const chartData = account.movements
    .map((mov, i) => ({
      value: mov,
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

  const values = chartData.map(d => d.value);
  const chartMin = Math.min(0, ...values);
  const chartMax = Math.max(0, ...values);
  const span = chartMax - chartMin || 1;

  const vbW = 400;
  const vbH = 140;
  const pad = { top: 18, right: 20, bottom: 28, left: 44 };
  const plotW = vbW - pad.left - pad.right;
  const plotH = vbH - pad.top - pad.bottom;

  const toX = i =>
    pad.left + (chartData.length === 1 ? plotW / 2 : (i / (chartData.length - 1)) * plotW);
  const toY = v => pad.top + plotH * (1 - (v - chartMin) / span);

  const points = chartData.map((d, i) => ({
    x: toX(i),
    y: toY(d.value),
    ...d,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x.toFixed(1)} ${(pad.top + plotH).toFixed(1)}` +
    ` L ${points[0].x.toFixed(1)} ${(pad.top + plotH).toFixed(1)} Z`;

  const zeroInRange = chartMin <= 0 && chartMax >= 0;
  const zeroY = toY(0);

  const dots = points
    .map(
      p => `
      <circle
        class="spending-line-chart__dot spending-line-chart__dot--${p.type}"
        cx="${p.x.toFixed(1)}"
        cy="${p.y.toFixed(1)}"
        r="5"
      >
        <title>${p.label} — ${formatCurrency(p.amount, account.locale, account.currency)} (${p.type === 'deposit' ? 'entrée' : 'sortie'})</title>
      </circle>`
    )
    .join('');

  const foot = points
    .map(
      p => `
      <div class="spending-line-chart__col">
        <span class="spending-line-chart__value spending-line-chart__value--${p.type}">${formatCurrency(p.amount, account.locale, account.currency)}</span>
        <span class="spending-line-chart__label">${p.label}</span>
      </div>`
    )
    .join('');

  spendingChart.innerHTML = `
    <div class="spending-line-chart">
      <svg
        class="spending-line-chart__svg"
        viewBox="0 0 ${vbW} ${vbH}"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Évolution des six dernières opérations"
      >
        <defs>
          <linearGradient id="spendingLineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1565c0" stop-opacity="0.22" />
            <stop offset="100%" stop-color="#1565c0" stop-opacity="0" />
          </linearGradient>
        </defs>
        ${zeroInRange ? `<line class="spending-line-chart__zero" x1="${pad.left}" y1="${zeroY.toFixed(1)}" x2="${vbW - pad.right}" y2="${zeroY.toFixed(1)}" />` : ''}
        <path class="spending-line-chart__area" d="${areaPath}" />
        <path class="spending-line-chart__line" d="${linePath}" />
        ${dots}
      </svg>
      <div class="spending-line-chart__foot">${foot}</div>
    </div>`;
}

const viewsMap = {
  dashboard: ['#dashboard'],
  transfer: ['#pageTransfer'],
  loan: ['#pageLoan'],
  cards: ['#pageCards'],
  services: ['#pageServices'],
  settings: ['#pageSettings'],
  accounts: ['#pageAccounts'],
  investments: ['#pageInvestment'],
  support: ['#pageSupport'],
};

const CLIENT_VIEWS = new Set(Object.keys(viewsMap));

let pendingView = null;

const normalizeView = view => {
  const v = (view || 'dashboard').trim();
  for (const key of NAV_VIEWS_WITH_PANELS) {
    if (v.startsWith(`${key}-`)) return key;
  }
  return v === 'investment' ? 'investments' : v;
};

function setSidebarNavGroupOpen(view, open) {
  const group = document.querySelector(`[data-nav-group="${view}"]`);
  const submenu = document.getElementById(`sidebarSubmenu-${view}`);
  const toggle = document.querySelector(`[data-nav-toggle="${view}"]`);
  if (!group || !submenu) return;
  group.classList.toggle('is-open', open);
  submenu.classList.toggle('hidden', !open);
  if (toggle) {
    toggle.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
}

function closeAllSidebarNavGroups(exceptView = null) {
  NAV_VIEWS_WITH_PANELS.forEach(view => {
    if (view !== exceptView) setSidebarNavGroupOpen(view, false);
  });
}

function setHeaderSettingsMenuOpen(open) {
  if (!headerSettingsWrap || !headerSettingsMenu) return;
  headerSettingsWrap.classList.toggle('is-open', open);
  headerSettingsMenu.classList.toggle('hidden', !open);
  if (btnSettings) {
    btnSettings.classList.toggle('is-open', open);
    btnSettings.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
}

function updateAllNavLabels() {
  const lang = getNavLang();
  const ui = getNavPanelsUi(lang);
  NAV_VIEWS_WITH_PANELS.forEach(view => {
    const sectionUi = ui[view];
    if (!sectionUi) return;
    document.querySelectorAll(`[data-nav-label="${view}"]`).forEach(el => {
      el.textContent = sectionUi.nav;
    });
    document.querySelectorAll(`.sidebar-sublink[data-nav-view="${view}"]`).forEach(btn => {
      const panel = btn.dataset.navPanel;
      const panelUi = sectionUi.panels[panel];
      if (panelUi) btn.textContent = panelUi.title;
    });
  });
  const menuSettingsLabel = document.querySelector('[data-i18n-nav="settings"]');
  if (menuSettingsLabel && ui.settings) menuSettingsLabel.textContent = ui.settings.nav;
  document.querySelectorAll('.header-settings-sublink').forEach(btn => {
    const panel = btn.dataset.navPanel;
    const panelUi = ui.settings?.panels[panel];
    if (panelUi) btn.textContent = panelUi.title;
  });
}

function updateNavPageHeader(view, panelKey) {
  const section = NAV_SECTIONS[view];
  const lang = getNavLang();
  const panelsUi = getNavPanelsUi(lang);
  const ui = panelsUi[view] || getNavPanelsUi('fr')[view];
  if (!section || !ui) return;
  const panel = ui.panels[panelKey] || ui.panels[section.defaultPanel];
  const titleEl = document.getElementById(section.titleId);
  const descEl = document.getElementById(section.descId);
  if (titleEl) titleEl.textContent = panel.title;
  if (descEl) descEl.textContent = panel.desc;
}

function activateNavPanel(view, panelKey) {
  const section = NAV_SECTIONS[view];
  if (!section) return;
  if (!section.panels.includes(panelKey)) panelKey = section.defaultPanel;
  activeNavPanels[view] = panelKey;
  const panelId = `${section.prefix}${panelKey.charAt(0).toUpperCase()}${panelKey.slice(1)}`;
  document.querySelectorAll(section.panelSelector).forEach(panel => {
    panel.classList.toggle('active', panel.id === panelId);
  });
  document.querySelectorAll(`.sidebar-sublink[data-nav-view="${view}"]`).forEach(btn => {
    btn.classList.toggle('active', btn.dataset.navPanel === panelKey);
  });
  updateNavPageHeader(view, panelKey);
}

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
  if (signupTab) signupTab.classList.remove('active');

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

function showView(view, options = {}) {
  const normalized = normalizeView(view);

  if (isAdminSession) return;

  if (CLIENT_VIEWS.has(normalized) && !isClientAuthenticated()) {
    showLoginPrompt(normalized);
    return;
  }

  hideAllViews();
  const selectors = viewsMap[normalized] || viewsMap.dashboard;
  selectors.forEach(sel => document.querySelectorAll(sel).forEach(el => el.classList.remove('hidden')));

  if (NAV_SECTIONS[normalized] && currentAccount) {
    const panel = options.navPanel || getNavPanelFromHash(normalized);
    displayNavSection(normalized, panel);
    closeAllSidebarNavGroups(normalized);
    setSidebarNavGroupOpen(normalized, true);
  } else {
    closeAllSidebarNavGroups();
    setHeaderSettingsMenuOpen(false);
  }
  if (normalized === 'dashboard' && currentAccount) updateUI(currentAccount);

  try {
    if (NAV_SECTIONS[normalized]) {
      const panel = options.navPanel || getNavPanelFromHash(normalized);
      history.replaceState(null, '', `#${normalized}-${panel}`);
    } else {
      history.replaceState(null, '', `#${normalized}`);
    }
  } catch {
    /* ignore */
  }
  if (!options.keepSidebar) closeSidebar();
}

function fillAdminEditForm(username) {
  const account = accounts.find(acc => acc.username === username);
  if (!account) {
    adminEditName.value = '';
    if (adminEditPin) adminEditPin.value = '';
    adminEditBalance.value = '';
    adminCurrentBalance.textContent = 'Solde actuel : —';
    return;
  }
  const balance = getAccountBalance(account);
  adminEditName.value = account.owner;
  if (adminEditPin) adminEditPin.value = '';
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
  applyUiLocale(visitorLocale);
  btnMenu.classList.remove('hidden');
  if (headerSettingsWrap) headerSettingsWrap.classList.add('hidden');
  setHeaderSettingsMenuOpen(false);
  closeSidebar();
  renderAdminUserList();
  adminSelectUser.value = '';
  fillAdminEditForm('');
  updateLoginViewState();
}

function hideAdminPanel() {
  isAdminSession = false;
  containerAdmin.classList.add('hidden');
}

function updateLoginViewState() {
  if (!appRoot || !containerLogin) return;
  const loginVisible = !containerLogin.classList.contains('hidden') && !isAdminSession;
  appRoot.classList.toggle('is-login-view', loginVisible);
}

function showClientControls() {
  btnMenu.classList.remove('hidden');
  if (headerSettingsWrap) headerSettingsWrap.classList.remove('hidden');
  updateLoginViewState();
}

function hideClientControls() {
  btnMenu.classList.add('hidden');
  if (headerSettingsWrap) headerSettingsWrap.classList.add('hidden');
  setHeaderSettingsMenuOpen(false);
  closeSidebar();
  updateLoginViewState();
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
    updateClientDisplay(currentAccount);
    displayDate(currentAccount.locale);
    applyUiLocale(currentAccount.locale);
    return true;
  }
  return false;
}

function logout() {
  setHeaderSettingsMenuOpen(false);
  hideAllViews();
  containerDashboard.classList.add('hidden');
  hideAdminPanel();
  hideClientControls();
  containerLogin.classList.remove('hidden');
  applyUiLocale(visitorLocale);
  updateLoginViewState();
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

function setMenuToggleState(isOpen) {
  if (!btnMenu) return;
  btnMenu.classList.toggle('is-open', isOpen);
  btnMenu.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  btnMenu.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
}

function openSidebar() {
  sidebar.classList.remove('hidden');
  sidebar.classList.add('open');
  sidebarOverlay.classList.remove('hidden');
  document.body.classList.add('menu-open');
  setMenuToggleState(true);
}

function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.add('hidden');
  sidebar.classList.add('hidden');
  document.body.classList.remove('menu-open');
  setMenuToggleState(false);
}

function toggleSidebar() {
  if (sidebar.classList.contains('open')) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

function displayDate(locale = 'fr-FR') {
  labelDate.textContent = new Date().toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function displayNavSection(view, panelKey) {
  if (!currentAccount) return;
  const panel = panelKey || NAV_SECTIONS[view].defaultPanel;
  activateNavPanel(view, panel);

  if (view === 'services') updateServiceForms(currentAccount);
  if (view === 'settings') updateSettingsForms(currentAccount);
  if (view === 'accounts') {
    renderAccountProducts(currentAccount);
    renderSavings(currentAccount);
  }
  if (view === 'investments') renderInvestments(currentAccount);
  if (view === 'support') renderTickets(currentAccount);

  updateAllNavLabels();
}

function displayServices(panelKey = 'profile') {
  displayNavSection('services', panelKey);
}

function updateSettingsForms(account) {
  ensureAccountSettings(account);
  if (settingsName) settingsName.value = account.owner;
  if (settingsEmail) settingsEmail.value = account.username;
  if (settingsNotifyEmail) settingsNotifyEmail.checked = account.notifications.email;
  if (settingsNotifySms) settingsNotifySms.checked = account.notifications.sms;
  if (settingsNotifyOperations) settingsNotifyOperations.checked = account.notifications.operations;
  if (settingsLocale) settingsLocale.value = account.locale;
  if (settingsCurrency) settingsCurrency.value = account.currency;
  if (settingsHideBalanceHero) settingsHideBalanceHero.checked = account.preferences.hideBalanceHero;
  if (settingsCompactMovements) settingsCompactMovements.checked = account.preferences.compactMovements;
  if (settingsMaskBalances) settingsMaskBalances.checked = account.preferences.maskBalances;
  updateCountryHint(account.locale);
  if (settingsCurrentPin) settingsCurrentPin.value = '';
  if (settingsNewPin) settingsNewPin.value = '';
  if (settingsConfirmPin) settingsConfirmPin.value = '';

  if (settingsAccountInfo) {
    const balance = getAccountBalance(account);
    settingsAccountInfo.innerHTML = `
      <li><strong>Nom</strong><span>${account.owner}</span></li>
      <li><strong>Email</strong><span>${account.username}</span></li>
      <li><strong>Solde</strong><span>${formatCurrency(balance, account.locale, account.currency)}</span></li>
      <li><strong>Produits actifs</strong><span>${account.accountProducts.length}</span></li>
      <li><strong>Bénéficiaires</strong><span>${account.beneficiaries.length}</span></li>`;
  }
}

function displaySettings(panelKey = 'profile') {
  displayNavSection('settings', panelKey);
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

function displayAccounts(account, panelKey = 'summary') {
  if (account) currentAccount = account;
  displayNavSection('accounts', panelKey);
}

function displayInvestments(account, panelKey = 'portfolio') {
  if (account) currentAccount = account;
  displayNavSection('investments', panelKey);
}

function displaySupportPage(account, panelKey = 'faq') {
  if (account) currentAccount = account;
  displayNavSection('support', panelKey);
}

// --- Événements ---
initToast();

loginTab.addEventListener('click', () => {
  loginForm.classList.remove('hidden');
  signupForm.classList.add('hidden');
  loginTab.classList.add('active');
  if (signupTab) signupTab.classList.remove('active');
});

if (signupTab) {
  signupTab.addEventListener('click', () => {
    showInfo('Les inscriptions en ligne sont fermées. Contactez votre agence Ecorise Banque.');
    loginTab.click();
  });
}

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
      updateClientDisplay(currentAccount);
      displayDate(currentAccount.locale);
      applyUiLocale(currentAccount.locale);
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
    const newPin = adminEditPin?.value.trim() || '';
    const newBalance = Number(adminEditBalance.value);

    if (!newName) {
      showError('Le nom affiché est requis.');
      return;
    }
    if (newPin && newPin.length < 4) {
      showError('Le mot de passe doit contenir au moins 4 caractères.');
      return;
    }
    if (!Number.isFinite(newBalance)) {
      showError('Indiquez un solde valide.');
      return;
    }

    const previousBalance = getAccountBalance(account);
    account.owner = newName;
    if (newPin) account.pin = newPin;
    if (adminEditPin) adminEditPin.value = '';
    const { changed } = syncStatementToBalance(account, newBalance);
    account.statementBalance = roundAmount(getAccountBalance(account));
    await persistAccounts();

    renderAdminUserList();
    adminSelectUser.value = username;
    fillAdminEditForm(username);

    if (currentAccount?.username === username) updateUI(currentAccount);

    const finalBalance = getAccountBalance(account);
    const pinMsg = newPin ? ' — mot de passe mis à jour' : '';
    showSuccess(
      `Compte mis à jour : ${newName} — solde ${formatCurrency(finalBalance, account.locale, account.currency)}${pinMsg}` +
        (changed && newBalance > previousBalance
          ? ' (régularisation entrée ajoutée)'
          : changed && newBalance < previousBalance
            ? ' (régularisation sortie ajoutée)'
            : '')
    );

    if (currentAccount?.username === username && newPin) {
      saveSession(username, newPin, 'user');
    }
  }, 'Mise à jour du compte…');
});

signupForm.addEventListener('submit', e => {
  e.preventDefault();
  showError('Les inscriptions en ligne sont fermées. Contactez votre agence Ecorise Banque.');
  if (!SIGNUP_ENABLED) return;

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

if (btnLogout) btnLogout.addEventListener('click', logout);
btnMenu.addEventListener('click', toggleSidebar);
if (btnSettings) {
  btnSettings.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = headerSettingsMenu && !headerSettingsMenu.classList.contains('hidden');
    setHeaderSettingsMenuOpen(!isOpen);
  });
}
sidebarOverlay.addEventListener('click', closeSidebar);

document.querySelectorAll('[data-nav-toggle]').forEach(toggle => {
  toggle.addEventListener('click', e => {
    e.stopPropagation();
    const view = toggle.dataset.navToggle;
    const submenu = document.getElementById(`sidebarSubmenu-${view}`);
    const isOpen = submenu && !submenu.classList.contains('hidden');
    if (isOpen) {
      setSidebarNavGroupOpen(view, false);
    } else {
      closeAllSidebarNavGroups(view);
      setSidebarNavGroupOpen(view, true);
    }
  });
});

function bindNavSublink(btn, options = {}) {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const view = btn.dataset.navView;
    const panel = btn.dataset.navPanel;
    if (!view || !panel) return;
    if (view === 'settings') setHeaderSettingsMenuOpen(false);
    showView(view, {
      navPanel: panel,
      keepSidebar: options.keepSidebar ?? false,
    });
  });
}

document.querySelectorAll('.sidebar-sublink[data-nav-view]').forEach(btn => {
  bindNavSublink(btn);
});

document.querySelectorAll('.header-settings-sublink').forEach(btn => {
  bindNavSublink(btn);
});

document.addEventListener('click', e => {
  if (!headerSettingsWrap || headerSettingsMenu?.classList.contains('hidden')) return;
  if (headerSettingsWrap.contains(e.target)) return;
  setHeaderSettingsMenuOpen(false);
});

document.querySelectorAll('[data-open-settings]').forEach(btn => {
  btn.addEventListener('click', () => {
    showView('settings', { navPanel: btn.dataset.openSettings || 'profile' });
  });
});

if (settingsProfileForm) {
  settingsProfileForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (!currentAccount) return;
    const name = settingsName.value.trim();
    if (!name) {
      showError('Le nom complet est requis.');
      return;
    }
    currentAccount.owner = name;
    await persistAccounts();
    updateClientDisplay(currentAccount);
    updateSettingsForms(currentAccount);
    updateUI(currentAccount);
    showSuccess('Profil mis à jour.');
  });
}

if (settingsNotificationsForm) {
  settingsNotificationsForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (!currentAccount) return;
    currentAccount.notifications = {
      email: settingsNotifyEmail.checked,
      sms: settingsNotifySms.checked,
      operations: settingsNotifyOperations.checked,
    };
    await persistAccounts();
    showSuccess('Notifications mises à jour.');
  });
}

if (settingsPreferencesForm) {
  settingsPreferencesForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (!currentAccount) return;
    const locale = settingsLocale.value;
    if (!LOCALE_CONFIG[locale]) return;
    currentAccount.locale = locale;
    currentAccount.currency = settingsCurrency.value || getLocaleCurrency(locale);
    currentAccount.preferences.hideBalanceHero = settingsHideBalanceHero.checked;
    currentAccount.preferences.compactMovements = settingsCompactMovements.checked;
    await persistAccounts();
    displayDate(currentAccount.locale);
    updateSettingsForms(currentAccount);
    applyUiLocale(locale);
    updateUI(currentAccount);
    showSuccess(t('localeUpdated', locale));
  });
}

if (settingsLocale) {
  settingsLocale.addEventListener('change', () => {
    if (!currentAccount) return;
    settingsCurrency.value = getLocaleCurrency(settingsLocale.value);
    updateCountryHint(settingsLocale.value);
  });
}

if (settingsSecurityForm) {
  settingsSecurityForm.addEventListener('submit', e => {
    e.preventDefault();
    if (!currentAccount) return;
    const currentPin = settingsCurrentPin.value;
    const newPin = settingsNewPin.value.trim();
    const confirmPin = settingsConfirmPin.value.trim();
    if (currentPin || newPin || confirmPin) {
      settingsCurrentPin.value = settingsNewPin.value = settingsConfirmPin.value = '';
      showError(
        'Impossible de modifier votre mot de passe. Cette opération est réservée à l’administration de la banque. Contactez votre conseiller Ecorise Banque.'
      );
    }
  });
}

if (settingsPrivacyForm) {
  settingsPrivacyForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (!currentAccount) return;
    currentAccount.preferences.maskBalances = settingsMaskBalances.checked;
    await persistAccounts();
    updateUI(currentAccount);
    showSuccess('Paramètres de confidentialité enregistrés.');
  });
}

adminSelectUser.addEventListener('change', function () {
  adminUserList.querySelectorAll('li').forEach(li => {
    li.classList.toggle('selected', li.dataset.username === this.value);
  });
  fillAdminEditForm(this.value);
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

  if (pin.length > 0) {
    servicePin.value = '';
    showError(
      'Impossible de modifier votre mot de passe. Cette opération est réservée à l’administration de la banque. Contactez votre conseiller Ecorise Banque.'
    );
    if (name !== currentAccount.owner) {
      currentAccount.owner = name;
      persistAccounts();
      updateUI(currentAccount);
      showInfo('Votre nom a été mis à jour. Le mot de passe n’a pas été modifié.');
    }
    return;
  }

  currentAccount.owner = name;
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
  const accountCheck = validateBankAccountField(beneficiaryAccount.value);
  const bicCheck = validateBicField(beneficiaryBic.value);
  if (!name || !email) {
    showError('Complétez tous les champs bénéficiaire.');
    return;
  }
  if (!accountCheck.ok) {
    beneficiaryAccount.value = accountCheck.value;
    showError(accountCheck.message);
    return;
  }
  if (!bicCheck.ok) {
    beneficiaryBic.value = bicCheck.value;
    showError(bicCheck.message);
    return;
  }
  currentAccount.beneficiaries.push({
    name,
    email,
    account: accountCheck.value,
    bic: bicCheck.value,
  });
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

  const accountInput = document.getElementById('transferAccountNumber');
  const bicInput = document.getElementById('transferBic');
  const accountCheck = validateBankAccountField(accountInput?.value);
  const bicCheck = validateBicField(bicInput?.value);

  if (!accountCheck.ok) {
    if (accountInput) accountInput.value = accountCheck.value;
    showError(accountCheck.message);
    return;
  }
  if (!bicCheck.ok) {
    if (bicInput) bicInput.value = bicCheck.value;
    showError(bicCheck.message);
    return;
  }
  if (accountInput) accountInput.value = accountCheck.value;
  if (bicInput) bicInput.value = bicCheck.value;

  await withLoader(async () => {
    openTransferBlockedModal();
  }, 'Traitement du virement…');
});

transferBlockedClose?.addEventListener('click', closeTransferBlockedModal);
transferBlockedOk?.addEventListener('click', closeTransferBlockedModal);
transferBlockedContact?.addEventListener('click', openTransferSupportContact);
transferBlockedOverlay?.addEventListener('click', closeTransferBlockedModal);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && transferBlockedModal && !transferBlockedModal.classList.contains('hidden')) {
    closeTransferBlockedModal();
  }
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

document.querySelectorAll('.menu-card[href], .sidebar-link[href]').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    const view = (this.getAttribute('href') || '').replace('#', '').trim();
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
    for (const navView of NAV_VIEWS_WITH_PANELS) {
      if (view.startsWith(`${navView}-`)) {
        const panel = view.replace(`${navView}-`, '');
        showView(navView, {
          navPanel: NAV_SECTIONS[navView].panels.includes(panel) ? panel : NAV_SECTIONS[navView].defaultPanel,
          keepSidebar: true,
        });
        return;
      }
    }
    showView(map[view] || view || 'dashboard');
  });
});

// --- Init ---
async function initApp() {
  await initUiLocale();
  bindBankingInputs();
  populateLocaleOptions();
  populateCurrencyOptions();
  await syncAccountsFromServer();

  tryAutoLogin();
  rebindCurrentAccount();
  applyUiLocale(getActiveLocale());

  const rawHash = (location.hash || '').replace('#', '').trim() || 'dashboard';
  if (isAdminSession) {
    hideAllViews();
    renderAdminUserList();
  } else {
    let matched = false;
    for (const navView of NAV_VIEWS_WITH_PANELS) {
      if (rawHash.startsWith(`${navView}-`)) {
        const panel = rawHash.replace(`${navView}-`, '');
        showView(navView, {
          navPanel: NAV_SECTIONS[navView].panels.includes(panel)
            ? panel
            : NAV_SECTIONS[navView].defaultPanel,
        });
        matched = true;
        break;
      }
    }
    if (!matched) {
      showView(normalizeView(rawHash));
    }
  }

  updateLoginViewState();
}

initApp();

window.addEventListener('hashchange', () => {
  const raw = (location.hash || '').replace('#', '').trim() || 'dashboard';
  for (const navView of NAV_VIEWS_WITH_PANELS) {
    if (raw.startsWith(`${navView}-`)) {
      const panel = raw.replace(`${navView}-`, '');
      showView(navView, {
        navPanel: NAV_SECTIONS[navView].panels.includes(panel)
          ? panel
          : NAV_SECTIONS[navView].defaultPanel,
        keepSidebar: true,
      });
      return;
    }
  }
  showView(normalizeView(raw));
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
