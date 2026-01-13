import { HttpStatus, Controller, Get, Post, Body, Param, Patch, Delete, Query, ParseIntPipe, Put, ParseUUIDPipe, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto, UpdateContactDto } from './dto/create-contact.dto';
import { ListContactDto } from './dto/list-contact.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { BulkUploadResult } from './dto/bulk-upload-result.dto';
import { ListCountryDto } from './dto/list-country.dto';
import { CreateContactBulkDto } from './dto/create-bulk-upload.dto';
import { OptionalJwtAuthGuard } from './utils/optional-auth';
@Controller('contacts')
export class ContactsController {
    constructor(private readonly contactsService: ContactsService) {}
        
    @Get()
    getHello() {
        return { message: 'Welcome to Contact Library' };
    }

    @UseGuards(OptionalJwtAuthGuard)
    @Post('create')
    async create(@Body() createContactDto: CreateContactDto, @Request() req: any) {
        const userId = req.user?.userId || null;
        return this.contactsService.create(createContactDto,userId);
    }

    @UseGuards(OptionalJwtAuthGuard)
    @Get('list')
    async list(@Query() dto: ListContactDto, @Request() req: any) {
        const userId = req.user?.userId || null;
        return this.contactsService.findAll(dto,userId);
    }

    @UseGuards(OptionalJwtAuthGuard)
    @Get('view/:uuid')
    async findOne(@Param('uuid') uuid: string, @Request() req: any) {
        const userId = req.user?.userId || null;
        return this.contactsService.findOne(uuid,userId);
    }

    @UseGuards(OptionalJwtAuthGuard)
    @Patch('update/:uuid')
    async update(@Param('uuid') uuid: string, @Body() dto: UpdateContactDto, @Request() req: any) {
        const userId = req.user?.userId || null;
        return this.contactsService.update(uuid, dto,userId);
    }

    @UseGuards(OptionalJwtAuthGuard)
    @Delete('delete/:uuid')
    async softDelete(@Param('uuid') uuid: string, @Request() req: any) {
        const userId = req.user?.userId || null;
        return this.contactsService.softDelete(uuid,userId);
    }

    @UseGuards(OptionalJwtAuthGuard)
    @Post('bulk-upload') @UseInterceptors(FileInterceptor('file')) 
    async bulkUpload(@UploadedFile() file: Express.Multer.File, @Body() CreateContactBulkDto: CreateContactBulkDto, @Request() req: any): Promise<{ 
        statusCode: number; status: boolean; message: string; data: BulkUploadResult[] }> { 
            const userId = req.user?.userId || null;
            const companyID = CreateContactBulkDto?.companyId || null;
            return this.contactsService.bulkUpload(file,userId, companyID ?? '');
    }
    

    //country
    @Get('country')
    async listCountry(@Query() query: ListCountryDto) {
        const data = await this.contactsService.listCountry(query);
        return {
        statusCode: 200,
        status: true,
        message: 'Countries fetched successfully',
        data,
        };
    }
}
