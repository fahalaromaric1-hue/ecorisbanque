const LOCALE_CONFIG = {
  'fr-FR': { lang: 'fr', label: 'Français', country: 'France', currency: 'EUR', dir: 'ltr' },
  'fr-CA': { lang: 'fr', label: 'Français (Canada)', country: 'Canada', currency: 'CAD', dir: 'ltr' },
  'en-GB': { lang: 'en', label: 'English (UK)', country: 'United Kingdom', currency: 'GBP', dir: 'ltr' },
  'en-US': { lang: 'en', label: 'English (US)', country: 'United States', currency: 'USD', dir: 'ltr' },
  'de-DE': { lang: 'de', label: 'Deutsch', country: 'Deutschland', currency: 'EUR', dir: 'ltr' },
  'es-ES': { lang: 'es', label: 'Español', country: 'España', currency: 'EUR', dir: 'ltr' },
  'es-MX': { lang: 'es', label: 'Español (México)', country: 'México', currency: 'MXN', dir: 'ltr' },
  'it-IT': { lang: 'it', label: 'Italiano', country: 'Italia', currency: 'EUR', dir: 'ltr' },
  'pt-PT': { lang: 'pt', label: 'Português', country: 'Portugal', currency: 'EUR', dir: 'ltr' },
  'pt-BR': { lang: 'pt', label: 'Português (Brasil)', country: 'Brasil', currency: 'BRL', dir: 'ltr' },
  'nl-NL': { lang: 'nl', label: 'Nederlands', country: 'Nederlands', currency: 'EUR', dir: 'ltr' },
  'ar-MA': { lang: 'ar', label: 'العربية', country: 'المغرب', currency: 'MAD', dir: 'rtl' },
};

const I18N = {
  fr: {
    appTitle: 'Ecorise Banque - Banque en ligne',
    welcome: 'Bienvenue',
    guestWelcome: 'Connectez-vous pour accéder à votre compte',
    adminWelcome: 'Espace administrateur',
    logout: 'Se déconnecter',
    menu: 'Menu',
    settings: 'Paramètres',
    close: 'Fermer',
    login: 'Connexion',
    signup: 'Créer un compte',
    email: 'Email',
    password: 'Mot de passe',
    connect: 'Se connecter',
    fullName: 'Nom complet',
    loginNote: 'Entrez votre email et votre mot de passe pour vous connecter.',
    balance: 'Solde',
    availableBalance: 'Solde disponible',
    income: 'Entrées',
    expenses: 'Dépenses',
    interest: 'Intérêts',
    navDashboard: 'Tableau de bord',
    navMyAccounts: 'Mes comptes',
    navTransfer: 'Transferts',
    navLoan: 'Prêts',
    navCards: 'Cartes',
    navServices: 'Services',
    navSettings: 'Paramètres',
    navAccounts: 'Comptes',
    navInvestments: 'Investissements',
    navSupport: 'Assistance',
    sidebarTitle: 'Menu bancaire',
    sidebarSubtitle: 'Choisissez un service',
    movementsHistory: 'Historique des opérations',
    search: 'Rechercher',
    searchMovements: 'Rechercher une opération…',
    exportStatement: 'Exporter le relevé',
    sort: 'Trier',
    filterAll: 'Tous',
    filterDeposits: 'Reçus',
    filterWithdrawals: 'Dépenses',
    showMore: 'Montrer plus',
    showLess: 'Montrer moins',
    showMoreOps: 'Montrer plus ({n} opérations)',
    showMoreOne: 'Montrer plus (1 opération)',
    showChart: 'Afficher le graphique',
    hideChart: 'Masquer le graphique',
    today: 'Aujourd’hui',
    yesterday: 'Hier',
    daysAgo: 'Il y a {n} jours',
    movementBalance: 'Solde',
    deposit: 'Reçu',
    withdrawal: 'Dépense',
    noMovements: 'Aucune opération disponible.',
    loading: 'Chargement…',
    localeUpdated: 'Langue et devise mises à jour.',
    countryLabel: 'Pays',
    languageLabel: 'Langue / région',
    currencyLabel: 'Devise',
    currentAccountBadge: 'Compte courant',
    clientArea: 'Espace client',
    navProfile: 'Profil',
    navBeneficiaries: 'Bénéficiaires',
    navSupportShort: 'Assistance',
    navSavings: 'Épargne',
    navActions: 'Actions',
    navPortfolio: 'Portefeuille',
    navInvest: 'Investir',
    navStrategy: 'Stratégie',
    navFaq: 'FAQ',
    navTickets: 'Tickets',
    navNotifications: 'Notifications',
    navPreferences: 'Préférences',
    navSecurity: 'Sécurité',
    navAccount: 'Compte',
  },
  en: {
    appTitle: 'Ecorise Bank - Online banking',
    welcome: 'Welcome',
    guestWelcome: 'Sign in to access your account',
    adminWelcome: 'Administrator area',
    logout: 'Sign out',
    menu: 'Menu',
    settings: 'Settings',
    close: 'Close',
    login: 'Sign in',
    signup: 'Create account',
    email: 'Email',
    password: 'Password',
    connect: 'Sign in',
    fullName: 'Full name',
    loginNote: 'Enter your email and password to sign in.',
    balance: 'Balance',
    availableBalance: 'Available balance',
    income: 'Income',
    expenses: 'Expenses',
    interest: 'Interest',
    navDashboard: 'Dashboard',
    navMyAccounts: 'My accounts',
    navTransfer: 'Transfers',
    navLoan: 'Loans',
    navCards: 'Cards',
    navServices: 'Services',
    navSettings: 'Settings',
    navAccounts: 'Accounts',
    navInvestments: 'Investments',
    navSupport: 'Support',
    sidebarTitle: 'Bank menu',
    sidebarSubtitle: 'Choose a service',
    movementsHistory: 'Transaction history',
    search: 'Search',
    searchMovements: 'Search a transaction…',
    exportStatement: 'Export statement',
    sort: 'Sort',
    filterAll: 'All',
    filterDeposits: 'Received',
    filterWithdrawals: 'Expenses',
    showMore: 'Show more',
    showLess: 'Show less',
    showMoreOps: 'Show more ({n} transactions)',
    showMoreOne: 'Show more (1 transaction)',
    showChart: 'Show chart',
    hideChart: 'Hide chart',
    today: 'Today',
    yesterday: 'Yesterday',
    daysAgo: '{n} days ago',
    movementBalance: 'Balance',
    deposit: 'Received',
    withdrawal: 'Expense',
    noMovements: 'No transactions available.',
    loading: 'Loading…',
    localeUpdated: 'Language and currency updated.',
    countryLabel: 'Country',
    languageLabel: 'Language / region',
    currencyLabel: 'Currency',
    currentAccountBadge: 'Current account',
    clientArea: 'Client area',
    navProfile: 'Profile',
    navBeneficiaries: 'Beneficiaries',
    navSupportShort: 'Support',
    navSavings: 'Savings',
    navActions: 'Actions',
    navPortfolio: 'Portfolio',
    navInvest: 'Invest',
    navStrategy: 'Strategy',
    navFaq: 'FAQ',
    navTickets: 'Tickets',
    navNotifications: 'Notifications',
    navPreferences: 'Preferences',
    navSecurity: 'Security',
    navAccount: 'Account',
  },
  de: {
    appTitle: 'Ecorise Bank - Online-Banking',
    welcome: 'Willkommen',
    guestWelcome: 'Melden Sie sich an, um auf Ihr Konto zuzugreifen',
    adminWelcome: 'Administratorbereich',
    logout: 'Abmelden',
    menu: 'Menü',
    settings: 'Einstellungen',
    close: 'Schließen',
    login: 'Anmeldung',
    signup: 'Konto erstellen',
    email: 'E-Mail',
    password: 'Passwort',
    connect: 'Anmelden',
    fullName: 'Vollständiger Name',
    loginNote: 'Geben Sie E-Mail und Passwort ein.',
    balance: 'Saldo',
    availableBalance: 'Verfügbarer Saldo',
    income: 'Eingänge',
    expenses: 'Ausgaben',
    interest: 'Zinsen',
    navDashboard: 'Dashboard',
    navMyAccounts: 'Meine Konten',
    navTransfer: 'Überweisungen',
    navLoan: 'Kredite',
    navCards: 'Karten',
    navServices: 'Services',
    navSettings: 'Einstellungen',
    navAccounts: 'Konten',
    navInvestments: 'Investitionen',
    navSupport: 'Support',
    sidebarTitle: 'Bankmenü',
    sidebarSubtitle: 'Wählen Sie einen Service',
    movementsHistory: 'Transaktionsverlauf',
    search: 'Suchen',
    searchMovements: 'Transaktion suchen…',
    exportStatement: 'Kontoauszug exportieren',
    sort: 'Sortieren',
    filterAll: 'Alle',
    filterDeposits: 'Eingänge',
    filterWithdrawals: 'Ausgaben',
    showMore: 'Mehr anzeigen',
    showLess: 'Weniger anzeigen',
    showMoreOps: 'Mehr anzeigen ({n} Transaktionen)',
    showMoreOne: 'Mehr anzeigen (1 Transaktion)',
    showChart: 'Diagramm anzeigen',
    hideChart: 'Diagramm ausblenden',
    today: 'Heute',
    yesterday: 'Gestern',
    daysAgo: 'Vor {n} Tagen',
    movementBalance: 'Saldo',
    deposit: 'Eingang',
    withdrawal: 'Ausgabe',
    noMovements: 'Keine Transaktionen verfügbar.',
    loading: 'Laden…',
    localeUpdated: 'Sprache und Währung aktualisiert.',
    countryLabel: 'Land',
    languageLabel: 'Sprache / Region',
    currencyLabel: 'Währung',
    currentAccountBadge: 'Girokonto',
    clientArea: 'Kundenbereich',
    navProfile: 'Profil',
    navBeneficiaries: 'Begünstigte',
    navSupportShort: 'Support',
    navSavings: 'Sparen',
    navActions: 'Aktionen',
    navPortfolio: 'Portfolio',
    navInvest: 'Investieren',
    navStrategy: 'Strategie',
    navFaq: 'FAQ',
    navTickets: 'Tickets',
    navNotifications: 'Benachrichtigungen',
    navPreferences: 'Einstellungen',
    navSecurity: 'Sicherheit',
    navAccount: 'Konto',
  },
  es: {
    appTitle: 'Ecorise Banco - Banca en línea',
    welcome: 'Bienvenido',
    guestWelcome: 'Inicie sesión para acceder a su cuenta',
    adminWelcome: 'Área de administración',
    logout: 'Cerrar sesión',
    menu: 'Menú',
    settings: 'Ajustes',
    close: 'Cerrar',
    login: 'Iniciar sesión',
    signup: 'Crear cuenta',
    email: 'Correo',
    password: 'Contraseña',
    connect: 'Entrar',
    fullName: 'Nombre completo',
    loginNote: 'Introduzca su correo y contraseña.',
    balance: 'Saldo',
    availableBalance: 'Saldo disponible',
    income: 'Ingresos',
    expenses: 'Gastos',
    interest: 'Intereses',
    navDashboard: 'Panel',
    navMyAccounts: 'Mis cuentas',
    navTransfer: 'Transferencias',
    navLoan: 'Préstamos',
    navCards: 'Tarjetas',
    navServices: 'Servicios',
    navSettings: 'Ajustes',
    navAccounts: 'Cuentas',
    navInvestments: 'Inversiones',
    navSupport: 'Asistencia',
    sidebarTitle: 'Menú bancario',
    sidebarSubtitle: 'Elija un servicio',
    movementsHistory: 'Historial de operaciones',
    search: 'Buscar',
    searchMovements: 'Buscar una operación…',
    exportStatement: 'Exportar extracto',
    sort: 'Ordenar',
    filterAll: 'Todos',
    filterDeposits: 'Ingresos',
    filterWithdrawals: 'Gastos',
    showMore: 'Ver más',
    showLess: 'Ver menos',
    showMoreOps: 'Ver más ({n} operaciones)',
    showMoreOne: 'Ver más (1 operación)',
    showChart: 'Mostrar gráfico',
    hideChart: 'Ocultar gráfico',
    today: 'Hoy',
    yesterday: 'Ayer',
    daysAgo: 'Hace {n} días',
    movementBalance: 'Saldo',
    deposit: 'Ingreso',
    withdrawal: 'Gasto',
    noMovements: 'No hay operaciones disponibles.',
    loading: 'Cargando…',
    localeUpdated: 'Idioma y moneda actualizados.',
    countryLabel: 'País',
    languageLabel: 'Idioma / región',
    currencyLabel: 'Moneda',
    currentAccountBadge: 'Cuenta corriente',
    clientArea: 'Área de cliente',
    navProfile: 'Perfil',
    navBeneficiaries: 'Beneficiarios',
    navSupportShort: 'Asistencia',
    navSavings: 'Ahorro',
    navActions: 'Acciones',
    navPortfolio: 'Cartera',
    navInvest: 'Invertir',
    navStrategy: 'Estrategia',
    navFaq: 'FAQ',
    navTickets: 'Tickets',
    navNotifications: 'Notificaciones',
    navPreferences: 'Preferencias',
    navSecurity: 'Seguridad',
    navAccount: 'Cuenta',
  },
  it: {
    appTitle: 'Ecorise Banca - Banca online',
    welcome: 'Benvenuto',
    guestWelcome: 'Accedi al tuo conto',
    adminWelcome: 'Area amministratore',
    logout: 'Esci',
    menu: 'Menu',
    settings: 'Impostazioni',
    close: 'Chiudi',
    login: 'Accesso',
    signup: 'Crea account',
    email: 'Email',
    password: 'Password',
    connect: 'Accedi',
    fullName: 'Nome completo',
    loginNote: 'Inserisci email e password.',
    balance: 'Saldo',
    availableBalance: 'Saldo disponibile',
    income: 'Entrate',
    expenses: 'Uscite',
    interest: 'Interessi',
    navDashboard: 'Dashboard',
    navMyAccounts: 'I miei conti',
    navTransfer: 'Bonifici',
    navLoan: 'Prestiti',
    navCards: 'Carte',
    navServices: 'Servizi',
    navSettings: 'Impostazioni',
    navAccounts: 'Conti',
    navInvestments: 'Investimenti',
    navSupport: 'Assistenza',
    sidebarTitle: 'Menu banca',
    sidebarSubtitle: 'Scegli un servizio',
    movementsHistory: 'Storico operazioni',
    search: 'Cerca',
    searchMovements: 'Cerca un’operazione…',
    exportStatement: 'Esporta estratto',
    sort: 'Ordina',
    filterAll: 'Tutti',
    filterDeposits: 'Entrate',
    filterWithdrawals: 'Uscite',
    showMore: 'Mostra di più',
    showLess: 'Mostra di meno',
    showMoreOps: 'Mostra di più ({n} operazioni)',
    showMoreOne: 'Mostra di più (1 operazione)',
    showChart: 'Mostra grafico',
    hideChart: 'Nascondi grafico',
    today: 'Oggi',
    yesterday: 'Ieri',
    daysAgo: '{n} giorni fa',
    movementBalance: 'Saldo',
    deposit: 'Entrata',
    withdrawal: 'Uscita',
    noMovements: 'Nessuna operazione disponibile.',
    loading: 'Caricando…',
    localeUpdated: 'Lingua e valuta aggiornate.',
    countryLabel: 'Paese',
    languageLabel: 'Lingua / regione',
    currencyLabel: 'Valuta',
  },
  pt: {
    appTitle: 'Ecorise Banco - Banco online',
    welcome: 'Bem-vindo',
    guestWelcome: 'Inicie sessão para aceder à sua conta',
    adminWelcome: 'Área de administração',
    logout: 'Terminar sessão',
    menu: 'Menu',
    settings: 'Definições',
    close: 'Fechar',
    login: 'Entrar',
    signup: 'Criar conta',
    email: 'Email',
    password: 'Palavra-passe',
    connect: 'Entrar',
    fullName: 'Nome completo',
    loginNote: 'Introduza o email e a palavra-passe.',
    balance: 'Saldo',
    availableBalance: 'Saldo disponível',
    income: 'Entradas',
    expenses: 'Despesas',
    interest: 'Juros',
    navDashboard: 'Painel',
    navMyAccounts: 'As minhas contas',
    navTransfer: 'Transferências',
    navLoan: 'Empréstimos',
    navCards: 'Cartões',
    navServices: 'Serviços',
    navSettings: 'Definições',
    navAccounts: 'Contas',
    navInvestments: 'Investimentos',
    navSupport: 'Apoio',
    sidebarTitle: 'Menu bancário',
    sidebarSubtitle: 'Escolha um serviço',
    movementsHistory: 'Histórico de operações',
    search: 'Pesquisar',
    searchMovements: 'Pesquisar uma operação…',
    exportStatement: 'Exportar extrato',
    sort: 'Ordenar',
    filterAll: 'Todos',
    filterDeposits: 'Entradas',
    filterWithdrawals: 'Despesas',
    showMore: 'Mostrar mais',
    showLess: 'Mostrar menos',
    showMoreOps: 'Mostrar mais ({n} operações)',
    showMoreOne: 'Mostrar mais (1 operação)',
    showChart: 'Mostrar gráfico',
    hideChart: 'Ocultar gráfico',
    today: 'Hoje',
    yesterday: 'Ontem',
    daysAgo: 'Há {n} dias',
    movementBalance: 'Saldo',
    deposit: 'Entrada',
    withdrawal: 'Despesa',
    noMovements: 'Nenhuma operação disponível.',
    loading: 'A carregar…',
    localeUpdated: 'Idioma e moeda atualizados.',
    countryLabel: 'País',
    languageLabel: 'Idioma / região',
    currencyLabel: 'Moeda',
  },
  nl: {
    appTitle: 'Ecorise Bank - Online bankieren',
    welcome: 'Welkom',
    guestWelcome: 'Log in om toegang te krijgen tot uw rekening',
    adminWelcome: 'Beheerdersgebied',
    logout: 'Uitloggen',
    menu: 'Menu',
    settings: 'Instellingen',
    close: 'Sluiten',
    login: 'Inloggen',
    signup: 'Account aanmaken',
    email: 'E-mail',
    password: 'Wachtwoord',
    connect: 'Inloggen',
    fullName: 'Volledige naam',
    loginNote: 'Voer e-mail en wachtwoord in.',
    balance: 'Saldo',
    availableBalance: 'Beschikbaar saldo',
    income: 'Inkomsten',
    expenses: 'Uitgaven',
    interest: 'Rente',
    navDashboard: 'Dashboard',
    navMyAccounts: 'Mijn rekeningen',
    navTransfer: 'Overschrijvingen',
    navLoan: 'Leningen',
    navCards: 'Kaarten',
    navServices: 'Diensten',
    navSettings: 'Instellingen',
    navAccounts: 'Rekeningen',
    navInvestments: 'Beleggingen',
    navSupport: 'Ondersteuning',
    sidebarTitle: 'Bankmenu',
    sidebarSubtitle: 'Kies een dienst',
    movementsHistory: 'Transactiegeschiedenis',
    search: 'Zoeken',
    searchMovements: 'Zoek een transactie…',
    exportStatement: 'Exporteer afschrift',
    sort: 'Sorteren',
    filterAll: 'Alle',
    filterDeposits: 'Ontvangen',
    filterWithdrawals: 'Uitgaven',
    showMore: 'Meer tonen',
    showLess: 'Minder tonen',
    showMoreOps: 'Meer tonen ({n} transacties)',
    showMoreOne: 'Meer tonen (1 transactie)',
    showChart: 'Grafiek tonen',
    hideChart: 'Grafiek verbergen',
    today: 'Vandaag',
    yesterday: 'Gisteren',
    daysAgo: '{n} dagen geleden',
    movementBalance: 'Saldo',
    deposit: 'Ontvangst',
    withdrawal: 'Uitgave',
    noMovements: 'Geen transacties beschikbaar.',
    loading: 'Laden…',
    localeUpdated: 'Taal en valuta bijgewerkt.',
    countryLabel: 'Land',
    languageLabel: 'Taal / regio',
    currencyLabel: 'Valuta',
  },
  ar: {
    appTitle: 'إيكورise بنك - بنك إلكتروني',
    welcome: 'مرحباً',
    guestWelcome: 'سجّل الدخول للوصول إلى حسابك',
    adminWelcome: 'منطقة المسؤول',
    logout: 'تسجيل الخروج',
    menu: 'القائمة',
    settings: 'الإعدادات',
    close: 'إغلاق',
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    connect: 'دخول',
    fullName: 'الاسم الكامل',
    loginNote: 'أدخل بريدك الإلكتروني وكلمة المرور.',
    balance: 'الرصيد',
    availableBalance: 'الرصيد المتاح',
    income: 'المداخيل',
    expenses: 'المصاريف',
    interest: 'الفائدة',
    navDashboard: 'لوحة التحكم',
    navMyAccounts: 'حساباتي',
    navTransfer: 'التحويلات',
    navLoan: 'القروض',
    navCards: 'البطاقات',
    navServices: 'الخدمات',
    navSettings: 'الإعدادات',
    navAccounts: 'الحسابات',
    navInvestments: 'الاستثمارات',
    navSupport: 'المساعدة',
    sidebarTitle: 'قائمة البنك',
    sidebarSubtitle: 'اختر خدمة',
    movementsHistory: 'سجل العمليات',
    search: 'بحث',
    searchMovements: 'البحث عن عملية…',
    exportStatement: 'تصدير كشف الحساب',
    sort: 'ترتيب',
    filterAll: 'الكل',
    filterDeposits: 'الوارد',
    filterWithdrawals: 'الصادر',
    showMore: 'عرض المزيد',
    showLess: 'عرض أقل',
    showMoreOps: 'عرض المزيد ({n} عمليات)',
    showMoreOne: 'عرض المزيد (عملية واحدة)',
    showChart: 'عرض الرسم البياني',
    hideChart: 'إخفاء الرسم البياني',
    today: 'اليوم',
    yesterday: 'أمس',
    daysAgo: 'منذ {n} أيام',
    movementBalance: 'الرصيد',
    deposit: 'وارد',
    withdrawal: 'صادر',
    noMovements: 'لا توجد عمليات.',
    loading: 'جاري التحميل…',
    localeUpdated: 'تم تحديث اللغة والعملة.',
    countryLabel: 'البلد',
    languageLabel: 'اللغة / المنطقة',
    currencyLabel: 'العملة',
  },
};

const CURRENCY_OPTIONS = [
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'USD', label: 'US Dollar ($)' },
  { code: 'GBP', label: 'Pound (£)' },
  { code: 'CAD', label: 'Canadian Dollar (CA$)' },
  { code: 'MXN', label: 'Peso mexicano ($)' },
  { code: 'BRL', label: 'Real (R$)' },
  { code: 'MAD', label: 'Dirham (MAD)' },
];

function detectBrowserLocale() {
  const preferred = navigator.languages?.length ? navigator.languages : [navigator.language || 'fr-FR'];
  for (const lang of preferred) {
    if (LOCALE_CONFIG[lang]) return lang;
    const base = lang.split('-')[0];
    const match = Object.keys(LOCALE_CONFIG).find(code => code.startsWith(`${base}-`));
    if (match) return match;
  }
  return 'fr-FR';
}

function getLangFromLocale(locale) {
  return LOCALE_CONFIG[locale]?.lang || locale.split('-')[0] || 'fr';
}

function t(key, locale = 'fr-FR', vars = {}) {
  const lang = getLangFromLocale(locale);
  const pack = I18N[lang] || I18N.fr;
  let text = pack[key] || I18N.fr[key] || key;
  Object.entries(vars).forEach(([name, value]) => {
    text = text.replace(`{${name}}`, String(value));
  });
  return text;
}

function getLocaleCurrency(locale) {
  return LOCALE_CONFIG[locale]?.currency || 'EUR';
}

function getLocaleDir(locale) {
  return LOCALE_CONFIG[locale]?.dir || 'ltr';
}

/** Pays du visiteur (code ISO) → locale régionale */
const COUNTRY_TO_LOCALE = {
  FR: 'fr-FR',
  BE: 'fr-FR',
  LU: 'fr-FR',
  MC: 'fr-FR',
  CH: 'fr-FR',
  CA: 'fr-CA',
  US: 'en-US',
  GB: 'en-GB',
  IE: 'en-GB',
  AU: 'en-US',
  NZ: 'en-US',
  ZA: 'en-GB',
  IN: 'en-GB',
  SG: 'en-US',
  PH: 'en-US',
  DE: 'de-DE',
  AT: 'de-DE',
  ES: 'es-ES',
  MX: 'es-MX',
  AR: 'es-ES',
  CO: 'es-ES',
  CL: 'es-ES',
  PE: 'es-ES',
  IT: 'it-IT',
  PT: 'pt-PT',
  BR: 'pt-BR',
  NL: 'nl-NL',
  MA: 'ar-MA',
  DZ: 'ar-MA',
  TN: 'ar-MA',
  EG: 'ar-MA',
  SA: 'ar-MA',
  AE: 'ar-MA',
};

const VISITOR_LOCALE_KEY = 'ecorisVisitorLocale';

const UI_STATIC_BINDINGS = [
  { sel: '#appLoaderText', key: 'loading' },
  { sel: '#loginSection h2', key: 'login' },
  { sel: '#loginForm label[for="inputUsername"]', key: 'email' },
  { sel: '#loginForm label[for="inputPin"]', key: 'password' },
  { sel: '#loginForm .btn--primary', key: 'connect' },
  { sel: '#loginSection .login-note:not(.login-note--closed)', key: 'loginNote' },
  { sel: '#btnLogout', key: 'logout' },
  { sel: '#btnMenu', key: 'menu', attr: 'aria' },
  { sel: '#btnSettings', key: 'settings', attr: 'aria' },
  { sel: '.sidebar-nav > a[href="#dashboard"]', key: 'navDashboard' },
  { sel: '.sidebar-nav > a[href="#transfer"]', key: 'navTransfer' },
  { sel: '.sidebar-nav > a[href="#loan"]', key: 'navLoan' },
  { sel: '.sidebar-nav > a[href="#cards"]', key: 'navCards' },
  { sel: '[data-nav-label="services"]', key: 'navServices' },
  { sel: '[data-nav-label="accounts"]', key: 'navAccounts' },
  { sel: '[data-nav-label="investments"]', key: 'navInvestments' },
  { sel: '[data-nav-label="support"]', key: 'navSupport' },
  { sel: '[data-nav-label="settings"]', key: 'navSettings' },
  { sel: '#balanceHeroCard .balance-hero__label', key: 'availableBalance' },
  { sel: '#sidebarClientGreeting', key: 'clientArea' },
  { sel: '#balanceHeroCard .balance-hero__badge', key: 'currentAccountBadge' },
  { sel: '#dashboard .summary-card:nth-child(1) p', key: 'balance' },
  { sel: '#dashboard .summary-card:nth-child(2) p', key: 'income' },
  { sel: '#dashboard .summary-card:nth-child(3) p', key: 'expenses' },
  { sel: '#dashboard .summary-card:nth-child(4) p', key: 'interest' },
  { sel: '#dashboard .movements-card h3', key: 'movementsHistory' },
  { sel: '#movementSearch', key: 'searchMovements', attr: 'placeholder' },
  { sel: '#btnExportStatement', key: 'exportStatement' },
  { sel: '#btnSort', key: 'sort' },
  { sel: '.filter-buttons [data-filter="all"]', key: 'filterAll' },
  { sel: '.filter-buttons [data-filter="deposit"]', key: 'filterDeposits' },
  { sel: '.filter-buttons [data-filter="withdrawal"]', key: 'filterWithdrawals' },
  { sel: '.menu-grid a[href="#dashboard"]', key: 'navMyAccounts' },
  { sel: '.menu-grid a[href="#transfer"]', key: 'navTransfer' },
  { sel: '.menu-grid a[href="#loan"]', key: 'navLoan' },
  { sel: '.menu-grid a[href="#cards"]', key: 'navCards' },
  { sel: '.menu-grid a[href="#services"]', key: 'navServices' },
  { sel: '.menu-card--settings span', key: 'navSettings' },
];

function applyText(el, text, attr) {
  if (!el || text == null) return;
  if (attr === 'aria') {
    el.setAttribute('aria-label', text);
    return;
  }
  if (attr === 'placeholder') {
    el.placeholder = text;
    return;
  }
  if (el.tagName === 'INPUT' && (el.type === 'submit' || el.type === 'button')) {
    el.value = text;
    return;
  }
  el.textContent = text;
}

function applyPageI18n(locale = 'fr-FR') {
  const safeLocale = LOCALE_CONFIG[locale] ? locale : detectBrowserLocale();
  document.documentElement.lang = getLangFromLocale(safeLocale);
  document.documentElement.dir = getLocaleDir(safeLocale);
  document.title = t('appTitle', safeLocale);

  document.querySelectorAll('[data-i18n]').forEach(el => {
    applyText(el, t(el.dataset.i18n, safeLocale), el.dataset.i18nAttr);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    applyText(el, t(el.dataset.i18nPlaceholder, safeLocale), 'placeholder');
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    applyText(el, t(el.dataset.i18nAria, safeLocale), 'aria');
  });

  UI_STATIC_BINDINGS.forEach(({ sel, key, attr }) => {
    document.querySelectorAll(sel).forEach(el => applyText(el, t(key, safeLocale), attr));
  });

  return safeLocale;
}

function localeFromCountryCode(code) {
  if (!code) return null;
  const upper = String(code).trim().toUpperCase();
  return COUNTRY_TO_LOCALE[upper] || null;
}

async function fetchCountryCode() {
  try {
    const res = await fetch('/api/geo', { cache: 'no-store', signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const data = await res.json();
      const code = data.country_code || data.country || data.countryCode;
      if (code) return String(code).toUpperCase();
    }
  } catch {
    /* serveur local ou réseau indisponible */
  }

  try {
    const res = await fetch('https://ipapi.co/country_code/', {
      signal: AbortSignal.timeout(3500),
    });
    if (res.ok) {
      const text = (await res.text()).trim().toUpperCase();
      if (text.length === 2) return text;
    }
  } catch {
    /* API externe optionnelle */
  }

  return null;
}

async function detectVisitorLocale() {
  try {
    const cached = sessionStorage.getItem(VISITOR_LOCALE_KEY);
    if (cached && LOCALE_CONFIG[cached]) return cached;
  } catch {
    /* ignore */
  }

  const country = await fetchCountryCode();
  const fromCountry = localeFromCountryCode(country);
  const locale = fromCountry || detectBrowserLocale();

  try {
    sessionStorage.setItem(VISITOR_LOCALE_KEY, locale);
  } catch {
    /* ignore */
  }

  return locale;
}

/** Sous-titres des sections (panneaux) par langue */
const NAV_PANELS_UI = {
  fr: {
    services: {
      nav: 'Services',
      panels: {
        profile: { title: 'Profil', desc: 'Informations personnelles et notifications.' },
        beneficiaries: { title: 'Bénéficiaires', desc: 'Gérez vos bénéficiaires de virement.' },
        support: { title: 'Assistance', desc: 'Contactez le support par message.' },
      },
    },
    settings: {
      nav: 'Paramètres',
      panels: {
        profile: { title: 'Profil', desc: 'Modifiez vos informations personnelles.' },
        notifications: { title: 'Notifications', desc: 'Gérez vos alertes email, SMS et opérations.' },
        preferences: { title: 'Préférences', desc: 'Langue, devise et affichage.' },
        security: { title: 'Sécurité', desc: 'Mot de passe et protection du compte.' },
        account: { title: 'Compte', desc: 'Informations et confidentialité.' },
      },
    },
    accounts: {
      nav: 'Comptes',
      panels: {
        summary: { title: 'Mes comptes', desc: 'Consultez vos comptes actifs.' },
        savings: { title: 'Épargne', desc: 'Produits d’épargne et soldes.' },
        actions: { title: 'Actions', desc: 'Demander ou fermer un produit.' },
      },
    },
    investments: {
      nav: 'Investissements',
      panels: {
        portfolio: { title: 'Portefeuille', desc: 'Suivez vos investissements.' },
        invest: { title: 'Investir', desc: 'Passez un nouvel ordre.' },
        strategy: { title: 'Stratégie', desc: 'Conseils et bonnes pratiques.' },
      },
    },
    support: {
      nav: 'Assistance',
      panels: {
        faq: { title: 'FAQ', desc: 'Questions fréquentes.' },
        tickets: { title: 'Tickets', desc: 'Vos demandes au support.' },
      },
    },
  },
  en: {
    services: {
      nav: 'Services',
      panels: {
        profile: { title: 'Profile', desc: 'Personal info and notifications.' },
        beneficiaries: { title: 'Beneficiaries', desc: 'Manage transfer beneficiaries.' },
        support: { title: 'Support', desc: 'Contact support by message.' },
      },
    },
    settings: {
      nav: 'Settings',
      panels: {
        profile: { title: 'Profile', desc: 'Update personal information.' },
        notifications: { title: 'Notifications', desc: 'Email, SMS and alert settings.' },
        preferences: { title: 'Preferences', desc: 'Language, currency and display.' },
        security: { title: 'Security', desc: 'Password and account protection.' },
        account: { title: 'Account', desc: 'Account info and privacy.' },
      },
    },
    accounts: {
      nav: 'Accounts',
      panels: {
        summary: { title: 'My accounts', desc: 'View active accounts.' },
        savings: { title: 'Savings', desc: 'Savings products and balances.' },
        actions: { title: 'Actions', desc: 'Request or close a product.' },
      },
    },
    investments: {
      nav: 'Investments',
      panels: {
        portfolio: { title: 'Portfolio', desc: 'Track your investments.' },
        invest: { title: 'Invest', desc: 'Place a new order.' },
        strategy: { title: 'Strategy', desc: 'Tips and best practices.' },
      },
    },
    support: {
      nav: 'Support',
      panels: {
        faq: { title: 'FAQ', desc: 'Frequently asked questions.' },
        tickets: { title: 'Tickets', desc: 'Your support requests.' },
      },
    },
  },
  de: {
    services: {
      nav: 'Services',
      panels: {
        profile: { title: 'Profil', desc: 'Persönliche Daten und Benachrichtigungen.' },
        beneficiaries: { title: 'Begünstigte', desc: 'Überweisungsbegünstigte verwalten.' },
        support: { title: 'Support', desc: 'Support per Nachricht kontaktieren.' },
      },
    },
    settings: {
      nav: 'Einstellungen',
      panels: {
        profile: { title: 'Profil', desc: 'Persönliche Daten bearbeiten.' },
        notifications: { title: 'Benachrichtigungen', desc: 'E-Mail-, SMS- und Transaktionsalerts.' },
        preferences: { title: 'Einstellungen', desc: 'Sprache, Währung und Anzeige.' },
        security: { title: 'Sicherheit', desc: 'Passwort und Kontoschutz.' },
        account: { title: 'Konto', desc: 'Kontoinformationen und Datenschutz.' },
      },
    },
    accounts: {
      nav: 'Konten',
      panels: {
        summary: { title: 'Meine Konten', desc: 'Aktive Konten anzeigen.' },
        savings: { title: 'Sparen', desc: 'Sparkonten und Salden.' },
        actions: { title: 'Aktionen', desc: 'Produkt anfordern oder schließen.' },
      },
    },
    investments: {
      nav: 'Investitionen',
      panels: {
        portfolio: { title: 'Portfolio', desc: 'Investitionen verfolgen.' },
        invest: { title: 'Investieren', desc: 'Neuen Auftrag platzieren.' },
        strategy: { title: 'Strategie', desc: 'Tipps und Empfehlungen.' },
      },
    },
    support: {
      nav: 'Support',
      panels: {
        faq: { title: 'FAQ', desc: 'Häufige Fragen.' },
        tickets: { title: 'Tickets', desc: 'Ihre Support-Anfragen.' },
      },
    },
  },
  es: {
    services: {
      nav: 'Servicios',
      panels: {
        profile: { title: 'Perfil', desc: 'Datos personales y notificaciones.' },
        beneficiaries: { title: 'Beneficiarios', desc: 'Gestione sus beneficiarios.' },
        support: { title: 'Asistencia', desc: 'Contacte con soporte.' },
      },
    },
    settings: {
      nav: 'Ajustes',
      panels: {
        profile: { title: 'Perfil', desc: 'Modifique sus datos personales.' },
        notifications: { title: 'Notificaciones', desc: 'Alertas por email, SMS y operaciones.' },
        preferences: { title: 'Preferencias', desc: 'Idioma, moneda y visualización.' },
        security: { title: 'Seguridad', desc: 'Contraseña y protección de la cuenta.' },
        account: { title: 'Cuenta', desc: 'Información y privacidad.' },
      },
    },
    accounts: {
      nav: 'Cuentas',
      panels: {
        summary: { title: 'Mis cuentas', desc: 'Consulte sus cuentas activas.' },
        savings: { title: 'Ahorro', desc: 'Productos de ahorro y saldos.' },
        actions: { title: 'Acciones', desc: 'Solicitar o cerrar un producto.' },
      },
    },
    investments: {
      nav: 'Inversiones',
      panels: {
        portfolio: { title: 'Cartera', desc: 'Siga sus inversiones.' },
        invest: { title: 'Invertir', desc: 'Realice una nueva orden.' },
        strategy: { title: 'Estrategia', desc: 'Consejos y buenas prácticas.' },
      },
    },
    support: {
      nav: 'Asistencia',
      panels: {
        faq: { title: 'FAQ', desc: 'Preguntas frecuentes.' },
        tickets: { title: 'Tickets', desc: 'Sus solicitudes de soporte.' },
      },
    },
  },
};

function getNavPanelsUi(lang) {
  return NAV_PANELS_UI[lang] || NAV_PANELS_UI.en || NAV_PANELS_UI.fr;
}
