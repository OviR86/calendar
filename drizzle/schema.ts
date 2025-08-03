import { DAYS_OF_WEEK_IN_ORDER } from "@/constants";
import { relations } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";

const createdAt = timestamp("createdAt").notNull().defaultNow();
const updatedAt = timestamp("updatedAt")
  .notNull()
  .defaultNow()
  .$onUpdate(() => new Date());

// Define a PostgreSQL ENUM for the days of the week
export const scheduleDayOfWeekEnum = pgEnum("day", DAYS_OF_WEEK_IN_ORDER);

// Define the "events" table with fields like: name, description, duration, clerkUserId, isActive, createdAt, updatedAt
export const EventTable = pgTable(
  "events", //table name
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    duration: integer("duration").notNull(),
    clerkUserId: text("clerkUserId").notNull(),
    isActive: boolean("isActive").notNull().default(true),
    createdAt,
    updatedAt,
  },
  (table) => [index("clerkUserIdIndex").on(table.clerkUserId)]
);

//define the schedules table, one per user, with timezone and timestamps

export const ScheduleTable = pgTable("schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  timezone: text("timezone").notNull(),
  clerkUserId: text("clerkUserId").notNull().unique(),
  createdAt,
  updatedAt,
});

//Define a relation for the ScheduleTable: a schedule has many scheduleAvailabilities
export const scheduleRelations = relations(ScheduleTable, ({ many }) => ({
  scheduleAvailabilities: many(ScheduleAvailabilityTable), //one-to-many relationship
}));

// Define the "scheduleAvailabilities" table, which stores available time slots per day
export const ScheduleAvailabilityTable = pgTable(
  "scheduleAvailabilities",
  {
    id: uuid("id").primaryKey().defaultRandom(), // unique ID
    scheduleId: uuid("scheduleId") // foreign key to the Schedule table
      .notNull()
      .references(() => ScheduleTable.id, { onDelete: "cascade" }), // cascade delete when schedule is deleted
    startTime: text("startTime").notNull(), // start time of availability (e.g. "09:00")
    endTime: text("endTime").notNull(), // end time of availability (e.g. "17:00")
    dayOfWeek: scheduleDayOfWeekEnum("dayOfWeek").notNull(), // day of the week (ENUM)
  },
  (table) => [
    index("scheduleIdIndex").on(table.scheduleId), // index on foreign key for faster lookups
  ]
);

//Define the reverse relation for the ScheduleAvailabilityTable: a scheduleAvailability belongs to a schedule
export const scheduleAvailabilityRelations = relations(
  ScheduleAvailabilityTable,
  ({ one }) => ({
    schedule: one(ScheduleTable, {
      fields: [ScheduleAvailabilityTable.scheduleId],
      references: [ScheduleTable.id],
    }),
  })
);
