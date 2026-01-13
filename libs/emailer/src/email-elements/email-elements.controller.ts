import { HttpStatus, Controller, Get, Post, Body, Param, Patch, Delete, Query, Request, Put, ParseUUIDPipe, UseGuards  } from '@nestjs/common';
import { EmailElementsService } from './email-elements.service';
import { EmailElementsGroup } from '../entities/emailElementsGroup.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { CreateEmailElementDto } from './dto/create-email-element.dto';
import { UpdateGroupOrderDto } from './dto/reordering-group.dto';
import { ReorderElementsDto } from './dto/reorder-elements.dto';
import { OptionalJwtAuthGuard } from '../utils/optional-auth';

@Controller('emailer/elements')
export class EmailElementsController {
  constructor(private readonly emailElementsService: EmailElementsService) {}

  @Get()
  getHello() {
    return { message: 'Welcome to Email Elements Module' };
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post('group/create')
  async createGroup(@Body() createGroupDto: CreateGroupDto, @Request() req: any) {
    const userId = req.user?.userId || null;
    return this.emailElementsService.createGroup(createGroupDto, userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Put('group/update/:id')
  async updateGroup(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateGroupDto: UpdateGroupDto, @Request() req: any) {
    const userId = req.user?.userId || null;
    return this.emailElementsService.updateGroup(id,updateGroupDto, userId);
  }

  //@UseGuards(OptionalJwtAuthGuard)
  @Get('group/:id')
  async getGroup(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) { //ParseIntPipe ensures that the uuid parameter from the URL is automatically converted to a string.
   // const userId = req.user?.userId || null;
    return this.emailElementsService.getGroupById(id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Delete('group/delete/:id')
  async deleteGroup(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const userId = req.user?.userId || null;
    return this.emailElementsService.deleteGroup(id, userId);
  }

  //@UseGuards(OptionalJwtAuthGuard)
  @Patch('group/reorder')
  async updateGroupOrder(@Body() updateGroupOrderDto: UpdateGroupOrderDto, @Request() req: any) {
    // const userId = req.user?.userId || null;
    return this.emailElementsService.updateGroupOrder(updateGroupOrderDto);
  }

  // common api for fetch all groups and its elements with search option
  @UseGuards(OptionalJwtAuthGuard)
  @Get('list')
  findAll(@Query('search') search?: string, @Request() req?: any) {
    const userId = req.user?.userId || null;
    return this.emailElementsService.findAll(search, userId);
  }

  // elements sections
  @UseGuards(OptionalJwtAuthGuard)
  @Post('create')
  async create(@Body() createElementDto: CreateEmailElementDto, @Request() req: any) {
     const userId = req.user?.userId || null;
    return this.emailElementsService.createElement(createElementDto, userId);
  }

  @Put('update/:id')
  async updateElement(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateElementDto: Partial<CreateEmailElementDto>,
  ) {
    return this.emailElementsService.updateElement(id, updateElementDto);
  }

  @Get(':id')
  async getElementById(@Param('id', ParseUUIDPipe) id: string) {
    return this.emailElementsService.getElementById(id);
  }

  @Delete('delete/:id')
  async deleteElement(@Param('id', ParseUUIDPipe) id: string) {
    return this.emailElementsService.deleteElement(id);
  }

  @Patch('reorder')
  async reorderElements(@Body() dto: ReorderElementsDto) {
    return this.emailElementsService.reorderElements(dto);
  }

}
