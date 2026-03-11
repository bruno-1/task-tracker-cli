import test from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { writeFile, rm } from 'node:fs/promises';

import TaskDao from '../../src/dao/task-dao.js';
import { listTasks, taskToString } from '../../src/cli/list-tasks.js';
import { TASK_STATUS } from '../../src/constants/task-status.js';


const mockFileJson = path.resolve('test-list-tasks.json');

test('List Tasks', (t) => {
  const logs = [];
  const original = console.log;
  const dao = new TaskDao(mockFileJson);
  let task1;
  let task2;
  let task3;

  t.before(async () => {
    console.log = (...args) => logs.push(args.join(' '));
    await writeFile(mockFileJson, JSON.stringify([]));
    await dao.init();

    task1 = await dao.insert({ description: 'Task 1' });
    task2 = await dao.insert({ description: 'Task 2' });
    task3 = await dao.insert({ description: 'Task 3' });

    task1 = await dao.update(task1.id, { status: 'done' });
    task2 = await dao.update(task2.id, { status: 'in-progress' });
  });

  t.afterEach(async () => {
    logs.length = 0;
  });

  t.after(async () => {
    console.log = original;
    await rm(mockFileJson);
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