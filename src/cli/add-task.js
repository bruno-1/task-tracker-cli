export async function addTask(taskDao, args) {
  const commandIndex = args.indexOf('add');
  if (commandIndex === -1) return;

  const description = args[commandIndex + 1];
  if (!description?.trim()) throw new TypeError('Task description is required');

  return taskDao.insert({ description });
}