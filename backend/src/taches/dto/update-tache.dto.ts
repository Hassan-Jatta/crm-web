import { PartialType } from '@nestjs/mapped-types';
import { CreateTacheDto } from './create-tache.dto';

export class UpdateTacheDto extends PartialType(CreateTacheDto) {}
