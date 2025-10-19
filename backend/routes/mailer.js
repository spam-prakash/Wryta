const { google } = require('googleapis')
require('dotenv').config()

// OAuth2 client setup
const oAuth2Client = new google.auth.OAuth2(
  process.env.MAILING_CLIENT_ID,
  process.env.MAILING_CLIENT_SECRET,
  process.env.MAILING_REDIRECT_URI
)

// Set refresh token
oAuth2Client.setCredentials({ refresh_token: process.env.MAILING_REFRESH_TOKEN })

// Create Gmail API client
const gmail = google.gmail({ version: 'v1', auth: oAuth2Client })

const sendMail = async (to, subject, text, html) => {
  try {
    // Create email content in base64 format
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`
    const messageParts = [
      `From: Wryta <${process.env.EMAIL_USER}>`,
      `To: ${to}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      html
    ]
    const message = messageParts.join('\n')
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    // Send email using Gmail API
    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    })

    console.log('✅ Email sent:', result.data.id)
    return result.data
  } catch (err) {
    console.error('❌ Error sending email:', err.message)
    throw err // Propagate error for better error handling
  }
}

module.exports = sendMail
