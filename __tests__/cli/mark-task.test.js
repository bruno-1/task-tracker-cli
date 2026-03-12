import path from 'node:path';
import test from 'node:test';
import { writeFile, rm } from 'node:fs/promises';
import assert from 'node:assert';
import { setTimeout } from 'node:timers/promises';

import TaskDao from '../../src/dao/task-dao.js';
import { markTask } from '../../src/cli/mark-task.js';
import { TASK_STATUS } from '../../src/constants/task-status.js';


const mockFileJson = path.resolve('test-mark-tasks.json');

test('Mark Task', (t) => {
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

  t.test('should do nothing when mark command is not present', async () => {
    const tasksBefore = dao.findAll();
    await markTask(dao, []);
    const tasksAfter = dao.findAll();

    assert.equal(tasksBefore.length, 3);
    assert.equal(tasksAfter.length, 3);

    assert.strictEqual(tasksAfter[0], tasksBefore[0]);
    assert.strictEqual(tasksAfter[1], tasksBefore[1]);
    assert.strictEqual(tasksAfter[2], tasksBefore[2]);
  });

  t.test(
    'should throw error when status is invalid',
    async () => {
      await assert.rejects(
        markTask(dao, ['mark-invalid', '1']),
        {
          name: 'TypeError',
          message: `Invalid status: invalid. Valid statuses are: ${[...TASK_STATUS].join(', ')}`,
        }
      );
    }
  );

  t.test(
    'should throw error when id is missing',
    async () => {
      await assert.rejects(
        markTask(dao, ['mark-in-progress']),
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
        markTask(dao, ['mark-in-progress', '999']),
        {
          message: 'Task with id 999 not found'
        }
      );
    }
  );

  const transitions = [
    ['todo', 'in-progress', 'Task 3'],
    ['todo', 'done', 'Task 3'],
    ['in-progress', 'done', 'Task 2'],
    ['in-progress', 'todo', 'Task 2'],
    ['done', 'todo', 'Task 1'],
    ['done', 'in-progress', 'Task 1'],
  ];

  for (const [from, to, taskDescription] of transitions) {
    t.test(`should mark ${from} task as ${to}`, async () => {
      const taskMap = {
        'Task 3': task3,
        'Task 2': task2,
        'Task 1': task1,
      }
      const task = taskMap[taskDescription];
      await setTimeout(1, null);
      const updated = await markTask(dao, [`mark-${to}`, task.id]);

      assert.strictEqual(updated.id, task.id);
      assert.strictEqual(updated.description, task.description);
      assert.notEqual(updated.status, task.status);
      assert.strictEqual(updated.createdAt.getTime(), task.createdAt.getTime());
      assert.ok(updated.updatedAt.getTime() > task.updatedAt.getTime());

      const statusHandlers = {
        'todo': () => dao.findTodo(),
        'in-progress': () => dao.findInProgress(),
        'done': () => dao.findDone(),
      };

      const tasks = statusHandlers[to]();
      const taskInFile = tasks.find(el => el.id === task.id);

      assert.notEqual(taskInFile, null);
      assert.strictEqual(updated, taskInFile);
    });
  }
});