import { HttpException, HttpStatus, Inject, Injectable, InternalServerErrorException, NotFoundException, Optional } from '@nestjs/common';
import { OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, IsNull, DeepPartial } from 'typeorm';
import { CampaignStatus, EmailCampaign } from '../entities/emailCampaigns.entity';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { ListCampaignDto } from './dto/lists-campaign.dto';
import { EmailTemplate } from '../entities/emailTemplates.entity';
import { EmailSendJob, JobStatus } from '../entities/emailSendJob.entity';
// import { QueueManagerService } from '@app/queue-manager/queue-manager.service';
import type { Redis } from 'ioredis';

let AuthService: any;
try {
  ({ AuthService } = require('libs/auth/src'));
} catch (e) {
  AuthService = null;
}

let ContactsService: any;
try {
  ({ ContactsService } = require('libs/contacts/src'));
} catch (e) {
  ContactsService = null;
}

let EmailService: any;
try {
  ({ EmailService } = require('libs/email/src'));
} catch (e) {
  EmailService = null;
}

let QueueManagerService: any;
try {
  ({ QueueManagerService } = require('libs/queue-manager/src'));
} catch (e) {
  QueueManagerService = null;
}

let CompanyProfileService: any;
try {
  ({ CompanyProfileService } = require('libs/company-profile/src'));
} catch (e) {
  CompanyProfileService = null;
}

@Injectable()
export class CampaignsService implements OnModuleInit{
    private contactsService?: any;
    private emailService?: any;
    private authService?: any;
    private companyService?: any;
    private queueManagerService?: any;

    constructor(
    @InjectRepository(EmailCampaign)
    private readonly campaignRepo: Repository<EmailCampaign>,

    @InjectRepository(EmailTemplate)
    private readonly emailTemplateRepo: Repository<EmailTemplate>,

    @InjectRepository(EmailSendJob)
    private readonly emailSendJobRepo: Repository<EmailSendJob>,

    // @Optional() 
    // private readonly queueManagerService: QueueManagerService,
    
    private readonly moduleRef: ModuleRef,  
    
) {}

    async onModuleInit() {
        if (ContactsService) {
            try {
                this.contactsService = this.moduleRef.get(ContactsService, { strict: false });
            } catch {
                console.log('ContactsService not found in DI container');
                this.contactsService = null;
            }
        } else {
            console.log('Contacts library not installed, skipping');
        }

        if (EmailService) {
            try {
                this.emailService = this.moduleRef.get(EmailService, { strict: false });
            } catch {
                console.log('Email Service not found in DI container');
                this.emailService = null;
            }
        } else {
            console.log('Email library not installed, skipping');
        }

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

        if (QueueManagerService) {
            try {
                this.queueManagerService = this.moduleRef.get(QueueManagerService, { strict: false });
            } catch {
                console.log('Queue Manager Service Service not found in DI container');
                this.queueManagerService = null;
            }
        } else {
            console.log('Queue Manager library not installed, skipping');
        }

    }

    async create(dto: CreateCampaignDto, userUuId: string) {
        try {
            const template = await this.emailTemplateRepo.findOneBy({ uuid: dto.templateId });
            if (!template) {
                return {
                    statusCode: HttpStatus.NOT_FOUND,
                    status: false,
                    message: 'Template not found',
                    data: null,
                };
            }

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

            let normalizedAudience: string[] = [];
            if (Array.isArray(dto.audience)) {
            if (dto.audience.length > 0 && typeof dto.audience[0] === 'object') {
                // case: { uuid: string }[]
                normalizedAudience = (dto.audience as { uuid: string }[]).map(a => a.uuid);
            } else {
                // case: string[]
                normalizedAudience = dto.audience as string[];
            }
            }

            const campaignData: DeepPartial<EmailCampaign> = {
            ...dto,
            userId: userId ?? null,
            companyId: companyId ?? null,
            createdBy: userId ?? null,
            templateId: template.id,
            audience: normalizedAudience,
            emails: dto.emails ?? [],
            is_sent:dto?.isSent
            };

            const campaign = this.campaignRepo.create(campaignData);
            const savedCampaign = await this.campaignRepo.save(campaign);

            const jobs: EmailSendJob[] = [];

            if ([CampaignStatus.SENT, CampaignStatus.SENDING].includes(dto.status)) {
                // 1. Audience contacts
                if (Array.isArray(dto.audience) && dto.audience.length > 0 && this.contactsService) {
                    const contacts = await Promise.all(
                        dto.audience.map((uuid) => uuid ? this.contactsService.getContactByUuid(uuid) : null),
                    );
                    const validContacts = contacts.filter(Boolean);
                    jobs.push(
                        ...validContacts.map((contact) =>
                            this.emailSendJobRepo.create({
                                campaignId: savedCampaign.id,
                                recipient_contact_id: contact.uuid,
                                email: contact.email,
                                status: JobStatus.QUEUED,
                                attempts: 0,
                            }),
                        ),
                    );
                }

                // 2. Raw emails
                if (Array.isArray(dto.emails) && dto.emails.length > 0) {
                    jobs.push(
                        ...dto.emails.filter(Boolean).map((email) =>
                            this.emailSendJobRepo.create({
                                campaignId: savedCampaign.id,
                                recipient_contact_id: null,
                                email,
                                status: JobStatus.QUEUED,
                                attempts: 0,
                            }),
                        ),
                    );
                }

                // 3. Save jobs
                if (jobs.length > 0) {
                    await this.emailSendJobRepo.insert(jobs);
                }

                // 4. Trigger email sending
                if (this.emailService) {
                    console.log("Email service exists and entering the condition");
                    const campaignJobs = await this.getEmailJobByCampaignId(savedCampaign.id);
                    if (!campaignJobs?.length) {
                        console.log('No queued jobs for this campaign');
                    } else {
                        const campaignWithTemplate = await this.getCampaignTemplateByCampaignId(savedCampaign.id);
                        if (!campaignWithTemplate?.template) {
                            console.log('No template found for this campaign');
                        } else {
                            await this.sendBulkEmails(
                                savedCampaign.id,
                                campaignJobs,
                                campaignWithTemplate,
                                JobStatus,
                            );
                        }
                    }
                }
            }

            // Response cleanup
            const { id, ...result } = savedCampaign;
            return {
                statusCode: HttpStatus.CREATED,
                status: true,
                message: 'Email campaign created successfully',
                data: result,
            };
        } catch (error) {
            console.error('Failed to create email campaign:', error);
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                status: false,
                message: 'Failed to create email campaign',
                error: error.message || 'Internal Server Error',
                data: null,
            };
        }
    }

    // async list(dto: ListCampaignDto, userUuid: string) {
    //     try {
    //         const { page = 1, limit = 10, search, status, sendAt, isSent, companyId: companyUuid } = dto;

    //         // Step 1: Resolve User and Company IDs
    //         let userId: number | null = null;
    //         if (this.authService && userUuid) {
    //         const user = await this.authService.getUserByUuid(userUuid);
    //         userId = user?.id ?? null;
    //         }

    //         let companyId: number | null = null;
    //         if (this.companyService && companyUuid) {
    //         const company = await this.companyService.getCompanyDetailsByUuid(companyUuid);
    //         companyId = company?.id ?? null;
    //         }

    //         // Step 2: Build Query
    //         const query = this.campaignRepo
    //         .createQueryBuilder('campaign')
    //         .leftJoinAndSelect('campaign.template', 'template')
    //         .where('campaign.deletedAt IS NULL');

    //         if (userId) {
    //         query.andWhere('campaign.userId = :userId', { userId });
    //         }

    //         if (companyId) {
    //         query.andWhere('campaign.companyId = :companyId', { companyId });
    //         }

    //         if (search) {
    //         query.andWhere(
    //             '(campaign.name ILIKE :search OR campaign.subject ILIKE :search OR template.name ILIKE :search)',
    //             { search: `%${search}%` }
    //         );
    //         }

    //         if (status) {
    //         query.andWhere('campaign.status = :status', { status });
    //         }

    //         if (typeof isSent === 'boolean') {
    //         query.andWhere('campaign.isSent = :isSent', { isSent });
    //         }

    //         if (sendAt) {
    //         // Ensure sendAt is a Date or valid string
    //         const formattedDate =
    //             sendAt instanceof Date
    //             ? sendAt.toISOString().split('T')[0]
    //             : new Date(sendAt).toISOString().split('T')[0];

    //         query.andWhere('DATE(campaign.sendAt) = :sendAt', { sendAt: formattedDate });
    //         }

    //         // Step 3: Pagination + Sorting
    //         query.orderBy('campaign.createdAt', 'DESC');
    //         query.skip((page - 1) * limit);
    //         query.take(limit);

    //         // Step 4: Execute Query
    //         const [campaigns, total] = await query.getManyAndCount();

    //         // Step 5: Transform Response
    //         const data = campaigns.map((c) => ({
    //         uuid: c.uuid,
    //         name: c.name,
    //         fromName: c.fromName,
    //         fromEmail: c.fromEmail,
    //         replyTo: c.replyTo,
    //         subject: c.subject,
    //         status: c.status,
    //         sendAt: c.sendAt,
    //         createdAt: c.createdAt,
    //         updatedAt: c.updatedAt,
    //         isSent: c.is_sent,
    //         audianceCount: 
    //         template: c.template
    //             ? {
    //                 uuid: c.template.uuid,
    //                 id: c.template.id,
    //                 name: c.template.name,
    //                 html: c.template.html,
    //                 model: c.template.model,
    //             }
    //             : null,
    //         }));

    //         // Step 6: Return Structured Response
    //         return {
    //         statusCode: HttpStatus.OK,
    //         status: true,
    //         message: 'Campaigns fetched successfully',
    //         data,
    //         meta: {
    //             total,
    //             page,
    //             limit,
    //             totalPages: Math.ceil(total / limit),
    //         },
    //         };
    //     } catch (error) {
    //         console.error('Failed to fetch campaigns:', error);
    //         return {
    //         statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    //         status: false,
    //         message: 'Failed to fetch campaigns',
    //         error: error.message || 'Internal Server Error',
    //         data: null,
    //         };
    //     }
    // }

    async list(dto: ListCampaignDto, userUuid: string) {
        try {
            const { page = 1, limit = 10, search, status, sendAt, isSent, companyId: companyUuid } = dto;

            // Step 1: Resolve User and Company IDs
            let userId: number | null = null;
            if (this.authService && userUuid) {
            const user = await this.authService.getUserByUuid(userUuid);
            userId = user?.id ?? null;
            }

            let companyId: number | null = null;
            if (this.companyService && companyUuid) {
            const company = await this.companyService.getCompanyDetailsByUuid(companyUuid);
            companyId = company?.id ?? null;
            }

            // Step 2: Build Query
            const query = this.campaignRepo
            .createQueryBuilder('campaign')
            .leftJoinAndSelect('campaign.template', 'template')
            .where('campaign.deletedAt IS NULL');

            if (userId) query.andWhere('campaign.userId = :userId', { userId });
            if (companyId) query.andWhere('campaign.companyId = :companyId', { companyId });

            if (search) {
            query.andWhere(
                '(campaign.name ILIKE :search OR campaign.subject ILIKE :search OR template.name ILIKE :search)',
                { search: `%${search}%` }
            );
            }

            if (status) query.andWhere('campaign.status = :status', { status });
            if (typeof isSent === 'boolean') query.andWhere('campaign.isSent = :isSent', { isSent });

            if (sendAt) {
            const formattedDate =
                sendAt instanceof Date
                ? sendAt.toISOString().split('T')[0]
                : new Date(sendAt).toISOString().split('T')[0];
            query.andWhere('DATE(campaign.sendAt) = :sendAt', { sendAt: formattedDate });
            }

            // Step 3: Pagination + Sorting
            query.orderBy('campaign.createdAt', 'DESC');
            query.skip((page - 1) * limit);
            query.take(limit);

            // Step 4: Execute Query
            const [campaigns, total] = await query.getManyAndCount();

            // Step 5: Transform Response
            const data = campaigns.map((c) => {
            let audienceCount = 0;

            try {
                const audienceArr = Array.isArray(c.audience)
                ? c.audience
                : JSON.parse(c.audience || '[]');
                const emailArr = Array.isArray(c.emails)
                ? c.emails
                : JSON.parse(c.emails || '[]');

                audienceCount = audienceArr.length + emailArr.length;
            } catch (err) {
                console.warn(`Error parsing JSON for campaign ${c.uuid}:`, err);
            }

            return {
                uuid: c.uuid,
                name: c.name,
                fromName: c.fromName,
                fromEmail: c.fromEmail,
                replyTo: c.replyTo,
                subject: c.subject,
                status: c.status,
                sendAt: c.sendAt,
                createdAt: c.createdAt,
                updatedAt: c.updatedAt,
                isSent: c.is_sent,
                audienceCount,
                template: c.template
                ? {
                    uuid: c.template.uuid,
                    id: c.template.id,
                    name: c.template.name,
                    html: c.template.html,
                    model: c.template.model,
                    }
                : null,
            };
            });

            // Step 6: Return Structured Response
            return {
            statusCode: HttpStatus.OK,
            status: true,
            message: 'Campaigns fetched successfully',
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            };
        } catch (error) {
            console.error('Failed to fetch campaigns:', error);
            return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            status: false,
            message: 'Failed to fetch campaigns',
            error: error.message || 'Internal Server Error',
            data: null,
            };
        }
    }


    async findOne(uuid: string, userUuid: string, companyUuid?: string) {
        try {
            let userId: number | null = null;
            let companyId: number | null = null;

            // Resolve User ID if AuthService is available
            if (this.authService && userUuid) {
            const user = await this.authService.getUserByUuid(userUuid);
            userId = user?.id ?? null;
            }

            // Resolve Company ID if provided and service available
            // if (this.companyService && companyUuid) {
            // const company = await this.companyService.getCompanyDetailsByUuid(companyUuid);
            // companyId = company?.id ?? null;
            // }

            // Build base query
            const query = this.campaignRepo
            .createQueryBuilder('campaign')
            .leftJoinAndSelect('campaign.template', 'template')
            .where('campaign.uuid = :uuid', { uuid })
            .andWhere('campaign.deletedAt IS NULL'); // use correct column name

            if (userId) {
            query.andWhere('campaign.userId = :userId', { userId });
            }

            // if (companyId) {
            // query.andWhere('campaign.company_id = :companyId', { companyId });
            // }

            //Select only required columns
            query.select([
            'campaign.id',
            'campaign.uuid',
            'campaign.name',
            'campaign.fromName',
            'campaign.fromEmail',
            'campaign.replyTo',
            'campaign.subject',
            'campaign.status',
            'campaign.sendAt',
            'campaign.audience',
            'campaign.emails',
            'campaign.is_sent',
            'template.id',
            'template.uuid',
            'template.name',
            'template.html',
            'template.model',
            ]);

            const campaign = await query.getOne();

            // Handle not found
            if (!campaign) {
            return {
                statusCode: HttpStatus.NOT_FOUND,
                status: false,
                message: 'Campaign not found',
                data: null,
            };
            }

            // Enrich audience with contact details (if service available)
            let enrichedAudience = campaign.audience;
            if (this.contactsService && Array.isArray(campaign.audience)) {
            const rawAudience = campaign.audience as (string | { uuid: string })[];

            const resolvedContacts = await Promise.all(
                rawAudience.map(async (aud) => {
                const audUuid = typeof aud === 'string' ? aud : aud?.uuid;
                if (!audUuid) return null;

                try {
                    const contact = await this.contactsService.getContactByUuid(audUuid);
                    return contact ?? null;
                } catch {
                    return null;
                }
                }),
            );

            enrichedAudience = resolvedContacts.filter(Boolean);
            }

            // Prepare final response
            const { template, ...campaignData } = campaign;

            return {
            statusCode: HttpStatus.OK,
            status: true,
            message: 'Campaign fetched successfully',
            data: {
                ...campaignData,
                isSent: campaign.is_sent, // normalize naming
                audience: enrichedAudience,
                template: template
                ? {
                    uuid: template.uuid,
                    id: template.id,
                    name: template.name,
                    html: template.html,
                    model: template.model,
                    }
                : null,
            },
            };
        } catch (error) {
            console.error('Failed to fetch campaign:', error);
            return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            status: false,
            message: 'Failed to fetch campaign',
            error: error.message || 'Internal Server Error',
            data: null,
            };
        }
    }

    async update(uuid: string, dto: UpdateCampaignDto, userUuId: string) {
        try {
            const existingCampaign = await this.campaignRepo.findOne({
                where: { uuid },
            });

            if (!existingCampaign) {
                return {
                    statusCode: HttpStatus.NOT_FOUND,
                    status: false,
                    message: 'Campaign not found',
                    data: null,
                };
            }

            const template = await this.emailTemplateRepo.findOneBy({ uuid: dto.templateId });

            if (!template) {
                return {
                    statusCode: HttpStatus.NOT_FOUND,
                    status: false,
                    message: 'Template not found',
                    data: null,
                };
            }

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

            let normalizedAudience: string[] = [];
            if (Array.isArray(dto.audience)) {
            if (dto.audience.length > 0 && typeof dto.audience[0] === 'object') {
                // case: { uuid: string }[]
                normalizedAudience = (dto.audience as { uuid: string }[]).map(a => a.uuid);
            } else {
                // case: string[]
                normalizedAudience = dto.audience as string[];
            }
            }

            const campaignData: DeepPartial<EmailCampaign> = {
            ...dto,
            userId: userId ?? null,
            companyId: companyId ?? null,
            createdBy: userId ?? null,
            templateId: template.id,
            audience: normalizedAudience,
            emails: dto.emails ?? [],
            is_sent:dto?.isSent
            };

            await this.campaignRepo.update({ uuid }, campaignData);

            const jobs: EmailSendJob[] = [];
            
            if ([CampaignStatus.SENT, CampaignStatus.SENDING].includes(dto.status)) {
                // 1. Audience contacts
                if (Array.isArray(dto.audience) && dto.audience.length > 0 && this.contactsService) {
                    const contacts = await Promise.all(
                        dto.audience.map((uuid) => uuid ? this.contactsService.getContactByUuid(uuid) : null),
                    );
                    const validContacts = contacts.filter(Boolean);
                    jobs.push(
                        ...validContacts.map((contact) =>
                            this.emailSendJobRepo.create({
                                campaignId: existingCampaign.id,
                                recipient_contact_id: contact.uuid,
                                email: contact.email,
                                status: JobStatus.QUEUED,
                                attempts: 0,
                            }),
                        ),
                    );
                }

                // 2. Raw emails
                if (Array.isArray(dto.emails) && dto.emails.length > 0) {
                    jobs.push(
                        ...dto.emails.filter(Boolean).map((email) =>
                            this.emailSendJobRepo.create({
                                campaignId: existingCampaign.id,
                                recipient_contact_id: null,
                                email,
                                status: JobStatus.QUEUED,
                                attempts: 0,
                            }),
                        ),
                    );
                }

                // 3. Save jobs
                if (jobs.length > 0) {
                    await this.emailSendJobRepo.insert(jobs);
                }

                // 4. Trigger email sending
                if (this.emailService) {
                    console.log("Email service exists and entering the condition");
                    const campaignJobs = await this.getEmailJobByCampaignId(existingCampaign.id);
                    if (!campaignJobs?.length) {
                        console.log('No queued jobs for this campaign');
                    } else {
                        const campaignWithTemplate = await this.getCampaignTemplateByCampaignId(existingCampaign.id);
                        if (!campaignWithTemplate?.template) {
                            console.log('No template found for this campaign');
                        } else {
                            await this.sendBulkEmails(
                                existingCampaign.id,
                                campaignJobs,
                                campaignWithTemplate,
                                JobStatus,
                            );
                        }
                    }
                }
            }


            const updatedCampaign = await this.campaignRepo.findOne({
                where: { uuid },
                relations: ['template'],
            });

            if (!updatedCampaign) {
                return {
                    statusCode: HttpStatus.NOT_FOUND,
                    status: false,
                    message: 'Campaign not found after update',
                    data: null,
                };
            }

            const { id, ...result } = updatedCampaign;

            return {
                statusCode: HttpStatus.OK,
                status: true,
                message: 'Email campaign updated successfully',
                data: result,
            };

        } catch (error) {
            console.error('Failed to update email campaign:', error);
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                status: false,
                message: 'Failed to update email campaign',
                error: error.message || 'Internal Server Error',
                data: null,
            };
        }
    }

    async delete(uuid: string, userUuId: string) {
        try {
            let userId = null;
            if (this.authService && userUuId) {
                userId = await this.authService.getUserByUuid(userUuId);
            }

            const campaign = await this.campaignRepo.findOne({
                where: { uuid },
            });

            if (!campaign) {
                return {
                    statusCode: HttpStatus.NOT_FOUND,
                    status: false,
                    message: 'Campaign not found',
                    data: null,
                };
            }

            // Ensure userId matches if provided
            if (userId && campaign.userId !== userId) {
                return {
                    statusCode: HttpStatus.FORBIDDEN,
                    status: false,
                    message: 'Unauthorized to delete this campaign',
                    data: null,
                };
            }
            //softRemove(entity) → Loads the entity, sets deleted_at = NOW(), and saves it.
            //softDelete(criteria) → Executes a direct UPDATE ... SET deleted_at = NOW() without loading the entity first.
            await this.campaignRepo.softRemove(campaign); 

            return {
                statusCode: HttpStatus.OK,
                status: true,
                message: 'Email campaign deleted successfully',
                data: null,
            };
        } catch (error) {
            console.error('Failed to delete email campaign:', error);
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                status: false,
                message: 'Failed to delete email campaign',
                error: error.message || 'Internal Server Error',
                data: null,
            };
        }
    }

    async getEmailJobByCampaignId(id: number){
        const query = await this.emailSendJobRepo.find({
            where: { 
                campaignId: id,
                status: JobStatus.QUEUED,
                deletedAt : IsNull()
            }
        });
        if (!query) {
            return null;
        }

        return query;
    }

    async getCampaignTemplateByCampaignId(id: number){
        const query = this.campaignRepo
            .createQueryBuilder('campaign')
            .leftJoinAndSelect('campaign.template', 'template')
            .where('campaign.id = :id', { id })
            .andWhere('campaign.deletedAt IS NULL')
            .select([
                'campaign.uuid',
                'campaign.name',
                'campaign.fromName',
                'campaign.fromEmail',
                'campaign.replyTo',
                'campaign.subject',
                'campaign.status',
                'campaign.sendAt',
                'campaign.audience',
                'campaign.emails',
                'template.uuid',
                'template.name',
                'template.html',
                'template.model',
            ])
            .getOne();
        if (!query) {
            return null;
        }

        return query;
    }

    async sentCampaignEmails(campaign: any){
        try {
            const jobs: EmailSendJob[] = [];
            if ([CampaignStatus.SCHEDULED, CampaignStatus.SENT].includes(campaign.status)) {
                    // 1. Audience contacts
                if (Array.isArray(campaign.audience) && campaign.audience.length > 0 && this.contactsService) {
                    const contacts = await Promise.all(
                        campaign.audience.map((uuid) => uuid ? this.contactsService.getContactByUuid(uuid) : null),
                    );
                    const validContacts = contacts.filter(Boolean);
                    jobs.push(
                        ...validContacts.map((contact) =>
                            this.emailSendJobRepo.create({
                                campaignId: campaign.id,
                                recipient_contact_id: contact.uuid,
                                email: contact.email,
                                status: JobStatus.QUEUED,
                                attempts: 0,
                            }),
                        ),
                    );
                }

                // 2. Raw emails
                if (Array.isArray(campaign.emails) && campaign.emails.length > 0) {
                    jobs.push(
                        ...campaign.emails.filter(Boolean).map((email) =>
                            this.emailSendJobRepo.create({
                                campaignId: campaign.id,
                                recipient_contact_id: null,
                                email,
                                status: JobStatus.QUEUED,
                                attempts: 0,
                            }),
                        ),
                    );
                }

                // 3. Save jobs
                if (jobs.length > 0) {
                    await this.emailSendJobRepo.insert(jobs);
                }

                // 4. Trigger email sending
                if (this.emailService) {
                    console.log("Email service exists and entering the condition");
                    const campaignJobs = await this.getEmailJobByCampaignId(campaign.id);
                    if (!campaignJobs?.length) {
                        console.log('No queued jobs for this campaign');
                    } else {
                        const campaignWithTemplate = await this.getCampaignTemplateByCampaignId(campaign.id);
                        if (!campaignWithTemplate?.template) {
                            console.log('No template found for this campaign');
                        } else {
                            await this.sendBulkEmails(
                                campaign.id,
                                campaignJobs,
                                campaignWithTemplate,
                                JobStatus,
                            );
                        }
                    }
                }
                return true
            }else{
                console.log("campaign status not matching:", campaign.status);
                return false;
            }
           
        } catch (error) {
            console.log("error :", error);
            return false;
        }
    }

    // async sendBulkEmails(campaignId: number, jobs: any[], campaign: any, JobStatus: any) {
    //     // ensure service is available
    //     if (!this.queueManagerService) {
    //         console.warn('QueueManagerService not available, skipping bulk email enqueue');
    //         this.emailService.sendCampaignEmail(campaignId, jobs, campaign, JobStatus);
    //     }

    //     await this.queueManagerService.enqueueBulkEmails(campaignId, jobs, campaign, JobStatus);
    // }



    async sendBulkEmails(
        campaignId: number,
        jobs: any[],
        campaign: any,
        JobStatus: any
    ) {
        try {
            //Check if queue service exists
            if (!this.queueManagerService || !this.queueManagerService.queues?.length) {
            console.warn('QueueManagerService not available — sending emails directly...');
            return this.emailService.sendCampaignEmail(campaignId, jobs, campaign, JobStatus);
            }

            // 2️ Check if any Redis client is connected
            let isRedisConnected = false;

            for (const queue of this.queueManagerService.queues) {
            try {
                const client = await queue.client;
                const redisClient = client as unknown as Redis;

                const pong = await redisClient.ping();
                if (pong === 'PONG') {
                isRedisConnected = true;
                break; // At least one Redis connection active
                }
            } catch (err: any) {
                console.warn(`Queue "${queue.name}" Redis check failed:`, err.message);
            }
            }

            // Send based on Redis connectivity
            if (isRedisConnected) {
            console.log(' Redis connected — enqueueing bulk emails...');
            await this.queueManagerService.enqueueBulkEmails(campaignId, jobs, campaign, JobStatus);
            } else {
            console.warn('Redis disconnected — sending emails directly...');
            await this.emailService.sendCampaignEmail(campaignId, jobs, campaign, JobStatus);
            }

        } catch (error: any) {
            console.error(' Error while sending bulk emails:', error.message);
            // Fallback on any error
            await this.emailService.sendCampaignEmail(campaignId, jobs, campaign, JobStatus);
        }
    }


}
export interface Contact {
  uuid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  number?: string;
  address?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;
  companyName?: string;
  birthday?: string;
  isSubscribed?: boolean;
  created_at?: Date;
}
