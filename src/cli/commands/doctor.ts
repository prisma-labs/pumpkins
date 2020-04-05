import chalk from 'chalk'
import { Command } from '../../lib/cli'
import * as Layout from '../../lib/layout'
import { findOrScaffoldTsConfig } from '../../lib/tsc'

export class Doctor implements Command {
  async parse() {
    await tsconfig()
  }
}

/**
 * Check that a tsconfig file is present and scaffold one if it is not.
 */
async function tsconfig() {
  console.log(chalk.bold('-- tsconfig.json --'))
  const layout = await Layout.createLayout()
  const result = await findOrScaffoldTsConfig(layout, {
    exitAfterError: false,
  })
  if (result === 'success') {
    console.log(
      chalk`{green OK:} "tsconfig.json" is present and in the right directory`
    )
  }
}
