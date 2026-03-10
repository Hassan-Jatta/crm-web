import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateProduitDto {
  @IsString()
  modele: string;

  @IsString()
  marque: string;

  @IsNumber()
  prix_unitaire: number;

  @IsOptional()
  @IsNumber()
  stock_disponible?: number;
}