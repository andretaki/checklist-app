-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE IF NOT EXISTS "chemprice" (
	"chemical_name" varchar(255),
	"unit" varchar(50),
	"price_per_pound" numeric,
	"specific_gravity" numeric,
	"concentration" numeric
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lot_number" (
	"id" serial PRIMARY KEY NOT NULL,
	"product" varchar(255) NOT NULL,
	"january" varchar(255) NOT NULL,
	"february" varchar(255) NOT NULL,
	"march" varchar(255) NOT NULL,
	"april" varchar(255) NOT NULL,
	"may" varchar(255) NOT NULL,
	"june" varchar(255) NOT NULL,
	"july" varchar(255) NOT NULL,
	"august" varchar(255) NOT NULL,
	"september" varchar(255) NOT NULL,
	"october" varchar(255) NOT NULL,
	"november" varchar(255) NOT NULL,
	"december" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_pricing" (
	"product_id" varchar(255) PRIMARY KEY NOT NULL,
	"title" varchar(255),
	"pricing_tier" varchar(10),
	"tier_margin_multiplier" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "variants" (
	"id" varchar PRIMARY KEY NOT NULL,
	"product_id" varchar NOT NULL,
	"title" text NOT NULL,
	"price" varchar,
	"sku" varchar,
	"option1" text,
	"option2" text,
	"option3" text,
	"calculated_price" numeric,
	"product_title" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "option2_lookup" (
	"option2_value" varchar(255) PRIMARY KEY NOT NULL,
	"volume" numeric,
	"is_liquid" boolean,
	"labor_price" numeric(10, 2),
	"container_price" numeric(10, 2),
	"box_price" numeric(10, 2),
	"weight" numeric(10, 2),
	"base_margin" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" varchar PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"price_per_pound" numeric,
	"specific_gravity" numeric
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_descriptions" (
	"product_id" varchar(255) PRIMARY KEY NOT NULL,
	"generated_description" text,
	"seo_title" text,
	"seo_description" text,
	"last_updated" timestamp DEFAULT CURRENT_TIMESTAMP,
	"generated_description_html" text,
	"form" varchar(255),
	"grade" varchar(255),
	"percentage" text,
	"cas_number" varchar(100),
	"formula" varchar(255),
	"molecular_weight" text,
	"boiling_point" text,
	"melting_point" text,
	"flash_point" text,
	"appearance" text,
	"solubility" text,
	"industry" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oauth_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shipments" (
	"shipment_id" integer PRIMARY KEY NOT NULL,
	"order_id" integer,
	"order_key" varchar(255),
	"user_id" varchar(255),
	"order_number" varchar(255),
	"create_date" timestamp with time zone,
	"ship_date" date,
	"shipment_cost" numeric(10, 2),
	"insurance_cost" numeric(10, 2),
	"tracking_number" varchar(255),
	"is_return_label" boolean,
	"batch_number" varchar(255),
	"carrier_code" varchar(50),
	"service_code" varchar(50),
	"package_code" varchar(50),
	"confirmation" varchar(50),
	"warehouse_id" integer,
	"voided" boolean,
	"void_date" timestamp with time zone,
	"marketplace_notified" boolean,
	"notify_error_message" text,
	"dimensions" jsonb,
	"advanced_options" jsonb,
	"label_data" text,
	"form_data" jsonb,
	"ship_to" jsonb,
	"weight" jsonb,
	"insurance_options" jsonb,
	"shipment_items" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "warehouse_outgoing_checklist" (
	"id" serial PRIMARY KEY NOT NULL,
	"clientName" varchar(255) NOT NULL,
	"datePerformed" date NOT NULL,
	"invoiceNumber" varchar(255) NOT NULL,
	"orderType" varchar(255) NOT NULL,
	"inspector" varchar(255) NOT NULL,
	"lotNumbers" varchar(255) NOT NULL,
	"preparedBy" varchar(255) NOT NULL,
	"packingSlip" text NOT NULL,
	"cofAs" text NOT NULL,
	"inspectProducts" text NOT NULL,
	"billOfLading" text NOT NULL,
	"mistakes" varchar(255) NOT NULL,
	"actionTaken" text,
	"comments" text,
	"attachment_name" varchar(255),
	"attachmentUrl" varchar(1000)
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_pricing" ADD CONSTRAINT "product_pricing_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "variants" ADD CONSTRAINT "variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_descriptions" ADD CONSTRAINT "product_descriptions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "lot_number_product_key" ON "lot_number" USING btree ("product");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_shipments_carrier_code" ON "shipments" USING btree ("carrier_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_shipments_carrier_service" ON "shipments" USING btree ("carrier_code","service_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_shipments_create_date" ON "shipments" USING btree ("create_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_shipments_date_carrier" ON "shipments" USING btree ("ship_date","carrier_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_shipments_insurance_options" ON "shipments" USING gin ("insurance_options");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_shipments_marketplace_notified" ON "shipments" USING btree ("marketplace_notified");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_shipments_order_id" ON "shipments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_shipments_package_code" ON "shipments" USING btree ("package_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_shipments_service_code" ON "shipments" USING btree ("service_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_shipments_ship_date" ON "shipments" USING btree ("ship_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_shipments_ship_to" ON "shipments" USING gin ("ship_to");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_shipments_shipment_items" ON "shipments" USING gin ("shipment_items");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_shipments_user_id" ON "shipments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_shipments_voided" ON "shipments" USING btree ("voided");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_shipments_warehouse_id" ON "shipments" USING btree ("warehouse_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_shipments_weight" ON "shipments" USING gin ("weight");
*/