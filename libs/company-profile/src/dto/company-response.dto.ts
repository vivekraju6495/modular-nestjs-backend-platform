export class CompanyResponseDto {
  id: number;
  uuid: string;
  userId?: number;
  company_Name: string;
  registrationNumber?: string;
  industry?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  email?: string;
  phone?: string;
  companyLogo?: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
