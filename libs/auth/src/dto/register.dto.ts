import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';


export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @MinLength(6)
    phone: string;

    @IsString()
    @MinLength(6)
    whatsapp: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsOptional()
    MiddleName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

}