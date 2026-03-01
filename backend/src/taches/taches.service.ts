import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TachesService {
  constructor(private prisma: PrismaService) {}

  create(createTacheDto: any) {
    return this.prisma.tache.create({
      data: createTacheDto,
    });
  }

  findAll() {
    return this.prisma.tache.findMany({
      orderBy: { date_echeance: 'asc' },
      include: { contact: true }
    });
  }

  findOne(id: string) {
    return this.prisma.tache.findUnique({
      where: { id_tache: id },
      include: { contact: true }
    });
  }

  update(id: string, updateTacheDto: any) {
    return this.prisma.tache.update({
      where: { id_tache: id },
      data: updateTacheDto,
    });
  }

  remove(id: string) {
    return this.prisma.tache.delete({
      where: { id_tache: id },
    });
  }
}