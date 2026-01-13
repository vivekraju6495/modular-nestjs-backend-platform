//Install Mongoose and Its Types

npm install mongoose
npm install --save-dev @types/mongoose


//Update the main.ts from root folder

import { LoggerInterceptor } from '@app/logger/logger.interceptor'; // logger path
import { LoggerService } from '@app/logger/logger.service'; // logger path

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new LoggerInterceptor(app.get(LoggerService)));
 ...other codes
}
bootstrap();


//Update the env with
ENABLE_API_LOGGING=true
MONGODB_URI=mongodb url // example : mongodb://127.0.0.1:27017/modular_framework

Then add optionally logger in app.module
let LoggerModule:any
try {
  ({ LoggerModule } = require('libs/logger/src'));
} catch (e) {
  LoggerModule = null;


  @Module({
  imports: [
    ...(LoggerModule ? [LoggerModule] : []),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


Add mongo db path in system environmental

and run this in terminal
mongod --dbpath "C:\modular_framwork\db"  //create the foler if don't (any path)





To downlaod and setup mongodb in our local system
step1
Download MongoDB Community Edition
Go to the official MongoDB download page: https://www.mongodb.com/try/download/community

Choose your OS (Windows/macOS/Linux)

Select MSI installer for Windows or TGZ for Linux/macOS

Download and install

step 2
Install MongoDB as a Service (Windows only)
During installation:

Choose “Complete” setup

Enable “Install MongoDB as a Service” (recommended)

Optionally install MongoDB Compass (GUI tool)

Then using MongoDb Compass Add a connection