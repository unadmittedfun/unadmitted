import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'unadmitted'

interface AccountVerifiedProps {
  handle?: string
  appUrl?: string
}

const AccountVerifiedEmail = ({
  handle,
  appUrl = 'https://unadmitted.fun',
}: AccountVerifiedProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>your {SITE_NAME} account has been verified</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {handle ? `welcome, ${handle}` : 'welcome'}
        </Heading>
        <Text style={text}>
          your account has been verified. you can now post, vote, and dm
          anonymously inside your university community on {SITE_NAME}.
        </Text>
        <Button href={appUrl} style={button}>
          open {SITE_NAME}
        </Button>
        <Text style={footer}>
          stay anonymous. respect the amendments. — the {SITE_NAME} team
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AccountVerifiedEmail,
  subject: 'your account has been verified',
  displayName: 'account verified',
  previewData: { handle: 'anon_a1b2c3d4', appUrl: 'https://unadmitted.fun' },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '"Space Grotesk", Arial, sans-serif',
}
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = {
  fontSize: '26px',
  fontWeight: 'bold',
  color: 'hsl(220, 25%, 10%)',
  margin: '0 0 16px',
}
const text = {
  fontSize: '15px',
  color: 'hsl(220, 10%, 42%)',
  lineHeight: '1.6',
  margin: '0 0 24px',
}
const button = {
  backgroundColor: 'hsl(252, 88%, 60%)',
  color: '#ffffff',
  padding: '12px 22px',
  borderRadius: '16px',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: 600,
  display: 'inline-block',
}
const footer = {
  fontSize: '12px',
  color: 'hsl(220, 10%, 55%)',
  margin: '32px 0 0',
}
