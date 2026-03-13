import path from 'node:path';
import test from 'node:test';
import { writeFile, rm } from 'node:fs/promises';
import assert from 'node:assert';

import TaskDao from '../../src/dao/task-dao.js';
import { addTask } from '../../src/cli/add-task.js';


const mockFileJson = path.resolve('test-add-task.json');

test('Add task', (t) => {
  const dao = new TaskDao(mockFileJson);

  t.beforeEach(async () => {
    await writeFile(mockFileJson, JSON.stringify([]));
    await dao.init();
  });

  t.afterEach(async () => {
    await rm(mockFileJson);
  });

  t.test('should do nothing when add command is not present', async () => {
    await addTask(dao, []);

    const tasks = dao.findAll();

    assert.equal(tasks.length, 0);
  });

  t.test('should throw error when description is missing', async () => {
    await assert.rejects(
      addTask(dao, ['add']),
      {
        name: 'TypeError',
        message: 'Task description is required'
      }
    );
  });

  t.test('should create a new task', async () => {
    const task = await addTask(dao, ['add', 'Buy groceries']);

    assert.ok(task.id);
    assert.equal(task.description, 'Buy groceries');
    assert.equal(task.status, 'todo');
    assert.ok(task.createdAt instanceof Date);
    assert.ok(task.updatedAt instanceof Date);

    const tasks = dao.findAll();
    assert.equal(tasks.length, 1);
    assert.strictEqual(tasks[0], task);
  });
});