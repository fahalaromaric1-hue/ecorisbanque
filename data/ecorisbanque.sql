-- Schéma et données Ecorise Banque.
-- Au démarrage, ce script reconstruit data/ecorisbanque.sqlite s’il est absent.
PRAGMA foreign_keys = OFF;

BEGIN TRANSACTION;

CREATE TABLE meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

CREATE TABLE accounts (
      username TEXT PRIMARY KEY COLLATE NOCASE,
      owner TEXT NOT NULL,
      pin TEXT NOT NULL,
      balance REAL NOT NULL,
      statement_balance REAL NOT NULL,
      document TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

CREATE TABLE movements (
      username TEXT NOT NULL COLLATE NOCASE,
      position INTEGER NOT NULL,
      amount REAL NOT NULL,
      label TEXT NOT NULL DEFAULT '',
      occurred_at TEXT NOT NULL DEFAULT '',
      PRIMARY KEY (username, position),
      FOREIGN KEY (username) REFERENCES accounts(username) ON DELETE CASCADE
    );

INSERT INTO meta (key, value) VALUES ('seeded', '2026-10-14T18:46:42.875Z');

INSERT INTO accounts (username, owner, pin, balance, statement_balance, document, updated_at) VALUES ('ingofranc@gmail.com', 'Ingo Franc', 'franc123', 4334800, 4334800, '{"owner":"Ingo Franc","username":"ingofranc@gmail.com","pin":"franc123","movements":[200000,300000,350000,250000,-5000,-12000,4500,-1400,4800,200,-15,-185,-950,14250,30600,800000,2400000],"movementDates":["2023-10-18T09:30:00.000Z","2023-11-14T00:23:30.211Z","2024-01-10T01:26:43.521Z","2024-05-09T11:40:11.620Z","2024-06-16T12:22:20.493Z","2024-11-15T15:10:55.986Z","2024-12-21T03:02:16.268Z","2025-03-07T04:26:34.014Z","2025-03-30T00:03:51.338Z","2025-07-03T01:49:13.521Z","2025-08-22T18:45:25.352Z","2026-01-09T05:19:57.887Z","2026-02-08T15:29:40.986Z","2026-04-19T08:46:57.254Z","2026-06-02T17:36:07.606Z","2026-09-12T03:28:31.268Z","2026-10-02T10:15:00.000Z"],"movementLabels":["","","","","","","","","","Dépôt espèces","Frais de tenue de compte","Retrait DAB","","","","Virement reçu — 800000 EUR","Virement reçu — 2400000 EUR"],"interestRate":1.2,"locale":"fr-FR","currency":"EUR","notifications":{"email":true,"sms":false,"operations":false},"beneficiaries":[],"accountProducts":[{"name":"Compte courant","status":"Actif"},{"name":"Livret épargne","status":"Actif"}],"savings":[{"name":"Livret A","balance":1200},{"name":"Plan épargne","balance":5400}],"investments":[{"product":"Actions","amount":200,"date":"2026-05-10"}],"supportRequests":[{"subject":"Bloqué sur transfert","message":"Impossible de finaliser le virement.","status":"Ouvert","date":"2026-05-28"}],"preferences":{"hideBalanceHero":false,"compactMovements":false,"maskBalances":false},"statementBalance":4334800,"balance":4334800}', '2026-10-14T18:48:06.637Z');
INSERT INTO accounts (username, owner, pin, balance, statement_balance, document, updated_at) VALUES ('md', 'Marie Dubois', '2222', 127353, 127353, '{"owner":"Marie Dubois","username":"md","pin":"2222","movements":[500,340,-300,-20,-460,200,190,1000,80000,20000,15000,-500,-12,-800,12215],"movementDates":["2023-10-22T08:45:00.000Z","2023-11-21T03:26:31.667Z","2024-01-23T22:55:30.953Z","2024-06-06T16:03:22.778Z","2024-07-19T05:02:42.302Z","2025-01-05T09:00:00.397Z","2025-02-14T01:55:22.619Z","2025-05-10T03:54:01.667Z","2025-06-04T16:29:37.381Z","2025-09-19T00:57:56.191Z","2025-11-14T18:17:02.223Z","2026-04-19T17:54:33.810Z","2026-05-23T18:42:01.429Z","2026-08-09T18:30:47.223Z","2026-09-28T09:40:00.000Z"],"interestRate":1.5,"locale":"fr-FR","currency":"EUR","notifications":{"email":true,"sms":false,"operations":false},"beneficiaries":[],"accountProducts":[{"name":"Compte courant","status":"Actif"},{"name":"Compte joint","status":"Actif"}],"savings":[{"name":"Livret A","balance":900}],"investments":[{"product":"Fonds","amount":120,"date":"2026-05-26"}],"supportRequests":[],"preferences":{"hideBalanceHero":false,"compactMovements":false,"maskBalances":false},"movementLabels":["","","","","","","","","Virement reçu — salaire","Dépôt espèces","Virement reçu — remboursement","Retrait DAB","Frais de tenue de compte","Virement émis — loyer","Virement reçu — versement complémentaire"],"statementBalance":127353,"balance":127353}', '2026-10-14T18:48:06.637Z');
INSERT INTO accounts (username, owner, pin, balance, statement_balance, document, updated_at) VALUES ('sabrine.nattes@ecoris.demo', 'sabrine nattes', 'Galet-6744', 1234556, 1234556, '{"owner":"sabrine nattes","username":"sabrine.nattes@ecoris.demo","pin":"Galet-6744","movements":[400000,250000,250000,150000,100000,80000,-400,-250,-18,-12,-1200,-186,-320,-85,7027],"movementDates":["2023-10-20T11:10:00.000Z","2023-11-19T12:29:51.667Z","2024-01-22T22:12:25.238Z","2024-06-06T21:22:16.111Z","2024-07-19T19:50:38.492Z","2025-01-07T13:44:08.016Z","2025-02-16T15:30:36.905Z","2025-05-13T12:27:21.667Z","2025-06-08T06:44:23.096Z","2025-09-23T14:55:19.048Z","2025-11-19T20:53:08.889Z","2026-04-26T07:17:10.952Z","2026-05-30T15:39:52.857Z","2026-08-17T08:51:53.889Z","2026-10-06T11:05:00.000Z"],"interestRate":1.2,"locale":"fr-FR","currency":"EUR","notifications":{"email":true,"sms":false,"operations":false},"preferences":{"hideBalanceHero":false,"compactMovements":false,"maskBalances":false},"beneficiaries":[],"accountProducts":[{"name":"Compte courant","status":"Actif"}],"savings":[{"name":"Livret A","balance":0}],"investments":[],"supportRequests":[],"movementLabels":["Dépôt d''ouverture","Virement reçu — salaire","Virement reçu — salaire juin","Dépôt espèces","Virement reçu — remboursement","Virement reçu — prestation","Retrait DAB","Retrait DAB — agence","Frais de tenue de compte","Frais bancaires","Virement émis — loyer","Virement émis — électricité","Paiement carte — courses","Paiement carte — carburant","Virement reçu — versement"],"balance":1234556,"statementBalance":1234556}', '2026-10-14T18:48:06.637Z');

INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('ingofranc@gmail.com', 0, 200000, '', '2023-10-18T09:30:00.000Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('ingofranc@gmail.com', 1, 300000, '', '2023-11-14T00:23:30.211Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('ingofranc@gmail.com', 2, 350000, '', '2024-01-10T01:26:43.521Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('ingofranc@gmail.com', 3, 250000, '', '2024-05-09T11:40:11.620Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('ingofranc@gmail.com', 4, -5000, '', '2024-06-16T12:22:20.493Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('ingofranc@gmail.com', 5, -12000, '', '2024-11-15T15:10:55.986Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('ingofranc@gmail.com', 6, 4500, '', '2024-12-21T03:02:16.268Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('ingofranc@gmail.com', 7, -1400, '', '2025-03-07T04:26:34.014Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('ingofranc@gmail.com', 8, 4800, '', '2025-03-30T00:03:51.338Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('ingofranc@gmail.com', 9, 200, 'Dépôt espèces', '2025-07-03T01:49:13.521Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('ingofranc@gmail.com', 10, -15, 'Frais de tenue de compte', '2025-08-22T18:45:25.352Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('ingofranc@gmail.com', 11, -185, 'Retrait DAB', '2026-01-09T05:19:57.887Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('ingofranc@gmail.com', 12, -950, '', '2026-02-08T15:29:40.986Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('ingofranc@gmail.com', 13, 14250, '', '2026-04-19T08:46:57.254Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('ingofranc@gmail.com', 14, 30600, '', '2026-06-02T17:36:07.606Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('ingofranc@gmail.com', 15, 800000, 'Virement reçu — 800000 EUR', '2026-09-12T03:28:31.268Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('ingofranc@gmail.com', 16, 2400000, 'Virement reçu — 2400000 EUR', '2026-10-02T10:15:00.000Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('md', 0, 500, '', '2023-10-22T08:45:00.000Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('md', 1, 340, '', '2023-11-21T03:26:31.667Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('md', 2, -300, '', '2024-01-23T22:55:30.953Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('md', 3, -20, '', '2024-06-06T16:03:22.778Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('md', 4, -460, '', '2024-07-19T05:02:42.302Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('md', 5, 200, '', '2025-01-05T09:00:00.397Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('md', 6, 190, '', '2025-02-14T01:55:22.619Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('md', 7, 1000, '', '2025-05-10T03:54:01.667Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('md', 8, 80000, 'Virement reçu — salaire', '2025-06-04T16:29:37.381Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('md', 9, 20000, 'Dépôt espèces', '2025-09-19T00:57:56.191Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('md', 10, 15000, 'Virement reçu — remboursement', '2025-11-14T18:17:02.223Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('md', 11, -500, 'Retrait DAB', '2026-04-19T17:54:33.810Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('md', 12, -12, 'Frais de tenue de compte', '2026-05-23T18:42:01.429Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('md', 13, -800, 'Virement émis — loyer', '2026-08-09T18:30:47.223Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('md', 14, 12215, 'Virement reçu — versement complémentaire', '2026-09-28T09:40:00.000Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('sabrine.nattes@ecoris.demo', 0, 400000, 'Dépôt d''ouverture', '2023-10-20T11:10:00.000Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('sabrine.nattes@ecoris.demo', 1, 250000, 'Virement reçu — salaire', '2023-11-19T12:29:51.667Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('sabrine.nattes@ecoris.demo', 2, 250000, 'Virement reçu — salaire juin', '2024-01-22T22:12:25.238Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('sabrine.nattes@ecoris.demo', 3, 150000, 'Dépôt espèces', '2024-06-06T21:22:16.111Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('sabrine.nattes@ecoris.demo', 4, 100000, 'Virement reçu — remboursement', '2024-07-19T19:50:38.492Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('sabrine.nattes@ecoris.demo', 5, 80000, 'Virement reçu — prestation', '2025-01-07T13:44:08.016Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('sabrine.nattes@ecoris.demo', 6, -400, 'Retrait DAB', '2025-02-16T15:30:36.905Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('sabrine.nattes@ecoris.demo', 7, -250, 'Retrait DAB — agence', '2025-05-13T12:27:21.667Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('sabrine.nattes@ecoris.demo', 8, -18, 'Frais de tenue de compte', '2025-06-08T06:44:23.096Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('sabrine.nattes@ecoris.demo', 9, -12, 'Frais bancaires', '2025-09-23T14:55:19.048Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('sabrine.nattes@ecoris.demo', 10, -1200, 'Virement émis — loyer', '2025-11-19T20:53:08.889Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('sabrine.nattes@ecoris.demo', 11, -186, 'Virement émis — électricité', '2026-04-26T07:17:10.952Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('sabrine.nattes@ecoris.demo', 12, -320, 'Paiement carte — courses', '2026-05-30T15:39:52.857Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('sabrine.nattes@ecoris.demo', 13, -85, 'Paiement carte — carburant', '2026-08-17T08:51:53.889Z');
INSERT INTO movements (username, position, amount, label, occurred_at) VALUES ('sabrine.nattes@ecoris.demo', 14, 7027, 'Virement reçu — versement', '2026-10-06T11:05:00.000Z');

COMMIT;
