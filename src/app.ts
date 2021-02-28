import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
import expressHbs from 'express-handlebars';
import "express-async-errors";
import createConnection from './database';
import { router } from './router';
import { AppError } from './errors/AppError';
import path from "path";

createConnection();
const app = express();

app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', expressHbs({
  layoutsDir: path.resolve(__dirname, "views"),
  partialsDir: path.resolve(__dirname, "views"),
  defaultLayout: undefined,
  extname: '.hbs'
}));
app.set('view engine', 'hbs');

app.use(express.json());
app.use(router);

app.use((err: Error, request: Request, response: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return response.status(err.statusCode).json({
      message: err.message
    });
  }

  return response.status(500).json({
    status: 'Error',
    message: `Internal server error ${err.message}`
  })
});

export { app };