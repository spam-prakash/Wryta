// simple-test.js
require('dotenv').config()
const sendMail = require('../routes/mailer') // adjust path

async function test () {
  console.log('Testing email...')

  const result = await sendMail(
    'prakashkumar01031975@gmail.com', // send to yourself
    'Simple Test',
    'Hello from Wryta!',
    '<h1>Hello!</h1><p>Test email working.</p>'
  )

  console.log('Result:', result)
}

test()
