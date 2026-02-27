export class CreateLeadDto {
  id_contact?: string; // Client concerné
  id_utilisateur?: string; // Commercial assigné
  statut: string; // 'nouveau', 'en cours', 'converti', 'perdu'
  source?: string; // D'où vient le prospect
  montant_estime?: number; // Combien d'argent ce lead peut rapporter
}
