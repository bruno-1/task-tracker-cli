# Task Tracker CLI

A simple command-line task tracker built with Node.js.
This project allows you to manage tasks directly from the terminal with persistent storage using a JSON file.

## Features

* Add new tasks
* Update task descriptions
* Delete tasks
* Mark tasks as `todo`, `in-progress`, or `done`
* List all tasks or filter by status
* Persistent storage using a local JSON file
* Unit tests using Node.js built-in test runner

---

# Installation

Clone the repository:

```bash
git clone <repository-url>
cd task-tracker
```

No external dependencies are required.

---

# Usage

Run the CLI with:

```bash
node src/index.js <command> [arguments]
```

---

# Commands

## Add a task

```bash
node src/index.js add "Buy groceries"
```

---

## Update a task

```bash
node src/index.js update <task-id> "New description"
```

Example:

```bash
node src/index.js update 1 "Buy groceries and cook dinner"
```

---

## Delete a task

```bash
node src/index.js delete <task-id>
```

Example:

```bash
node src/index.js delete 1
```

---

## Mark a task

Mark a task as **in progress**:

```bash
node src/index.js mark-in-progress <task-id>
```

Mark a task as **done**:

```bash
node src/index.js mark-done <task-id>
```

Example:

```bash
node src/index.js mark-done 2
```

---

## List tasks

List all tasks:

```bash
node src/index.js list
```

List tasks by status:

```bash
node src/index.js list todo
node src/index.js list in-progress
node src/index.js list done
```

---

# Example

Add a task:

```bash
node src/index.js add "Buy groceries"
```

List tasks:

```bash
node src/index.js list
```

Example output:

```
1. Buy groceries [todo]
2. Cook dinner [in-progress]
3. Study Node.js [done]
```

---

# Running Tests

The project uses the built-in Node.js test runner.

Run all tests:

```bash
node --test
```

---

# Development

Run the CLI locally:

```bash
node src/index.js
```

Tasks are stored in a local file:

```
tasks.json
```

---

# License

This project is licensed under the **ISC License**.

See the [LICENSE](LICENSE) file for more details.