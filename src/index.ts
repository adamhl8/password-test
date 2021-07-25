import bcrypt from 'bcrypt'
import fs, { promises as fsp } from 'node:fs'
import prompts from 'prompts'

const pwRequirements = `
Password Requirements:

At least 8 characters.
At least 1 uppercase character.
At least 1 lowercase character.
At least one digit.
At least one special character.
`

const pwRegExp = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\d\sA-Za-z])(\S){8,}$/gm
const passwordExists = fs.existsSync('password')

if (passwordExists) {
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
