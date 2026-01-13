import { Test, TestingModule } from '@nestjs/testing';
import { QueueManagerService } from './queue-manager.service';

describe('QueueManagerService', () => {
  let service: QueueManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueueManagerService],
    }).compile();

    service = module.get<QueueManagerService>(QueueManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
