import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Photo processing types
export const photoProcessSchema = z.object({
  imageUrl: z.string().url(),
});

export const audioResponseSchema = z.object({
  audioUrl: z.string().url(),
});

export type PhotoProcessRequest = z.infer<typeof photoProcessSchema>;
export type AudioResponse = z.infer<typeof audioResponseSchema>;
