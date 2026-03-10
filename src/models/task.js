import { TASK_STATUS } from '../constants/task-status.js';


export default class Task {
  constructor({
    id,
    description,
    status = 'todo',
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    if (!id) throw new TypeError('Id is required');
    if (!description) throw new TypeError('Description is required');
    if (!TASK_STATUS.has(status))
      throw new TypeError(
        `Invalid status: ${status}. Valid statuses are: ${[...TASK_STATUS].join(', ')}`
      );

    this.id = id;
    this.description = description;
    this.status = status;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    this.updatedAt = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
  }
}