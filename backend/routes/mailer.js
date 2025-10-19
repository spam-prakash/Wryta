const nodemailer = require('nodemailer')
const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

const sendMail = async (to, subject, html) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      // Use Resend in production (Render)
      await resend.emails.send({
        from: 'Wryta <onboarding@resend.dev>', // Or your verified domain
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
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      })

      await transporter.sendMail({
        from: `"Wryta" <${process.env.EMAIL_USER}>`,
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

module.exports = sendMail
