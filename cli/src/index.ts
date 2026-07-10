#!/usr/bin/env node

import { Command } from "commander";
import { pushCommand } from "./commands/push.js";
import { statusCommand } from "./commands/status.js";
import { loginCommand } from "./commands/login.js";
import { whoAmICommand } from "./commands/whoami.js";
import { logoutCommand } from "./commands/logout.js";
import { gitLogin } from "./commands/gitlogin.js";

const program = new Command();

program
  .name("envpull")
  .description("Env variable manaager")
  .version("(dev v0.1)");

program
  .command("push")
  .description("Upload enviornment variables")
  .action(pushCommand);

program
  .command("status")
  .description("See status of logged in user")
  .action(statusCommand);

program.command("login").description("Login to envpull").action(loginCommand);

program
  .command("whoami")
  .description("Details of logged in user")
  .action(whoAmICommand);

program
  .command("logout")
  .description("Logout the current user")
  .action(logoutCommand);

program.command("gitlogin").description("Login to GitHub").action(gitLogin);

program.parse();
