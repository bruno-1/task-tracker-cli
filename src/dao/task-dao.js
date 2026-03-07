import path from 'node:path';
import { existsSync } from 'node:fs';
import { writeFile, readFile } from 'node:fs/promises';

import Task from '../models/task.js';


export default class TaskDao {
  constructor(filePath = path.resolve('tasks.json')) {
    this.filePath = filePath;
    this.tasks = [];
  }

  async init() {
    this.tasks = await this.#loadFromFile();
  }

  findAll() {
    return this.tasks.map(task => new Task({
      id: task.id,
      description: task.description,
      status: task.status,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
    }));
  }

  async insert(taskData) {
    const task = new Task({
      ...taskData,
      id: await this.#generateNextId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.tasks.push(task);
    this.#persist();

    return task;
  }

  async update(id, updatedData) {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error(`Task with id ${id} not found`);

    const existing = this.tasks[index];
    const updatedTask = new Task({
      id: existing.id,
      description: updatedData.description ?? existing.description,
      status: updatedData.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });

    this.tasks[index] = updatedTask;
    await this.#persist();

    return updatedTask;
  }

  async #persist() {
    await writeFile(this.filePath, JSON.stringify(this.tasks, (_, value) => {
      return value instanceof Date ? value.toISOString() : value;
    }));
  }

  async #loadFromFile() {
    try {
      if (!existsSync(this.filePath)) {
        await writeFile(this.filePath, JSON.stringify([], (_, value) => {
          return value instanceof Date ? value.toISOString() : value;
        }));

        return [];
      }

      const content = await readFile(this.filePath);
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      return [];
    }
  }

  async #generateNextId() {
    const tasks = await this.#loadFromFile();

    if (!tasks?.length) return 1;
    const ids = tasks.map(t => t.id);
    return Math.max(...ids) + 1;
  }
}