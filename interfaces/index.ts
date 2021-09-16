import { Request } from "express";
// import {Event} from "@prisma/client";
export interface Error {
  message?: string;
  status?: number;
  logData?: string;
}

export type ErrorBuilder = (
  message?: string,
  status?: number,
  logData?: string
) => Error;

export interface RequestWithPayload extends Request {
  intermediatePayload?: any;
}

export type EventType = {
  name: string;
};

export type SlackEventMessage = {
  title: string;
  description: string;
  startDateTime: string;
  url: string;
  blocks: SlackMessageBlocks[];
  icon: string;
  username: string;
};

export type SlackMessageBlocks = {
  type: string;
  elements?: object[];
  text?: object;
};

export type Event = {
  title: string;
  description: string;
  startDateTime: Date;
  endDateTime: Date;
  timezone: string;
  location: string;
  limit: number;
  proposerEmail: string;
  series: boolean;
  typeId?: number;

  startDateTimeUnix?: number;
  endDateTimeUnix?: number;
  startDateTimeOffset?: number;
  endDateTimeOffset?: number;
  hash?: string;
  seriesId?: string;

  // services
  postOnSlack: boolean;
  slackChannelId?: string;
  createGcalEvent: boolean;
  gcalCalendarId?: string;
};

export type GoogleEvent = {
  summary: string;
  attendees: GoogleAttendee[];
  start: GoogleDate;
  end: GoogleDate;
  guestsCanSeeOtherGuests: boolean;
  location: string;
};

export type GoogleDate = {
  dateTime: string;
  timezone: string;
};

export type GoogleAttendee = {
  email: string;
  organizer?: boolean;
  responseStatus?: "accepted" | "tentative" | "needsAction" | "declined";
};

export type Attendee = {
  name?: string;
  email: string;
  eventId?: number;
  hash?: string;
};
