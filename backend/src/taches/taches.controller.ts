import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TachesService } from './taches.service';
import { CreateTacheDto } from './dto/create-tache.dto';
import { UpdateTacheDto } from './dto/update-tache.dto';

@Controller('taches')
export class TachesController {
  constructor(private readonly tachesService: TachesService) {}

  @Post()
  create(@Body() createTachDto: CreateTacheDto) {
    return this.tachesService.create(createTachDto);
  }

  @Get()
  findAll() {
    return this.tachesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tachesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTachDto: UpdateTacheDto) {
    return this.tachesService.update(id, updateTachDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tachesService.remove(id);
  }
}
