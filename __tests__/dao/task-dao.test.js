import test, { mock } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { writeFile, rm, readFile } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';

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

    const file = await readFile(mockFileJson);
    const fileContent = JSON.parse(file);
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

  t.test('should return only done tasks', async (t) => {
    const dao = new TaskDao(mockFileJson);
    await dao.init();

    const task1 = await dao.insert({ description: 'Task 1' });
    const task2 = await dao.insert({ description: 'Task 2' });
    await dao.insert({ description: 'Task 3' });

    await dao.update(task1.id, { status: 'done' });
    await dao.update(task2.id, { status: 'in-progress' });

    const doneTasks = dao.findDone();

    assert.equal(doneTasks.length, 1);
    assert.strictEqual(doneTasks[0].id, task1.id);
  });

  t.test('should return only todo tasks', async (t) => {
    const dao = new TaskDao(mockFileJson);
    await dao.init();

    const task1 = await dao.insert({ description: 'Task 1' });
    const task2 = await dao.insert({ description: 'Task 2' });
    const task3 = await dao.insert({ description: 'Task 3' });

    await dao.update(task1.id, { status: 'done' });
    await dao.update(task2.id, { status: 'in-progress' });

    const todoTasks = dao.findTodo();

    assert.equal(todoTasks.length, 1);
    assert.strictEqual(todoTasks[0].id, task3.id);
  });

  t.test('should return only tasks in progress', async (t) => {
    const dao = new TaskDao(mockFileJson);
    await dao.init();

    const task1 = await dao.insert({ description: 'Task 1' });
    const task2 = await dao.insert({ description: 'Task 2' });
    await dao.insert({ description: 'Task 3' });

    await dao.update(task1.id, { status: 'done' });
    await dao.update(task2.id, { status: 'in-progress' });

    const inProgressTasks = dao.findInProgress();

    assert.equal(inProgressTasks.length, 1);
    assert.strictEqual(inProgressTasks[0].id, task2.id);
  });

  t.test('should update an existing task', async () => {
    const dao = new TaskDao(mockFileJson);
    await dao.init();

    const originalTask = await dao.insert({ description: 'Buy groceries', });
    const originalUpdatedAt = originalTask.updatedAt.getTime();

    const updatedDate = { description: 'Buy griceries and cook dinner' }
    await setTimeout(1, null);
    const updatedTask = await dao.update(originalTask.id, updatedDate);

    assert.strictEqual(originalTask.id, updatedTask.id);
    assert.notEqual(originalTask.description, updatedTask.description);
    assert.strictEqual(originalTask.status, updatedTask.status);
    assert.strictEqual(originalTask.createdAt.getTime(), updatedTask.createdAt.getTime());
    assert.ok(updatedTask.updatedAt.getTime() > originalUpdatedAt);

    const tasks = dao.findAll();
    assert.strictEqual(tasks.length, 1);
    assert.strictEqual(tasks[0].id, updatedTask.id);
    assert.strictEqual(tasks[0].description, updatedTask.description);
    assert.strictEqual(tasks[0].status, updatedTask.status);
    assert.strictEqual(tasks[0].createdAt.getTime(), updatedTask.createdAt.getTime());
    assert.strictEqual(tasks[0].updatedAt.getTime(), updatedTask.updatedAt.getTime());
  });

  t.test('should delete an existing task', async () => {
    const dao = new TaskDao(mockFileJson);
    await dao.init();

    const task1 = await dao.insert({ description: 'Buy groceries' });
    const task2 = await dao.insert({ description: 'Cook Dinner' });

    const removedTask = await dao.delete(task1.id);

    assert.strictEqual(removedTask.id, task1.id);

    const tasks = dao.findAll();
    assert.equal(tasks.length, 1);
    assert.strictEqual(tasks[0].id, task2.id);
    assert.strictEqual(tasks[0].description, task2.description);

    const file = await readFile(mockFileJson);
    const fileContent = JSON.parse(file);

    assert.strictEqual(fileContent.length, 1);
    assert.strictEqual(fileContent[0].id, task2.id);
  });

  t.test(
    'should throw error when updating a non-existing task',
    { expectFailure: 'Task with id 999 not found' },
    async () => {
      const dao = new TaskDao(mockFileJson);
      await dao.init();

      await dao.update(999, { description: 'new description' });
    }
  );

  t.test(
    'should throw error when deleting a non-existing task',
    { expectFailure: 'Task with id 999 not found' },
    async () => {
      const dao = new TaskDao(mockFileJson);
      await dao.init();

      await dao.delete(999);
    }
  );

  t.test('should generate sequential ids when inserting multiple tasks', async () => {
    const dao = new TaskDao(mockFileJson);
    await dao.init();

    const task1 = await dao.insert({ description: 'Task 1' });
    const task2 = await dao.insert({ description: 'Task 2' });
    const task3 = await dao.insert({ description: 'Task 3' });

    assert.strictEqual(task1.id, 1);
    assert.strictEqual(task2.id, 2);
    assert.strictEqual(task3.id, 3);
  });

  t.test('should load persisted tasks after reinitializing DAO', async () => {
    const dao1 = new TaskDao(mockFileJson);
    await dao1.init();

    await dao1.insert({ description: 'Persisted task' });

    const dao2 = new TaskDao(mockFileJson);
    await dao2.init();

    const tasks = dao2.findAll();

    assert.strictEqual(tasks.length, 1);
    assert.equal(tasks[0].description, 'Persisted task');
  });
});