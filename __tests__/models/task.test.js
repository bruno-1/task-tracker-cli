import test from 'node:test';
import assert from 'node:assert';

import Task from '../../src/models/task.js';
import { TASK_STATUS } from '../../src/constants/task-status.js';


test('Task Model', (t) => {
  t.test('should create a task', () => {
    const task = new Task({ id: 1, description: 'Buy groceries' });

    assert.strictEqual(task.id, 1);
    assert.equal(task.description, 'Buy groceries');
    assert.equal(task.status, 'todo');
    assert.ok(task.createdAt instanceof Date);
    assert.ok(task.updatedAt instanceof Date);
  });

  t.test('should throw error if id is missing', { expectFailure: 'Id is required' }, () => {
    new Task({ description: 'Buy groceries' });
  });

  t.test(
    'should throw error if description is missing',
    { expectFailure: 'Description is required' },
    () => {
      new Task({ id: 1 });
    }
  );

  t.test(
    'should throw error for invalid status',
    {
      expectFailure:
        `Invalid status: invalid. Valid statuses are: ${[...TASK_STATUS].join(', ')}`
    },
    () => {
      new Task({ id: 1, description: 'Buy groceries', status: 'invalid' });
    }
  );
});