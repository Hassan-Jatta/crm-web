import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: [
      'https://kicks-crm.vercel.app',
      'http://localhost:3000',       
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  }); 
  
  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0'); 
  console.log(`Backend lancé sur le port ${port}`);
}
bootstrap();