import { getAuth } from "./auth";
import { google } from "googleapis";
import { GoogleEvent } from "interfaces";

class GoogleService {
  getCalendar = async () => {
    let auth;
    try {
      auth = await getAuth();
    } catch (e) {
      console.log("error in auth", e);
    }
    const calendar = google.calendar({ version: "v3", auth });
    return calendar;
  };
  public createEvent = async (
    event: GoogleEvent,
    calendarId: string
  ): Promise<string> => {
    const calendar = await this.getCalendar();
    const e = await calendar.events.insert({
      calendarId,
      requestBody: event,
    });
    if (!e.data.id) {
      throw new Error("Error in creating event");
    }
    return e.data.id!;
  };
  public getEvent = async (calendarId: string, eventId: string) => {
    const calendar = await this.getCalendar();
    return (
      await calendar.events.get({
        calendarId,
        eventId,
      })
    ).data;
  };
  public rsvp = async (
    eventId: string,
    calendarId: string,
    email: string
  ): Promise<void> => {
    const calendar = await this.getCalendar();
    const event = await this.getEvent(calendarId, eventId);
    let attendees = event.attendees ? event.attendees : [];
    attendees.push({
      email,
      responseStatus: "accepted",
    });
    await calendar.events.update({
      calendarId,
      eventId,
      requestBody: {
        summary: event.summary,
        creator: event.creator,
        start: event.start,
        end: event.end,
        attendees,
      },
      sendUpdates: "all",
    });
  };
}

export default new GoogleService();
