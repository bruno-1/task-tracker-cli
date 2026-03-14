export async function updateTask(taskDao, args) {
  const commandIndex = args.indexOf('update');
  if (commandIndex === -1) return;

  const indexTaskId = commandIndex + 1;
  const taskId = args[indexTaskId];
  if (!taskId) throw new TypeError('Task id is required');

  const description = args[indexTaskId + 1];
  if (!description?.trim()) throw new TypeError('Task description is required');

  return taskDao.update(taskId, { description });
}