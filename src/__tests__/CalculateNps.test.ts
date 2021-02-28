import request from 'supertest';
import { getConnection, getCustomRepository } from 'typeorm';
import { app } from '../app';
import createConnection from '../database';
import { SurveysRepository } from '../repositories/SurveysRepository';
import { SurveyUsersRepository } from '../repositories/SurveyUsersRepository';
import { UsersRepository } from '../repositories/UsersRepository';

describe("Calculate NPS", () => {
  beforeAll(async () => {
    const connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    const connection = getConnection();
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to calculate NPS", async () => {
    
    const usersRepository = getCustomRepository(UsersRepository);
    const surveysRepository = getCustomRepository(SurveysRepository);
    const surveyUsersRepository = getCustomRepository(SurveyUsersRepository);

    const user1 = usersRepository.create({
      name: 'User Example 1',
      email: 'user1@example.com'
    });
    const user2 = usersRepository.create({
      name: 'User Example 2',
      email: 'user2@example.com'
    });

    await usersRepository.save([user1, user2]);

    const survey = surveysRepository.create({
      title: 'Survey title',
      description: 'Survey description'
    });

    await surveysRepository.save(survey);

    const surveyUser1 = surveyUsersRepository.create({
      user_id: user1.id,
      survey_id: survey.id,
      value: 10
    });
    const surveyUser2 = surveyUsersRepository.create({
      user_id: user2.id,
      survey_id: survey.id,
      value: 8
    });

    await surveyUsersRepository.save([surveyUser1, surveyUser2]);

    const response = await request(app).get(`/nps/${survey.id}`);

    expect(response.body.nps).toBe(50);
  });
});