/* =========================================================
   js/config.js — TOUTES les infos d'Alu Confort du Forez sont ici.
   ---------------------------------------------------------
   Mode d'emploi (débutant) :
   • Pour changer une info, modifiez seulement le texte entre guillemets "...".
   • Une valeur vide ""  (ou null pour les horaires)  MASQUE le bloc lié.
     Exemple : facebook: ""  -> le lien Facebook disparaît du site.
   • Gardez les virgules en fin de ligne, sinon la page ne s'affiche plus bien.
   • Après une modification : enregistrez, puis rechargez la page (F5).

   Sources (relevées le 1er octobre 2026) :
   [SITE] leur site actuel aluconfortduforez.com (accueil, vérandas, menuiserie,
          fenêtres, contact, avis clients)
   [RGE]  annuaire officiel des entreprises RGE (data.ademe.fr / France Rénov')
   [LM]   fiche LeMenuisier.fr (horaires) — NON affichée, voir « horaires »
   ========================================================= */
window.SITE = {
  nom: "Alu Confort du Forez",

  /* ---------- Coordonnées ---------- */
  adresse: "68 rue des Grands Chênes, 42600 Montbrison",          // [SITE] page contact
  mapsQuery: "Alu Confort du Forez, 68 rue des Grands Chênes, 42600 Montbrison",
  tel: "04 77 97 62 79",                                           // [SITE] -> boutons « Appeler »
  email: "aluconfortduforez@orange.fr",                           // [SITE] -> bouton « Demander un devis »
  facebook: "https://www.facebook.com/Alu-Confort-du-Forez-1851736025079341/",  // [SITE] lien présent sur leur site

  /* ---------- E-mail « Demander un devis » ----------
     Le bouton ouvre la messagerie du visiteur avec ce message déjà écrit.
     (Aucun formulaire : le visiteur envoie lui-même son e-mail.) */
  devisObjet: "Demande de devis depuis votre site",
  devisMessage:
    "Bonjour,\n\n" +
    "Je souhaite un devis pour : (véranda, pergola, fenêtres, porte, volets...)\n" +
    "Ville du chantier : \n" +
    "Dimensions approximatives (si vous les connaissez) : \n" +
    "Mon téléphone : \n\n" +
    "Merci,\n",

  /* ---------- Ce que dit leur site (à faire confirmer) ---------- */
  depuis: "1973",              // [SITE] « Concepteur et fabriquant de vérandas de père en fils depuis 1973 »
  dirigeant: "Julien Chauve",  // [SITE] « l'établissement dirigé par M. Julien Chauve » (aussi au registre)
  showroom: "200",             // [SITE] « 200m² de show room »
  devisGratuit: "Devis gratuit",   // [SITE] « un devis gratuit et un conseil de professionnel » ("" = retiré)
  garantie: "Garantie décennale",  // [SITE] pages menuiserie, fenêtres et vérandas ("" = retiré)
  visuels3D: "oui",            // [SITE] page vérandas : « visuels de votre future véranda », « conception 3D » ("" = retiré)

  /* Phrase d'ouverture du showroom. Leur site dit « Nous sommes ouverts 6j/7 »,
     mais LeMenuisier.fr indique le samedi fermé : à vérifier, donc vide par défaut.
     Exemple une fois vérifié :  ouverture: "Showroom ouvert 6 jours sur 7", */
  ouverture: "",

  /* Horaires détaillés du showroom (0 = dimanche, 1 = lundi ... 6 = samedi).
     null = blocs « Horaires » et « Ouvert / Fermé » masqués.
     Leur site n'affiche AUCUN horaire. [LM] indique :
     lundi au vendredi 8h30-12h et 14h-17h30, samedi et dimanche fermés.
     Pour les afficher APRÈS vérification, remplacez null par :
     {
       1: [["08:30", "12:00"], ["14:00", "17:30"]],
       2: [["08:30", "12:00"], ["14:00", "17:30"]],
       3: [["08:30", "12:00"], ["14:00", "17:30"]],
       4: [["08:30", "12:00"], ["14:00", "17:30"]],
       5: [["08:30", "12:00"], ["14:00", "17:30"]],
       6: [],
       0: []
     }                                                                 */
  horaires: null,

  /* ---------- Certification RGE [RGE] ---------- */
  rge: "Qualibat RGE",
  rgeDomaine: "Fenêtres, volets, portes donnant sur l'extérieur",
  rgeQualification: "Fourniture et pose de menuiseries extérieures",
  rgeValidite: "25/03/2029",   // date de fin indiquée par l'annuaire officiel
  rgeLien: "https://france-renov.gouv.fr/annuaire-rge",

  mentionsLegales: ""          // lien vers la page de mentions légales (à créer après accord)
};
