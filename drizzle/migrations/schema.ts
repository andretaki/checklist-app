import { pgTable, varchar, numeric, uniqueIndex, serial, foreignKey, text, boolean, timestamp, index, integer, date, jsonb } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"




export const chemprice = pgTable("chemprice", {
	chemicalName: varchar("chemical_name", { length: 255 }),
	unit: varchar("unit", { length: 50 }),
	pricePerPound: numeric("price_per_pound"),
	specificGravity: numeric("specific_gravity"),
	concentration: numeric("concentration"),
});

export const lotNumber = pgTable("lot_number", {
	id: serial("id").primaryKey().notNull(),
	product: varchar("product", { length: 255 }).notNull(),
	january: varchar("january", { length: 255 }).notNull(),
	february: varchar("february", { length: 255 }).notNull(),
	march: varchar("march", { length: 255 }).notNull(),
	april: varchar("april", { length: 255 }).notNull(),
	may: varchar("may", { length: 255 }).notNull(),
	june: varchar("june", { length: 255 }).notNull(),
	july: varchar("july", { length: 255 }).notNull(),
	august: varchar("august", { length: 255 }).notNull(),
	september: varchar("september", { length: 255 }).notNull(),
	october: varchar("october", { length: 255 }).notNull(),
	november: varchar("november", { length: 255 }).notNull(),
	december: varchar("december", { length: 255 }).notNull(),
},
(table) => {
	return {
		productKey: uniqueIndex("lot_number_product_key").using("btree", table.product.asc().nullsLast()),
	}
});

export const productPricing = pgTable("product_pricing", {
	productId: varchar("product_id", { length: 255 }).primaryKey().notNull(),
	title: varchar("title", { length: 255 }),
	pricingTier: varchar("pricing_tier", { length: 10 }),
	tierMarginMultiplier: numeric("tier_margin_multiplier", { precision: 10, scale:  2 }),
},
(table) => {
	return {
		productPricingProductIdFkey: foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_pricing_product_id_fkey"
		}),
	}
});

export const variants = pgTable("variants", {
	id: varchar("id").primaryKey().notNull(),
	productId: varchar("product_id").notNull(),
	title: text("title").notNull(),
	price: varchar("price"),
	sku: varchar("sku"),
	option1: text("option1"),
	option2: text("option2"),
	option3: text("option3"),
	calculatedPrice: numeric("calculated_price"),
	productTitle: text("product_title"),
},
(table) => {
	return {
		variantsProductIdProductsIdFk: foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "variants_product_id_products_id_fk"
		}),
	}
});

export const option2Lookup = pgTable("option2_lookup", {
	option2Value: varchar("option2_value", { length: 255 }).primaryKey().notNull(),
	volume: numeric("volume"),
	isLiquid: boolean("is_liquid"),
	laborPrice: numeric("labor_price", { precision: 10, scale:  2 }),
	containerPrice: numeric("container_price", { precision: 10, scale:  2 }),
	boxPrice: numeric("box_price", { precision: 10, scale:  2 }),
	weight: numeric("weight", { precision: 10, scale:  2 }),
	baseMargin: numeric("base_margin", { precision: 10, scale:  2 }),
});

export const products = pgTable("products", {
	id: varchar("id").primaryKey().notNull(),
	title: text("title").notNull(),
	pricePerPound: numeric("price_per_pound"),
	specificGravity: numeric("specific_gravity"),
});

export const productDescriptions = pgTable("product_descriptions", {
	productId: varchar("product_id", { length: 255 }).primaryKey().notNull(),
	generatedDescription: text("generated_description"),
	seoTitle: text("seo_title"),
	seoDescription: text("seo_description"),
	lastUpdated: timestamp("last_updated", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	generatedDescriptionHtml: text("generated_description_html"),
	form: varchar("form", { length: 255 }),
	grade: varchar("grade", { length: 255 }),
	percentage: text("percentage"),
	casNumber: varchar("cas_number", { length: 100 }),
	formula: varchar("formula", { length: 255 }),
	molecularWeight: text("molecular_weight"),
	boilingPoint: text("boiling_point"),
	meltingPoint: text("melting_point"),
	flashPoint: text("flash_point"),
	appearance: text("appearance"),
	solubility: text("solubility"),
	industry: varchar("industry", { length: 255 }),
},
(table) => {
	return {
		productDescriptionsProductIdFkey: foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_descriptions_product_id_fkey"
		}),
	}
});

export const oauthTokens = pgTable("oauth_tokens", {
	id: serial("id").primaryKey().notNull(),
	accessToken: text("access_token").notNull(),
	refreshToken: text("refresh_token").notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const shipments = pgTable("shipments", {
	shipmentId: integer("shipment_id").primaryKey().notNull(),
	orderId: integer("order_id"),
	orderKey: varchar("order_key", { length: 255 }),
	userId: varchar("user_id", { length: 255 }),
	orderNumber: varchar("order_number", { length: 255 }),
	createDate: timestamp("create_date", { withTimezone: true, mode: 'string' }),
	shipDate: date("ship_date"),
	shipmentCost: numeric("shipment_cost", { precision: 10, scale:  2 }),
	insuranceCost: numeric("insurance_cost", { precision: 10, scale:  2 }),
	trackingNumber: varchar("tracking_number", { length: 255 }),
	isReturnLabel: boolean("is_return_label"),
	batchNumber: varchar("batch_number", { length: 255 }),
	carrierCode: varchar("carrier_code", { length: 50 }),
	serviceCode: varchar("service_code", { length: 50 }),
	packageCode: varchar("package_code", { length: 50 }),
	confirmation: varchar("confirmation", { length: 50 }),
	warehouseId: integer("warehouse_id"),
	voided: boolean("voided"),
	voidDate: timestamp("void_date", { withTimezone: true, mode: 'string' }),
	marketplaceNotified: boolean("marketplace_notified"),
	notifyErrorMessage: text("notify_error_message"),
	dimensions: jsonb("dimensions"),
	advancedOptions: jsonb("advanced_options"),
	labelData: text("label_data"),
	formData: jsonb("form_data"),
	shipTo: jsonb("ship_to"),
	weight: jsonb("weight"),
	insuranceOptions: jsonb("insurance_options"),
	shipmentItems: jsonb("shipment_items"),
},
(table) => {
	return {
		idxShipmentsCarrierCode: index("idx_shipments_carrier_code").using("btree", table.carrierCode.asc().nullsLast()),
		idxShipmentsCarrierService: index("idx_shipments_carrier_service").using("btree", table.carrierCode.asc().nullsLast(), table.serviceCode.asc().nullsLast()),
		idxShipmentsCreateDate: index("idx_shipments_create_date").using("btree", table.createDate.asc().nullsLast()),
		idxShipmentsDateCarrier: index("idx_shipments_date_carrier").using("btree", table.shipDate.asc().nullsLast(), table.carrierCode.asc().nullsLast()),
		idxShipmentsInsuranceOptions: index("idx_shipments_insurance_options").using("gin", table.insuranceOptions.asc().nullsLast()),
		idxShipmentsMarketplaceNotified: index("idx_shipments_marketplace_notified").using("btree", table.marketplaceNotified.asc().nullsLast()),
		idxShipmentsOrderId: index("idx_shipments_order_id").using("btree", table.orderId.asc().nullsLast()),
		idxShipmentsPackageCode: index("idx_shipments_package_code").using("btree", table.packageCode.asc().nullsLast()),
		idxShipmentsServiceCode: index("idx_shipments_service_code").using("btree", table.serviceCode.asc().nullsLast()),
		idxShipmentsShipDate: index("idx_shipments_ship_date").using("btree", table.shipDate.asc().nullsLast()),
		idxShipmentsShipTo: index("idx_shipments_ship_to").using("gin", table.shipTo.asc().nullsLast()),
		idxShipmentsShipmentItems: index("idx_shipments_shipment_items").using("gin", table.shipmentItems.asc().nullsLast()),
		idxShipmentsUserId: index("idx_shipments_user_id").using("btree", table.userId.asc().nullsLast()),
		idxShipmentsVoided: index("idx_shipments_voided").using("btree", table.voided.asc().nullsLast()),
		idxShipmentsWarehouseId: index("idx_shipments_warehouse_id").using("btree", table.warehouseId.asc().nullsLast()),
		idxShipmentsWeight: index("idx_shipments_weight").using("gin", table.weight.asc().nullsLast()),
	}
});

export const warehouseOutgoingChecklist = pgTable("warehouse_outgoing_checklist", {
	id: serial("id").primaryKey().notNull(),
	clientName: varchar("clientName", { length: 255 }).notNull(),
	datePerformed: date("datePerformed").notNull(),
	invoiceNumber: varchar("invoiceNumber", { length: 255 }).notNull(),
	orderType: varchar("orderType", { length: 255 }).notNull(),
	inspector: varchar("inspector", { length: 255 }).notNull(),
	lotNumbers: varchar("lotNumbers", { length: 255 }).notNull(),
	preparedBy: varchar("preparedBy", { length: 255 }).notNull(),
	packingSlip: text("packingSlip").notNull(),
	cofAs: text("cofAs").notNull(),
	inspectProducts: text("inspectProducts").notNull(),
	billOfLading: text("billOfLading").notNull(),
	mistakes: varchar("mistakes", { length: 255 }).notNull(),
	actionTaken: text("actionTaken"),
	comments: text("comments"),
	attachmentName: varchar("attachment_name", { length: 255 }),
	attachmentUrl: varchar("attachmentUrl", { length: 1000 }),
});