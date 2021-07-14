import bcrypt from 'bcrypt'
// eslint-disable-next-line unicorn/prefer-node-protocol
import fs, { promises as fsp } from 'fs'
import prompts from 'prompts'

const pwRequirements = `
Password Requirements:

At least 10 characters.
At least 3 whitespace characters.
At least one digit between 4 and 9.
The following symbols are not allowed: $, ^, &, *, (, ), [, ]
`

const pwRegExp = /^(?=.*[A-Za-z])(?=(?:.*\s){3})(?=.*[4-9])(?!.*[$&()*[\]^]).{10,}$/gm
const passwordExists = fs.existsSync('password')

if (fs.existsSync('password')) {
  console.log('Password file found. Please enter the password.')
} else {
  console.log('No password file found. Please create a new password.')
}

async function passwordPrompt() {
  if (passwordExists) {
    await prompts({
      type: 'password',
      name: 'value',
      message: 'Enter password',
      validate: async (value: string) => ((await passwordCheck(value)) ? true : 'Incorrect password. Try again.'),
    })

    console.log('Password matches!')
  } else {
    console.log(pwRequirements)

    const response = await prompts({
      type: 'password',
      name: 'value',
      message: 'Enter password',
      validate: (value: string) => (pwRegExp.test(value) ? true : 'Password does not satisfy requirements.'),
    })

    console.log('Saving password...')
    await passwordSave(response.value as string)
  }
}

async function passwordSave(password: string) {
  const hash = await bcrypt.hash(password, 10)

  await fsp.writeFile('password', hash)

  console.log('Password saved.')
}

async function passwordCheck(password: string): Promise<boolean> {
  const data = await fsp.readFile('password', 'utf8')
  return await bcrypt.compare(password, data)
}

void passwordPrompt()
