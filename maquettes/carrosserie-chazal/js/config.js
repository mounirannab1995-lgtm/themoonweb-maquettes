/* =========================================================
   js/config.js — toutes les infos de la carrosserie sont ici.
   Une valeur vide ("") masque automatiquement le bloc lié.
   Horaires : 0 = dimanche, 1 = lundi ... 6 = samedi.
   ========================================================= */
window.SITE = {
  nom: "Carrosserie Chazal",
  adresse: "73 Coursière de Saillant, 42600 Montbrison",
  mapsQuery: "Carrosserie Chazal, 73 Coursière de Saillant, 42600 Montbrison",

  tel: "04 77 58 28 31",
  email: "carrosserie.chazal@wanadoo.fr",   // adresse affichée sur leur site actuel

  // Horaires affichés sur leur site actuel
  horaires: {
    1: [["07:45", "12:00"], ["14:00", "18:45"]],
    2: [["07:45", "12:00"], ["14:00", "18:45"]],
    3: [["07:45", "12:00"], ["14:00", "18:45"]],
    4: [["07:45", "12:00"], ["14:00", "18:45"]],
    5: [["07:45", "12:00"], ["14:00", "18:45"]],
    6: [],
    0: []
  },

  mentionsLegales: ""
};
