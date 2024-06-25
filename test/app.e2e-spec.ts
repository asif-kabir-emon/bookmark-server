import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from 'src/auth/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333, 'localhost');

    prisma = app.get(PrismaService);
    await prisma.cleanDatabase();
  });

  afterAll(async () => {
    app.close();
  });

  const dto: AuthDto = {
    email: 'test1@gmail.com',
    password: 'password',
    firstName: 'John',
    lastName: 'Doe',
  };

  describe('Auth', () => {
    describe('Sign up', () => {
      it('should throw error if email empty', () => {
        return pactum
          .spec()
          .post('http://localhost:3333/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('should throw error if password empty', () => {
        return pactum
          .spec()
          .post('http://localhost:3333/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('should throw error if no body provided', () => {
        return pactum
          .spec()
          .post('http://localhost:3333/auth/signup')
          .expectStatus(400);
      });

      it('should signup', () => {
        return pactum
          .spec()
          .post('http://localhost:3333/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Sign in', () => {
      it('should throw error if email empty', () => {
        return pactum
          .spec()
          .post('http://localhost:3333/auth/login')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('should throw error if password empty', () => {
        return pactum
          .spec()
          .post('http://localhost:3333/auth/login')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('should throw error if no body provided', () => {
        return pactum
          .spec()
          .post('http://localhost:3333/auth/login')
          .expectStatus(400);
      });

      it('should login and return a token', () => {
        return pactum
          .spec()
          .post('http://localhost:3333/auth/login')
          .withBody({ email: dto.email, password: dto.password })
          .expectStatus(200)
          .expectJsonLike({
            token: /.*/,
          })
          .stores('userAccessToken', 'token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should get the current user', () => {
        return pactum
          .spec()
          .get('http://localhost:3333/users/me')
          .withHeaders({
            Authorization: '$S{userAccessToken}',
          })
          .expectStatus(200);
      });
    });

    describe('Edit User', () => {
      it('should get the current user', () => {
        return pactum
          .spec()
          .patch('http://localhost:3333/users')
          .withHeaders({
            Authorization: '$S{userAccessToken}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.lastName);
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Get no bookmark', () => {
      it('should return empty array if no bookmarks', () => {
        return pactum
          .spec()
          .get('http://localhost:3333/bookmarks')
          .withHeaders({
            Authorization: '$S{userAccessToken}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Create bookmark', () => {
      const dto = {
        link: 'https://nestjs.com',
        title: 'NestJS',
      };
      it('should create a bookmark', () => {
        return pactum
          .spec()
          .post('http://localhost:3333/bookmarks')
          .withHeaders({
            Authorization: '$S{userAccessToken}',
          })
          .withBody(dto)
          .expectStatus(201)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.link)
          .stores('bookmarkId', 'id');
      });

      it('should throw error if link empty', () => {
        return pactum
          .spec()
          .post('http://localhost:3333/bookmarks')
          .withHeaders({
            Authorization: '$S{userAccessToken}',
          })
          .withBody({
            title: dto.title,
          })
          .expectStatus(400);
      });

      it('should throw error if title empty', () => {
        return pactum
          .spec()
          .post('http://localhost:3333/bookmarks')
          .withHeaders({
            Authorization: '$S{userAccessToken}',
          })
          .withBody({
            link: dto.link,
          })
          .expectStatus(400);
      });
    });

    describe('Get bookmarks', () => {
      it('should return all bookmarks', () => {
        return pactum
          .spec()
          .get('http://localhost:3333/bookmarks')
          .withHeaders({
            Authorization: '$S{userAccessToken}',
          })
          .expectStatus(200);
      });
    });

    describe('Get bookmark by id', () => {
      it('should return a bookmark by id', () => {
        return pactum
          .spec()
          .get('http://localhost:3333/bookmarks/$S{bookmarkId}')
          .withHeaders({
            Authorization: '$S{userAccessToken}',
          })
          .expectStatus(200);
      });
    });

    describe('Update bookmark', () => {
      const dto = {
        link: 'https://nestjsv8.com',
        title: 'NestJS v8',
      };
      it('should update a bookmark', () => {
        return pactum
          .spec()
          .patch('http://localhost:3333/bookmarks/$S{bookmarkId}')
          .withHeaders({
            Authorization: '$S{userAccessToken}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.link);
      });
    });

    describe('Delete bookmark', () => {
      it('should delete the bookmark', () => {
        return pactum
          .spec()
          .delete('http://localhost:3333/bookmarks/$S{bookmarkId}')
          .withHeaders({
            Authorization: '$S{userAccessToken}',
          })
          .expectStatus(204);
      });
    });
  });
});
