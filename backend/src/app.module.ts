import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ContactsModule } from './contacts/contacts.module';
import { UtilisateursModule } from './utilisateurs/utilisateurs.module';
import { EntreprisesModule } from './entreprises/entreprises.module';
import { LeadsModule } from './leads/leads.module';
import { TachesModule } from './taches/taches.module';
import { CommunicationsModule } from './communications/communications.module';
import { ModelesEmailModule } from './modeles-email/modeles-email.module';
import { ProduitsModule } from './produits/produits.module';
import { CommandesModule } from './commandes/commandes.module';

@Module({
  imports: [PrismaModule, ContactsModule, UtilisateursModule, EntreprisesModule, LeadsModule, TachesModule, CommunicationsModule, ModelesEmailModule, ProduitsModule, CommandesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
