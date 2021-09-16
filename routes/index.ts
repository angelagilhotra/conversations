import { Router } from "express";
import {
  pingErrorHandler,
  pingHandler,
  responseHandler,
  newEventHandler,
  rsvpHandler,
} from "../handlers";

const router = Router();

export default (client) => {
  // const { logger } = client;
  const { server } = client;
  server.use("/", router);

  // hello world
  router.get("/ping", pingHandler, responseHandler);
  router.get("/pingerror", pingErrorHandler, responseHandler);

  // create new event
  router.post("/new", newEventHandler, responseHandler);

  // rsvp to an event
  router.post("/rsvp", rsvpHandler, responseHandler);

  // update an event
  // router.post('/update',eventUpdateHandler, responseHandler);

  // login
  // router.post('/access', accessHandler, responseHandler);

  // get all events (with pagination)
  // router.get('/events', fetchEventsHandler, responseHandler);

  // get event by id
  // router.get('/event/:id', fetchEventHandler, responseHandler);

  return router;
};
