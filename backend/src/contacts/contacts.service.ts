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
      data: createContactDto as any, // "as any" temporaire en attendant de typer le DTO
    });
  }

  // GET : Récupérer TOUS les contacts
  findAll() {
    return this.prisma.contact.findMany();
  }

  // GET : Récupérer UN SEUL contact par son ID
  findOne(id: string) {
    return this.prisma.contact.findUnique({
      where: { id_contact: id }, // Note: si ton ID est un Int (nombre), il faudra mettre Number(id)
    });
  }

  // PATCH : Mettre à jour un contact
  update(id: string, updateContactDto: UpdateContactDto) {
    return this.prisma.contact.update({
      where: { id_contact: id },
      data: updateContactDto as any,
    });
  }

  // DELETE : Supprimer un contact
  remove(id: string) {
    return this.prisma.contact.delete({
      where: { id_contact: id },
    });
  }
}