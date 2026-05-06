import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface NewSignupProps {
  newUserEmail?: string
}

const NewSignupNotificationEmail = ({ newUserEmail }: NewSignupProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>new unadmitted signup: {newUserEmail ?? 'unknown'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>new signup on unadmitted</Heading>
        <Text style={text}>
          a new user just signed up and is verifying their email:
        </Text>
        <Text style={emailBox}>{newUserEmail ?? 'unknown'}</Text>
        <Text style={footer}>— unadmitted system</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: NewSignupNotificationEmail,
  subject: (data: Record<string, any>) =>
    `new unadmitted signup: ${data.newUserEmail ?? 'unknown'}`,
  to: 'unadmittedfun@gmail.com',
  displayName: 'new signup notification',
  previewData: { newUserEmail: 'student@acg.edu' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '20px 25px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#000000', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.5', margin: '0 0 12px' }
const emailBox = { fontSize: '16px', fontWeight: 'bold' as const, color: '#000000', padding: '12px', backgroundColor: '#f4f4f5', borderRadius: '6px', margin: '0 0 25px' }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
