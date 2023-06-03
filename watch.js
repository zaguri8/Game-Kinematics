

import chalk from 'chalk'
import fs from 'fs'
import { exec } from 'child_process'

const log = console.log

log(chalk.yellow("Watching main.ts"))
fs.watchFile("./main.ts", () => {
    log(chalk.green("[TS-Watch] main.ts changed, applying tsc"))
    exec("tsc --removeComments")
})