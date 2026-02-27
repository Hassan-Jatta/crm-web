import { Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { PrismaService } from '../prisma/prisma.service'; // On importe notre moteur

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
  findOne(id: string) {
    return this.prisma.contact.findUnique({
      where: { id_contact: id },
      include: { entreprise: true }, 
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