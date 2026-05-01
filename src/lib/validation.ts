import { z } from "zod";

export const acgEmail = z
  .string()
  .trim()
  .toLowerCase()
  .email("Invalid email");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long");

export const signUpSchema = z.object({
  email: acgEmail,
  password: passwordSchema,
});

export const emailDomainSchema = (domain: string) =>
  z.string().trim().toLowerCase().email("Invalid email").refine(
    (e) => e.endsWith(`@${domain}`),
    { message: `Only @${domain} emails are allowed` }
  );

export const postSchema = z.object({
  body: z.string().trim().min(1, "Cannot be empty").max(2000, "Too long (max 2000)"),
});

export const commentSchema = z.object({
  body: z.string().trim().min(1).max(1000),
});

// 1st Amendment: no name drops with surnames.
// Heuristic: two consecutive Capitalized words (>=2 chars each) -> likely first + surname.
const surnameRegex = /\b([A-Z][a-z]{1,})\s+([A-Z][a-z]{2,})\b/;
export const containsSurname = (text: string) => surnameRegex.test(text);

// 2nd Amendment: cannot advertise real-store/event content without bot.
const adKeywords = [
  "promo", "discount", "% off", "sale at", "happy hour", "event at", "open at",
  "come to", "visit us", "address:", "located at", "follow us @", "dm us",
  "buy now", "limited offer", "for sale", "selling for", "free entry at",
];
export const looksLikeAd = (text: string) => {
  const t = text.toLowerCase();
  return adKeywords.some((k) => t.includes(k));
};
