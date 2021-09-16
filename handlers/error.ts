import { Request, Response, NextFunction as Next } from "express";
import { Error } from "../interfaces";
import { errorBuilder } from "../utils";

const errorNotFound = (req: Request, res: Response, next: Next) => {
  next(errorBuilder("Not Found", 404));
};

const errorHandler = (logger) => {
  return (error: Error, req: Request, res: Response, next: Next) => {
    logger.error(`${JSON.stringify(error)}`);
    res.status(error.status ? error.status : 500);
    res.json({
      ok: false,
      message: error.message ? error.message : "",
    });
  };
};

export default (client) => {
  const logger = client.logger;
  const server = client.server;
  server.use(errorNotFound);
  server.use(errorHandler(logger));
};
