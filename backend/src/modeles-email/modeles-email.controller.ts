import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ModelesEmailService } from './modeles-email.service';
import { CreateModelesEmailDto } from './dto/create-modeles-email.dto';
import { UpdateModelesEmailDto } from './dto/update-modeles-email.dto';

@Controller('modeles-email')
export class ModelesEmailController {
  constructor(private readonly modelesEmailService: ModelesEmailService) {}

  @Post()
  create(@Body() createModelesEmailDto: CreateModelesEmailDto) {
    return this.modelesEmailService.create(createModelesEmailDto);
  }

  @Get()
  findAll() {
    return this.modelesEmailService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.modelesEmailService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateModelesEmailDto: UpdateModelesEmailDto) {
    return this.modelesEmailService.update(id, updateModelesEmailDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.modelesEmailService.remove(id);
  }
}
