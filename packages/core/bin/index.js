#!/usr/bin/env node

const yargs = require("yargs/yargs");
// 参数解析
const { hideBin } = require("yargs/helpers");
const dedent = require("dedent");
const log = require("npmlog");
const pkg = require("../package.json");

const arg = hideBin(process.argv);
const cli = yargs(arg);

const argv = process.argv.slice(2);

const context = {
  kiwiVersion: pkg.version,
};

cli
  .usage("Usage: $0 <command> [options]")
  .demandCommand(
    1,
    "A command is required. Pass --help to see all available commands and options."
  )
  .strict()
  .fail((msg, err) => {
    // certain yargs validations throw strings :P
    const actual = err || new Error(msg);

    // ValidationErrors are already logged, as are package errors
    if (actual.name !== "ValidationError" && !actual.pkg) {
      // the recommendCommands() message is too terse
      if (/是指/.test(actual.message)) {
        log.error("kiwi-test", `Unknown command "${cli.parsed.argv._[0]}"`);
      }

      log.error("kiwi-test", actual.message);
    }

    // exit non-zero so the CLI can be usefully chained
    cli.exit(actual.exitCode > 0 ? actual.exitCode : 1, actual);
  })
  .recommendCommands()
  .alias("h", "help")
  .alias("v", "version")
  .wrap(cli.terminalWidth())
  .epilogue(
    dedent`
    When a command fails, all logs are written to lerna-debug.log in the current working directory.

    For more information, check out the docs at https://lerna.js.org/docs/introduction
  `
  )
  .options({
    debug: {
      type: "boolean",
      describe: "启动debug模式",
      alias: "d",
    },
  })
  .option("registry", {
    type: "string",
    describe: "Define global registry",
    alias: "r",
  })
  .group(["debug"], "Dev Options:")
  .group(["registry"], "Extra Options:")
  .command(
    "init [name]",
    "Do init a project",
    (yargs) => {
      yargs.positional("name", {
        describe: "Name of the project",
        type: "string",
        alias: "n",
      });
    },
    (argv) => {
      console.log(argv);
    }
  )
  .command({
    command: "list",
    aliases: ["ls", "la", "ll"],
    describe: "List local packages",
    builder: (yargs) => {},
    handler: (argv) => {
      console.log(argv);
    },
  })
  .parse(argv, context);