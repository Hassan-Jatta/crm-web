import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommandesService {
  constructor(private prisma: PrismaService) {}

  async create(createCommandeDto: any) {
    return this.prisma.commande.create({
      data: {
        id_contact: createCommandeDto.id_contact,
        statut_paiement: createCommandeDto.statut_paiement || 'En attente',
        montant_total: createCommandeDto.montant_total,
        commande_produit: {
          create: createCommandeDto.produits.map((p: any) => ({
            id_produit: p.id_produit,
            quantite: p.quantite,
            prix_unitaire_facture: p.prix_unitaire_facture,
          })),
        },
      },
      include: {
        commande_produit: true, 
      },
    });
  }

  
  findAll() {
    return this.prisma.commande.findMany({
      orderBy: { date_commande: 'desc' },
      include: {
        contact: true, 
        commande_produit: {
          include: {
            produit: true, 
          },
        },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.commande.findUnique({
      where: { id_commande: id },
      include: {
        contact: true,
        commande_produit: {
          include: {
            produit: true,
          },
        },
      },
    });
  }

  update(id: string, updateCommandeDto: any) {
    return this.prisma.commande.update({
      where: { id_commande: id },
      data: updateCommandeDto,
    });
  }

  remove(id: string) {
    return this.prisma.commande.delete({
      where: { id_commande: id },
    });
  }
}