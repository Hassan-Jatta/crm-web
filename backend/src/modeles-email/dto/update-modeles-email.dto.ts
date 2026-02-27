import { PartialType } from '@nestjs/mapped-types';
import { CreateModelesEmailDto } from './create-modeles-email.dto';

export class UpdateModelesEmailDto extends PartialType(CreateModelesEmailDto) {}
