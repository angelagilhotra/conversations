-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "startDateTimeUnix" INTEGER NOT NULL,
    "startDateTimeTZOffset" INTEGER NOT NULL,
    "endDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTimeUnix" INTEGER NOT NULL,
    "endDateTimeTZOffset" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "series" BOOLEAN NOT NULL,
    "limit" INTEGER NOT NULL,
    "typeId" INTEGER NOT NULL,
    "proposerEmail" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "block" INTEGER NOT NULL,
    "sendReminders" BOOLEAN DEFAULT false
);

-- CreateTable
CREATE TABLE "EventType" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "emoji" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "RSVP" (
    "eventId" INTEGER NOT NULL,
    "attendees" TEXT[]
);

-- CreateTable
CREATE TABLE "GoogleCalendar" (
    "eventId" INTEGER NOT NULL,
    "gCalEventId" TEXT,
    "gCalCalendarId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Slack" (
    "eventId" INTEGER NOT NULL,
    "messageId" TEXT,
    "channelId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_id_key" ON "Event"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "EventType_id_key" ON "EventType"("id");

-- CreateIndex
CREATE UNIQUE INDEX "RSVP_eventId_key" ON "RSVP"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleCalendar_eventId_key" ON "GoogleCalendar"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Slack_eventId_key" ON "Slack"("eventId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "EventType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_proposerEmail_fkey" FOREIGN KEY ("proposerEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RSVP" ADD CONSTRAINT "RSVP_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleCalendar" ADD CONSTRAINT "GoogleCalendar_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Slack" ADD CONSTRAINT "Slack_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
