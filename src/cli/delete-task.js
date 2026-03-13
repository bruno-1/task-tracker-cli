export async function deleteTask(taskDao, args) {
  const commandIndex = args.indexOf('delete');
  if (commandIndex === -1) return;

  const taskId = args[commandIndex + 1];
  if (!taskId) throw new TypeError('Task id is required');

  return taskDao.delete(taskId);
}