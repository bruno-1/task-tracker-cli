import { TASK_STATUS } from '../constants/task-status.js';


function formatDateTime(date) {
  return new Intl.DateTimeFormat(
    Intl.DateTimeFormat().resolvedOptions().locale,
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }
  ).format(date);
}

export function taskToString(task) {
  const { id, description, status, createdAt, updatedAt } = task;

  const createdAtFormatted = formatDateTime(createdAt);
  const updatedAtFormatted = formatDateTime(updatedAt);

  return `Task: Id: ${id}, Description: ${description}, Status: ${status}, Created at: ${createdAtFormatted}, Updated At: ${updatedAtFormatted}`;
}

function printTasks(tasks = []) {
  tasks.forEach(task => console.log(taskToString(task)));
}

export function listTasks(taskDao, args) {
  const commandIndex = args.indexOf('list');
  if (commandIndex === -1) return;

  const status = args[commandIndex + 1];

  if (status && !TASK_STATUS.has(status))
    throw new TypeError(
      `Invalid status: ${status}. Valid statuses are: ${[...TASK_STATUS].join(', ')}`
    );
  
  const statusHandlers = {
    'todo': () => taskDao.findTodo(),
    'in-progress': () => taskDao.findInProgress(),
    'done': () => taskDao.findDone(),
  };

  const tasks = statusHandlers[status]?.() ?? taskDao.findAll();

  printTasks(tasks);
}