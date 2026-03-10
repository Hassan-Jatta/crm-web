import { Injectable } from '@nestjs/common';
import { PrismaService } from '../modeles-email/prisma/prisma.service';

@Injectable()
export class ProduitsService {
  constructor(private prisma: PrismaService) {}

  create(createProduitDto: any) {
    return this.prisma.produit.create({
      data: createProduitDto,
    });
  }

  findAll() {
    return this.prisma.produit.findMany({
      orderBy: { marque: 'asc' }, 
    });
  }

  findOne(id: string) {
    return this.prisma.produit.findUnique({
      where: { id_produit: id },
    });
  }

  update(id: string, updateProduitDto: any) {
    return this.prisma.produit.update({
      where: { id_produit: id },
      data: updateProduitDto,
    });
  }

  remove(id: string) {
    return this.prisma.produit.delete({
      where: { id_produit: id },
    });
  }
}