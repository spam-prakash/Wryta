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
    // ===== ADDED: Basic validation =====
    if (!to || typeof to !== 'string' || !to.includes('@')) {
      return {
        success: false,
        error: 'Invalid recipient email address'
      }
    }

    if (!subject || subject.trim() === '') {
      return {
        success: false,
        error: 'Email subject cannot be empty'
      }
    }

    // ===== ADDED: Ensure we have content =====
    const emailContent = html || text || 'No content provided'

    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`
    const messageParts = [
      `From: Wryta <${process.env.EMAIL_USER}>`,
      `To: ${to}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      emailContent
    ]

    const message = messageParts.join('\n')

    // ===== FIXED: More robust base64 encoding =====
    const encodedMessage = Buffer.from(message, 'utf-8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage }
    })

    console.log(`✅ Email sent to ${to}:`, result.data.id)
    return {
      success: true,
      id: result.data.id,
      message: 'Email sent successfully'
    }
  } catch (err) {
    console.error('❌ Error sending email to', to, ':', err?.message || err)

    // ===== ADDED: Better error categorization =====
    let errorMessage = err?.message || 'Unknown email sending error'
    let errorCode = err?.code

    // Check for common errors
    if (err.message?.includes('invalid_grant') || err.code === 401) {
      errorMessage = 'Authentication error - refresh token may have expired'
      errorCode = 'AUTH_ERROR'
      console.log('🔐 Please generate a new refresh token')
    } else if (err.message?.includes('quota')) {
      errorMessage = 'Gmail API quota exceeded'
      errorCode = 'QUOTA_EXCEEDED'
    } else if (err.message?.includes('rate limit')) {
      errorMessage = 'Rate limit exceeded, please try again later'
      errorCode = 'RATE_LIMIT'
    }

    // ❗ DO NOT throw error → it will crash the server
    return {
      success: false,
      error: errorMessage,
      code: errorCode,
      originalError: process.env.NODE_ENV === 'development' ? err.message : undefined
    }
  }
}

module.exports = sendMail
