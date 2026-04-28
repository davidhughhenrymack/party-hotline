CREATE TYPE "public"."sms_broadcast_delivery_status" AS ENUM('queued', 'sent', 'failed', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."sms_broadcast_status" AS ENUM('draft', 'sending', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."sms_subscriber_status" AS ENUM('subscribed', 'unsubscribed');--> statement-breakpoint
CREATE TABLE "sms_broadcast_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"broadcast_id" uuid NOT NULL,
	"phone_number" text NOT NULL,
	"status" "sms_broadcast_delivery_status" DEFAULT 'queued' NOT NULL,
	"twilio_message_sid" text,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sms_broadcasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message" text NOT NULL,
	"status" "sms_broadcast_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sms_subscribers" (
	"phone_number" text PRIMARY KEY NOT NULL,
	"status" "sms_subscriber_status" DEFAULT 'subscribed' NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"subscribed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"unsubscribed_at" timestamp with time zone,
	"last_inbound_message" text,
	"last_inbound_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sms_broadcast_deliveries" ADD CONSTRAINT "sms_broadcast_deliveries_broadcast_id_sms_broadcasts_id_fk" FOREIGN KEY ("broadcast_id") REFERENCES "public"."sms_broadcasts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sms_broadcast_deliveries" ADD CONSTRAINT "sms_broadcast_deliveries_phone_number_sms_subscribers_phone_number_fk" FOREIGN KEY ("phone_number") REFERENCES "public"."sms_subscribers"("phone_number") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "sms_broadcast_deliveries_broadcast_phone_idx" ON "sms_broadcast_deliveries" USING btree ("broadcast_id","phone_number");--> statement-breakpoint
CREATE INDEX "sms_broadcast_deliveries_status_idx" ON "sms_broadcast_deliveries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sms_broadcast_deliveries_phone_number_idx" ON "sms_broadcast_deliveries" USING btree ("phone_number");--> statement-breakpoint
CREATE INDEX "sms_broadcasts_status_idx" ON "sms_broadcasts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sms_subscribers_status_idx" ON "sms_subscribers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sms_subscribers_last_inbound_at_idx" ON "sms_subscribers" USING btree ("last_inbound_at");