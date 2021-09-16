import Server from "./server";
import * as Config from "./config/index.json";

new Server().start(Config.server.port);
