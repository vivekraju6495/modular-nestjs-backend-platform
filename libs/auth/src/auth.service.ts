import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Optional,
  Inject,
  HttpStatus,
  forwardRef,
  OnModuleInit,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, IsNull, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UserTemperory } from './entities/userTemperory.entity';
import { UserOtp } from './entities/loginOpt.entity';
import { SystemConfiguration } from './entities/systemConfig.entity';
import { first } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { ConfigService } from '@nestjs/config';

let EmailService: any;
try {
  ({ EmailService } = require('libs/email/src'));
} catch (e) {
  EmailService = null;
}

// let AuthRolesService: any;
// try {
//   ({ AuthRolesService } = require('libs/auth-roles/src'));
// } catch (e) {
//   AuthRolesService = null;
// }


@Injectable()
export class AuthService implements OnModuleInit {
   private authRolesService: any;
  constructor(
    private jwtService: JwtService,
    private readonly moduleRef: ModuleRef,  
    private readonly configService: ConfigService,

    @InjectRepository(User)
    private usersRepo: Repository<User>,

    @InjectRepository(UserTemperory)
    private userTemperory: Repository<UserTemperory>,

    @InjectRepository(UserOtp)
    private otpRepo: Repository<UserOtp>,

    @InjectRepository(SystemConfiguration)
    private systemConfiguration: Repository<SystemConfiguration>,

    // @Optional() 
    // @Inject(forwardRef(() => AuthRolesService))
    // private readonly authRolesService: typeof AuthRolesService,
    
    @Optional()
    @Inject(EmailService)
    private readonly emailService?: typeof EmailService,

  
  ) { }
  async onModuleInit() {
    try {
      this.authRolesService = this.moduleRef.get('AuthRolesService', { strict: false });
    } catch {
      console.log('AuthRolesService not found in DI container');
      this.authRolesService = null;
    }
  }

  async register(email: string, password: string, phone: string, whatsapp?: string, firstName?: string, middleName?: string, lastName?: string) {
    try {
      const exists = await this.userTemperory.findOne({ where: { email } });
      if (exists) {
        return {
          statusCode: HttpStatus.CONFLICT,
          status: false,
          message: 'User email address already exists',
          data: null,
        };
      }


      const phoneExists = await this.userTemperory.findOne({ where: { phone } });
      if (phoneExists) {
        return {
          statusCode: HttpStatus.CONFLICT,
          status: false,
          message: 'User Phone Number already exists',
          data: null,
        };
      }

      const whatsappExists = await this.userTemperory.findOne({ where: { whatsapp } });
      if (whatsappExists) {
        return {
          statusCode: HttpStatus.CONFLICT,
          status: false,
          message: 'User whatsapp Phone Number already exists',
          data: null,
        };
      }

      const hashed = await bcrypt.hash(password, 10);
      const user = this.userTemperory.create({
        email,
        password: hashed,
        phone,
        whatsapp,
        firstName: firstName || '',
        middleName: middleName || '',
        lastName: lastName || '',
        isVerified: false
      });
      await this.userTemperory.save(user);

       // Generate verification token (JWT)
      const token = jwt.sign(
        { uuid: user.uuid, email: user.email },
        process.env.JWT_SECRET || 'secretkey',
        { expiresIn: '1d' } // expires in 1 day
      );
    
      const verifyLink = `${process.env.APP_URL}/auth/verify?token=${token}`;
      const type = 'email';

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Expiry time (from config, fallback = 5 min)
      const expiryTimeConfig = await this.systemConfiguration.findOne({ where: { key: 'LOGIN_OTP_EXPIRY_TIME' } });
      const expiryTime = expiryTimeConfig ? Number(expiryTimeConfig.value) : 5;

      // await this.otpRepo.save({
      //   userId: user.id,
      //   type,
      //   otp,
      //   expiresAt: new Date(Date.now() + expiryTime * 60 * 1000),
      // });

      // console.log(`Your OTP is ${otp} sent to ${type}, expires in ${expiryTime} minutes.`);
      
      if (this.emailService) {
        this.emailService.sendRegistrationEmail(user, verifyLink,otp);
      }

      return {
        statusCode: HttpStatus.CREATED,
        status: true,
        message: 'User registered successfully',
        data: {
          uuid: user.uuid,
          email: user.email,
        }

      }

    } catch (error) {
      console.error('Error creating register:', error);

      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Failed to register user',
        error: error.message || 'Internal Server Error',
        data: null,
      };
    }
  }

  async verifyRegistration(token: string) {
    try {
      // Decode token
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'secretkey') as { uuid: string; email: string };
     
      const userTemp = await this.userTemperory.findOne({ where: { uuid: payload.uuid } });
      if (!userTemp) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          status: false,
          message: 'User not found',
          data: null,
        };
      }

      if (userTemp.isVerified) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          message: 'User already verified',
          data: null,
        };
      }

      userTemp.isVerified = true;
      userTemp.verifiedAt = new Date(Date.now()),
      await this.userTemperory.save(userTemp);

      const user = this.usersRepo.create({
        uuid:userTemp.uuid,
        email:userTemp.email,
        password:userTemp.password,
        phone:userTemp.phone,
        whatsapp:userTemp.whatsapp,
        firstName:userTemp.firstName || '',
        middleName:userTemp.middleName || '',
        lastName:userTemp.lastName || '',
        isActive: true
      });
      await this.usersRepo.save(user);

      console.log(user);
      if (this.authRolesService) {
        console.log("entering in the role service");
        const defaultRole = await this.systemConfiguration.findOne({ where: { key: 'DEFAULT_USER_ROLE' } });
        await this.authRolesService.mapUserRole(user.id, defaultRole?.value ?? 'admin');
      }
      console.log("entering in the role service outside");
      return {
        statusCode: HttpStatus.OK,
        status: true,
        message: 'Email verified successfully. You can now login.',
        data: {
          uuid: user.uuid,
          email: user.email,
        },
      };
    } catch (error) {
      console.error('Verification error:', error);
      return {
        statusCode: HttpStatus.UNAUTHORIZED,
        status: false,
        message: 'Invalid or expired verification link',
        error: error.message || 'Invalid token',
        data: null,
      };
    }
  }

  async login(email: string, password: string) {
    try {
      let user = await this.usersRepo.findOne({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return {
          statusCode: HttpStatus.UNAUTHORIZED,
          status: true,
          message: 'Invalid credentials',
          accessToken: null
        }

      }

      // Resolve userId from userUuid if needed
      let roles: any | null = null;
      if (this.authRolesService) {
        console.log("entering in the role service");
        const result = await this.authRolesService.getUserRolesWithPermissions(user.id);
        roles = result.roles;
      }

      const payload = await this.jwtPayload(user);
      
      // const extendedPayload = {
      //   ...payload,
      //   roles, // hierarchical roles + permissions
      // };
        
      const extendedPayload = {
        ...payload,
        role: roles?.[0]?.name ?? null,
        permissions: roles?.[0]?.permissions ?? [],
      };
      

      const jwtSecret = this.configService.get<string>('auth.jwtSecret');
      const jwtExpiresIn = this.configService.get<string>('auth.jwtExpiresIn');
      const jwtRefreshSecret = this.configService.get<string>('auth.jwtRefreshSecret');
      const jwtRefreshExpiresIn = this.configService.get<string>('auth.jwtRefreshExpiresIn');

      // Create tokens
      const accessToken = this.jwtService.sign(extendedPayload, {
        secret: jwtSecret,
        expiresIn: jwtExpiresIn,
      });

      const refreshToken = this.jwtService.sign(payload, {
        secret: jwtRefreshSecret,
        expiresIn: jwtRefreshExpiresIn,
      });

      // store hashed refresh token
      const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    
      user.refreshToken = hashedRefresh;
      await this.usersRepo.save(user);

      return {
        statusCode: HttpStatus.OK,
        status: true,
        message: 'Login successful',
        data: {
          access_token: accessToken,
          refresh_token: refreshToken, 
          user: {
            uuid: user.uuid,
            email: user.email,
            phone: user.phone,
            role: extendedPayload.role,
            permissions: extendedPayload.permissions,
          },
        },
      }

    } catch (error) {
      console.error('Error during login:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Invalid credentials',
        error: error.message || 'Internal Server Error',
        data: null,
      };

    }

  }

  async sentOtp(email: string, phone: string, type: string) {
    try {
      let user: any;

      if (type === 'email' && email?.length > 0) {
        user = await this.usersRepo.findOne({ where: { email } });
      } else if (type === 'phone' && phone?.length > 6) {
        user = await this.usersRepo.findOne({ where: { phone } });
      } else if (type === 'whatsapp' && phone?.length > 6) {
        user = await this.usersRepo.findOne({ where: { whatsapp: phone } });
      } else {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          message: 'Invalid type or missing contact info',
          data: null,
        };
      }

      if (!user) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          status: false,
          message: 'User not found',
          data: null,
        };
      }

      // Expire old OTPs for this user
      await this.otpRepo.update(
        { userId: user.id },
        { isExpired: true }
      );

      // System config values
      const lastExpiryTime = await this.systemConfiguration.findOne({ where: { key: 'LOGIN_OTP_TIME' } });
      const expiryCount = await this.systemConfiguration.findOne({ where: { key: 'LOGIN_OTP_LIMIT' } });

      // Count expired OTPs in the given time window
      const expiredCount = await this.otpRepo.count({
        where: {
          userId: user.id,
          isExpired: true,
          usedAt: IsNull(),
          isUsed: false,
          createdAt: Between(new Date(Number(lastExpiryTime?.value) || 0), new Date()),
        },
      });

      if (Number(expiredCount) > Number(expiryCount?.value)) {
        const minutes = Number(lastExpiryTime?.value) || 1;

        let durationText = `${minutes} minute${minutes > 1 ? 's' : ''}`;
        if (minutes >= 60) {
          const hours = Math.floor(minutes / 60);
          const remainingMinutes = minutes % 60;
          durationText = `${hours} hour${hours > 1 ? 's' : ''}`;
          if (remainingMinutes > 0) {
            durationText += ` ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
          }
        }

        return {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          status: false,
          message: `Your OTP limit is reached. Try again after ${durationText}`,
          data: null,
        };
      }

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Expiry time (from config, fallback = 5 min)
      const expiryTimeConfig = await this.systemConfiguration.findOne({ where: { key: 'LOGIN_OTP_EXPIRY_TIME' } });
      const expiryTime = expiryTimeConfig ? Number(expiryTimeConfig.value) : 5;

      await this.otpRepo.save({
        userId: user.id,
        type,
        otp,
        expiresAt: new Date(Date.now() + expiryTime * 60 * 1000),
      });

      console.log(`Your OTP is ${otp} sent to ${type}, expires in ${expiryTime} minutes.`);

      // Send OTP
      if (type === 'email' && this.emailService) {
        await this.emailService.sendLoginOtpEmail(user,otp,expiryTime);
      } else if (type === 'phone') {
        // await this.smsService.sendOtp(phone, otp);
      } else if (type === 'whatsapp') {
        // await this.whatsappService.sendOtp(phone, otp);
      }

      return {
        statusCode: HttpStatus.OK,
        status: true,
        message: `Your OTP is ${otp} sent to ${type}, expires in ${expiryTime} minutes.`,
        data: null,
      };

    } catch (error) {
      console.error('Error during sentOtp:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Failed to send OTP',
        error: error.message || 'Internal Server Error',
        data: null,
      };
    }
  }

  async verifyOtp(email: string, phone: string, type: string, otp: string) {
    try {
      let user: any;

      // Step 1: Identify user by type
      if (type === 'email' && email?.length > 0) {
        user = await this.usersRepo.findOne({ where: { email } });
      } else if (type === 'phone' && phone?.length > 6) {
        user = await this.usersRepo.findOne({ where: { phone } });
      } else if (type === 'whatsapp' && phone?.length > 6) {
        user = await this.usersRepo.findOne({ where: { whatsapp: phone } });
      } else {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          message: 'Invalid type or missing contact info',
        };
      }

      if (!user) {
        return {
          statusCode: HttpStatus.UNAUTHORIZED,
          status: false,
          message: 'User not found',
        };
      }

      // Step 2: Find OTP record
      const otpRecord = await this.otpRepo.findOne({
        where: {
          userId: user.id,
          type,
          otp,
          isExpired: false,
          isUsed: false,
        },
      });

      if (!otpRecord) {
        return {
          statusCode: HttpStatus.UNAUTHORIZED,
          status: false,
          message: 'Invalid OTP',
        };
      }

      // Step 3: Check expiry
      if (!otpRecord.expiresAt || otpRecord.expiresAt < new Date()) {
        await this.otpRepo.update({ id: otpRecord.id }, { isExpired: true });
        return {
          statusCode: HttpStatus.UNAUTHORIZED,
          status: false,
          message: 'OTP expired',
        };
      }

      // Step 4: Mark OTP as used
      await this.otpRepo.update(
        { id: otpRecord.id },
        { isUsed: true, usedAt: new Date(), isExpired: true },
      );

      // Step 5: Roles & permissions
      let roles: any[] = [];
      if (this.authRolesService) {
        const result = await this.authRolesService.getUserRolesWithPermissions(
          user.id,
        );
        roles = result.roles ?? [];
      }

      const payload = await this.jwtPayload(user);

      const extendedPayload = {
        ...payload,
        role: roles?.[0]?.name ?? null,
        permissions: roles?.[0]?.permissions ?? [],
      };

      const jwtSecret = this.configService.get<string>('auth.jwtSecret');
      const jwtExpiresIn = this.configService.get<string>('auth.jwtExpiresIn');
      const jwtRefreshSecret = this.configService.get<string>('auth.jwtRefreshSecret');
      const jwtRefreshExpiresIn = this.configService.get<string>('auth.jwtRefreshExpiresIn');

      // Create tokens
      const accessToken = this.jwtService.sign(extendedPayload, {
        secret: jwtSecret,
        expiresIn: jwtExpiresIn,
      });

      const refreshToken = this.jwtService.sign(payload, {
        secret: jwtRefreshSecret,
        expiresIn: jwtRefreshExpiresIn,
      });

      // store hashed refresh token
      const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    
      user.refreshToken = hashedRefresh;
      await this.usersRepo.save(user);

      return {
        statusCode: HttpStatus.OK,
        status: true,
        message: 'Login successful',
        data: {
          access_token: accessToken,
          refresh_token: refreshToken, 
          user: {
            uuid: user.uuid,
            email: user.email,
            phone: user.phone,
            role: extendedPayload.role,
            permissions: extendedPayload.permissions,
          },
        },
      }
    } catch (error) {
      console.error('verifyOtp error:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Something went wrong while verifying OTP',
        error: error?.message ?? error,
      };
    }
  }

  async refresh(token: string) {
    try {
      const jwtSecret = this.configService.get<string>('auth.jwtSecret');
      const jwtExpiresIn = this.configService.get<string>('auth.jwtExpiresIn');
      const jwtRefreshSecret = this.configService.get<string>('auth.jwtRefreshSecret');
      const jwtRefreshExpiresIn = this.configService.get<string>('auth.jwtRefreshExpiresIn');

      // Verify refresh token
      const payload = this.jwtService.verify(token, {
        secret: jwtRefreshSecret,
      });

      //  Find user by ID from payload
      const user = await this.usersRepo.findOne({ where: { uuid: payload.uuid } });

      if (!user || !user.refreshToken) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          status: false,
          message: 'User not found or refresh token missing',
          data: null,
        };
      }

      //Compare refresh tokens (hashed vs provided)
      const isMatch = await bcrypt.compare(token, user.refreshToken);
      if (!isMatch) {
        return {
          statusCode: HttpStatus.UNAUTHORIZED,
          status: false,
          message: 'Invalid refresh token',
          accessToken: null,
        };
      }

      //  Get user roles (optional)
      let roles: any[] = [];
      if (this.authRolesService) {
        console.log('Fetching roles from AuthRolesService...');
        const result = await this.authRolesService.getUserRolesWithPermissions(user.id);
        roles = result.roles || [];
      }

      // Build new access token payload
      const basePayload = await this.jwtPayload(user);

      const extendedPayload = {
        ...basePayload,
        role: roles?.[0]?.name ?? null,
        permissions: roles?.[0]?.permissions ?? [],
      };

      //  Generate new access token
        const newAccessToken = this.jwtService.sign(extendedPayload, {
          secret: jwtSecret,
          expiresIn: jwtExpiresIn,
        });
      return {
        statusCode: HttpStatus.OK,
        status: true,
        message: 'Access token refreshed successfully',
        data: {
          access_token: newAccessToken,
          refresh_token: user.refreshToken, 
          user: {
            uuid: user.uuid,
            email: user.email,
            phone: user.phone,
            role: extendedPayload.role,
            permissions: extendedPayload.permissions,
          },
        },
      }
    } catch (error) {
      console.error('Refresh error:', error.message);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userUuid: string) {
    try {
      const user = await this.usersRepo.findOne({ where: { uuid: userUuid } });
      console.log(user);
      if (!user) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          status: false,
          message: 'User not found',
        };
      }

      // Invalidate refresh token
      user.refreshToken = null;
      await this.usersRepo.save(user);

      return {
        statusCode: HttpStatus.OK,
        status: true,
        message: 'Logout successful',
      };

    } catch (error) {
      console.error('Error during logout:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Logout failed',
        error: error.message || 'Internal Server Error',
      };
    }
  }


  async jwtPayload(user: any) {
    return { uuid: user.uuid, email: user.email, phone: user.phone, whatsapp: user.whatsapp, firstName: user.firstName, middleName: user.middleName, lastName: user.lastName };
  }

  async validateUser(userId: number) {
    return this.usersRepo.findOne({ where: { id: userId } });
  }

  async getUserByUuid(userId: string) {
    return this.usersRepo.findOne({ where: { uuid: userId } });
  }

  async findByUuid(uuid: string) {
    return this.usersRepo.findOne({ where: { uuid } });
  }
}
