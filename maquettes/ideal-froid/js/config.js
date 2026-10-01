/* =========================================================
   js/config.js — TOUTES les infos d'Ideal Froid sont ici.
   ---------------------------------------------------------
   Mode d'emploi (débutant) :
   • Pour changer une info, modifiez seulement le texte entre guillemets "...".
   • Une valeur vide ""  (ou une liste vide [])  MASQUE le bloc lié sur le site.
     Exemple : mobile: ""  ->  le numéro de portable disparaît du site.
   • Gardez les virgules en fin de ligne, sinon la page ne s'affiche plus bien.
   • Après une modification : enregistrez, puis rechargez la page (F5).

   Sources (relevées le 1er octobre 2026) :
   [REG] registre des entreprises : annuaire-entreprises.data.gouv.fr (SIREN 508 990 306)
   [EF]  fiche Effy : https://www.effy.fr/artisans/pro/2251-ideal-froid
   [PJ]  fiche PagesJaunes « Idéal Froid » (lue via Mappy, source PagesJaunes)
   [QE]  certificat QualiPAC (Qualit'EnR) + annuaire www.qualit-enr.org
   [AD]  liste officielle des entreprises RGE (ADEME, data.ademe.fr)
   [G]   fiche Google (téléphone, lien vers l'ancien site www.ideal-froid.fr)
   ========================================================= */
window.SITE = {
  nom: "Ideal Froid",

  /* ---------- Adresse et zone ---------- */
  adresse: "ZAC des Granges, 13 rue des Grands Chênes, 42600 Montbrison",   // [REG] [PJ] [QE]
  mapsQuery: "Ideal Froid, 13 Rue des Grands Chênes, 42600 Montbrison",      // ce que la carte Google recherche
  zone: "Montbrison et alentours",   // formulation prudente : à faire préciser par l'entreprise

  /* Communes où l'entreprise intervient : À LEUR DEMANDER.
     Exemple : ["Montbrison", "Savigneux", "Champdieu"]   (liste vide = bloc masqué) */
  communes: [],

  /* ---------- Contact ---------- */
  tel: "04 77 24 40 89",             // [G] [PJ] [QE] [AD] — numéro du bureau
  mobile: "06 42 64 82 61",          // [EF] — portable affiché sur Effy (à confirmer)
  email: "ideal-froid@orange.fr",    // [EF] [AD]
  facebook: "https://www.facebook.com/idealfroidclimatisation",   // page Facebook de l'entreprise

  /* Texte du bouton « Demander un devis » : il ouvre la messagerie du visiteur
     avec ce message prêt à compléter (aucun formulaire, rien n'est envoyé tout seul). */
  devisSujet: "Demande de devis",
  devisMessage:
    "Bonjour,\n\n" +
    "Je souhaite recevoir un devis.\n\n" +
    "Mon projet : {projet}\n" +
    "Commune : \n" +
    "Type de logement (maison, appartement…) : \n" +
    "Chauffage ou équipement actuel : \n" +
    "Mes disponibilités pour être rappelé(e) : \n" +
    "Mon numéro de téléphone : \n\n" +
    "Merci,\n",

  /* ---------- L'entreprise ---------- */
  depuis: "2008",                    // [REG] société créée le 12/11/2008
  paiement: "Virement bancaire ou chèque",   // [PJ] « Moyens de paiement »

  /* Horaires du bureau — [PJ] « Du lundi au vendredi : de 8h à 12h et de 13h30 à 18h ».
     ATTENTION : Google indique « 8h45 – 18h » sans coupure. À faire confirmer.
     0 = dimanche, 1 = lundi ... 6 = samedi.  [] = fermé.  horaires: "" = bloc masqué. */
  horaires: {
    1: [["08:00", "12:00"], ["13:30", "18:00"]],
    2: [["08:00", "12:00"], ["13:30", "18:00"]],
    3: [["08:00", "12:00"], ["13:30", "18:00"]],
    4: [["08:00", "12:00"], ["13:30", "18:00"]],
    5: [["08:00", "12:00"], ["13:30", "18:00"]],
    6: [],
    0: []
  },

  /* ---------- Qualification RGE QualiPAC ---------- [QE] [AD]
     Certificat : « QualiPAC module chauffage et ECS », n° QPAC/47827,
     période couverte : 06/10/2025 au 06/10/2026.
     SÉCURITÉ : le lendemain de rgeFinValidite, TOUTES les mentions RGE disparaissent
     du site toutes seules (pour ne jamais afficher une qualification périmée).
     -> Vérifiez le renouvellement sur qualit-enr.org, puis mettez la nouvelle date ici. */
  rge: "RGE QualiPAC",
  rgeModule: "module chauffage et ECS",
  rgeNumero: "QPAC/47827",
  rgeFinValidite: "2026-10-06",      // format AAAA-MM-JJ
  rgeLien: "https://www.qualit-enr.org/entreprises/ideal-froid/",

  /* ---------- Avis (à mettre à jour juste avant l'envoi) ---------- */
  effyNote: "5.0",                   // [EF] note sur 5 (avec un point : "5.0")
  effyNbAvis: "27",                  // [EF] nombre d'avis vérifiés
  effyUrl: "https://www.effy.fr/artisans/pro/2251-ideal-froid",
  pjNote: "5",                       // [PJ] 5/5
  pjNbAvis: "4",                     // [PJ] 4 avis
  pjUrl: "https://www.pagesjaunes.fr/pros/12240270",
  dateReleve: "1er octobre 2026",    // date du relevé, affichée sous la note

  /* Avis clients copiés MOT POUR MOT depuis Effy (auteurs anonymes sur Effy).
     Pour en retirer un : supprimez son bloc { ... }, (liste vide [] = section masquée). */
  avis: [
    { texte: "Entreprise au top très professionnelle et très réactive. Nous recommandons++", date: "12/12/2025", source: "Avis vérifié Effy" },
    { texte: "Rien à redire, artisan très professionnel, respectant ses délais et installation consciencieusement réalisé.", date: "02/10/2025", source: "Avis vérifié Effy" },
    { texte: "Installation d'une PAC\n- Bonne qualité des opérations de raccordement ( tuyauteries + électricité )\n- Chantier propre ( évacuation des déchets....)\n- Délais : conforme", date: "26/06/2023", source: "Avis vérifié Effy" },
    { texte: "Technicité, professionnalisme, sens du service, que demander de plus ?\nVivement recommandé.", date: "21/09/2025", source: "Avis vérifié Effy" },
    { texte: "Date respectée travail très propre équipe respectueuse", date: "09/06/2023", source: "Avis vérifié Effy" },
    { texte: "Sérieux compétent réactif et toujours disponible. En un mot fiable", date: "30/12/2023", source: "Avis vérifié Effy" }
  ],

  /* ---------- Prestations optionnelles ---------- */
  plomberie: "oui",                  // ancien site : page « Plomberie » (« l'expert-dépanneur en plomberie »). "" = carte masquée
  froid: "oui",                      // [PJ] « Installation de systèmes frigorifiques ». "" = carte masquée

  /* ---------- Légal (après accord du client) ---------- */
  mentionsLegales: ""                // ex. "mentions-legales.html" (vide = lien masqué)
};
