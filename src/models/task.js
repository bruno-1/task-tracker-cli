export default class Task {
  static #VALID_STATUSES = new Set(['todo', 'in-progress', 'done']);

  constructor({
    id,
    description,
    status = 'todo',
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    if (!id) throw new TypeError('Id is required');
    if (!description) throw new TypeError('Description is required');
    if (!Task.#VALID_STATUSES.has(status))
      throw new TypeError(
        `Invalid status: ${status}. Valid statuses are: ${Task.#VALID_STATUSES.join(', ')}`
      );

    this.id = id;
    this.description = description;
    this.status = status;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    this.updatedAt = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
  }

  static getValidStatuses() {
    return [...Task.#VALID_STATUSES];
  }
}