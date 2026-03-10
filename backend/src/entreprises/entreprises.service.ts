import { Injectable } from '@nestjs/common';
import { PrismaService } from '../modeles-email/prisma/prisma.service';
import { CreateEntrepriseDto } from './dto/create-entreprise.dto';

@Injectable()
export class EntreprisesService {
  constructor(private prisma: PrismaService) {}

  create(createEntrepriseDto: CreateEntrepriseDto) {
    return this.prisma.entreprise.create({
      data: createEntrepriseDto,
    });
  }

  findAll() {
    return this.prisma.entreprise.findMany();
  }

  findOne(id: string) {
    return this.prisma.entreprise.findUnique({
      where: { id_entreprise: id },
    });
  }

  update(id: string, updateEntrepriseDto: any) {
    return this.prisma.entreprise.update({
      where: { id_entreprise: id },
      data: updateEntrepriseDto,
    });
  }

  remove(id: string) {
    return this.prisma.entreprise.delete({
      where: { id_entreprise: id },
    });
  }
}