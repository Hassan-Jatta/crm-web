import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  create(createLeadDto: CreateLeadDto) {
    return this.prisma.lead.create({
      data: createLeadDto,
    });
  }

  findAll() {
    return this.prisma.lead.findMany({
      include: {
        contact: true,     
        utilisateur: true, 
      },
      orderBy: { date_creation: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.lead.findUnique({
      where: { id_lead: id },
      include: {
        contact: true,
        utilisateur: true,
      },
    });
  }

  update(id: string, updateLeadDto: any) {
    return this.prisma.lead.update({
      where: { id_lead: id },
      data: updateLeadDto,
    });
  }

  remove(id: string) {
    return this.prisma.lead.delete({
      where: { id_lead: id },
    });
  }
}