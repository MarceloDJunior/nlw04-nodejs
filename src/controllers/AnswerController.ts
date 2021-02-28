import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { AppError } from "../errors/AppError";
import { SurveyUsersRepository } from "../repositories/SurveyUsersRepository";
import { UsersRepository } from "../repositories/UsersRepository";

class AnswerController {

  async execute(request: Request, response: Response) {
    const { value } = request.params;
    const { u } = request.query;

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