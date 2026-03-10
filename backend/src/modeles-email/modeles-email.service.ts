import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class ModelesEmailService {
  constructor(private prisma: PrismaService) {}

  create(createModelesEmailDto: any) {
    return this.prisma.modele_email.create({
      data: createModelesEmailDto,
    });
  }

  findAll() {
    return this.prisma.modele_email.findMany({
      orderBy: { date_creation: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.modele_email.findUnique({
      where: { id_modele: id },
    });
  }

  update(id: string, updateModelesEmailDto: any) {
    return this.prisma.modele_email.update({
      where: { id_modele: id },
      data: updateModelesEmailDto,
    });
  }

  remove(id: string) {
    return this.prisma.modele_email.delete({
      where: { id_modele: id },
    });
  }
}