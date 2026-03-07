import test from 'node:test';
import assert from 'node:assert';

import TaskDao from '../../src/dao/task-dao.js';
import Task from '../../src/models/task.js';


const now = new Date();
const mockTasks = [
  {
    id: 1,
    description: 'Buy groceries',
    status: 'todo',
    createdAt: now,
    updatedAt: now,
  }
]

test('Task DAO', (t) => {
  t.test('should return an array of Task instances', () => {
    const dao = new TaskDao(mockTasks);
    const tasks = dao.findAll();

    assert.ok(Array.isArray(tasks));
    assert.ok(tasks.every(task => task instanceof Task));
    assert.equal(tasks.length, 1);
    assert.strictEqual(tasks[0].id, 1);
    assert.strictEqual(tasks[0].status, 'todo');
    assert.equal(tasks[0].description, 'Buy groceries');
    assert.ok(tasks[0].createdAt instanceof Date);
    assert.strictEqual(tasks[0].createdAt.getTime(), now.getTime());
    assert.ok(tasks[0].updatedAt instanceof Date);
    assert.strictEqual(tasks[0].updatedAt.getTime(), now.getTime());
  });
});