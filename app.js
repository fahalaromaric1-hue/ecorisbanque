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
    return { ok: false, value, message: msg('valAccountRequired') };
  }
  if (!BANK_ACCOUNT_PATTERN.test(value)) {
    return { ok: false, value, message: msg('valAccountInvalid') };
  }
  if (isIbanFormat(value) && !ibanCheckDigitsValid(value)) {
    return { ok: false, value, message: msg('valIbanInvalid') };
  }
  if (!isValidBankAccount(value)) {
    return {
      ok: false,
      value,
      message: msg('valAccountLength', {
        min: BANK_ACCOUNT_MIN_LEN,
        max: BANK_ACCOUNT_MAX_LEN,
      }),
    };
  }
  return { ok: true, value };
}

function validateBicField(raw) {
  const value = normalizeBicInput(raw);
  if (!value) {
    return { ok: false, value, message: msg('valBicRequired') };
  }
  if (!isValidBic(value)) {
    return { ok: false, value, message: msg('valBicInvalid') };
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
    "owner": "Ingo Franc",
    "username": "ingofranc@gmail.com",
    "pin": "franc123",
    "movements": [
      200000,
      300000,
      350000,
      250000,
      -5000,
      -12000,
      4500,
      -1400,
      4800,
      200,
      -15,
      -185,
      -950,
      14250,
      30600,
      800000,
      2400000
    ],
    "movementDates": [
      "2023-10-18T09:30:00.000Z",
      "2023-11-14T00:23:30.211Z",
      "2024-01-10T01:26:43.521Z",
      "2024-05-09T11:40:11.620Z",
      "2024-06-16T12:22:20.493Z",
      "2024-11-15T15:10:55.986Z",
      "2024-12-21T03:02:16.268Z",
      "2025-03-07T04:26:34.014Z",
      "2025-03-30T00:03:51.338Z",
      "2025-07-03T01:49:13.521Z",
      "2025-08-22T18:45:25.352Z",
      "2026-01-09T05:19:57.887Z",
      "2026-02-08T15:29:40.986Z",
      "2026-04-19T08:46:57.254Z",
      "2026-06-02T17:36:07.606Z",
      "2026-09-12T03:28:31.268Z",
      "2026-10-02T10:15:00.000Z"
    ],
    "movementLabels": [
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "Dépôt espèces",
      "Frais de tenue de compte",
      "Retrait DAB",
      "",
      "",
      "",
      "Virement reçu — 800000 EUR",
      "Virement reçu — 2400000 EUR"
    ],
    "interestRate": 1.2,
    "locale": "fr-FR",
    "currency": "EUR",
    "notifications": {
      "email": true,
      "sms": false,
      "operations": false
    },
    "beneficiaries": [],
    "accountProducts": [
      {
        "name": "Compte courant",
        "status": "Actif"
      },
      {
        "name": "Livret épargne",
        "status": "Actif"
      }
    ],
    "savings": [
      {
        "name": "Livret A",
        "balance": 1200
      },
      {
        "name": "Plan épargne",
        "balance": 5400
      }
    ],
    "investments": [
      {
        "product": "Actions",
        "amount": 200,
        "date": "2026-05-10"
      }
    ],
    "supportRequests": [
      {
        "subject": "Bloqué sur transfert",
        "message": "Impossible de finaliser le virement.",
        "status": "Ouvert",
        "date": "2026-05-28"
      }
    ],
    "preferences": {
      "hideBalanceHero": false,
      "compactMovements": false,
      "maskBalances": false
    },
    "statementBalance": 4334800,
    "balance": 4334800
  },
  {
    "owner": "Marie Dubois",
    "username": "md",
    "pin": "2222",
    "movements": [
      500,
      340,
      -300,
      -20,
      -460,
      200,
      190,
      1000,
      80000,
      20000,
      15000,
      -500,
      -12,
      -800,
      12215
    ],
    "movementDates": [
      "2023-10-22T08:45:00.000Z",
      "2023-11-21T03:26:31.667Z",
      "2024-01-23T22:55:30.953Z",
      "2024-06-06T16:03:22.778Z",
      "2024-07-19T05:02:42.302Z",
      "2025-01-05T09:00:00.397Z",
      "2025-02-14T01:55:22.619Z",
      "2025-05-10T03:54:01.667Z",
      "2025-06-04T16:29:37.381Z",
      "2025-09-19T00:57:56.191Z",
      "2025-11-14T18:17:02.223Z",
      "2026-04-19T17:54:33.810Z",
      "2026-05-23T18:42:01.429Z",
      "2026-08-09T18:30:47.223Z",
      "2026-09-28T09:40:00.000Z"
    ],
    "interestRate": 1.5,
    "locale": "fr-FR",
    "currency": "EUR",
    "notifications": {
      "email": true,
      "sms": false,
      "operations": false
    },
    "beneficiaries": [],
    "accountProducts": [
      {
        "name": "Compte courant",
        "status": "Actif"
      },
      {
        "name": "Compte joint",
        "status": "Actif"
      }
    ],
    "savings": [
      {
        "name": "Livret A",
        "balance": 900
      }
    ],
    "investments": [
      {
        "product": "Fonds",
        "amount": 120,
        "date": "2026-05-26"
      }
    ],
    "supportRequests": [],
    "preferences": {
      "hideBalanceHero": false,
      "compactMovements": false,
      "maskBalances": false
    },
    "movementLabels": [
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "Virement reçu — salaire",
      "Dépôt espèces",
      "Virement reçu — remboursement",
      "Retrait DAB",
      "Frais de tenue de compte",
      "Virement émis — loyer",
      "Virement reçu — versement complémentaire"
    ],
    "statementBalance": 127353,
    "balance": 127353
  },
  {
    "owner": "sabrine nattes",
    "username": "sabrine.nattes@ecoris.demo",
    "pin": "Galet-6744",
    "movements": [
      400000,
      250000,
      250000,
      150000,
      100000,
      80000,
      -400,
      -250,
      -18,
      -12,
      -1200,
      -186,
      -320,
      -85,
      7027
    ],
    "movementDates": [
      "2023-10-20T11:10:00.000Z",
      "2023-11-19T12:29:51.667Z",
      "2024-01-22T22:12:25.238Z",
      "2024-06-06T21:22:16.111Z",
      "2024-07-19T19:50:38.492Z",
      "2025-01-07T13:44:08.016Z",
      "2025-02-16T15:30:36.905Z",
      "2025-05-13T12:27:21.667Z",
      "2025-06-08T06:44:23.096Z",
      "2025-09-23T14:55:19.048Z",
      "2025-11-19T20:53:08.889Z",
      "2026-04-26T07:17:10.952Z",
      "2026-05-30T15:39:52.857Z",
      "2026-08-17T08:51:53.889Z",
      "2026-10-06T11:05:00.000Z"
    ],
    "interestRate": 1.2,
    "locale": "fr-FR",
    "currency": "EUR",
    "notifications": {
      "email": true,
      "sms": false,
      "operations": false
    },
    "preferences": {
      "hideBalanceHero": false,
      "compactMovements": false,
      "maskBalances": false
    },
    "beneficiaries": [],
    "accountProducts": [
      {
        "name": "Compte courant",
        "status": "Actif"
      }
    ],
    "savings": [
      {
        "name": "Livret A",
        "balance": 0
      }
    ],
    "investments": [],
    "supportRequests": [],
    "movementLabels": [
      "Dépôt d'ouverture",
      "Virement reçu — salaire",
      "Virement reçu — salaire juin",
      "Dépôt espèces",
      "Virement reçu — remboursement",
      "Virement reçu — prestation",
      "Retrait DAB",
      "Retrait DAB — agence",
      "Frais de tenue de compte",
      "Frais bancaires",
      "Virement émis — loyer",
      "Virement émis — électricité",
      "Paiement carte — courses",
      "Paiement carte — carburant",
      "Virement reçu — versement"
    ],
    "balance": 1234556,
    "statementBalance": 1234556
  }
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

function adoptAccounts(nextAccounts) {
  accounts.length = 0;
  nextAccounts.forEach(account => {
    ensureAccountSettings(account);
    accounts.push(account);
  });
  stateEpoch += 1;
}

let serverSyncAvailable = false;
let serverHydrated = false;
let syncOfflineNotified = false;
let stateEpoch = 0;
let syncPromise = null;
let serverRevision = null;
let serverSnapshot = [];

const ACCOUNTS_SYNC_MS = 4000;

function revisionFromResponse(response) {
  const raw = response.headers.get('X-Accounts-Revision');
  if (raw == null || raw === '') return null;
  const value = Number(raw);
  return Number.isInteger(value) && value >= 0 ? value : null;
}

function rememberServerRevision(revision) {
  if (Number.isInteger(revision) && revision >= 0) serverRevision = revision;
}

function refreshSharedAccountViews() {
  rebindCurrentAccount();
  if (currentAccount) updateUI(currentAccount);
  if (!isAdminSession || !adminUserList) return;

  const selected = adminSelectUser?.value || '';
  const active = document.activeElement;
  const editing = Boolean(
    active &&
      (adminEditForm?.contains(active) ||
        adminCreateForm?.contains(active) ||
        adminTransferForm?.contains(active))
  );
  renderAdminUserList();
  if (!selected) return;
  if (editing) {
    if (adminSelectUser) adminSelectUser.value = selected;
    return;
  }
  refreshAdminAccount(selected);
}

async function syncAccountsFromServer({ notify = false } = {}) {
  if (syncPromise) return syncPromise;

  const job = (async () => {
    const wasOnline = serverSyncAvailable;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch(ACCOUNTS_API, { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const parsed = await response.json();
        if (!Array.isArray(parsed) || !parsed.length) throw new Error('Données invalides');
        const revision = revisionFromResponse(response);
        if (serverHydrated && revision !== null && revision === serverRevision) {
          serverSyncAvailable = true;
          syncOfflineNotified = false;
          return true;
        }
        adoptAccounts(parsed.map(cloneAccount));
        rememberServerRevision(revision);
        captureServerSnapshot();
        saveAccounts(accounts);
        serverSyncAvailable = true;
        serverHydrated = true;
        refreshSharedAccountViews();
        if (notify && !wasOnline && syncOfflineNotified) {
          showSuccess(msg('syncRestored'));
        }
        syncOfflineNotified = false;
        return true;
      } catch (error) {
        if (attempt === 0) {
          await new Promise(resolve => setTimeout(resolve, 600));
          continue;
        }
        serverSyncAvailable = false;
        if (!serverHydrated) adoptAccounts(loadAccounts().map(cloneAccount));
        rebindCurrentAccount();
        console.warn('Synchronisation serveur indisponible, cache local utilisé.', error);
        if (notify && !syncOfflineNotified) {
          showInfo(msg('syncOffline'));
          syncOfflineNotified = true;
        }
        return false;
      }
    }
    return false;
  })();

  syncPromise = job;
  try {
    return await job;
  } finally {
    if (syncPromise === job) syncPromise = null;
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
  account.movementLabels[account.movements.length - 1] = label;
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

function msg(key, vars) {
  return t(key, getActiveLocale(), vars);
}

function getMovementLabel(line, locale = getActiveLocale()) {
  if (line.label === RELEVE_LABEL_IN) return msg('releveIn');
  if (line.label === RELEVE_LABEL_OUT) return msg('releveOut');
  if (line.type === 'deposit') return msg('deposit');
  if (line.type === 'withdrawal') return msg('withdrawal');
  return line.label || line.type || '';
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

async function withLoader(fn, message = null) {
  const loaderMessage = message || msg('loading');
  const loader = document.getElementById('appLoader');
  const loaderText = document.getElementById('appLoaderText');
  if (loader) {
    if (loaderText) loaderText.textContent = loaderMessage;
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
  const loc = account.locale || getActiveLocale();
  const lang = getLangFromLocale(loc);
  const now = new Date().toLocaleDateString(loc, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const rows = lines
    .map((line, i) => {
      const label = getMovementLabel(line, loc);
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
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <title>${msg('exportTitle')} — ${account.owner}</title>
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
  <p class="meta">${t('exportTitle', loc)} — ${account.owner} (${account.username})<br/>${t('exportEdited', loc)} ${now}</p>
  <table>
    <thead>
      <tr><th>${t('exportColNum', loc)}</th><th>${t('exportColDate', loc)}</th><th>${t('exportColOperation', loc)}</th><th>${t('exportColAmount', loc)}</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="totals">
    <div><span>${t('totalIn', loc)}</span><strong>${formatCurrency(totalIn, account.locale, account.currency)}</strong></div>
    <div><span>${t('totalOut', loc)}</span><strong>${formatCurrency(totalOut, account.locale, account.currency)}</strong></div>
    <div class="balance"><span>${t('balance', loc)}</span><span>${formatCurrency(balance, account.locale, account.currency)}</span></div>
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
const adminAccess = document.getElementById('adminAccess');
const adminAccessEmail = document.getElementById('adminAccessEmail');
const adminAccessPassword = document.getElementById('adminAccessPassword');
const adminCreateForm = document.getElementById('adminCreateForm');
const adminCreateName = document.getElementById('adminCreateName');
const adminCreatedCredentials = document.getElementById('adminCreatedCredentials');
const adminCreatedEmail = document.getElementById('adminCreatedEmail');
const adminCreatedPassword = document.getElementById('adminCreatedPassword');
const adminTransfers = document.getElementById('adminTransfers');
const adminTransferList = document.getElementById('adminTransferList');
const adminTransferEmpty = document.getElementById('adminTransferEmpty');
const adminTransferForm = document.getElementById('adminTransferForm');
const adminTransferAmount = document.getElementById('adminTransferAmount');
const adminTransferLabel = document.getElementById('adminTransferLabel');
const adminTransferDirection = document.getElementById('adminTransferDirection');

function captureServerSnapshot() {
  serverSnapshot = accounts.map(cloneAccount);
}

function accountKey(account) {
  return String(account?.username || '').trim().toLowerCase();
}

function diffAccounts(base, current) {
  const baseMap = new Map((base || []).map(account => [accountKey(account), account]));
  const currentMap = new Map((current || []).map(account => [accountKey(account), account]));
  const changed = [];
  const removed = [];
  for (const [key, account] of currentMap) {
    const previous = baseMap.get(key);
    if (!previous || JSON.stringify(previous) !== JSON.stringify(account)) changed.push(cloneAccount(account));
  }
  for (const key of baseMap.keys()) {
    if (!currentMap.has(key)) removed.push(key);
  }
  return { changed, removed };
}

function applyAccountDelta(freshAccounts, delta) {
  const next = freshAccounts.map(cloneAccount);
  for (const key of delta.removed) {
    const index = next.findIndex(account => accountKey(account) === key);
    if (index >= 0) next.splice(index, 1);
  }
  for (const account of delta.changed) {
    const key = accountKey(account);
    const index = next.findIndex(item => accountKey(item) === key);
    if (index >= 0) next[index] = cloneAccount(account);
    else next.push(cloneAccount(account));
  }
  return next;
}

async function readServerAccounts() {
  const response = await fetch(ACCOUNTS_API, { cache: 'no-store' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const parsed = await response.json();
  if (!Array.isArray(parsed) || !parsed.length) throw new Error('Données invalides');
  return { accounts: parsed, revision: revisionFromResponse(response) };
}

async function persistAccounts() {
  const intended = accounts.map(cloneAccount);
  const base = serverSnapshot.map(cloneAccount);
  if (syncPromise) await syncPromise;

  if (!serverHydrated || serverRevision == null) {
    const synced = await syncAccountsFromServer();
    if (!synced) {
      saveAccounts(intended);
      showError(msg('syncSaveLocal'));
      return false;
    }
    return false;
  }

  const delta = diffAccounts(base, intended);
  if (!delta.changed.length && !delta.removed.length) return true;

  try {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const fresh = await readServerAccounts();
      const merged = applyAccountDelta(fresh.accounts, delta);
      const response = await fetch(ACCOUNTS_API, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'If-Match': String(fresh.revision),
        },
        body: JSON.stringify(merged),
      });
      if (response.status === 409) continue;
      if (response.status === 400 || response.status === 428) {
        let message = response.status === 400
          ? 'Écriture refusée : le solde ne correspond pas aux mouvements.'
          : msg('syncConflict');
        try {
          const body = await response.json();
          if (body?.error) message = body.error;
        } catch {
          /* ignore */
        }
        showError(message);
        await syncAccountsFromServer();
        refreshSharedAccountViews();
        return false;
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const body = await response.json().catch(() => ({}));
      serverSyncAvailable = true;
      if (Array.isArray(body.accounts) && body.accounts.length) {
        adoptAccounts(body.accounts.map(cloneAccount));
      } else {
        adoptAccounts(merged.map(cloneAccount));
      }
      rememberServerRevision(
        Number.isInteger(body.revision) ? body.revision : revisionFromResponse(response)
      );
      captureServerSnapshot();
      saveAccounts(accounts);
      refreshSharedAccountViews();
      return true;
    }
  } catch (error) {
    serverSyncAvailable = false;
    saveAccounts(intended);
    console.warn('Impossible de synchroniser les comptes sur le serveur.', error);
    showError(msg('syncSaveLocal'));
    return false;
  }

  showError(msg('syncConflict'));
  await syncAccountsFromServer();
  refreshSharedAccountViews();
  return false;
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
    containerMovements.innerHTML = `<p class="empty-state">${msg('noMovements')}</p>`;
    updateMovementsToggle(0, 0, sort);
    if (statementFooter) statementFooter.classList.add('hidden');
    if (spendingChart) spendingChart.innerHTML = '';
    return;
  }

  lines.forEach((line, i) => {
    const operationLabel = getMovementLabel(line, account.locale);
    const balanceAfter = balanceByIndex.get(line.index);
    const balanceHtml =
      !sort && balanceAfter !== undefined
        ? `<p class="movement-balance">${msg('movementBalancePrefix')} : ${formatCurrency(balanceAfter, account.locale, account.currency)}</p>`
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
    ? msg('showLess')
    : total - shown > 1
      ? msg('showMoreOps', { n: total - shown })
      : msg('showMoreOne');
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
      <span>${msg('totalIn')}</span>
      <strong>${formatCurrency(totalIn, account.locale, account.currency)}</strong>
    </div>
    <div class="statement-footer__row">
      <span>${msg('totalOut')}</span>
      <strong>${formatCurrency(totalOut, account.locale, account.currency)}</strong>
    </div>
    <div class="statement-footer__row statement-footer__row--total">
      <span>${msg('statementBalanceLabel')}</span>
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
    showInfo(msg('loginRequired'));
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

const DEMO_EMAIL_DOMAIN = 'ecoris.demo';

function slugifyAccountName(name) {
  return String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .replace(/\.{2,}/g, '.');
}

function generateClientEmail(owner) {
  const base = slugifyAccountName(owner) || 'client';
  const taken = new Set(accounts.map(account => String(account.username).toLowerCase()));
  taken.add(ADMIN.username.toLowerCase());
  let email = `${base}@${DEMO_EMAIL_DOMAIN}`;
  let suffix = 2;
  while (taken.has(email)) {
    email = `${base}${suffix}@${DEMO_EMAIL_DOMAIN}`;
    suffix += 1;
  }
  return email;
}

function generateClientPassword(owner) {
  const words = ['Rivage', 'Cedre', 'Brise', 'Noyer', 'Sauge', 'Azur', 'Erable', 'Galet'];
  const foldedName = slugifyAccountName(owner).replace(/\./g, '');
  for (let attempt = 0; attempt < words.length; attempt += 1) {
    const word = words[(attempt + Math.floor(Math.random() * words.length)) % words.length];
    const digits = String(1000 + Math.floor(Math.random() * 9000));
    const password = `${word}-${digits}`;
    const foldedPassword = password.toLowerCase().replace(/[^a-z0-9]/g, '');
    const collides =
      foldedName &&
      (foldedPassword.includes(foldedName) || foldedName.includes(foldedPassword));
    if (!collides && password.length >= 8) return password;
  }
  return `Ecoris-${String(100000 + Math.floor(Math.random() * 900000))}`;
}

function isProtectedAdminAccount(username) {
  return String(username || '').trim().toLowerCase() === ADMIN.username.toLowerCase();
}

function dropClientSession(username) {
  const target = String(username || '').trim().toLowerCase();
  const session = readSession();
  if (session && session.role !== 'admin' && String(session.username || '').toLowerCase() === target) {
    clearSession();
  }
  if (currentAccount && String(currentAccount.username || '').toLowerCase() === target) {
    currentAccount = null;
  }
}

async function deleteAdminAccount(username) {
  if (!isAdminSession) return;
  if (isProtectedAdminAccount(username)) {
    showError('Le compte administrateur ne peut pas être supprimé.');
    return;
  }

  const index = accounts.findIndex(acc => acc.username === username);
  if (index < 0) return;
  if (accounts.length <= 1) {
    showError('Impossible de supprimer le dernier compte client.');
    return;
  }

  const account = accounts[index];
  const confirmed = window.confirm(
    `Supprimer le compte de ${account.owner} (${account.username}) ?\n\nLe compte, ses virements et toutes ses données seront effacés. Cette action est irréversible.`
  );
  if (!confirmed) return;

  accounts.splice(index, 1);
  dropClientSession(username);
  if (adminCreatedEmail && adminCreatedEmail.textContent === username && adminCreatedCredentials) {
    adminCreatedCredentials.classList.add('hidden');
  }
  const saved = await persistAccounts();
  if (!saved) return;

  const stillSelected = adminSelectUser && adminSelectUser.value === username;
  renderAdminUserList();
  if (stillSelected) {
    adminSelectUser.value = '';
    fillAdminEditForm('');
  } else if (adminSelectUser?.value) {
    refreshAdminAccount(adminSelectUser.value);
  }
  showSuccess(`Compte supprimé : ${account.owner}`);
}

function rememberAccountBalance(account) {
  const balance = roundAmount(getAccountBalance(account));
  account.balance = balance;
  account.statementBalance = balance;
  return balance;
}

function renderAdminTransfers(username) {
  if (!adminTransfers || !adminTransferList) return;
  const account = accounts.find(acc => acc.username === username);
  if (!account) {
    adminTransfers.classList.add('hidden');
    adminTransferList.innerHTML = '';
    return;
  }

  adminTransfers.classList.remove('hidden');
  ensureMovementLabels(account);
  ensureMovementDatesLength(account);
  adminTransferList.innerHTML = '';
  if (adminTransferEmpty) adminTransferEmpty.classList.toggle('hidden', account.movements.length > 0);

  account.movements.forEach((amount, index) => {
    const storedLabel = (account.movementLabels[index] || '').trim();
    const label = storedLabel || (amount >= 0 ? 'Virement reçu' : 'Virement émis');
    const direction = amount > 0 ? 'Reçu' : amount < 0 ? 'Émis' : 'Nul';
    const li = document.createElement('li');
    const info = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = label;
    const meta = document.createElement('span');
    meta.textContent = `${direction} · ${formatCurrency(amount, account.locale, account.currency)}`;
    info.append(title, meta);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn--small';
    button.textContent = 'Retirer';
    button.addEventListener('click', () => {
      removeAdminTransfer(username, index);
    });
    li.append(info, button);
    adminTransferList.appendChild(li);
  });
}

function refreshAdminAccount(username) {
  renderAdminUserList();
  if (adminSelectUser) adminSelectUser.value = username;
  adminUserList.querySelectorAll('li').forEach(li => {
    li.classList.toggle('selected', li.dataset.username === username);
  });
  fillAdminEditForm(username);
}

function showCreatedCredentials(email, password) {
  if (!adminCreatedCredentials) return;
  adminCreatedEmail.textContent = email;
  adminCreatedPassword.textContent = password;
  adminCreatedCredentials.classList.remove('hidden');
}

function showAdminAccess(account) {
  if (!adminAccess) return;
  if (!account) {
    adminAccess.classList.add('hidden');
    if (adminAccessEmail) adminAccessEmail.textContent = '';
    if (adminAccessPassword) adminAccessPassword.textContent = '';
    return;
  }
  adminAccessEmail.textContent = account.username;
  adminAccessPassword.textContent = String(account.pin ?? '');
  adminAccess.classList.remove('hidden');
}

function fillAdminEditForm(username) {
  const account = accounts.find(acc => acc.username === username);
  if (!account) {
    adminEditName.value = '';
    if (adminEditPin) adminEditPin.value = '';
    adminEditBalance.value = '';
    adminCurrentBalance.textContent = 'Solde actuel : —';
    showAdminAccess(null);
    renderAdminTransfers('');
    return;
  }
  const balance = getAccountBalance(account);
  adminEditName.value = account.owner;
  if (adminEditPin) adminEditPin.value = '';
  adminEditBalance.value = balance.toFixed(2);
  adminCurrentBalance.textContent = `Solde actuel : ${formatCurrency(balance, account.locale, account.currency)}`;
  showAdminAccess(account);
  renderAdminTransfers(username);
}

function renderAdminUserList() {
  adminUserList.innerHTML = '';
  adminSelectUser.innerHTML = '<option value="">— Choisir un compte —</option>';

  accounts.forEach(account => {
    if (isProtectedAdminAccount(account.username)) return;

    const balance = getAccountBalance(account);
    const li = document.createElement('li');
    li.dataset.username = account.username;

    const identity = document.createElement('div');
    identity.className = 'admin-user-list__identity';
    const title = document.createElement('strong');
    title.textContent = account.owner;
    const meta = document.createElement('span');
    meta.textContent = `${account.username} • ${formatCurrency(balance, account.locale, account.currency)}`;
    identity.append(title, meta);

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'btn btn--small admin-user-delete';
    removeButton.textContent = 'Supprimer';
    removeButton.addEventListener('click', event => {
      event.stopPropagation();
      deleteAdminAccount(account.username);
    });

    li.append(identity, removeButton);
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
  showAccountMenu({ admin: true });
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

function showAccountMenu({ admin = false } = {}) {
  if (headerSettingsWrap) headerSettingsWrap.classList.remove('hidden');
  document.querySelectorAll('#headerSettingsMenu > li').forEach(li => {
    const isLogout = Boolean(li.querySelector('#btnLogout'));
    li.classList.toggle('hidden', admin && !isLogout);
  });
  if (admin) setHeaderSettingsMenuOpen(true);
}

function showClientControls() {
  btnMenu.classList.remove('hidden');
  showAccountMenu({ admin: false });
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
    containerLogin.classList.add('hidden');
    showClientControls();
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
  btnMenu.setAttribute('aria-label', isOpen ? msg('close') : msg('openMenu'));
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
      showSuccess(msg('adminLoginSuccess'));
      inputUsername.value = inputPin.value = '';
      return;
    }

    currentAccount = accounts.find(acc => acc.username === username);
    if (currentAccount?.pin === pin) {
      hideAdminPanel();
      containerLogin.classList.add('hidden');
      showClientControls();
      updateClientDisplay(currentAccount);
      displayDate(currentAccount.locale);
      applyUiLocale(currentAccount.locale);
      saveSession(username, pin, 'user');
      inputUsername.value = inputPin.value = '';
      showSuccess(msg('loginSuccess'));
      const target = pendingView || 'dashboard';
      pendingView = null;
      showView(target);
    } else {
      showError(msg('loginFailed'));
    }
  }, msg('signingIn'));
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
    const finalBalance = rememberAccountBalance(account);
    const saved = await persistAccounts();
    if (!saved) return;

    refreshAdminAccount(username);

    if (currentAccount?.username === username) updateUI(currentAccount);
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

function buildOpeningStatement(targetBalance = 0) {
  const dayMs = 24 * 60 * 60 * 1000;
  const lines = [
    [1800, 'Virement reçu — salaire'],
    [-1850, 'Virement émis — loyer'],
    [640, 'Virement reçu — remboursement'],
    [-710, 'Virement émis — électricité'],
    [320, 'Dépôt espèces'],
    [-275, 'Paiement carte — courses'],
    [210, 'Virement reçu — prestation'],
    [-180, 'Paiement carte — carburant'],
    [150, 'Virement reçu — versement'],
    [-120, 'Retrait DAB'],
    [90, "Dépôt d'ouverture"],
    [-60, 'Frais de tenue de compte'],
    [75, 'Virement reçu — salaire'],
    [-45, 'Retrait DAB — agence'],
    [0, 'Frais bancaires'],
  ];
  const target = roundAmount(targetBalance);
  const subtotal = lines.slice(0, -1).reduce((sum, [amount]) => sum + amount, 0);
  lines[lines.length - 1][0] = roundAmount(target - subtotal);
  if (lines[lines.length - 1][0] === 0) {
    lines[lines.length - 2][0] = roundAmount(lines[lines.length - 2][0] - 10);
    lines[lines.length - 1][0] = 10;
  }

  const gapDays = [21, 45, 90, 30, 120, 28, 60, 21, 75, 40, 100, 24, 55, 35];
  const latest = Date.now() - 4 * dayMs;
  const earliest = new Date(latest);
  earliest.setUTCFullYear(earliest.getUTCFullYear() - 3);
  earliest.setUTCDate(earliest.getUTCDate() + 7);
  const totalDays = gapDays.reduce((sum, days) => sum + days, 0);
  let cursor = Math.max(earliest.getTime(), latest - totalDays * dayMs);
  const movementDates = [new Date(cursor).toISOString()];
  gapDays.forEach(days => {
    cursor += days * dayMs;
    movementDates.push(new Date(Math.min(cursor, latest)).toISOString());
  });

  return {
    movements: lines.map(([amount]) => amount),
    movementLabels: lines.map(([, label]) => label),
    movementDates,
  };
}

if (adminCreateForm) {
  adminCreateForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (!isAdminSession) return;

    const owner = adminCreateName.value.trim();
    if (!owner) {
      showError('Indiquez le nom du compte.');
      return;
    }

    await withLoader(async () => {
      const username = generateClientEmail(owner);
      const pin = generateClientPassword(owner);
      const account = createAccount(owner, username, pin);
      const statement = buildOpeningStatement(0);
      account.movements = statement.movements;
      account.movementDates = statement.movementDates;
      account.movementLabels = statement.movementLabels;
      rememberAccountBalance(account);
      accounts.push(account);
      const saved = await persistAccounts();
      if (!saved) return;
      adminCreateName.value = '';
      showCreatedCredentials(username, pin);
      refreshAdminAccount(username);
      showSuccess(`Compte créé : ${owner}`);
    }, 'Création du compte…');
  });
}

async function removeAdminTransfer(username, index) {
  if (!isAdminSession) return;
  const account = accounts.find(acc => acc.username === username);
  if (!account) return;
  ensureMovementLabels(account);
  ensureMovementDatesLength(account);
  if (!Number.isInteger(index) || index < 0 || index >= account.movements.length) return;

  const removed = account.movements[index];
  account.movements.splice(index, 1);
  account.movementDates.splice(index, 1);
  account.movementLabels.splice(index, 1);
  const balance = rememberAccountBalance(account);
  const saved = await persistAccounts();
  if (!saved) return;
  refreshAdminAccount(username);
  showSuccess(
    `Virement retiré. Solde : ${formatCurrency(balance, account.locale, account.currency)} (${formatCurrency(removed, account.locale, account.currency)})`
  );
}

if (adminTransferForm) {
  adminTransferForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (!isAdminSession) return;

    const username = adminSelectUser.value;
    const account = accounts.find(acc => acc.username === username);
    if (!account) {
      showError('Sélectionnez un compte client.');
      return;
    }

    const amount = roundAmount(Number(adminTransferAmount.value));
    const label = adminTransferLabel.value.trim();
    const direction = adminTransferDirection.value === 'out' ? 'out' : 'in';
    if (!Number.isFinite(amount) || amount <= 0) {
      showError('Indiquez un montant supérieur à zéro.');
      return;
    }
    if (!label) {
      showError('Indiquez le libellé du virement.');
      return;
    }

    await withLoader(async () => {
      const signed = direction === 'out' ? -amount : amount;
      pushMovement(account, signed, label);
      const balance = rememberAccountBalance(account);
      const saved = await persistAccounts();
      if (!saved) return;
      adminTransferAmount.value = '';
      adminTransferLabel.value = '';
      adminTransferDirection.value = 'in';
      refreshAdminAccount(username);
      showSuccess(
        `Virement ${direction === 'out' ? 'émis' : 'reçu'} ajouté. Solde : ${formatCurrency(balance, account.locale, account.currency)}`
      );
    }, 'Ajout du virement…');
  });
}

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
      showError(msg('fullNameRequired'));
      return;
    }
    currentAccount.owner = name;
    await persistAccounts();
    updateClientDisplay(currentAccount);
    updateSettingsForms(currentAccount);
    updateUI(currentAccount);
    showSuccess(msg('profileUpdated'));
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
    showSuccess(msg('notificationsUpdated'));
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
    showSuccess(msg('privacyUpdated'));
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

investForm.addEventListener('submit', async e => {
  e.preventDefault();
  if (!currentAccount) return;
  const amount = Number(investAmount.value);
  const product = document.getElementById('investProduct').value;
  if (amount > 0 && currentAccount.balance >= amount) {
    currentAccount.investments.push({ product, amount, date: new Date().toISOString().slice(0, 10) });
    currentAccount.movements.push(roundAmount(-amount));
    ensureMovementLabels(currentAccount);
    assignDateToNewMovement(currentAccount);
    rememberAccountBalance(currentAccount);
    investAmount.value = '';
    const saved = await persistAccounts();
    if (!saved) return;
    renderInvestments(currentAccount);
    updateUI(currentAccount);
    showSuccess(msg('investmentDone'));
  } else {
    showError(msg('investmentFailed'));
  }
});

ticketForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!currentAccount) return;
  const subject = ticketSubject.value.trim();
  const message = ticketMessage.value.trim();
  if (!subject || !message) {
    showError(msg('fillTicketFields'));
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
  showSuccess(msg('ticketSent'));
});

profileForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!currentAccount) return;
  const name = serviceName.value.trim();
  const pin = servicePin.value.trim();
  if (!name) {
    showError(msg('nameRequired'));
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
    showError(msg('fillBeneficiaryFields'));
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
  showSuccess(msg('beneficiaryAdded'));
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
  showSuccess(msg('supportRequestSent'));
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
  }, msg('processingTransfer'));
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
  showError(msg('loanUnavailable'));
});

btnSort.addEventListener('click', () => {
  sorted = !sorted;
  movementsExpanded = false;
  btnSort.textContent = sorted ? msg('sortActive') : msg('sort');
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
    if (ok) showSuccess(msg('exportOpened'));
    else showError(msg('exportPopup'));
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
  await syncAccountsFromServer({ notify: true });

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
  watchAccountChanges();
}

function watchAccountChanges() {
  window.setInterval(() => {
    if (document.visibilityState === 'hidden') return;
    if (!isAdminSession && !currentAccount) return;
    syncAccountsFromServer();
  }, ACCOUNTS_SYNC_MS);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') syncAccountsFromServer();
  });
  window.addEventListener('focus', () => {
    syncAccountsFromServer();
  });
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
