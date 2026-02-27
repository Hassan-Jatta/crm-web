import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UtilisateursService {
  constructor(private prisma: PrismaService) {}

  // POST : Création du profil après l'inscription Supabase
  create(createUtilisateurDto: any) {
    return this.prisma.utilisateur.create({
      data: {
        nom_prenom: createUtilisateurDto.nom_prenom || 'Nouvel Utilisateur',
        email: createUtilisateurDto.email,
        mot_de_passe: 'géré_par_supabase', 
        role: 'Standard',
      },
    });
  }

  // GET : Voir tous les utilisateurs (utile pour l'Admin)
  findAll() {
    return this.prisma.utilisateur.findMany();
  }

  // GET : Voir un seul utilisateur
  findOne(id: string) {
    return this.prisma.utilisateur.findUnique({
      where: { id_utilisateur: id },
    });
  }

  // PATCH : Mettre à jour (ex: un Admin change le rôle en "commercial")
  update(id: string, updateUtilisateurDto: any) {
    return this.prisma.utilisateur.update({
      where: { id_utilisateur: id },
      data: updateUtilisateurDto,
    });
  }

  // DELETE : Supprimer un compte
  remove(id: string) {
    return this.prisma.utilisateur.delete({
      where: { id_utilisateur: id },
    });
  }
}