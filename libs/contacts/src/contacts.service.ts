import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { CreateContactDto, UpdateContactDto } from './dto/create-contact.dto';
import { ListContactDto } from './dto/list-contact.dto';
import * as XLSX from 'xlsx';
import { extname } from 'path';
import { BulkUploadResult } from './dto/bulk-upload-result.dto';
import { ListCountryDto } from './dto/list-country.dto';
import { Country } from './entities/country.entity';
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
export class ContactsService implements OnModuleInit{
    private authService?: any;
    private companyService?: any;
    constructor(
        @InjectRepository(Contact)
        private contactRepo: Repository<Contact>,

        @InjectRepository(Country)
        private readonly countryRepo: Repository<Country>,

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

    async create(dto: CreateContactDto, userUuId: string) {
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

        // Check for duplicate contact by email
        const existingContact = await this.contactRepo.findOne({
          where: { email: dto.email, deletedAt: IsNull() },
        });

        if (existingContact) {
          return {
            statusCode: HttpStatus.CONFLICT,
            status: false,
            message: 'Contact already exists',
            data: null,
          };
        }

        // Create contact entity
        const contact = this.contactRepo.create({
          ...dto,
          userId: userId ?? null,
          companyId:companyId ?? null,
        });

        // Save to database
        const result = await this.contactRepo.save(contact);

        return {
          statusCode: HttpStatus.CREATED,
          status: true,
          message: 'Contact created successfully',
          data: this.excludeFields(result),
        };
      } catch (error) {
        console.error('Failed to create contact:', error);
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          status: false,
          message: 'Failed to create contact',
          error: error.message || 'Internal Server Error',
          data: null,
        };
      }
    }

    async findAll(dto: ListContactDto, userUuId:string) {
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

          const { page = 1, limit = 10, search, permission, status, order = 'DESC' } = dto;

          const query = this.contactRepo.createQueryBuilder('contact');

          query.where('contact.deletedAt IS NULL');

          query.select([
            'contact.uuid',
            'contact.email',
            'contact.firstName',
            'contact.lastName',
            'contact.address',
            'contact.address1',
            'contact.address2',
            'contact.city',
            'contact.state',
            'contact.zipcode',
            'contact.country',
            'contact.number',
            'contact.birthday',
            'contact.companyName',
            'contact.tags',
            'contact.permission',
            'contact.isSubscribed',
            'contact.created_at',
            ]);

            // Apply user filter only if userId exists
            if (userId) {
              query.andWhere('contact.userId = :userId', { userId });
            }

            // Apply company filter only if companyId exists
            if (companyId) {
              query.andWhere('contact.companyId = :companyId', { companyId });
            }

            if (search) {
            query.andWhere(
                `(contact.email ILIKE :search
                OR contact.firstName ILIKE :search
                OR contact.lastName ILIKE :search
                OR contact.companyName ILIKE :search
                OR contact.number ILIKE :search)`,
                { search: `%${search}%` },
            );
            }

            if (permission) {
            query.andWhere('contact.permission = :permission', { permission });
            }

            if (status !== undefined) {
            query.andWhere('contact.status = :status', { status });
            }

            // Dynamic sort
            query.orderBy('contact.created_at', order);

            query.skip((page - 1) * limit);
            query.take(limit);

            const [result, total] = await query.getManyAndCount();

            return {
            statusCode: HttpStatus.OK,
            status: true,
            message: 'Contacts fetched successfully',
            data: result,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                order,
            },
            };
        } catch (error) {
            console.error('Failed to fetch contacts:', error);
            return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            status: false,
            message: 'Failed to fetch contacts',
            error: error.message || 'Internal Server Error',
            data: null,
            };
        }
    }

    async findOne(uuid: string, userUuId:string) {
        try {
            const result = await this.contactRepo.findOne({
            where: { uuid },
            select: [
                'uuid',
                'email',
                'firstName',
                'lastName',
                'address',
                'address1',
                'address2',
                'city',
                'state',
                'zipcode',
                'country',
                'number',
                'birthday',
                'companyName',
                'tags',
                'permission',
                'isSubscribed',
                'created_at',
            ],
            });

            if (!result) {
            return {
                statusCode: HttpStatus.NOT_FOUND,
                status: false,
                message: 'Contact not found',
                data: null,
            };
            }

            return {
            statusCode: HttpStatus.OK,
            status: true,
            message: 'Contact fetched successfully',
            data: result,
            };
        } catch (error) {
            console.error('Failed to fetch contact:', error);
            return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            status: false,
            message: 'Failed to fetch contact',
            error: error.message || 'Internal Server Error',
            data: null,
            };
        }
    }

    async update(uuid: string, dto: UpdateContactDto, userUuId:string) {
        try {

          // let userId: number | null = null;
          // if (this.authService && userUuId) {
          //   const user = await this.authService.getUserByUuid(userUuId);
          //   userId = user?.id ?? null;
          // }

          // let companyId: number | null = null;
          // if (this.companyService && dto.companyId) {
          //   const company = await this.companyService.getCompanyDetailsByUuid(dto.companyId);
          //   companyId = company?.id ?? null;
          // }

            // Find the contact (exclude soft-deleted ones)
            const contact = await this.contactRepo.findOne({
            where: { uuid, deletedAt: IsNull() },
            });

            if (!contact) {
                return {
                    statusCode: HttpStatus.NOT_FOUND,
                    status: false,
                    message: 'Contact not found',
                    data: null,
                };
            }

            // If updating email, check for duplicates (excluding self)
            if (dto.email && dto.email !== contact.email) {
                const existing = await this.contactRepo.findOne({
                    where: { email: dto.email, deletedAt: IsNull() },
                });

                if (existing && existing.uuid !== uuid) {
                    return {
                    statusCode: HttpStatus.CONFLICT,
                    status: false,
                    message: 'Email already exists for another active contact',
                    data: null,
                    };
                }
            }

            Object.assign(contact, dto);
            const result = await this.contactRepo.save(contact);

            return {
            statusCode: HttpStatus.OK,
            status: true,
            message: 'Contact updated successfully',
            data: this.excludeFields(result),
            };
        } catch (error) {
            console.error('Failed to update contact:', error);

            return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            status: false,
            message: 'Failed to update contact',
            error: error.message || 'Internal Server Error',
            data: null,
            };
        }
    }

    async softDelete(uuid: string, userUuId: string) {
      try {
        let userId: number | null = null;
        if (this.authService && userUuId) {
          const user = await this.authService.getUserByUuid(userUuId);
          userId = user?.id ?? null;
        }

        // Find contact that’s not already soft-deleted
        const contact = await this.contactRepo.findOne({
          where: { uuid, deletedAt: IsNull() },
        });

        if (!contact) {
          return {
            statusCode: HttpStatus.NOT_FOUND,
            status: false,
            message: 'Contact not found or already deleted',
            data: null,
          };
        }

        //  Check if logged-in user owns this contact
        if (userId && contact.userId && contact.userId !== userId) {
          return {
            statusCode: HttpStatus.FORBIDDEN,
            status: false,
            message: 'You are not authorized to delete this contact',
            data: null,
          };
        }

        // Soft delete contact
        await this.contactRepo.softRemove(contact);

        return {
          statusCode: HttpStatus.OK,
          status: true,
          message: 'Contact deleted successfully',
          data: {},
        };
      } catch (error) {
        console.error('Failed to delete contact:', error);

        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          status: false,
          message: 'Failed to delete contact',
          error: error.message || 'Internal Server Error',
          data: null,
        };
      }
    }

    private excludeFields(contact: Contact) {
        const { id, status, deletedAt, updated_at, created_at, ...rest } = contact;
        return rest;
    }

    async getContactByUuid(uuid: string) {
      console.log("uuid lsit by one :", uuid);
      return this.contactRepo.findOne({
          select: [
                'uuid',
                'email',
                'firstName',
                'lastName',
                'address',
                'address1',
                'address2',
                'city',
                'state',
                'zipcode',
                'country',
                'number',
                'birthday',
                'companyName',
                'tags',
                'permission',
                'isSubscribed',
                'created_at',
          ],
        where: { uuid, deletedAt: IsNull() },
      });
    }

    // bulk import

    // async bulkUpload(file: Express.Multer.File): Promise<{
    //     statusCode: number;
    //     status: boolean;
    //     message: string;
    //     data: BulkUploadResult[];
    // }> {
    //     const results: BulkUploadResult[] = [];

    //     try {
    //         if (!file) {
    //         return {
    //             statusCode: HttpStatus.BAD_REQUEST,
    //             status: false,
    //             message: 'No file uploaded',
    //             data: [],
    //         };
    //         }

    //         const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    //         const sheetName = workbook.SheetNames[0];
    //         const sheet = workbook.Sheets[sheetName];
    //         const rawData: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    //         if (!rawData.length) {
    //         return {
    //             statusCode: HttpStatus.BAD_REQUEST,
    //             status: false,
    //             message: 'File is empty',
    //             data: [],
    //         };
    //         }

    //         // Normalize headers
    //         const normalizeKey = (key: string) => key.toLowerCase().replace(/\s+/g, '');
    //         const jsonData = rawData.map(row => {
    //         const newRow: Record<string, any> = {};
    //         Object.keys(row).forEach(key => {
    //             newRow[normalizeKey(key)] = row[key];
    //         });
    //         return newRow;
    //         });

    //         const emails = jsonData
    //         .map(row => row['email']?.toString()?.trim())
    //         .filter(email => !!email);

    //         // Fetch all contacts (including deleted) for these emails
    //         const allContacts = await this.contactRepo.find({
    //         where: { email: In(emails) },
    //         withDeleted: true, // includes soft-deleted
    //         });

    //         const contactMap = new Map(allContacts.map(c => [c.email, c]));

    //         const contactsToInsert: Contact[] = [];
    //         const contactsToUpdate: Contact[] = [];

    //         for (const row of jsonData) {
    //         const email = row['email']?.toString()?.trim();

    //         if (!email) {
    //             results.push({ email: '', status: 'invalid' });
    //             continue;
    //         }

    //         const dto = {
    //             email,
    //             firstName: row['firstname'] || null,
    //             lastName: row['lastname'] || null,
    //             number: row['number'] || null,
    //             companyName: row['companyname'] || null,
    //             address: row['address'] || null,
    //             address1: row['address1'] || null,
    //             address2: row['address2'] || null,
    //             city: row['city'] || null,
    //             state: row['state'] || null,
    //             zipcode: row['zipcode'] || null,
    //             country: row['country'] || null,
    //             birthday: row['birthday'] || null,
    //             permission: row['permission'] || null,
                
    //         };

    //         const existing = contactMap.get(email);

    //         if (existing) {
    //             if (existing.deletedAt) {
    //             // Previously deleted -> allow re-insert
    //             const newContact = this.contactRepo.create(dto);
    //             contactsToInsert.push(newContact);
    //             results.push({ email, status: 'inserted' });
    //             } else {
    //             // Active contact already exists -> skip
    //             results.push({ email, status: 'skipped - already exists' });
    //             }
    //         } else {
    //             // Brand new email -> insert
    //             const newContact = this.contactRepo.create(dto);
    //             contactsToInsert.push(newContact);
    //             results.push({ email, status: 'inserted' });
    //         }
    //         }

    //         if (contactsToInsert.length) await this.contactRepo.save(contactsToInsert);
    //         if (contactsToUpdate.length) await this.contactRepo.save(contactsToUpdate);

    //         return {
    //         statusCode: HttpStatus.CREATED,
    //         status: true,
    //         message: 'Bulk upload processed successfully',
    //         data: results,
    //         };
    //     } catch (error) {
    //         console.error('Bulk upload failed:', error);
    //         return {
    //         statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    //         status: false,
    //         message: 'Failed to process bulk upload',
    //         data: results,
    //         };
    //     }
    // }

private excelDateToJSDate(serial: number): string | null {
  if (!serial || isNaN(serial)) return null;
  const utc_days = Math.floor(serial - 25569); // 25569 = Excel epoch
  const utc_value = utc_days * 86400; // seconds
  const date_info = new Date(utc_value * 1000);
  return date_info.toISOString().split('T')[0]; // YYYY-MM-DD
}


// async bulkUpload(
//   file: Express.Multer.File, userUuId:string
// ): Promise<{
//   statusCode: number;
//   status: boolean;
//   message: string;
//   data: BulkUploadResult[];
// }> {
//   const results: BulkUploadResult[] = [];

//   try {
//     if (!file) {
//       return {
//         statusCode: HttpStatus.BAD_REQUEST,
//         status: false,
//         message: 'No file uploaded',
//         data: [],
//       };
//     }

//     // Read CSV or Excel
//     const workbook = XLSX.read(file.buffer, { type: 'buffer' });
//     const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];
//     const rawData: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, {
//       defval: '',
//     });

//     if (!rawData.length) {
//       return {
//         statusCode: HttpStatus.BAD_REQUEST,
//         status: false,
//         message: 'File is empty',
//         data: [],
//       };
//     }

//     // Normalize headers (case-insensitive, remove spaces)
//     const normalizeKey = (key: string) =>
//       key.toLowerCase().replace(/\s+/g, '');
//     const jsonData = rawData.map((row) => {
//       const newRow: Record<string, any> = {};
//       Object.keys(row).forEach((key) => {
//         newRow[normalizeKey(key)] = row[key];
//       });
//       return newRow;
//     });

//     const emails = jsonData
//       .map((row) => row['email']?.toString()?.trim())
//       .filter((email) => !!email);

//     // Fetch all contacts (including deleted ones) for these emails
//     const allContacts = await this.contactRepo.find({
//       where: { email: In(emails) },
//       withDeleted: true,
//     });

//     const contactMap = new Map(allContacts.map((c) => [c.email, c]));

//     const contactsToInsert: Contact[] = [];

//     for (const row of jsonData) {
//       const email = row['email']?.toString()?.trim();

//       if (!email) {
//         results.push({ email: '', status: 'invalid' });
//         continue;
//       }

//       const dto = {
//         email,
//         firstName: row['firstname'] || null,
//         lastName: row['lastname'] || null,
//         number: row['number'] || null,
//         companyName: row['companyname'] || null,
//         address: row['address'] || null,
//         address1: row['address1'] || null,
//         address2: row['address2'] || null,
//         city: row['city'] || null,
//         state: row['state'] || null,
//         zipcode: row['zipcode'] || null,
//         country: row['country'] || null,
//         birthday: (() => {
//           const val = row['birthday'];
//           if (!val) return null;
//           if (typeof val === 'number') return this.excelDateToJSDate(val); // Excel serial
//           if (/^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$/.test(val)) {
//             // dd-mm-yyyy or dd/mm/yyyy
//             const [d, m, y] = val.split(/[-/]/);
//             return `${y.length === 2 ? '19' + y : y}-${m.padStart(
//               2,
//               '0',
//             )}-${d.padStart(2, '0')}`;
//           }
//           try {
//             return new Date(val).toISOString().split('T')[0];
//           } catch {
//             return null;
//           }
//         })(),
//         permission: row['permission'] || null,
//       };

//       const existing = contactMap.get(email);

//       if (existing) {
//         if (existing.deletedAt) {
//           // Previously deleted -> allow re-insert
//           const newContact = this.contactRepo.create(dto);
//           contactsToInsert.push(newContact);
//           results.push({ email, status: 'inserted' });
//         } else {
//           // Active contact already exists -> skip
//           results.push({ email, status: 'skipped - already exists' });
//         }
//       } else {
//         // Brand new email -> insert
//         const newContact = this.contactRepo.create(dto);
//         contactsToInsert.push(newContact);
//         results.push({ email, status: 'inserted' });
//       }
//     }

//     if (contactsToInsert.length) await this.contactRepo.save(contactsToInsert);

//     return {
//       statusCode: HttpStatus.CREATED,
//       status: true,
//       message: 'Bulk upload processed successfully',
//       data: results,
//     };
//   } catch (error) {
//     console.error('Bulk upload failed:', error);
//     return {
//       statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
//       status: false,
//       message: 'Failed to process bulk upload',
//       data: results,
//     };
//   }
// }

  async bulkUpload(
    file: Express.Multer.File,
    userUuId: string,
    companyUuId: string,
  ): Promise<{
    statusCode: number;
    status: boolean;
    message: string;
    data: BulkUploadResult[];
  }> {
    const results: BulkUploadResult[] = [];

    try {
      if (!file) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          message: 'No file uploaded',
          data: [],
        };
      }

      // Get logged-in user and company info
      let userId: number | null = null;
      if (this.authService && userUuId) {
        const user = await this.authService.getUserByUuid(userUuId);
        userId = user?.id ?? null;
      }

      let companyId: number | null = null;
      if (this.companyService && companyUuId) {
        const company = await this.companyService.getCompanyDetailsByUuid(companyUuId);
        companyId = company?.id ?? null;
      }

      // Read file
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rawData: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, {
        defval: '',
      });

      if (!rawData.length) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          message: 'File is empty',
          data: [],
        };
      }

      // Normalize headers
      const normalizeKey = (key: string) =>
        key.toLowerCase().replace(/\s+/g, '');
      const jsonData = rawData.map((row) => {
        const newRow: Record<string, any> = {};
        Object.keys(row).forEach((key) => {
          newRow[normalizeKey(key)] = row[key];
        });
        return newRow;
      });

      const emails = jsonData
        .map((row) => row['email']?.toString()?.trim())
        .filter((email) => !!email);

      // Fetch all existing contacts
      const allContacts = await this.contactRepo.find({
        where: { email: In(emails) },
        withDeleted: true,
      });

      const contactMap = new Map(allContacts.map((c) => [c.email, c]));
      const contactsToInsert: Contact[] = [];

      for (const row of jsonData) {
        const email = row['email']?.toString()?.trim();

        if (!email) {
          results.push({ email: '', status: 'invalid' });
          continue;
        }

        const dto = {
          email,
          firstName: row['firstname'] || null,
          lastName: row['lastname'] || null,
          number: row['number'] || null,
          companyName: row['companyname'] || null,
          address: row['address'] || null,
          address1: row['address1'] || null,
          address2: row['address2'] || null,
          city: row['city'] || null,
          state: row['state'] || null,
          zipcode: row['zipcode'] || null,
          country: row['country'] || null,
          birthday: (() => {
            const val = row['birthday'];
            if (!val) return null;
            if (typeof val === 'number') return this.excelDateToJSDate(val);
            if (/^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$/.test(val)) {
              const [d, m, y] = val.split(/[-/]/);
              return `${y.length === 2 ? '19' + y : y}-${m.padStart(
                2,
                '0',
              )}-${d.padStart(2, '0')}`;
            }
            try {
              return new Date(val).toISOString().split('T')[0];
            } catch {
              return null;
            }
          })(),
          permission: row['permission'] || null,
          ...(userId ? { userId } : {}),
          ...(companyId ? { companyId } : {}),
        };

        const existing = contactMap.get(email);

        if (existing) {
          if (existing.deletedAt) {
            // Previously deleted → reinsert as new record
            const newContact = this.contactRepo.create(dto);
            contactsToInsert.push(newContact);
            results.push({ email, status: 'inserted' });
          } else {
            // Already exists and active → skip
            results.push({ email, status: 'skipped - already exists' });
          }
        } else {
          // Brand new → insert
          const newContact = this.contactRepo.create(dto);
          contactsToInsert.push(newContact);
          results.push({ email, status: 'inserted' });
        }
      }

      if (contactsToInsert.length) {
        await this.contactRepo.save(contactsToInsert);
      }

      return {
        statusCode: HttpStatus.CREATED,
        status: true,
        message: 'Bulk upload processed successfully',
        data: results,
      };
    } catch (error) {
      console.error('Bulk upload failed:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Failed to process bulk upload',
        data: results,
      };
    }
  }

  async listCountry(dto: ListCountryDto) {
      const query = this.countryRepo.createQueryBuilder('country')
        .where('country.isActive = true');

      if (dto.search) {
        query.andWhere('country.name ILIKE :search OR country.code ILIKE :search', {
          search: `%${dto.search}%`,
        });
      }

      const countries = await query.orderBy('country.name', 'ASC').getMany();
      return countries;
  }

}
