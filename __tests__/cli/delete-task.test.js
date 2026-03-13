import path from 'node:path';
import test from 'node:test';
import { writeFile, rm } from 'node:fs/promises';
import assert from 'node:assert';

import TaskDao from '../../src/dao/task-dao.js';
import { deleteTask } from '../../src/cli/delete-task.js';


const mockFileJson = path.resolve('test-delete-task.json');

test('Delete task', (t) => {
  const dao = new TaskDao(mockFileJson);
  let task1;
  let task2;
  let task3;

  t.beforeEach(async () => {
    await writeFile(mockFileJson, JSON.stringify([]));
    await dao.init();
    task1 = await dao.insert({ description: 'Task 1' });
    task2 = await dao.insert({ description: 'Task 2' });
    task3 = await dao.insert({ description: 'Task 3' });

    task1 = await dao.update(task1.id, { status: 'done' });
    task2 = await dao.update(task2.id, { status: 'in-progress' });
  });

  t.afterEach(async () => {
    await rm(mockFileJson);
  });

  t.test('should do nothing when delete command is not present', async () => {
    await deleteTask(dao, []);

    const tasks = dao.findAll();

    assert.equal(tasks.length, 3);
    assert.ok(tasks.includes(task1));
    assert.ok(tasks.includes(task2));
    assert.ok(tasks.includes(task3));
  });

  t.test(
    'should throw error when id is missing',
    async () => {
      await assert.rejects(
        deleteTask(dao, ['delete']),
        {
          name: 'TypeError',
          message: 'Task id is required',
        }
      )
    }
  );

  t.test(
    'should throw an error when id does not exist',
    async () => {
      await assert.rejects(
        deleteTask(dao, ['delete', '999']),
        {
          message: 'Task with id 999 not found'
        }
      );
    }
  );

  t.test('should delete a task', async () => {
    await deleteTask(dao, ['delete', task3.id]);

    const tasks = dao.findAll();

    assert.equal(tasks.length, 2);
    assert.ok(!tasks.includes(task3));
    assert.ok(tasks.includes(task1));
    assert.ok(tasks.includes(task2));
  });
});