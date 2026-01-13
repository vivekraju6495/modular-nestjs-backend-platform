 for scheduler

 npm install @nestjs/schedule

APP module register schedular

import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    // other modules...
  ],
})
export class AppModule {}