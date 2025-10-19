// getTokens.js
const { google } = require('googleapis')
require('dotenv').config()

// OAuth2 client setup
const oAuth2Client = new google.auth.OAuth2(
  process.env.MAILING_CLIENT_ID,
  process.env.MAILING_CLIENT_SECRET,
  process.env.MAILING_REDIRECT_URI
)

// Scopes needed to send Gmail
const scopes = ['https://www.googleapis.com/auth/gmail.send']

// Generate the consent URL
const url = oAuth2Client.generateAuthUrl({
  access_type: 'offline', // important to get refresh token
  scope: scopes
})

console.log('Visit this URL in your browser to authorize the app:')
console.log(url)
console.log('\nAfter authorizing, you will get a code in the redirect URI.\nUse it to get tokens using getTokens(code).\n')

async function getTokens (code) {
  try {
    const { tokens } = await oAuth2Client.getToken(code)
    console.log('✅ Tokens received:')
    console.log('Access Token:', tokens.access_token)
    console.log('Refresh Token (save this!):', tokens.refresh_token)
  } catch (err) {
    console.error('❌ Error getting tokens:', err.message)
  }
}

// Export the function so you can call it with the code from the URL
async function getTokens(code) {
  try {
    const { tokens } = await oAuth2Client.getToken(code)
    console.log('✅ Access Token:', tokens.access_token)
    console.log('✅ Refresh Token:', tokens.refresh_token)
  } catch (err) {
    console.error('❌ Error getting tokens:', err.message)
  }
}

// Replace this with your code from the URL
const code = '4/0AVGzR1Bjd7j2lM_zMcCssCjYqeb2e_1Ska_gYk0fUF60NSczdAL60TzzJk6e06XL1-59iA&scope=https://www.googleapis.com/auth/gmail.send'
getTokens(code)
