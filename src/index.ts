import bcrypt, { hash } from "bcrypt"
import prompts from "prompts"
import fse from "fs-extra"
const fsep = fse.promises

const pwRegExp = /^(?=.*[a-zA-Z])(?=.*\s.*\s.*\s)(?=.*[4-9])(?!.*[$^&*()[\]]).{10,}$/gm
const passwordExists = fse.existsSync("password")

if (passwordExists) {
  console.log("Password file found. Please enter the password.")
} else console.log("No password file found. Please create a new password.")

async function passwordPrompt() {
  
  if (!passwordExists) console.log(`
Password Requirements:

At least 10 characters.
At least 3 whitespace characters.
At least one digit between 4 and 9.
The following symbols are not allowed: $, ^, &, *, (, ), [, ]
`)

  const response = await prompts({
    type: "password",
    name: "value",
    message: "Enter password",
  })

  if (!passwordExists) {

    if (response.value.match(pwRegExp)) {
      console.log("Saving password...")
      passwordSave(response.value)
    } else {
      console.log("== Password does not satisfy requirements. ==")
      passwordPrompt()
    }
  } else {
    
    if (await passwordCheck(response.value)) {
      console.log("Password matches!")
    } else {
      console.log("Incorrect password. Try again.")
      passwordPrompt()
    }
  }
}

async function passwordSave(password: string) {
  const hash = await bcrypt.hash(password, 10)

  fsep.writeFile("password", hash)

  console.log("Password saved.")
}

async function passwordCheck(password: string): Promise<boolean> {
  const data = await fsep.readFile("password", "utf8")

  return await bcrypt.compare(password, data)
}

passwordPrompt()