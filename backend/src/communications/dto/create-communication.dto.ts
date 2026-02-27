export class CreateCommunicationDto {
  id_contact?: string;
  id_utilisateur?: string;
  canal?: string;
  objet_email?: string;
  corps_email?: string;
  taux_ouverture?: number;
}
