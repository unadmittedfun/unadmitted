import * as React from "npm:react@18.3.1";
import {
  Body, Container, Head, Heading, Html, Link, Preview, Text,
} from "npm:@react-email/components@0.0.22";
import type { TemplateEntry } from "./registry.ts";

interface WelcomeEmailProps {
  userEmail: string;
  siteUrl: string;
}

const WelcomeEmail = ({ userEmail, siteUrl }: WelcomeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>welcome to unadmitted — your account is ready!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>welcome to unadmitted!</Heading>
        <Text style={text}>
          your account ({userEmail}) is ready. start posting, exploring, and
          connecting with your campus community.
        </Text>
        <Text style={text}>
          <Link href={siteUrl} style={link}>go to unadmitted →</Link>
        </Text>
        <Text style={footer}>— the unadmitted team</Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: WelcomeEmail,
  subject: "welcome to unadmitted — your account is ready!",
  displayName: "welcome email",
  previewData: {
    userEmail: "student@acg.edu",
    siteUrl: "https://unadmitted.fun",
  },
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container = { padding: "20px 25px" };
const h1 = { fontSize: "24px", fontWeight: "bold" as const, color: "#000000", margin: "0 0 20px" };
const text = { fontSize: "14px", color: "#55575d", lineHeight: "1.6", margin: "0 0 16px" };
const link = { color: "#007bff", textDecoration: "underline" };
const footer = { fontSize: "12px", color: "#999999", margin: "30px 0 0" };
