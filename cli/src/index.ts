#!/usr/bin/env node

import { Command } from "commander";
import { pushCommand } from "./commands/push.js";
import { statusCommand } from "./commands/status.js";
import { loginCommand } from "./commands/login.js";

const program = new Command();

program.name("envpull").description("Env variable manaager").version("1.0.0");

program
  .command("push")
  .description("Upload enviornment variables")
  .action(pushCommand);

program
  .command("status")
  .description("See status of logged in user")
  .action(statusCommand);

program.command("login").description("Login to envpull").action(loginCommand);

program.parse();
