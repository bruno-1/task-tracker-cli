import test from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { writeFile, rm, readFile } from 'node:fs/promises';

import TaskDao from '../../src/dao/task-dao.js';
import Task from '../../src/models/task.js';


const mockFileJson = path.resolve('test-tasks.json');

test('Task DAO', (t) => {
  t.beforeEach(async () => {
    await writeFile(mockFileJson, JSON.stringify([]));
  });

  t.afterEach(async () => {
    await rm(mockFileJson);
  });

  t.test('should insert a new task', async () => {
    const taskData = { description: 'Cook Dinner', };
    const dao = new TaskDao(mockFileJson);
    await dao.init();

    const task = await dao.insert(taskData);

    const tasks = dao.findAll();

    assert.equal(task.description, 'Cook Dinner');
    assert.strictEqual(task.id, tasks[0].id);
    assert.strictEqual(task.description, tasks[0].description);
    assert.strictEqual(task.status, tasks[0].status);
    assert.strictEqual(task.createdAt.getTime(), tasks[0].createdAt.getTime());
    assert.strictEqual(task.updatedAt.getTime(), tasks[0].updatedAt.getTime());

    const fileContent = JSON.parse(await readFile(mockFileJson));
    assert.equal(fileContent.length, 1);
    assert.equal(fileContent[0].description, 'Cook Dinner');
  });

  t.test('should return an array of Task instances', async () => {
    const dao = new TaskDao(mockFileJson);
    await dao.init();

    const task1 = { description: 'Buy groceries', };
    const task2 = { description: 'Cook Dinner', };

    await dao.insert(task1);
    await dao.insert(task2);

    const tasks = dao.findAll();

    assert.ok(Array.isArray(tasks));
    assert.ok(tasks.every(task => task instanceof Task));
    assert.equal(tasks.length, 2);
  });
});