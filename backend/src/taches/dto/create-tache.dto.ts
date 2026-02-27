export class CreateTacheDto {
  titre: string;
  description?: string;
  date_echeance: string | Date;
  statut?: string; // "À faire" ou "Terminé"
  type_tache: string; // "Appel", "Email", "Rendez-vous", "Rappel"
  
  id_utilisateur?: string;
  id_contact?: string;
  id_lead?: string;
}
