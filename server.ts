import express from "express";
import routes from "./routes";
import consola, { Consola } from "consola";
import cors from "cors";
import error from "./handlers/error";
import morgan from "morgan";

export default class Server {
  public server;
  public logger: Consola = consola;
  constructor() {
    this.server = express();
    this.load();
    routes(this);
    error(this);
    this.logger.success("constructed");
  }
  load() {
    this.server.use(express.json({ limit: "50mb" }));
    this.server.use(morgan("dev"));
    this.server.use(cors());
  }
  public start(port) {
    this.server.listen(port);
    this.logger.success(`app listening on ${port}`);
  }
}
