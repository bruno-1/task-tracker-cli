import test from 'node:test';
import assert from 'node:assert';
import { setTimeout } from 'node:timers/promises';

import { createTestDao, destroyTestDao, seedTasks } from '../helpers/create-test-dao.js';
import { markTask } from '../../src/cli/mark-task.js';
import { TASK_STATUS } from '../../src/constants/task-status.js';


test('Mark Task', (t) => {
  let dao;
  let file;
  let task1;
  let task2;
  let task3;

  t.beforeEach(async () => {
    ({ dao, file } = await createTestDao('test-mark-tasks.json'));
    ({ task1, task2, task3 } = await seedTasks(dao));
  });

  t.afterEach(async () => {
    await destroyTestDao(file);
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