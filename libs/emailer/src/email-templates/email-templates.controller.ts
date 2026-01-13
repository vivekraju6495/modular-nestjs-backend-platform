import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { ListEmailTemplatesDto } from './dto/list-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import { EmailTemplatesService } from './email-templates.service';
// import { OptionalJwtAuthGuard } from '@app/auth/guards/optional-jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../utils/optional-auth';
@Controller('emailer/templates')
export class EmailTemplatesController {
  constructor(private readonly service: EmailTemplatesService) { }

  @Get()
  getHello() {
    return { message: 'Welcome to Email Templates Module' };
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post('create')
  async create(@Body() dto: CreateEmailTemplateDto, @Request() req: any) {
    const userId = req.user?.userId || null;
    return this.service.create(dto, userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('list')
  async list(@Query() dto: ListEmailTemplatesDto, @Request() req: any) {
    const userId = req.user?.userId || null;
    return this.service.list(dto, userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Patch('update/:uuid')
  async update(@Param('uuid') uuid: string, @Body() body: UpdateEmailTemplateDto, @Request() req: any) {
    const userId = req.user?.userId || null;
    return await this.service.update(uuid, body, userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('view/:uuid')
  async getTemplate(@Param('uuid') uuid: string, @Request() req: any) {
    const userId = req.user?.userId || null;
    return this.service.getTemplateByUuid(uuid, userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Delete('delete/:uuid')
  async deleteElement(@Param('uuid', ParseUUIDPipe) uuid: string, @Request() req: any) {
    const userId = req.user?.userId || null;
    return this.service.deleteTemplateByUuid(uuid, userId);
  }


}
