"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const prompts_1 = __importDefault(require("prompts"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const fsep = fs_extra_1.default.promises;
const pwRegExp = /^(?=.*[a-zA-Z])(?=.*\s.*\s.*\s)(?=.*[4-9])(?!.*[$^&*()[\]]).{10,}$/gm;
const passwordExists = fs_extra_1.default.existsSync("password");
if (passwordExists) {
    console.log("Password file found. Please enter the password.");
}
else
    console.log("No password file found. Please create a new password.");
async function passwordPrompt() {
    if (!passwordExists)
        console.log(`
Password Requirements:

At least 10 characters.
At least 3 whitespace characters.
At least one digit between 4 and 9.
The following symbols are not allowed: $, ^, &, *, (, ), [, ]
`);
    const response = await prompts_1.default({
        type: "password",
        name: "value",
        message: "Enter password",
    });
    if (!passwordExists) {
        if (response.value.match(pwRegExp)) {
            console.log("Saving password...");
            passwordSave(response.value);
        }
        else {
            console.log("== Password does not satisfy requirements. ==");
            passwordPrompt();
        }
    }
    else {
        if (await passwordCheck(response.value)) {
            console.log("Password matches!");
        }
        else {
            console.log("Incorrect password. Try again.");
            passwordPrompt();
        }
    }
}
async function passwordSave(password) {
    const hash = await bcrypt_1.default.hash(password, 10);
    fsep.writeFile("password", hash);
    console.log("Password saved.");
}
async function passwordCheck(password) {
    const data = await fsep.readFile("password", "utf8");
    return await bcrypt_1.default.compare(password, data);
}
passwordPrompt();
//# sourceMappingURL=index.js.map