import { Test, TestingModule } from '@nestjs/testing';
import { EmailElementsController } from './email-elements.controller';

describe('EmailElementsController', () => {
  let controller: EmailElementsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailElementsController],
    }).compile();

    controller = module.get<EmailElementsController>(EmailElementsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
