import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static'; // for view images and files from root folder through url
import { join } from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthRolesMiddleware } from '@app/auth-roles/auth-roles.middleware';

// Optional EmailModule import
let EmailModule: any;
try {
  ({ EmailModule } = require('libs/email/src'));
} catch (e) {
  EmailModule = null;
}
//optional Auth
let AuthModule: any;
try {
  ({ AuthModule } = require('libs/auth/src'));
} catch (e) {
  AuthModule = null;
}
//optional import emailer
let EmailerModule: any;
try {
  ({ EmailerModule } = require('libs/emailer/src'));
} catch (e) {
  EmailerModule = null;
}
//optional import Contact
let ContactsModule: any;
try {
  ({ ContactsModule } = require('libs/contacts/src'));
} catch (e) {
  ContactsModule = null;
}
//optional import uploader
let UploaderModule: any;
try {
  ({ UploaderModule } = require('libs/uploader/src'));
} catch (e) {
  UploaderModule = null;
}

let LoggerModule:any
try {
  ({ LoggerModule } = require('libs/logger/src'));
} catch (e) {
  LoggerModule = null;
}

let CompanyProfileModule:any
try {
  ({ CompanyProfileModule } = require('libs/company-profile/src'));
} catch (e) {
  CompanyProfileModule = null;
}

let QueueManagerModule:any
try {
  ({ QueueManagerModule } = require('libs/queue-manager/src'));
} catch (e) {
  QueueManagerModule = null;
}

let AuthRolesModule:any
try {
  ({ AuthRolesModule } = require('libs/auth-roles/src'));
} catch (e) {
  AuthRolesModule = null;
}
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // path to your uploads folder
      serveRoot: '/uploads', // public route prefix
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT!,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: true, // turn off in prod
    }),
    ...(AuthModule ? [AuthModule] : []),
    ...(AuthRolesModule ? [AuthRolesModule] : []),
    ...(EmailerModule ? [EmailerModule] : []),
    ...(EmailModule ? [EmailModule] : []),
    ...(ContactsModule ? [ContactsModule] : []),
    ...(UploaderModule ? [UploaderModule] : []),
    ...(LoggerModule ? [LoggerModule] : []),
    ...(CompanyProfileModule ? [CompanyProfileModule] : []),
    ...(QueueManagerModule ? [QueueManagerModule] : []),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthRolesMiddleware)
      .exclude(
        { path: 'auth/register', method: RequestMethod.ALL },
        { path: 'auth/login', method: RequestMethod.ALL },
        { path: 'auth/refresh', method: RequestMethod.ALL },
        { path: 'auth/sent-otp', method: RequestMethod.ALL },
        { path: 'auth/verify-otp', method: RequestMethod.ALL },
        { path: 'auth/verify', method: RequestMethod.ALL },
        { path: 'auth-roles/assign-user', method: RequestMethod.ALL },
        { path: 'auth-roles/assign-permission', method: RequestMethod.ALL },
        { path: 'auth-roles/permission/create', method: RequestMethod.ALL }
      )
      .forRoutes('*'); // apply to all other routes
  }
}
