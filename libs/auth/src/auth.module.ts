import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import authConfig from './config/auth.config';
import { User } from './entities/user.entity';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { UserOtp } from './entities/loginOpt.entity';
import { SystemConfiguration } from './entities/systemConfig.entity';
import { AuthRolesModule } from '@app/auth-roles/auth-roles.module';
import { UserTemperory } from './entities/userTemperory.entity';

// Try to load EmailModule safely
let EmailModule: any;
try {
  // If libs/email/src exports a Nest module
  ({ EmailModule } = require('libs/email/src'));
} catch (e) {
  EmailModule = null;
}

@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('auth.jwtSecret'),
        signOptions: { expiresIn: config.get('auth.jwtExpiresIn') },
      }),
    }),
    TypeOrmModule.forFeature([User,UserTemperory, UserOtp,SystemConfiguration]),
    forwardRef(() => AuthRolesModule),
    ...(EmailModule ? [EmailModule] : []), // only import if available
  ],
  providers: [
    {
      provide: 'AuthService',
      useExisting: AuthService,
    },
    AuthService,
    JwtStrategy,
  ],
  controllers: [AuthController],
  exports: [
    AuthService,
    JwtModule,
    TypeOrmModule,
    ...(EmailModule ? [EmailModule] : []), // only export if available
  ],
})
export class AuthModule {}
