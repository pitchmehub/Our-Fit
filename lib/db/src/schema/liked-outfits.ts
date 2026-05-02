import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const likedOutfits = pgTable("liked_outfits", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  outfitId: text("outfit_id").notNull(),
  title: text("title").notNull(),
  style: text("style").notNull(),
  items: text("items").notNull(),
  tags: text("tags").notNull(),
  image: text("image").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertLikedOutfitSchema = createInsertSchema(likedOutfits).omit({
  id: true,
  createdAt: true,
});

export type LikedOutfit = typeof likedOutfits.$inferSelect;
export type InsertLikedOutfit = z.infer<typeof insertLikedOutfitSchema>;
