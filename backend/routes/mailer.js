const nodemailer = require('nodemailer')

const sendMail = async (to, subject, text, html) => {
  try {
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

    console.log('✅ Email sent successfully via Gmail')
  } catch (err) {
    console.error('❌ Email send failed:', err.message)
  }
}

module.exports = sendMail
