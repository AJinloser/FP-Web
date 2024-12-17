export class TaskQueue {
  private queue: (() => Promise<void>)[] = [];
  private running = false;
  private taskInterval: number;

  constructor(taskIntervalMs = 3000) {
    this.taskInterval = taskIntervalMs;
  }

  addTask(task: () => Promise<void>) {
    this.queue.push(task);
    this.runNextTask();
  }

  clearQueue() {
    this.queue = [];
  }

  private async runNextTask() {
    if (this.running || this.queue.length === 0) {
      if (this.queue.length === 0) {
        console.log("Queue is empty");
      }
      return;
    }

    this.running = true;
    const task = this.queue.shift();
    try {
      await task?.();
    } catch (error) {
      console.error('Task failed', error);
    }
    this.running = false;
    setTimeout(() => this.runNextTask(), this.taskInterval);
  }
}

export const audioTaskQueue = new TaskQueue(20); 