#!/usr/bin/env node
import { Command } from "commander";
import { pushCommand } from "./commands/push.js";
import { pullCommand } from "./commands/pull.js";
import { initCommand } from "./commands/init.js";
import { loginCommand } from "./commands/login.js";
import { whoAmICommand } from "./commands/whoami.js";
import { logoutCommand } from "./commands/logout.js";
import { recoverCommand } from "./commands/recover.js";
import { configCommand } from "./commands/config.js";
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
    .command("pull")
    .description("Download environment variables")
    .action(pullCommand);
program
    .command("init")
    .description("Create or connect a project in this directory")
    .action(initCommand);
program
    .command("recover")
    .description("Reset password with recovery key (no login required)")
    .action(recoverCommand);
program
    .command("config")
    .description("Show or set CLI config")
    .argument("[action]", "show | set-api | set-biometrics")
    .argument("[value]", "value for set-api / set-biometrics")
    .action((action, value) => {
    void configCommand(action, value);
});
program.command("login").description("Login to envpull").action(loginCommand);
program
    .command("whoami")
    .description("Details of logged in user")
    .action(whoAmICommand);
program
    .command("logout")
    .description("Logout the current user")
    .action(logoutCommand);
program.parse();
//# sourceMappingURL=index.js.map