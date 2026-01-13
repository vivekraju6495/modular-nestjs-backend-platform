import { Test, TestingModule } from '@nestjs/testing';
import { LoggerHealthController } from './logger.controller';

describe('LoggerController', () => {
  let controller: LoggerHealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoggerHealthController],
    }).compile();

    controller = module.get<LoggerHealthController>(LoggerHealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
