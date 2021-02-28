import request from 'supertest';
import { getConnection } from 'typeorm';
import { app } from '../app';
import createConnection from '../database';
import { Survey } from '../models/Survey';
import { User } from '../models/User';

const sendMailMock = jest.fn(); // this will return undefined if .sendMail() is called

// In order to return a specific value you can use this instead
// const sendMailMock = jest.fn().mockReturnValue(/* Whatever you would expect as return value */);

jest.mock("nodemailer");

const nodemailer = require("nodemailer"); //doesn't work with import. idk why
nodemailer.createTransport.mockReturnValue({"sendMail": sendMailMock});

beforeEach( () => {
    sendMailMock.mockClear();
    nodemailer.createTransport.mockClear();
});

describe("SendMail", () => {
  beforeAll(async () => {
    const connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    const connection = getConnection();
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to create a new user", async () => {
    const response = await request(app).post("/users")
      .send({
        email: "user@example.com",
        name: "User Example"
      });

    expect(response.status).toBe(201);
  });

  it("Should be able to create a new survey", async () => {
    const response = await request(app).post("/surveys")
      .send({
        title: "Title Example",
        description: "Description Example"
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
  });

  it("Should be able to send a survey through email", async () => {
    const userResponse = await request(app).get("/users");
    const surveyResponse = await request(app).get("/surveys");
    const response = await request(app).post("/sendmail")
      .send({
        email: String(userResponse.body[0].email),
        survey_id: String(surveyResponse.body[0].id)
      });

    expect(response.body).toHaveProperty("value");
  });
})