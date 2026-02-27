import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTacheDto } from './dto/create-tache.dto';

@Injectable()
export class TachesService {
  constructor(private prisma: PrismaService) {}

  create(createTacheDto: CreateTacheDto) {
    return this.prisma.tache.create({
      data: createTacheDto,
    });
  }

  findAll() {
    return this.prisma.tache.findMany({
      include: {
        contact: true,     
        utilisateur: true, 
        lead: true,     
      },
      orderBy: { date_echeance: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.tache.findUnique({
      where: { id_tache: id },
      include: {
        contact: true,
        utilisateur: true,
        lead: true,
      },
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