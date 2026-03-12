import { TASK_STATUS } from '../constants/task-status.js';

export async function markTask(taskDao, args) {
  const commandIndex = args.findIndex(arg => arg.startsWith('mark'));
  if (commandIndex === -1) return;

  const command = args[commandIndex];
  const status = command.substring(5);
  if (status && !TASK_STATUS.has(status))
    throw new TypeError(
      `Invalid status: ${status}. Valid statuses are: ${[...TASK_STATUS].join(', ')}`
    );
  
  const taskId = args[commandIndex + 1];
  if (!taskId) throw new TypeError('Task id is required');

  return taskDao.update(taskId, { status });
}