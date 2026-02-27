import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommunicationDto } from './dto/create-communication.dto';
import { Resend } from 'resend'; 

@Injectable()
export class CommunicationsService {
  private resend: Resend;

  constructor(private prisma: PrismaService) {
    
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  
  create(createCommunicationDto: CreateCommunicationDto) {
    return this.prisma.communication.create({
      data: createCommunicationDto,
    });
  }

  
  async envoyerEmail(data: { email_destinataire: string; sujet: string; corps: string; id_contact: string; id_utilisateur?: string }) {
    
    
    const resendResponse = await this.resend.emails.send({
      from: 'onboarding@resend.dev',
      to: data.email_destinataire,
      subject: data.sujet,
      html: data.corps, 
    });

    if (resendResponse.error) {
      throw new Error(`Erreur d'envoi Resend: ${resendResponse.error.message}`);
    }

    
    return this.prisma.communication.create({
      data: {
        id_contact: data.id_contact,
        id_utilisateur: data.id_utilisateur || null,
        canal: 'Email',
        objet_email: data.sujet,
        corps_email: data.corps,
      },
    });
  }

  findAll() {
    return this.prisma.communication.findMany({
      include: { contact: true, utilisateur: true },
      orderBy: { date_envoi: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.communication.findUnique({
      where: { id_communication: id },
      include: { contact: true, utilisateur: true },
    });
  }

  update(id: string, updateCommunicationDto: any) {
    return this.prisma.communication.update({
      where: { id_communication: id },
      data: updateCommunicationDto,
    });
  }

  remove(id: string) {
    return this.prisma.communication.delete({
      where: { id_communication: id },
    });
  }
}