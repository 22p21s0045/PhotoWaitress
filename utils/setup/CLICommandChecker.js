import { exec } from "child_process";
import chalk from "chalk";

export class CLICommandChecker {

  /**
 * The function is a JavaScript constructor that takes an array of strings as a command.
 * @param {string[]} command - An array of strings representing commands or instructions 
 * that can be accessed and used within the object or class where the constructor is defined.
 */
    constructor(command){
        this.command = command
    }

    /**
     * Checks if a given command is available on the system.
     * @param {string} command - The CLI command to check (e.g., "rawtherapee-cli -v").
     * @returns {Promise<boolean>} - Resolves to true if the command is available, false otherwise.
     */
    async isCommandAvailable(command) {
        return new Promise((resolve) => {
            exec(command, (error) => {
                if (error) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    }

    /**
   * Checks if all commands in the command array are available.
   * @returns {Promise<void>} - Resolves when all commands have been checked.
   */
  async checkAllCommands() {
    const commandChecks = this.command.map(async (cmd) => {
      const isAvailable = await this.isCommandAvailable(cmd);
      return { command: cmd, isAvailable };
    });

    const results = await Promise.all(commandChecks);

    results.forEach((result) => {
      if (result.isAvailable) {
        console.log(chalk.green(`✔ Command "${result.command}" is available.`));
      } else {
        console.log(chalk.red(`✘ Command "${result.command}" is not available.`));
      }
    });

}

}
