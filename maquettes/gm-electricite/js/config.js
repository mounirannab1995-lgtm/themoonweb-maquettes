/* =========================================================
   js/config.js — TOUTES les infos de GM Électricité sont ici.
   ---------------------------------------------------------
   Mode d'emploi (débutant) :
   • Pour changer une info, modifiez seulement le texte entre guillemets "...".
   • Une valeur vide ""  (ou une liste vide [])  MASQUE le bloc lié sur le site.
     Exemple : instagramUrl: ""  -> le bouton Instagram disparaît.
   • Gardez les virgules en fin de ligne, sinon la page ne s'affiche plus bien.

   Sources (relevées le 1er octobre 2026) :
   [G]  fiche Google « GM Electricité » (téléphone, lien vers Instagram)
   [AV] profil AlloVoisins : https://www.allovoisins.com/p/gmelectricite
        (présentation, avis, note, chiffres, diplôme, « sur devis après visite du chantier »)
   ========================================================= */
window.SITE = {
  nom: "GM Électricité",
  artisan: "Mehdi Ghodbane",            // [AV] nom affiché sur son profil
  zone: "Montbrison et alentours",      // on n'affiche PAS l'adresse (probablement son domicile)
  base: "Montbrison (Moingt)",          // [AV] « Montbrison (Moingt) »
  mapsQuery: "Montbrison 42600",        // la carte est centrée sur la ville, pas sur une adresse

  /* ---------- Contact ---------- */
  mobile: "06 68 91 09 77",             // [G] -> boutons « Appeler » et « Envoyer un SMS »
  smsTexte: "Bonjour, je vous contacte depuis votre site. Mon besoin : ",  // texte pré-rempli du SMS ("" = aucun)
  email: "",                            // non trouvé : à demander à Mehdi

  instagram: "@gmelectricite",          // [G] la fiche Google renvoie vers ce compte
  instagramUrl: "https://www.instagram.com/gmelectricite/",
  instagramMessage: "https://ig.me/m/gmelectricite",   // lien officiel qui ouvre la conversation Instagram
  allovoisinsUrl: "https://www.allovoisins.com/p/gmelectricite",

  /* ---------- Chiffres AlloVoisins (à mettre à jour avant l'envoi) ---------- */
  note: "5",                            // [AV] 5/5
  nbAvis: "10",                         // [AV] 10 avis
  misesEnRelation: "121",               // [AV] 121 mises en relation
  dateChiffres: "1er octobre 2026",     // date du relevé, affichée sous les compteurs

  /* ---------- Infos affichées par l'artisan ---------- */
  diplome: "Titre professionnel d'électricien d'équipements du bâtiment",   // [AV] rubrique « Certifications / Diplômes »
  tarif: "Sur devis, après visite du chantier",                            // [AV] « sur devis après visite du chantier »
  clientele: "Particuliers et professionnels",                             // [AV] présentation

  /* Communes où Mehdi intervient : À LUI DEMANDER.
     Exemple : ["Montbrison", "Savigneux", "Champdieu"]   (liste vide = bloc masqué) */
  communes: [],

  /* ---------- Avis clients (copiés mot pour mot depuis AlloVoisins) ----------
     « vedette: true » = l'avis mis en grand. Pour retirer un avis : supprimez son bloc { ... },
     y compris la virgule qui le suit. */
  avis: [
    {
      vedette: true,
      accroche: "Sincèrement vous pouvez y aller les yeux fermés.",
      texte: "Il a fait + que le nécessaire, ponctuel, propre et efficace. Il a le sens du devoir accompli et c’est vraiment très appréciable. Encore merci Mehdi ;)",
      auteur: "Nesli B.",
      date: "9 octobre 2023",
      prestation: "Installation électrique"
    },
    {
      texte: "Réponse très rapide et sérieux",
      auteur: "Rabiya T.",
      date: "22 juin 2026",
      prestation: "Installation électrique",
      compliment: "Super réactif"
    },
    {
      texte: "Il a parfaitement résolu le problème mon visiophone ne fonctionnait jamais plus…, disponible rapidement, a l’écoute et efficace dans son travail je recommande",
      auteur: "Naciye G.",
      date: "25 avril 2024",
      prestation: "Visiophone"
    },
    {
      texte: "Alimentation de mon garage en électricité et pose d'un petit tableau. Pas besoin d'un long discours quand le travail est réalisé correctement. Personne agréable que je recommande",
      auteur: "Marc G.",
      date: "15 septembre 2023",
      prestation: "Garage"
    },
    {
      texte: "Dépannage par téléphone. Honnête je n'hésiterais pas à rappeler",
      auteur: "Marie M.",
      date: "27 novembre 2023",
      prestation: "Installation électrique"
    }
  ],

  mentionsLegales: ""                   // lien vers la page de mentions légales (à créer après accord)
};
