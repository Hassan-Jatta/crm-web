export class CreateContactDto {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  pointure?: number;
  marque_preferee?: string;
}
