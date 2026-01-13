import { HttpStatus, Inject, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, IsNull, Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { ListCompaniesDto } from './dto/list-companies.dto';

let AuthService: any;
try {
  ({ AuthService } = require('libs/auth/src'));
} catch (e) {
  AuthService = null;
}

@Injectable()
export class CompanyProfileService {
    constructor(
        @InjectRepository(Company)
        private readonly companyRepo: Repository<Company>,
        
        @Optional()
        @Inject(AuthService)
        private readonly authService?: typeof AuthService,
    ) {}

    async create(dto: CreateCompanyDto , userUuId?: string) {
        try {
            let userId: number | null = null;
            if (this.authService && userUuId) {
                const user = await this.authService.getUserByUuid(userUuId);
                userId = user?.id ?? null;
            }
            const data: DeepPartial<Company> = {
                ...dto,
                userId: userId ?? null,
                createdBy: userId ?? null,
            };
            const company = this.companyRepo.create(data);
            const savedCompany = await this.companyRepo.save(company);

            // Remove internal id from response
            const { id, ...result } = savedCompany;
            
            return {
                statusCode: HttpStatus.CREATED,
                status: true,
                message: 'Company Profile created successfully',
                data: result,
            };
        } catch (error) {
            console.error('Failed to create Company Profile:', error);
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                status: false,
                message: 'Failed to Create Company Profile',
                error: error.message || 'Internal Server Error',
                data: null,
            };                          
        }
    }

    async findAll(dto: ListCompaniesDto, userUuId: string) {
        try {
            const { page = 1, limit = 10, search, createdAt, sortBy, sortOrder } = dto;

            const skip = (page - 1) * limit;
            
            let userId: number | null = null;
            if (this.authService && userUuId) {
                const user = await this.authService.getUserByUuid(userUuId);
                userId = user?.id ?? null;
            }

            // Base query excluding soft-deleted and filter by user
            const query = this.companyRepo.createQueryBuilder('company')
                .where('company.deletedAt IS NULL')
                .andWhere('company.status = :status', { status: true })

            if(userId){
              query.andWhere('company.user_id = :userId', { userId });
            }
            // Search by company_Name
            if (search) {
                query.andWhere('company.company_Name ILIKE :search', { search: `%${search}%` });
            }

            // Filter by creation date
            if (createdAt) {
                query.andWhere('company.createdAt::date = :createdAt', { createdAt: createdAt.toISOString().split('T')[0] });
            }

            // Sorting
            if (sortBy) {
                query.orderBy(`company.${sortBy}`, sortOrder === 'ASC' ? 'ASC' : 'DESC');
            } else {
                query.orderBy('company.createdAt', 'DESC');
            }

            query.skip(skip).take(limit);

            const [company, total] = await query.getManyAndCount();

            // Remove internal id before sending response
            const data = company.map(({ id, ...rest }) => rest);

            return {
                statusCode: HttpStatus.OK,
                status: true,
                message: 'Companies details fetched successfully',
                data,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
           
            console.error('Failed to fetch Companies details:', error);
            return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            status: false,
            message: 'Failed to fetch Companies details',
            error: error.message || 'Internal Server Error',
            data: null,
            };
        }
    }

    async findByUuid(uuid: string, userUuId?: string) {
        try {
            let userId: number | null = null;
            if (this.authService && userUuId) {
                const user = await this.authService.getUserByUuid(userUuId);
                userId = user?.id ?? null;
            }

            // Build where condition dynamically
            const whereCondition: any = {
            uuid,
            status: true,
            deletedAt: IsNull(),
            };

            // if (userId) {
            // whereCondition.userId = userId;
            // }

            const company = await this.companyRepo.findOne({
            where: whereCondition,
            select: [
                'uuid',
                'company_Name',
                'about',
                'registrationNumber',
                'industry',
                'address1',
                'address2',
                'city',
                'state',
                'zipCode',
                'country',
                'email',
                'phone',
                'companyLogo',
                'status',
                'createdAt',
                'updatedAt',
            ],
            });

            if (!company) {
                return {
                    statusCode: HttpStatus.NOT_FOUND,
                    status: false,
                    message: 'Company not found or inactive',
                    data: null,
                };
            }

            return {
            statusCode: HttpStatus.OK,
            status: true,
            message: 'Company profile fetched successfully',
            data: company,
            };
        } catch (error) {
            console.error('Failed to fetch Company Profile:', error);
            return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            status: false,
            message: 'Failed to fetch Company Profile',
            error: error.message || 'Internal Server Error',
            data: null,
            };
        }
    }

    async update(uuid: string, dto: UpdateCompanyDto, userUuId?: string) {
        try {
            let userId: number | null = null;

            if (this.authService && userUuId) {
            const user = await this.authService.getUserByUuid(userUuId);
            userId = Number(user?.id) ?? null;
            }

            // Base where condition
            const whereCondition: any = {
            uuid,
            status: true,
            deletedAt: IsNull(),
            };

            const company = await this.companyRepo.findOne({ where: whereCondition });
            if (!company) {
                return {
                    statusCode: HttpStatus.NOT_FOUND,
                    status: false,
                    message: 'Company not found or inactive',
                    data: null,
                };
            }

            // Condition: if company.userId is set → must match token userId
            if (company.userId) {
                if (Number(company.userId) !== userId) {
                    return {
                    statusCode: HttpStatus.NOT_FOUND,
                    status: false,
                    message: 'User details not found or inactive',
                    data: null,
                    };
                }
            }

            // Add audit field
            if (userId) {
                dto.updatedBy = userId;
            }

            await this.companyRepo.update({ uuid }, dto);

            const updatedCompany = await this.companyRepo.findOne({
            where: { uuid },
            select: [
                'uuid',
                'company_Name',
                'about',
                'registrationNumber',
                'industry',
                'address1',
                'address2',
                'city',
                'state',
                'zipCode',
                'country',
                'email',
                'phone',
                'companyLogo',
                'status',
                'createdAt',
                'updatedAt',
            ],
            });

            return {
            statusCode: HttpStatus.OK,
            status: true,
            message: 'Company profile updated successfully',
            data: updatedCompany,
            };
        } catch (error) {
            console.error('Failed to update Company Profile:', error);
            return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            status: false,
            message: 'Failed to update Company Profile',
            error: error.message || 'Internal Server Error',
            data: null,
            };
        }
    }

    async softDelete(uuid: string, userUuId?: string) {
        try {
            let userId: number | null = null;

            if (this.authService && userUuId) {
            const user = await this.authService.getUserByUuid(userUuId);
            userId = Number(user?.id) ?? null;
            }

            // Base condition
            const whereCondition: any = {
            uuid,
            status: true,
            deletedAt: IsNull(),
            };

            const company = await this.companyRepo.findOne({ where: whereCondition });
            if (!company) {
            return {
                statusCode: HttpStatus.NOT_FOUND,
                status: false,
                message: 'Company not found or already deleted',
                data: null,
            };
            }

            // Check ownership
            if (company.userId) {
                if (Number(company.userId) !== userId) {
                    return {
                    statusCode: HttpStatus.NOT_FOUND,
                    status: false,
                    message: 'User details not found or inactive',
                    data: null,
                    };
                }
            }

            // Soft delete
            company.deletedAt = new Date();
            if (userId) {
                company.updatedBy = userId; // audit field
            }
            await this.companyRepo.save(company);

            return {
            statusCode: HttpStatus.OK,
            status: true,
            message: 'Company profile deleted successfully',
            data: { uuid },
            };
        } catch (error) {
            console.error('Failed to delete Company Profile:', error);
            return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            status: false,
            message: 'Failed to delete Company Profile',
            error: error.message || 'Internal Server Error',
            data: null,
            };
        }
    }

    async getCompanyDetailsByUuid(uuid: string) {
        return this.companyRepo.findOne({ where: { uuid: uuid } });
    }
}
