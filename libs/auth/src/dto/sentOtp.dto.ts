import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';


export class SentOtpDto {
    @IsEmail()
    @IsOptional()
    email: string;

    @IsString()
    @IsOptional()
    @MinLength(6)
    phone: string;

    @IsString()
    type: string;

}