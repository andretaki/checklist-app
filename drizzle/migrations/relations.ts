import { relations } from "drizzle-orm/relations";
import { products, productPricing, variants, productDescriptions } from "./schema";

export const productPricingRelations = relations(productPricing, ({one}) => ({
	product: one(products, {
		fields: [productPricing.productId],
		references: [products.id]
	}),
}));

export const productsRelations = relations(products, ({many}) => ({
	productPricings: many(productPricing),
	variants: many(variants),
	productDescriptions: many(productDescriptions),
}));

export const variantsRelations = relations(variants, ({one}) => ({
	product: one(products, {
		fields: [variants.productId],
		references: [products.id]
	}),
}));

export const productDescriptionsRelations = relations(productDescriptions, ({one}) => ({
	product: one(products, {
		fields: [productDescriptions.productId],
		references: [products.id]
	}),
}));