/*  Sur l'espace admin, le status BROUILLON ne sera jamais vu,
il ne fait donc pas parti de la liste des status possibles*/
export const demandeSejourStatut = {
  TRANSMISE: "TRANSMISE",
  EN_COURS: "EN COURS",
  A_MODIFIER: "A MODIFIER",
  ATTENTE_HEBERGEMENT: "EN ATTENTE VALIDATION HEBERGEMENT",
  ATTENTE_8_JOUR: "EN ATTENTE DECLARATION 8 JOURS",
  TRANSMISE_8J: "TRANSMISE 8J",
  VALIDEE: "VALIDEE",
  REFUSEE: "REFUSEE",
  MAJ_POST_8J: "MAJ POST 8J",
};
