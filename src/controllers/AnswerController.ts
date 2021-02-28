import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { AppError } from "../errors/AppError";
import { SurveyUsersRepository } from "../repositories/SurveyUsersRepository";
import { UsersRepository } from "../repositories/UsersRepository";
import * as yup from 'yup';

class AnswerController {

  async execute(request: Request, response: Response) {
    const { value } = request.params;
    const { u } = request.query;

    const paramSchema = yup.object().shape({
      value: yup.number().required()
    });

    const querySchema = yup.object().shape({
      u: yup.string().required()
    });

    try {
      await paramSchema.validate(request.params, { abortEarly: false });
      await querySchema.validate(request.query, { abortEarly: false });
    } catch(err) {
      throw new AppError(err);
    }

    const surveyUsersRepository = getCustomRepository(SurveyUsersRepository);
    const usersRepository = getCustomRepository(UsersRepository);

    const surveyUser = await surveyUsersRepository.findOne({
      id: String(u)
    });

    if(!surveyUser) {
      throw new AppError("Survey user does not exists!");
    }

    const user = await usersRepository.findOne({
      id: surveyUser.user_id
    });

    if(!user) {
      throw new AppError("User does not exists!");
    }

    surveyUser.value = Number(value);

    await surveyUsersRepository.save(surveyUser);
    
    return response.redirect( `/thankyou?name=${user.name}`)
  }

  async thankYou(request: Request, response: Response) {
    const { name } = request.query;

    return response.render("npsAnswer", { name });
  }
}

export { AnswerController }