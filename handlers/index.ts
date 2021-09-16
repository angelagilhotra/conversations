import { NextFunction as Next, Response } from "express";
import { errorBuilder } from "../utils";
import {
  RequestWithPayload,
  Attendee,
  Event,
  GoogleEvent,
  GoogleAttendee,
  SlackEventMessage,
  SlackMessageBlocks,
} from "../interfaces";
import { nanoid } from "nanoid";
import db from "../services/database";
import google from "../services/google";
import slack from "../services/slack";

export const responseHandler = (
  req: RequestWithPayload,
  res: Response,
  next: Next
) => {
  const msg = req.intermediatePayload ? req.intermediatePayload : [];
  res.json({
    ok: true,
    data: msg,
  });
};

export const pingHandler = (
  req: RequestWithPayload,
  res: Response,
  next: Next
) => {
  req.intermediatePayload = "pong";
  next();
};

export const pingErrorHandler = (
  req: RequestWithPayload,
  res: Response,
  next: Next
) => {
  next(errorBuilder("error message", 500, "raw log data goes here"));
};

const getEventDetailsToStore = (event: Event, series: any): Event => {
  let e: Event = {
    ...event,

    startDateTimeUnix: new Date(event.startDateTime).getTime(),
    startDateTimeOffset: new Date(event.startDateTime).getTimezoneOffset(),

    endDateTimeUnix: new Date(event.endDateTime).getTime(),
    endDateTimeOffset: new Date(event.endDateTime).getTimezoneOffset(),

    hash: series == false ? nanoid(10) : series,
    series: series == false ? false : true,
  };

  return e;
};

const getEventDetailsForGcal = (event: Event): GoogleEvent => {
  const organizer: GoogleAttendee = {
    email: event.proposerEmail,
    organizer: true,
    responseStatus: "accepted",
  };
  return {
    summary: event.title,
    attendees: [organizer],
    start: {
      dateTime: new Date(event.startDateTime).toISOString(),
      timezone: event.timezone,
    },
    end: {
      dateTime: new Date(event.startDateTime).toISOString(),
      timezone: event.timezone,
    },
    guestsCanSeeOtherGuests: true,
    location: event.location,
  };
};

const prepareEventURL = (series: string | false): string => {
  return "https://juntos.kernel.community/rsvp" + series;
};

const prepareSlackMessage = async (
  event: Event,
  series: string | false
): Promise<SlackEventMessage> => {
  const proposer = await db.getUser(event.proposerEmail);
  const type = await db.getType(event.typeId!);
  const title = event.title.replace(/[&\/\\#,+()$~%.'":*?<>@^{}]/g, "");
  let description = event.description
    .replace(/[&\/\\#,+()$~%.'":*?<>@^{}]/g, "")
    .substring(0, 200);
  if (description.length > 200) description += "...";

  let blocks: SlackMessageBlocks[] = [];
  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: proposer + " has proposed a new " + type?.type + "!",
    },
  });
  blocks.push({
    type: "divider",
  });
  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: title + "\n" + description,
    },
  });
  if (series) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*_This event is part of a series_*",
      },
    });
  }
  blocks.push({
    type: "actions",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "Read more",
          emoji: true,
        },
        value: "click-0",
        action_id: "actionId-0",
        url: prepareEventURL(series),
      },
    ],
  });
  return {
    title: event.title,
    description: event.description,
    startDateTime: new Date(event.startDateTime).toString(),
    url: prepareEventURL(series),
    blocks,
    icon: type?.emoji!,
    username: "New " + type?.type + " scheduled",
  };
};

/**
 * expects 'event' (type Event) object in body
 */
export const newEventHandler = async (
  req: RequestWithPayload,
  res: Response,
  next: Next
) => {
  const events: Event[] = req.body.data;
  let series: string | false = events.length > 1 ? nanoid(10) : false;
  let createdEvents: number[] = [];

  for (const e of events) {
    const eventModel = getEventDetailsToStore(e, series);
    const created = await db.createEvent(eventModel);
    createdEvents.push(created.id);

    if (e.createGcalEvent === true) {
      if (!e.gcalCalendarId) {
        next(
          errorBuilder("google calendar id not found", 500, e.gcalCalendarId)
        );
      }
      const eventGcalModel: GoogleEvent = getEventDetailsForGcal(e);
      const calEventId: string = await google.createEvent(
        eventGcalModel,
        e.gcalCalendarId!
      );
      await db.createGCalEvent(created.id, e.gcalCalendarId!, calEventId);
    }
  }

  let slackMessage: SlackEventMessage;
  if (events[0].postOnSlack === true) {
    slackMessage = await prepareSlackMessage(events[0], series);
    if (!events[0].slackChannelId) {
      next(
        errorBuilder(
          "slack channel id not found in the first event in array",
          500,
          events[0].slackChannelId
        )
      );
    }
    const messageId: string = await slack.sendEventMessage(
      slackMessage,
      events[0].slackChannelId!
    );
    await db.createSlackMessage(
      createdEvents[0],
      events[0].slackChannelId!,
      messageId
    );
  }
  next();
};

/**
 * expects attendee (type Attendee) obj in body
 */
export const rsvpHandler = async (
  req: RequestWithPayload,
  res: Response,
  next: Next
) => {
  const attendee: Attendee = req.body.data;
  let attendeesToStore: string[] = [];
  let eventId: number;
  if (!attendee.hash && !attendee.eventId) {
    next(
      errorBuilder(
        "either one of hash or eventid required",
        500,
        "missing hash and/or eventId"
      )
    );
    return;
  }
  if (attendee.hash) {
    eventId = await db.getEventIdByHash(attendee.hash);
  } else {
    eventId = attendee.eventId!;
  }
  const eventExistsInRsvp: boolean = await db.eventExistsInRsvp(eventId);
  if (eventExistsInRsvp) {
    attendeesToStore = await db.getAttendees(eventId);
  }
  // @todo push only if not already exists
  attendeesToStore.push(attendee.email);
  await db.rsvp(eventId, attendee.email, eventExistsInRsvp, attendeesToStore);

  const eventExistsInGCal: boolean = await db.eventExistsInGCal(eventId);
  if (eventExistsInGCal) {
    const gCal = await db.getGCalEvent(eventId);
    await google.rsvp(gCal.event, gCal.calendar, attendee.email);
  }
  next();
};

/**
 * update event details
 */
export const eventUpdateHandler = (
  req: RequestWithPayload,
  res: Response,
  next: Next
) => {
  // const eventId: number = req.body.eventId;
  // data.createGcalEvent should be false
  // // data.series should be false
  // const data: Event = req.body.data;
  // // update event in database
  // const updated = await updateEvent({eventId, data});
  // // check if google event exists for event in GoogleCalendar table using updated.id
  // // update google calendar event if exists
  // // post a message on slack if data.postOnSlack is true
  // await sendUpdateOnSlack({...data, update: true})
};
