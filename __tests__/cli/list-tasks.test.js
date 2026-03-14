import test from 'node:test';
import assert from 'node:assert';

import { createTestDao, destroyTestDao, seedTasks } from '../helpers/create-test-dao.js';
import { listTasks, taskToString } from '../../src/cli/list-tasks.js';
import { TASK_STATUS } from '../../src/constants/task-status.js';


test('List Tasks', (t) => {
  const logs = [];
  const original = console.log;
  let dao;
  let file;
  let task1;
  let task2;
  let task3;

  t.before(async () => {
    console.log = (...args) => logs.push(args.join(' '));
    ({ dao, file } = await createTestDao('test-list-tasks.json'));
    ({ task1, task2, task3 } = await seedTasks(dao));
  });

  t.afterEach(async () => {
    logs.length = 0;
  });

  t.after(async () => {
    console.log = original;
    await destroyTestDao(file);
  });

  t.test('should do nothing when list command is not present', async () => {
    listTasks(dao, []);
    assert.equal(logs.length, 0);
  });

  t.test(
    'should throw error when status is invalid',
    () => {
      assert.throws(
        () => listTasks(dao, ['list', 'invalid']),
        {
          name: 'TypeError',
          message: `Invalid status: invalid. Valid statuses are: ${[...TASK_STATUS].join(', ')}`,
        }
      );
    }
  )

  t.test('should list all tasks when no status is provided', async () => {
    listTasks(dao, ['list']);

    assert.equal(logs.length, 3);
    assert.equal(logs[0], taskToString(task1));
    assert.equal(logs[1], taskToString(task2));
    assert.equal(logs[2], taskToString(task3));
  });

  t.test('should list todo tasks', () => {
    listTasks(dao, ['list', 'todo']);

    assert.equal(logs.length, 1);
    assert.equal(logs[0], taskToString(task3));
  });

  t.test('should list in-progress tasks', () => {
    listTasks(dao, ['list', 'in-progress']);

    assert.equal(logs.length, 1);
    assert.equal(logs[0], taskToString(task2));
  });

  t.test('should list done tasks', () => {
    listTasks(dao, ['list', 'done']);

    assert.equal(logs.length, 1);
    assert.equal(logs[0], taskToString(task1));
  });
});