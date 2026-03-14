import path from 'node:path';
import { writeFile, rm } from 'node:fs/promises';

import TaskDao from '../../src/dao/task-dao.js';


export async function createTestDao(filename) {
  const file = path.resolve(filename);

  await writeFile(file, JSON.stringify([]));

  const dao = new TaskDao(file);
  await dao.init();

  return { dao, file };
}

export async function destroyTestDao(file) {
  await rm(file);
}

export async function seedTasks(dao) {
  let task1 = await dao.insert({ description: 'Task 1' });
  let task2 = await dao.insert({ description: 'Task 2' });
  let task3 = await dao.insert({ description: 'Task 3' });

  task1 = await dao.update(task1.id, { status: 'done' });
  task2 = await dao.update(task2.id, { status: 'in-progress' });

  return { task1, task2, task3 };
}