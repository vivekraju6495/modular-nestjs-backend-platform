import { HttpStatus, Inject, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailElement } from '../entities/emailElements.entity';
import { In, Repository } from 'typeorm';
import { EmailElementsGroup } from '../entities/emailElementsGroup.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { CreateEmailElementDto } from './dto/create-email-element.dto';
import { UpdateGroupOrderDto } from './dto/reordering-group.dto';
import { ReorderElementsDto } from './dto/reorder-elements.dto';

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
export class EmailElementsService {
    constructor(

        @InjectRepository(EmailElement)
        private elementsRepo: Repository<EmailElement>,

        @InjectRepository(EmailElementsGroup)
        private groupsRepo: Repository<EmailElementsGroup>,

        @Optional()
        @Inject(AuthService)
        private readonly authService?: typeof AuthService,
        
        @Optional()
        @Inject(CompanyProfileService)
        private readonly companyService?: typeof CompanyProfileService,

    ) { }

    async createGroup(createGroupDto: CreateGroupDto, userUuid: string) {
        try {
           
            let userId: number | null = null;
            if (this.authService && userUuid) {
            const user = await this.authService.getUserByUuid(userUuid);
            userId = user?.id ?? null;
            }

            let companyId: number | null = null;
            if (this.companyService && createGroupDto.companyId) {
            const company = await this.companyService.getCompanyDetailsByUuid(createGroupDto.companyId);
            companyId = company?.id ?? null;
            }

            // Find max order for the same user + company
            const lastRecQuery = this.groupsRepo.createQueryBuilder('grp');

            if (userId) {
            lastRecQuery.andWhere('grp.userId = :userId', { userId });
            }

            if (companyId) {
            lastRecQuery.andWhere('grp.companyId = :companyId', { companyId });
            }

            const maxOrderGroup = await lastRecQuery
            .select('MAX(grp.order)', 'max')
            .getRawOne();

            const newOrder = (maxOrderGroup?.max ?? 0) + 1;

            // Create new group
            const group = this.groupsRepo.create({
            name: createGroupDto.name,
            description: createGroupDto.description ?? null,
            order: newOrder,
            userId: userId,
            companyId: companyId,
            status: true,
            created_at: new Date(),
            updated_at: new Date(),
            });

            const savedGroup = await this.groupsRepo.save(group);

            // Step 5: Remove internal ID from response
            const { id, ...groupData } = savedGroup;

            return {
            statusCode: HttpStatus.CREATED,
            status: true,
            message: 'Group created successfully',
            data: groupData,
            };
        } catch (error) {
            console.error('Error creating group:', error);

            return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            status: false,
            message: 'Failed to create group',
            error: error.message || 'Internal Server Error',
            data: null,
            };
        }
    }

    async updateGroup(uuid: string, updateGroupDto: UpdateGroupDto, userUuId:string ) {
        try {
            const { ...updateData } = updateGroupDto;

            const group = await this.groupsRepo.findOne({ where: { uuid, status: true } });

            if (!group) {
                return {
                    statusCode: HttpStatus.NOT_FOUND,
                    status: false,
                    message: 'Group not found',
                    data: null,
                };
            }

            // Update the group fields
            Object.assign(group, updateData);

            const savedGroup = await this.groupsRepo.save(group);

            // remove id by destructuring
            const { id, ...groupData } = savedGroup;

            return {
                statusCode: HttpStatus.OK,
                status: true,
                message: 'Group updated successfully',
                data: groupData,
            };
        } catch (error) {
            console.error('Error updating group:', error);

            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                status: false,
                message: 'Failed to update group',
                error: error.message || 'Internal Server Error',
                data: null,
            };
        }
    }

    async getGroupById(uuid: string) {
        try {
            const group = await this.groupsRepo
                .createQueryBuilder('group')
                .leftJoinAndSelect(
                    'group.elements',
                    'element',
                    'element.status = :elementStatus',
                    { elementStatus: true },
                )
                .select([
                    'group.uuid',
                    'group.name',
                    'group.description',
                    'group.order',
                    // 'element.id',
                    'element.uuid',
                    'element.name',
                    'element.block',
                    'element.attributes',
                    // 'element.groupId',
                    'element.order',
                ])
                .where('group.uuid = :uuid', { uuid })
                .andWhere('group.status = :groupStatus', { groupStatus: true })
                .getOne();

            if (!group) {
                return {
                    statusCode: HttpStatus.NOT_FOUND,
                    status: false,
                    message: 'Group not found',
                    data: null,
                };
            }

            return {
                statusCode: HttpStatus.OK,
                status: true,
                message: 'Group fetched successfully',
                data: group,
            };
        } catch (error) {
            console.error('Error fetching group:', error);

            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                status: false,
                message: 'Failed to fetch group',
                error: error.message || 'Internal Server Error',
                data: null,
            };
        }
    }

    async deleteGroup(uuid: string, userUuId: string) {
        try {
            let userId: number | null = null;

            // Resolve userId (optional check)
            if (this.authService && userUuId) {
            const user = await this.authService.getUserByUuid(userUuId);
            userId = user?.id ?? null;
            }

            //Build query with optional user filter
            const query = this.groupsRepo
            .createQueryBuilder('grp')
            .where('grp.uuid = :uuid', { uuid })
            .andWhere('grp.status = :status', { status: true });

            if (userId) {
            query.andWhere('grp.userId = :userId', { userId });
            }

            const group = await query.getOne();

            if (!group) {
            return {
                statusCode: HttpStatus.NOT_FOUND,
                status: false,
                message: 'Group not found or access denied',
                data: null,
            };
            }

            //Soft delete (set status=false)
            group.status = false;
            group.updated_at = new Date();

            const savedGroup = await this.groupsRepo.save(group);
            const { id, ...groupData } = savedGroup;

            return {
            statusCode: HttpStatus.OK,
            status: true,
            message: 'Group deleted successfully',
            data: groupData,
            };
        } catch (error) {
            console.error('Error deleting group:', error);

            return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            status: false,
            message: 'Failed to delete group',
            error: error.message || 'Internal Server Error',
            data: null,
            };
        }
    }

    async updateGroupOrder(updateGroupOrderDto: UpdateGroupOrderDto) {
        const { groups } = updateGroupOrderDto;

        try {
            for (const item of groups) {
                await this.groupsRepo.update({ uuid: item.id }, { order: item.order });
            }

            // Optionally, fetch the updated list
            const updatedGroups = await this.groupsRepo.find({
                where: { status: true },
                order: { order: 'ASC' },
            });

            const savedGroups = await this.groupsRepo.save(updatedGroups);

            // remove id by destructuring
            const response = savedGroups.map(({ id, ...groupData }) => groupData);

            return {
                statusCode: HttpStatus.OK,
                status: true,
                message: 'Group order updated successfully',
                data: response,
            };
        } catch (error) {
            console.error('Error updating group order:', error);

            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                status: true,
                message: 'Failed to update group order',
                error: error.message || 'Internal Server Error',
                data: null,
            };
        }
    }

    async findAll(search?: string, userUuId?: string) {
        try {
            let userId: number | null = null;

            if (this.authService && userUuId) {
            const user = await this.authService.getUserByUuid(userUuId);
            userId = user?.id ?? null;
            }

            const qb = this.groupsRepo
            .createQueryBuilder('group')
            .leftJoinAndSelect(
                'group.elements',
                'element',
                'element.status = :elementStatus',
                { elementStatus: true },
            )
            .select([
                'group.uuid',
                'group.name',
                'group.description',
                'group.order',
                'element.uuid',
                'element.name',
                'element.block',
                'element.attributes',
                'element.group_id',
                'element.order',
            ])
            .where('group.status = :groupStatus', { groupStatus: true });

            //Fetch user-specific + system default groups
            if (userId) {
            qb.andWhere('(group.userId = :userId OR group.userId IS NULL)', { userId });
            }

            if (search) {
            qb.andWhere(
                '(LOWER(group.name) LIKE :search OR LOWER(element.name) LIKE :search)',
                { search: `%${search.toLowerCase()}%` },
            );
            }

            qb.orderBy('group.order', 'ASC').addOrderBy('element.order', 'ASC');

            const groups = await qb.getMany();

            return {
            statusCode: HttpStatus.OK,
            status: true,
            message: 'Groups fetched successfully',
            data: groups,
            };
        } catch (error) {
            console.error('Error fetching groups:', error);

            return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            status: false,
            message: 'Failed to fetch groups',
            error: error.message || 'Internal Server Error',
            data: [],
            };
        }
    }


    // Elements sections

    async createElement(createElementDto: CreateEmailElementDto, userUuId: string) {
        try {
            const { groupId, name, block, attributes, companyId: companyUuid } = createElementDto;

            // Step 1: Resolve User ID (optional)
            let userId: number | null = null;
            if (this.authService && userUuId) {
            const user = await this.authService.getUserByUuid(userUuId);
            userId = user?.id ?? null;
            }

            // Step 2: Resolve Company ID (optional)
            let companyId: number | null = null;
            if (this.companyService && companyUuid) {
            const company = await this.companyService.getCompanyDetailsByUuid(companyUuid);
            companyId = company?.id ?? null;
            }

            // Step 3: Validate group existence
            const group = await this.groupsRepo.findOne({
            where: { uuid: groupId, status: true },
            });

            if (!group) {
            return {
                statusCode: HttpStatus.NOT_FOUND,
                status: false,
                message: 'Group not found',
                data: null,
            };
            }

            // Step 4: Calculate next order within the group
            const maxOrderElement = await this.elementsRepo
            .createQueryBuilder('element')
            .select('MAX(element.order)', 'max')
            .where('element.groupId = :groupId', { groupId: group.id })
            .getRawOne();

            const newOrder = (maxOrderElement?.max ?? 0) + 1;

            // Step 5: Create new element with user/company references
            const element = this.elementsRepo.create({
            name,
            block,
            attributes: attributes ?? {},
            groupId: group.id,
            userId: userId ?? null,
            companyId: companyId ?? null,
            order: newOrder,
            status: true,
            created_at: new Date(),
            updated_at: new Date(),
            });

            const savedElement = await this.elementsRepo.save(element);

            // Step 6: Cleanup & return response
            const { id, ...elementData } = savedElement;

            return {
            statusCode: HttpStatus.CREATED,
            status: true,
            message: 'Element created successfully',
            data: {
                ...elementData,
                groupId: group.uuid, // Return UUID instead of numeric ID
            },
            };
        } catch (error) {
            console.error('Error creating element:', error);

            return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            status: false,
            message: 'Failed to create element',
            error: error.message || 'Internal Server Error',
            data: null,
            };
        }
    }

    async updateElement(uuid: string, updateElementDto: Partial<CreateEmailElementDto>) {
        try {
            const { name, block, attributes, groupId } = updateElementDto;

            // Find the element
            const element = await this.elementsRepo.findOne({ where: { uuid, status: true } });
            if (!element) {
                return {
                    statusCode: HttpStatus.NOT_FOUND,
                    status: false,
                    message: 'Element not found',
                    data: null,
                };
            }

            // Optional: check if group exists if groupId is being updated
            if (groupId) {
                const group = await this.groupsRepo.findOne({ where: { uuid: groupId, status: true } });
                if (!group) {
                    return {
                        statusCode: HttpStatus.NOT_FOUND,
                        status: false,
                        message: 'Group not found',
                        data: null,
                    };
                }
                element.groupId = group.id; // allow moving element to another group
            }

            // Update fields if provided
            if (name !== undefined) element.name = name;
            if (block !== undefined) element.block = block;
            if (attributes !== undefined) element.attributes = attributes;

            const updatedElement = await this.elementsRepo.save(element);

            // remove id by destructuring
            const { id, ...elementData } = updatedElement;

            // just fetch uuid for response
            const group = await this.groupsRepo.findOne({
                where: { id: element.groupId },
                select: ['uuid'],
            });

            return {
                statusCode: HttpStatus.OK,
                status: true,
                message: 'Element updated successfully',
                data: {
                    ...elementData,
                    groupId: group?.uuid, // replace numeric id with uuid
                },
            };
        } catch (error) {
            console.error('Error updating element:', error);
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                status: false,
                message: 'Failed to update element',
                error: error.message || 'Internal Server Error',
                data: null,
            };
        }
    }

    async getElementById(uuid: string) {
        try {
            const element = await this.elementsRepo.findOne({
                where: { uuid, status: true },
                relations: ['group'],
            });

            if (!element) {
                return {
                    statusCode: HttpStatus.NOT_FOUND,
                    status: false,
                    message: 'Element not found',
                    data: null,
                };
            }

            // remove id by destructuring
            const { id, groupId, group, ...elementData } = element;

            // remove id from nested group
            const { id: _, ...groupData } = group;

            return {
                statusCode: HttpStatus.OK,
                status: true,
                message: 'Element fetched successfully',
                data: {
                    ...elementData,
                    group: groupData, 
                    groupId:element?.group?.uuid
                },
            };
        } catch (error) {
            console.error('Error fetching element:', error);
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                status: false,
                message: 'Failed to fetch element',
                error: error.message || 'Internal Server Error',
                data: null,
            };
        }
    }

    async deleteElement(uuid: string) {
        try {
            // Find element
            const element = await this.elementsRepo.findOne({ where: { uuid, status: true } });
            if (!element) {
                return {
                    statusCode: HttpStatus.NOT_FOUND,
                    status: false,
                    message: 'Element not found',
                    data: null,
                };
            }

            // Soft delete (update status)
            element.status = false;
            await this.elementsRepo.save(element);

            return {
                statusCode: HttpStatus.OK,
                status: true,
                message: 'Element deleted successfully',
                data: { id: element.uuid },
            };
        } catch (error) {
            console.error('Error deleting element:', error);
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                status: false,
                message: 'Failed to delete element',
                error: error.message || 'Internal Server Error',
                data: null,
            };
        }
    }

    async reorderElements(dto: ReorderElementsDto) {
        try {
            const { groupId, elementIds } = dto;

            // Check if group exists
            const group = await this.groupsRepo.findOne({ where: { uuid: groupId, status: true } });
            if (!group) {
                return {
                    statusCode: HttpStatus.NOT_FOUND,
                    status: false,
                    message: 'Group not found',
                    data: null,
                };
            }

            // Validate elements belong to this group
            const elements = await this.elementsRepo.find({
                where: { uuid: In(elementIds), groupId:group?.id, status: true },
            });

            if (elements.length !== elementIds.length) {
                return {
                    statusCode: HttpStatus.BAD_REQUEST,
                    status: false,
                    message: 'Some elements not found in this group',
                    data: null,
                };
            }

            // Update order based on array index
            for (let i = 0; i < elementIds.length; i++) {
                await this.elementsRepo.update({ uuid: elementIds[i] }, { order: i + 1 });
            }

            return {
                statusCode: HttpStatus.OK,
                status: true,
                message: 'Elements reordered successfully',
                data: elementIds.map((id, idx) => ({ id, order: idx + 1 })),
            };
        } catch (error) {
            console.error('Error reordering elements:', error);
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                status: false,
                message: 'Failed to reorder elements',
                error: error.message || 'Internal Server Error',
                data: null,
            };
        }
    }

}
