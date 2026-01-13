import { Injectable, Optional } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { getRepositoryToken, InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private fromEmail: string;
  private emailSendJobRepo?: Repository<any>;

  constructor(
      private readonly moduleRef: ModuleRef, 
    
  ) {
    // Load SMTP details from environment variables
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    this.fromEmail = process.env.SMTP_FROM || 'no-reply@yopmail.com';
  }

  async onModuleInit() {
    try {
      const { EmailSendJob, JobStatus } = require('@app/emailer/entities/emailSendJob.entity');
      this.emailSendJobRepo = this.moduleRef.get(getRepositoryToken(EmailSendJob), { strict: false });
    } catch (err) {
      console.warn('EmailSendJob entity not available');
    }
  }

  async sendTestEmail() {
    const mailOptions = {
      from: this.fromEmail,
      to: 'saitama.og@yopmail.fr',
      subject: 'Testing Email Service',
      text: 'This is a plain text body for testing.',
      html: '<h1>This is a test email</h1><p>Sent from NestJS</p>',
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);

      // Ethereal only (for preview URL)
      if (nodemailer.getTestMessageUrl(info)) {
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }
    } catch (error) {
      console.error('Error sending test email:', error.message);
    }
  }

  async sendLoginOtpEmail(user: any, otp: string, expiryTime: number) {
    const mailOptions = {
      from: this.fromEmail,
      to: user.email,
      subject: 'Your One-Time Password (OTP) for Login',
      text: `
        Hello ${user.firstName || user.email},

        Your OTP for login is: ${otp}
        This OTP will expire in ${expiryTime} minutes.

        If you did not request this OTP, please ignore this message.

        Best regards,
        Your App Team
      `,
      html: `
        <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333;">
          <h2>Hello ${user.firstName || user.email},</h2>
          <p>Here is your One-Time Password (OTP) for login:</p>

          <p style="text-align:center; margin: 20px 0;">
            <span style="font-size:24px; font-weight:bold; color:#4CAF50; letter-spacing:3px;">${otp}</span>
          </p>

          <p>This OTP will expire in <strong>${expiryTime} minutes</strong>.</p>

          <p>If you did not request this OTP, you can safely ignore this email.</p>

          <p>Best regards,<br>Modular Framework Team</p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Login OTP email sent:', info.messageId);

      if (nodemailer.getTestMessageUrl(info)) {
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }
    } catch (error) {
      console.error('Error sending login OTP email:', error.message);
    }
  }


  async sendRegistrationEmail1(user: any, verifyLink: string, otp: string) {
    const mailOptions = {
      from: this.fromEmail,
      to: user.email,
      subject: 'Verify Your Account - Email Confirmation',
      text: `
        Hello ${user.firstName || user.email},

        Please verify your email by visiting this link:
        ${verifyLink}

        OTP for first login: ${otp}

        Best regards,
        Your App Team
      `,
      html: `
        <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333;">
          <h2>Welcome, ${user.firstName || user.email}</h2>
          <p>Thanks for signing up! To complete your registration, please verify your email address by clicking the button below:</p>
          
          <p style="text-align:center; margin: 20px 0;">
            <a href="${verifyLink}" 
              style="background:#4CAF50; color:#fff; padding:12px 20px; text-decoration:none; border-radius:5px;">
              Verify Email
            </a>
          </p>

          <p>If the button above doesn't work, copy this link:</p>
          <p style="word-break: break-all; color:#0066cc;">${verifyLink}</p>

          <hr />

          <p><strong>Use this OTP for your first login:</strong></p>
          <h3 style="color:#4CAF50; letter-spacing:3px;">${otp}</h3>

          <p>This link and OTP will expire shortly. If you did not register, ignore this email.</p>

          <p>Best regards,<br>Modular Framework Team</p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Registration email sent:', info.messageId);

      if (nodemailer.getTestMessageUrl(info)) {
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }
    } catch (error) {
      console.error('Error sending registration email:', error.message);
    }
  }

   async sendRegistrationEmail(user: any, verifyLink: string, otp: string) {
    const mailOptions = {
      from: this.fromEmail,
      to: user.email,
      subject: 'Verify Your Account - Email Confirmation',
      text: `
        Hello ${user.firstName || user.email},

        Please verify your email by visiting this link:
        ${verifyLink}

        Best regards,
        Modular Framework Team
      `,
      html: `
        <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333;">
          <h2>Welcome, ${user.firstName || user.email}</h2>
          <p>Thanks for signing up! To complete your registration, please verify your email address by clicking the button below:</p>
          
          <p style="text-align:center; margin: 20px 0;">
            <a href="${verifyLink}" 
              style="background:#4CAF50; color:#fff; padding:12px 20px; text-decoration:none; border-radius:5px;">
              Verify Email
            </a>
          </p>

          <p>If the button above doesn't work, copy this link:</p>
          <p style="word-break: break-all; color:#0066cc;">${verifyLink}</p>

          <p>Best regards,<br>Modular Framework Team</p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Registration email sent:', info.messageId);

      if (nodemailer.getTestMessageUrl(info)) {
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }
    } catch (error) {
      console.error('Error sending registration email:', error.message);
    }
  }

  async sendCampaignEmail(campaignId: number,jobs: any[],campaign: any,JobStatus: any): Promise<void> {
    const { template, subject, fromName, fromEmail } = campaign;

    for (const job of jobs) {
      const mailOptions = {
        from: `"${fromName || 'Modular Framework'}" <${fromEmail || this.fromEmail}>`,
        to: job.email,
        subject: subject || 'Campaign Email',
        html: template?.html || '', // safer access
      };

      try {
        const info = await this.transporter.sendMail(mailOptions);
        console.log(`Email sent to ${job.email}: ${info.messageId}`);

        job.status = JobStatus.SENT;
        job.sentAt = new Date();
        job.lastError = null;
        job.attempts = 0;

        await this.updateEmailJobStatus(job.id, campaignId, job);
        console.log(`Email sent successfully to ${job.email}`);
      } catch (error: any) {
        console.error(`Failed to send email to ${job.email}:`, error.message);

        job.status = JobStatus.FAILED;
        job.lastError = error.message;
        job.attempts = (job.attempts || 0) + 1;

        await this.updateEmailJobStatus(job.id, campaignId, job);
        console.log(`Email failed for ${job.email}`);
      }
    }
  }

  private async updateEmailJobStatus(id: number,campaignId: number,job: any): Promise<boolean> {
    if (!this.emailSendJobRepo) {
      console.warn('EmailSendJobRepo not initialized');
      return false;
    }

    await this.emailSendJobRepo.update(
      { id, campaignId },
      {
        status: job.status,
        sentAt: job.sentAt,
        lastError: job.lastError,
        attempts: job.attempts,
      }
    );

    return true;
  }


}
