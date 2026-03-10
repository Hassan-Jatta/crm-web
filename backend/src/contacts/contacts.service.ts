import { Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { PrismaService } from '../modeles-email/prisma/prisma.service';

@Injectable()
export class ContactsService {
  // On injecte Prisma dans le service
  constructor(private prisma: PrismaService) {}

  // POST : Créer un nouveau contact
  create(createContactDto: CreateContactDto) {
    return this.prisma.contact.create({
      data: createContactDto
    });
  }

  // GET : Récupérer TOUS les contacts
  findAll() {
    return this.prisma.contact.findMany({
      include: { entreprise: true }, 
    });
  }

  // GET : Récupérer un contact par son id
  async findOne(id: string) {
    const cleanId = id.trim();
    return this.prisma.contact.findUnique({
      where: { id_contact: cleanId },
      include: { 
        entreprise: true,
        communication: { orderBy: { date_envoi: 'desc' } },
        tache: { orderBy: { date_echeance: 'asc' } },
        lead: { orderBy: { date_creation: 'desc' } },
        commande: {
          orderBy: { date_commande: 'desc' },
          include: {
            commande_produit: {
              include: {
                produit: true
              }
            }
          }
        }
      },
    });
  }

  // PATCH : Mettre à jour un contact
  update(id: string, updateContactDto: any) {
    return this.prisma.contact.update({
      where: { id_contact: id },
      data: updateContactDto
    });
  }

  // DELETE : Supprimer un contact
  remove(id: string) {
    return this.prisma.contact.delete({
      where: { id_contact: id },
    });
  }
}