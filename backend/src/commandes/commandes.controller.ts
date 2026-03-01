import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommandesService } from './commandes.service';

@Controller('commandes')
export class CommandesController {
  constructor(private readonly commandesService: CommandesService) {}

  @Post()
  create(@Body() createCommandeDto: any) {
    return this.commandesService.create(createCommandeDto);
  }

  @Get()
  findAll() {
    return this.commandesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commandesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommandeDto: any) {
    return this.commandesService.update(id, updateCommandeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commandesService.remove(id);
  }
}
