import { relations } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const smsSubscriberStatus = pgEnum("sms_subscriber_status", [
  "subscribed",
  "unsubscribed",
]);

export const smsBroadcastStatus = pgEnum("sms_broadcast_status", [
  "draft",
  "sending",
  "sent",
  "failed",
]);

export const smsBroadcastDeliveryStatus = pgEnum("sms_broadcast_delivery_status", [
  "queued",
  "sent",
  "failed",
  "skipped",
]);

export const smsSubscribers = pgTable(
  "sms_subscribers",
  {
    phoneNumber: text("phone_number").primaryKey(),
    status: smsSubscriberStatus("status").notNull().default("subscribed"),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull().defaultNow(),
    subscribedAt: timestamp("subscribed_at", { withTimezone: true }).notNull().defaultNow(),
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
    lastInboundMessage: text("last_inbound_message"),
    lastInboundAt: timestamp("last_inbound_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("sms_subscribers_status_idx").on(table.status),
    index("sms_subscribers_last_inbound_at_idx").on(table.lastInboundAt),
  ],
);

export const smsBroadcasts = pgTable(
  "sms_broadcasts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    message: text("message").notNull(),
    status: smsBroadcastStatus("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("sms_broadcasts_status_idx").on(table.status)],
);

export const smsBroadcastDeliveries = pgTable(
  "sms_broadcast_deliveries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    broadcastId: uuid("broadcast_id")
      .notNull()
      .references(() => smsBroadcasts.id, { onDelete: "cascade" }),
    phoneNumber: text("phone_number")
      .notNull()
      .references(() => smsSubscribers.phoneNumber, { onDelete: "cascade" }),
    status: smsBroadcastDeliveryStatus("status").notNull().default("queued"),
    twilioMessageSid: text("twilio_message_sid"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("sms_broadcast_deliveries_broadcast_phone_idx").on(
      table.broadcastId,
      table.phoneNumber,
    ),
    index("sms_broadcast_deliveries_status_idx").on(table.status),
    index("sms_broadcast_deliveries_phone_number_idx").on(table.phoneNumber),
  ],
);

export const smsSubscribersRelations = relations(smsSubscribers, ({ many }) => ({
  deliveries: many(smsBroadcastDeliveries),
}));

export const smsBroadcastsRelations = relations(smsBroadcasts, ({ many }) => ({
  deliveries: many(smsBroadcastDeliveries),
}));

export const smsBroadcastDeliveriesRelations = relations(
  smsBroadcastDeliveries,
  ({ one }) => ({
    broadcast: one(smsBroadcasts, {
      fields: [smsBroadcastDeliveries.broadcastId],
      references: [smsBroadcasts.id],
    }),
    subscriber: one(smsSubscribers, {
      fields: [smsBroadcastDeliveries.phoneNumber],
      references: [smsSubscribers.phoneNumber],
    }),
  }),
);
