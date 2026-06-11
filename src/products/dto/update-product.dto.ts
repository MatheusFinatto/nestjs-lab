import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

// PartialType pega o CreateProductDto e marca TODOS os campos como opcionais
// (aplica @IsOptional() em cada um), mantendo as mesmas regras quando o campo
// vier. Zero decorator copiado: se Create mudar, Update acompanha sozinho.
export class UpdateProductDto extends PartialType(CreateProductDto) {}
