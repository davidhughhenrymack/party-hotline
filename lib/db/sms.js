import { and, desc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import {
  smsBroadcastDeliveries,
  smsBroadcasts,
  smsSubscribers,
} from "@/lib/db/schema";

function normalizePhoneNumber(phoneNumber) {
  return phoneNumber.trim();
}

function normalizeInboundMessage(message) {
  return message.trim().slice(0, 1600);
}

export async function subscribeSmsNumber({ phoneNumber, inboundMessage = "" }) {
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
  const normalizedInboundMessage = normalizeInboundMessage(inboundMessage);
  const now = new Date();

  if (!normalizedPhoneNumber) {
    return null;
  }

  const [subscriber] = await getDb()
    .insert(smsSubscribers)
    .values({
      phoneNumber: normalizedPhoneNumber,
      status: "subscribed",
      subscribedAt: now,
      unsubscribedAt: null,
      lastInboundMessage: normalizedInboundMessage,
      lastInboundAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: smsSubscribers.phoneNumber,
      set: {
        status: "subscribed",
        subscribedAt: now,
        unsubscribedAt: null,
        lastInboundMessage: normalizedInboundMessage,
        lastInboundAt: now,
        updatedAt: now,
      },
    })
    .returning();

  return subscriber;
}

export async function unsubscribeSmsNumber({ phoneNumber, inboundMessage = "" }) {
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
  const normalizedInboundMessage = normalizeInboundMessage(inboundMessage);
  const now = new Date();

  if (!normalizedPhoneNumber) {
    return null;
  }

  const [subscriber] = await getDb()
    .insert(smsSubscribers)
    .values({
      phoneNumber: normalizedPhoneNumber,
      status: "unsubscribed",
      unsubscribedAt: now,
      lastInboundMessage: normalizedInboundMessage,
      lastInboundAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: smsSubscribers.phoneNumber,
      set: {
        status: "unsubscribed",
        unsubscribedAt: now,
        lastInboundMessage: normalizedInboundMessage,
        lastInboundAt: now,
        updatedAt: now,
      },
    })
    .returning();

  return subscriber;
}

export async function getSubscribedSmsNumbers() {
  return getDb()
    .select({
      phoneNumber: smsSubscribers.phoneNumber,
      subscribedAt: smsSubscribers.subscribedAt,
    })
    .from(smsSubscribers)
    .where(eq(smsSubscribers.status, "subscribed"));
}

export async function getSmsSubscribers() {
  return getDb()
    .select({
      phoneNumber: smsSubscribers.phoneNumber,
      status: smsSubscribers.status,
      firstSeenAt: smsSubscribers.firstSeenAt,
      subscribedAt: smsSubscribers.subscribedAt,
      unsubscribedAt: smsSubscribers.unsubscribedAt,
      lastInboundAt: smsSubscribers.lastInboundAt,
      updatedAt: smsSubscribers.updatedAt,
    })
    .from(smsSubscribers)
    .orderBy(desc(smsSubscribers.lastInboundAt));
}

export async function createSmsBroadcast({ message }) {
  const [broadcast] = await getDb()
    .insert(smsBroadcasts)
    .values({ message })
    .returning();

  return broadcast;
}

export async function enqueueSmsBroadcastDeliveries({ broadcastId }) {
  const subscribers = await getSubscribedSmsNumbers();

  if (subscribers.length === 0) {
    return [];
  }

  return getDb()
    .insert(smsBroadcastDeliveries)
    .values(
      subscribers.map((subscriber) => ({
        broadcastId,
        phoneNumber: subscriber.phoneNumber,
      })),
    )
    .onConflictDoNothing()
    .returning();
}

export async function markSmsBroadcastSending({ broadcastId }) {
  const [broadcast] = await getDb()
    .update(smsBroadcasts)
    .set({
      status: "sending",
      updatedAt: new Date(),
    })
    .where(eq(smsBroadcasts.id, broadcastId))
    .returning();

  return broadcast;
}

export async function markSmsBroadcastSent({ broadcastId }) {
  const now = new Date();
  const [broadcast] = await getDb()
    .update(smsBroadcasts)
    .set({
      status: "sent",
      sentAt: now,
      updatedAt: now,
    })
    .where(eq(smsBroadcasts.id, broadcastId))
    .returning();

  return broadcast;
}

export async function markSmsBroadcastFailed({ broadcastId }) {
  const [broadcast] = await getDb()
    .update(smsBroadcasts)
    .set({
      status: "failed",
      updatedAt: new Date(),
    })
    .where(eq(smsBroadcasts.id, broadcastId))
    .returning();

  return broadcast;
}

export async function markSmsDeliverySent({ broadcastId, phoneNumber, twilioMessageSid }) {
  const now = new Date();
  const [delivery] = await getDb()
    .update(smsBroadcastDeliveries)
    .set({
      status: "sent",
      twilioMessageSid,
      sentAt: now,
      updatedAt: now,
    })
    .where(
      and(
        eq(smsBroadcastDeliveries.broadcastId, broadcastId),
        eq(smsBroadcastDeliveries.phoneNumber, normalizePhoneNumber(phoneNumber)),
      ),
    )
    .returning();

  return delivery;
}

export async function markSmsDeliveryFailed({ broadcastId, phoneNumber, errorMessage }) {
  const [delivery] = await getDb()
    .update(smsBroadcastDeliveries)
    .set({
      status: "failed",
      errorMessage,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(smsBroadcastDeliveries.broadcastId, broadcastId),
        eq(smsBroadcastDeliveries.phoneNumber, normalizePhoneNumber(phoneNumber)),
      ),
    )
    .returning();

  return delivery;
}
