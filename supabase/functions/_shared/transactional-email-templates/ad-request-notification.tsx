import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Unadmitted'

interface AdRequestNotificationProps {
  handle?: string
  packageLabel?: string
  priceEur?: number | string
  details?: string
  community?: string
  requestId?: string
}

const AdRequestNotificationEmail = ({
  handle = 'anon_unknown',
  packageLabel = 'Unknown package',
  priceEur = '—',
  details = '(no details provided)',
  community = '—',
  requestId = '—',
}: AdRequestNotificationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      New ad request from {handle} — {packageLabel} (€{priceEur})
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>📣 New ad request</Heading>
        <Text style={text}>
          A student just requested an ad promotion on {SITE_NAME}.
        </Text>

        <Section style={card}>
          <Text style={row}>
            <strong>Handle:</strong> {handle}
          </Text>
          <Text style={row}>
            <strong>Community:</strong> {community}
          </Text>
          <Text style={row}>
            <strong>Package:</strong> {packageLabel}
          </Text>
          <Text style={row}>
            <strong>Price:</strong> €{priceEur}
          </Text>
          <Hr style={hr} />
          <Text style={rowLabel}>Details from the bot conversation:</Text>
          <Text style={detailsText}>{details}</Text>
          <Hr style={hr} />
          <Text style={metaRow}>Request ID: {requestId}</Text>
        </Section>

        <Text style={footer}>
          You're receiving this because you're the admin of {SITE_NAME}.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AdRequestNotificationEmail,
  subject: (data: Record<string, any>) =>
    `📣 New ad request — ${data.packageLabel ?? 'package'} (€${data.priceEur ?? '?'})`,
  displayName: 'Ad request notification',
  previewData: {
    handle: 'anon_jane',
    packageLabel: 'Pin to top — 24h',
    priceEur: 25,
    details:
      'Wants to promote their hand-made jewelry shop. Target: ACG students. Image attached via DM.',
    community: 'ACG Unadmitted',
    requestId: 'preview-12345',
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Arial, sans-serif',
}
const container = {
  padding: '24px 28px',
  maxWidth: '560px',
  margin: '0 auto',
}
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold',
  color: '#0a0a0a',
  margin: '0 0 16px',
}
const text = {
  fontSize: '14px',
  color: '#444',
  lineHeight: '1.5',
  margin: '0 0 20px',
}
const card = {
  backgroundColor: '#f5f8ff',
  border: '1px solid #d6e1ff',
  borderRadius: '10px',
  padding: '16px 18px',
  margin: '0 0 20px',
}
const row = {
  fontSize: '14px',
  color: '#0a0a0a',
  margin: '0 0 6px',
  lineHeight: '1.4',
}
const rowLabel = {
  fontSize: '12px',
  color: '#666',
  margin: '0 0 6px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
}
const detailsText = {
  fontSize: '14px',
  color: '#0a0a0a',
  margin: '0 0 4px',
  lineHeight: '1.5',
  whiteSpace: 'pre-wrap' as const,
}
const metaRow = {
  fontSize: '11px',
  color: '#888',
  margin: '0',
  fontFamily: 'monospace',
}
const hr = {
  borderColor: '#d6e1ff',
  margin: '12px 0',
}
const footer = {
  fontSize: '11px',
  color: '#999',
  margin: '24px 0 0',
}
