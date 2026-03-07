import Task from '../models/task.js';


export default class TaskDao {
  constructor(tasks = []) {
    this.tasks = tasks;
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
}