import nodemailer from 'nodemailer'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendMail = async (to, subject, html) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      // Use Resend on Render (production)
      await resend.emails.send({
        from: 'Wryta <noreply@wryta.tech>', // your verified sender domain
        to,
        subject,
        html
      })
      console.log('✅ Email sent via Resend')
    } else {
      // Use Gmail locally (development)
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS
        }
      })

      await transporter.sendMail({
        from: `"Wryta" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html
      })

      console.log('✅ Email sent via Gmail (local)')
    }
  } catch (err) {
    console.error('❌ Email send failed:', err.message)
  }
}
