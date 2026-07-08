#!/usr/bin/env node
import { Command } from "commander";
const program = new Command();
program.name("envpull").description("Env variable manaager").version("1.0.0");
program
    .command("push")
    .description("Upload enviornment variables")
    .action(() => {
    console.log("push command recieved");
});
program.parse();
//# sourceMappingURL=index.js.map