import { Test, TestingModule } from '@nestjs/testing';
import { EmailTemplatesController } from './email-templates.controller';

describe('EmailTemplatesController', () => {
  let controller: EmailTemplatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailTemplatesController],
    }).compile();

    controller = module.get<EmailTemplatesController>(EmailTemplatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
