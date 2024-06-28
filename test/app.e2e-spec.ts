import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error('API_KEY not set.');
    }
    return request(app.getHttpServer())
      .get('/')
      .set('Authorization', apiKey)
      .expect(200)
      .expect('Hello Nest!');
  });

  afterAll(async () => {
    await app.close();
  });
});
