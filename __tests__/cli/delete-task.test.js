import test from 'node:test';
import assert from 'node:assert';

import { createTestDao, destroyTestDao, seedTasks } from '../helpers/create-test-dao.js';
import { deleteTask } from '../../src/cli/delete-task.js';


test('Delete task', (t) => {
  let dao;
  let file;
  let task1;
  let task2;
  let task3;

  t.beforeEach(async () => {
    ({ dao, file } = await createTestDao('test-delete-task.json'));
    ({ task1, task2, task3 } = await seedTasks(dao));
  });

  t.afterEach(async () => {
    await destroyTestDao(file);
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