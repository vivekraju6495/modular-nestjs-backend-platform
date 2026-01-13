import { HttpStatus, Controller, Get, Post, Body, Param, Patch, Delete, Query, ParseIntPipe, Put, ParseUUIDPipe, UseGuards, Request } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { OptionalJwtAuthGuard } from '../utils/optional-auth';
import { ListCampaignDto } from './dto/lists-campaign.dto';

@Controller('emailer/campaigns')
export class CampaignsController {
    constructor(private readonly campaignsService: CampaignsService) {}
    
    @Get()
    getHello() {
        return { message: 'Welcome to Campaigns Module' };
    }

    @UseGuards(OptionalJwtAuthGuard)
    @Post('create')
    async create(@Body() createCampaignDto: CreateCampaignDto,  @Request() req: any) {
        console.log("user id as : ", req.user);
        const userId = req.user?.userId || null;
        return this.campaignsService.create(createCampaignDto, userId);
    }

    @UseGuards(OptionalJwtAuthGuard)
    @Get('list')
    async list(@Query() dto: ListCampaignDto, @Request() req: any) {
        const userId = req.user?.userId || null;
        return this.campaignsService.list(dto, userId);
    }

    @UseGuards(OptionalJwtAuthGuard)
    @Get('view/:uuid')
    async getTemplate(@Param('uuid') uuid: string, @Request() req: any) {
        const userId = req.user?.userId || null;
        return this.campaignsService.findOne(uuid,userId);
    }

    @UseGuards(OptionalJwtAuthGuard)
    @Patch('update/:uuid')
      async update(@Param('uuid') uuid: string, @Body() body: UpdateCampaignDto, @Request() req: any) {
        const userId = req.user?.userId || null;
        return await this.campaignsService.update(uuid, body, userId);
    }

    @UseGuards(OptionalJwtAuthGuard)
    @Delete('delete/:id')
    remove(@Param('id') id: string, @Request() req: any) {
        const userId = req.user?.userId || null;
        return this.campaignsService.delete(id, userId);
    }
}
