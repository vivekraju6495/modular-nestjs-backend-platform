import { HttpException, HttpStatus, Inject, Injectable, InternalServerErrorException, NotFoundException,  Optional } from '@nestjs/common';
import { DeepPartial, Repository } from 'typeorm';
import { EmailTemplate } from '../entities/emailTemplates.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { ListEmailTemplatesDto } from './dto/list-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import { OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';


let AuthService: any;
try {
  ({ AuthService } = require('libs/auth/src'));
} catch (e) {
  AuthService = null;
}

let CompanyProfileService: any;
try {
  ({ CompanyProfileService } = require('libs/company-profile/src'));
} catch (e) {
  CompanyProfileService = null;
}
@Injectable()
export class EmailTemplatesService implements OnModuleInit{
    private authService?: any;
    private companyService?: any;
    constructor(
        @InjectRepository(EmailTemplate)
        private readonly emailTemplateRepo: Repository<EmailTemplate>,

        // @Optional()
        // @Inject(AuthService)
        // private readonly authService?: typeof AuthService,

        // @Optional()
        // @Inject(CompanyProfileService)
        // private readonly companyService?: typeof CompanyProfileService,

            private readonly moduleRef: ModuleRef, 
    ) {}

    async onModuleInit() {
    
        if (CompanyProfileService) {
            try {
                this.companyService = this.moduleRef.get(CompanyProfileService, { strict: false });
            } catch {
                console.log('Company Service not found in DI container');
                this.companyService = null;
            }
        } else {
            console.log('Company library not installed, skipping');
        }

         if (AuthService) {
            try {
                this.authService = this.moduleRef.get(AuthService, { strict: false });
            } catch {
                console.log('Auth Service not found in DI container');
                this.authService = null;
            }
        } else {
            console.log('Auth library not installed, skipping');
        }


    }

    async create(dto: CreateEmailTemplateDto, userUuId:string) {
        
        try {
            let userIdnew: number | null = null;
            if (this.authService && userUuId) {
                const user = await this.authService.getUserByUuid(userUuId);
                userIdnew = user?.id ?? null;
            }
            let companyId: number | null = null;
            if (this.companyService && dto.companyId) {
                const company = await this.companyService.getCompanyDetailsByUuid(dto.companyId);
                companyId = company?.id ?? null;
            }

            const data: DeepPartial<EmailTemplate> = {
                ...dto,
                user_id: userIdnew ?? null,
                companyId:companyId ?? null,
                created_by: userIdnew ?? null,
            };

            const template = this.emailTemplateRepo.create(data);
            const savedTemplate = await this.emailTemplateRepo.save(template);

            // Remove internal id from response
            const { id, ...result } = savedTemplate;

            return {
                statusCode: HttpStatus.CREATED,
                status: true,
                message: 'Email template created successfully',
                data: result,
            };
        } catch (error) {
            console.error('Failed to create email template:', error);
            return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            status: false,
            message: 'Failed to create email template',
            error: error.message || 'Internal Server Error',
            data: null,
            };
        }
    }

    async list(dto: ListEmailTemplatesDto, userUuId: string) {
        try {
            const { page = 1, limit = 10, search, version, type } = dto;

            let userId: number | null = null;
            if (this.authService && userUuId) {
            const user = await this.authService.getUserByUuid(userUuId);
            userId = user?.id ?? null;
            }

            let companyId: number | null = null;
            if (this.companyService && dto.companyId) {
                const company = await this.companyService.getCompanyDetailsByUuid(dto.companyId);
                companyId = company?.id ?? null;
            }

            const query = this.emailTemplateRepo.createQueryBuilder('template');

            // Filter by user if applicable
            if (userId) {
            query.andWhere('template.user_id = :userId OR template.user_id IS NULL', { userId });
            }

            if (companyId) {
            query.andWhere('template.companyId = :companyId OR template.companyId IS NULL', { companyId });
            }

            //  Always include only active templates
            query.andWhere('template.status = :status', { status: 1 });

            // Search by name or description
            if (search) {
            query.andWhere(
                '(template.name ILIKE :search OR template.description ILIKE :search)',
                { search: `%${search}%` }
            );
            }

            // Filter by version
            if (version) {
            query.andWhere('template.version = :version', { version });
            }

            // Filter by type
            if (type) {
            query.andWhere('template.type = :type', { type });
            }

            // Sorting and pagination
            query.orderBy('template.created_at', 'DESC');
            query.skip((page - 1) * limit);
            query.take(limit);

            const [templates, total] = await query.getManyAndCount();

            // Remove internal id before sending response
            const data = templates.map(({ id, ...rest }) => rest);

            return {
            statusCode: HttpStatus.OK,
            status: true,
            message: 'Email templates fetched successfully',
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            };
        } catch (error) {
            console.error('Failed to fetch email templates:', error);
            return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            status: false,
            message: 'Failed to fetch email templates',
            error: error.message || 'Internal Server Error',
            data: null,
            };
        }
    }

    async update(uuid: string, dto: UpdateEmailTemplateDto, userUuId: string) {
        try {
            let userId: number | null = null;
            if (this.authService && userUuId) {
                const user = await this.authService.getUserByUuid(userUuId);
                userId = user?.id ?? null;
            }

            let companyId: number | null = null;
            if (this.companyService && dto.companyId) {
                const company = await this.companyService.getCompanyDetailsByUuid(dto.companyId);
                companyId = company?.id ?? null;
            }

            const template = await this.emailTemplateRepo.findOne({
                where: { uuid },
            });

            if (!template) {
                return {
                    statusCode: HttpStatus.NOT_FOUND,
                    status: false,
                    message: 'Email template not found',
                    data: null,
                };
            }

            // Ensure userId matches if provided
            if (userId && template.user_id !== userId) {
                return {
                    statusCode: HttpStatus.FORBIDDEN,
                    status: false,
                    message: 'Unauthorized to update this template',
                    data: null,
                };
            }

            Object.assign(template, dto);
            await this.emailTemplateRepo.save(template);

            return {
                statusCode: HttpStatus.OK,
                status: true,
                message: 'Email template updated successfully',
                data: template,
            };

        } catch (error) {
            console.error('Failed to update email template:', error);
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                status: false,
                message: 'Failed to update email template',
                error: error.message || 'Internal Server Error',
                data: null,
            };
        }
    }


    async getTemplateByUuid(uuid: string, userUuId: string) {
        try {
            let userId: number | null = null;
            if (this.authService && userUuId) {
                const user = await this.authService.getUserByUuid(userUuId);
                userId = user?.id ?? null;
            }

            const query = this.emailTemplateRepo
                .createQueryBuilder('template')
                .where('template.uuid = :uuid', { uuid })
                .andWhere('template.status = :status', { status: true });

            if (userId) {
                query.andWhere('template.user_id = :userId OR template.user_id IS NULL', { userId });
            }

            const template = await query.select([
                'template.uuid',
                'template.name',
                'template.description',
                'template.model',
                'template.html',
                'template.layout',
                'template.version',
                'template.is_published',
                'template.thumbnail_url',
                'template.type',
                'template.created_at',
                'template.updated_at',
            ]).getOne();

            if (!template) {
                return {
                    statusCode: HttpStatus.NOT_FOUND,
                    status: false,
                    message: 'Template not found or inactive',
                    data: null,
                };
            }

            return {
                statusCode: HttpStatus.OK,
                status: true,
                message: 'Template fetched successfully',
                data: template,
            };
        } catch (error) {
            console.error('Failed to fetch template:', error);
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                status: false,
                message: 'Failed to fetch template',
                error: error.message || 'Internal Server Error',
                data: null,
            };
        }
    }

    async deleteTemplateByUuid(uuid: string, userUuId: string) {
        try {
            let userId: number | null = null;
            if (this.authService && userUuId) {
                const user = await this.authService.getUserByUuid(userUuId);
                userId = user?.id ?? null;
            }

            const template = await this.emailTemplateRepo.findOne({
                where: { uuid },
            });

            if (!template) {
                return {
                    statusCode: HttpStatus.NOT_FOUND,
                    status: false,
                    message: 'Email template not found',
                    data: null,
                };
            }

            // Ensure userId matches if provided
            if (userId && template.user_id !== userId) {
                return {
                    statusCode: HttpStatus.FORBIDDEN,
                    status: false,
                    message: 'Unauthorized to delete this template',
                    data: null,
                };
            }

            // Soft delete by setting status to false
            template.status = false;
            await this.emailTemplateRepo.save(template);

            return {
                statusCode: HttpStatus.OK,
                status: true,
                message: 'Email template deleted successfully',
                data: { uuid: template.uuid },
            };

        } catch (error) {
            console.error('Failed to delete email template:', error);
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                status: false,
                message: 'Failed to delete email template',
                error: error.message || 'Internal Server Error',
                data: null,
            };
        }
    }

}