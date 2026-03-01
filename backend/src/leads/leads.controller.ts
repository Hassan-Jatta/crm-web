import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  @Get()
  findAll() {
    return this.leadsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeadDto: any) {
    return this.leadsService.update(id, updateLeadDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}
