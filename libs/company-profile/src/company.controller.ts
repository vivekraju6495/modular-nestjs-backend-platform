import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { CompanyProfileService } from './company-profile.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { OptionalJwtAuthGuard } from './utils/optional-auth';
import { ListCompaniesDto } from './dto/list-companies.dto';

@Controller('company')
export class CompanyController {
    constructor(private readonly service: CompanyProfileService) {}

  @Get()
  getHello() {
    return { message: 'Welcome to Company Profile library' };
  }
  
  @UseGuards(OptionalJwtAuthGuard)
  @Post('create')
  create(@Body() dto: CreateCompanyDto,  @Request() req: any) {
    const userId = req.user?.userId || null;
    return this.service.create(dto, userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('list')
  findAll(@Query() dto: ListCompaniesDto, @Request() req: any) {
    const userId = req.user?.userId || null;
    return this.service.findAll(dto,userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('view/:uuid')
  findOne(@Param('uuid') uuid: string, @Request() req: any) {
    return this.service.findByUuid(uuid);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Patch('update/:uuid')
  update(@Param('uuid') uuid: string, @Body() dto: UpdateCompanyDto, @Request() req: any) {
    const userId = req.user?.userId || null;
    return this.service.update(uuid, dto,userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Delete('delete/:uuid')
  remove(@Param('uuid') uuid: string,@Request() req: any) {
    const userId = req.user?.userId || null;
    return this.service.softDelete(uuid,userId);
  }
}

