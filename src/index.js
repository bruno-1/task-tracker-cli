import { argv } from 'node:process';
import path from 'node:path';

import TaskDao from './dao/task-dao.js';
import { addTask, deleteTask, listTasks, markTask, updateTask } from './cli/index.js';


const cliArgs = argv.slice(2);

async function main() {
  try {
    const taskDao = new TaskDao(path.resolve('tasks.json'));
    await taskDao.init();

    const commands = [
      addTask,
      updateTask,
      deleteTask,
      markTask,
      listTasks,
    ]

    for (const command of commands) {
      const result = await command(taskDao, cliArgs);

      if (result != undefined) break;
    }
  } catch (error) {
    console.error(error.message);
  }
}

main();