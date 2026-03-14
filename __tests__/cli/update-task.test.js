import test from 'node:test';
import assert from 'node:assert';
import { setTimeout } from 'node:timers/promises';

import { createTestDao, destroyTestDao, seedTasks } from '../helpers/create-test-dao.js';
import { updateTask } from '../../src/cli/update-task.js';


test('Update task', (t) => {
  let dao;
  let file;
  let task1;
  let task2;
  let task3;

  t.beforeEach(async () => {
    ({ dao, file } = await createTestDao('test-update-task.json'));
    ({ task1, task2, task3 } = await seedTasks(dao));
  });

  t.afterEach(async () => {
    await destroyTestDao(file);
  });

  t.test('should do nothing when update command is not present', async () => {
    await updateTask(dao, []);

    const tasks = dao.findAll();

    assert.ok(tasks.some(t => t.id === task1.id));
    assert.ok(tasks.some(t => t.id === task2.id));
    assert.ok(tasks.some(t => t.id === task3.id));
  });

  t.test(
    'should throw error when id is missing',
    async () => {
      await assert.rejects(
        updateTask(dao, ['update']),
        {
          name: 'TypeError',
          message: 'Task id is required',
        }
      )
    }
  );

  t.test('should throw error when description is missing', async () => {
    await assert.rejects(
      updateTask(dao, ['update', task1.id]),
      {
        name: 'TypeError',
        message: 'Task description is required'
      }
    );
  });

  t.test('should update a task', async () => {
    await setTimeout(1, null);
    task3 = await updateTask(dao, ['update', task3.id, 'Buy groceries and cook dinner']);

    const tasks = dao.findAll();

    assert.equal(task3.description, 'Buy groceries and cook dinner');
    assert.ok(task3.updatedAt.getTime() > task3.createdAt.getTime());

    const updated = tasks.find(t => t.id === task3.id);

    assert.ok(updated);
    assert.ok(tasks.some(t => t.id === task1.id));
    assert.ok(tasks.some(t => t.id === task2.id));

    assert.strictEqual(task3.id, updated.id);
    assert.equal(task3.description, updated.description);
    assert.equal(task3.status, updated.status);
    assert.equal(task3.updatedAt.getTime(), updated.updatedAt.getTime());
    assert.equal(task3.createdAt.getTime(), updated.createdAt.getTime());
  });
});