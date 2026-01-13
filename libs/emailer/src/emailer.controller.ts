import { Controller, Get } from '@nestjs/common';

@Controller('emailer')
export class EmailerController {
    @Get()
      getHello() {
        return { message: 'Welcome to Emailer Library!' };
      }
    
}
