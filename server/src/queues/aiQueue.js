const config = require('../config/env');

class InMemoryQueue {
  constructor() {
    this.jobs = new Map();
  }

  async add(name, data) {
    const jobId = 'job_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const job = { id: jobId, name, data, status: 'queued', createdAt: new Date() };
    this.jobs.set(jobId, job);
    
    // Process asynchronously
    setTimeout(async () => {
      job.status = 'completed';
      job.completedAt = new Date();
    }, 100);

    return job;
  }

  async getJob(jobId) {
    return this.jobs.get(jobId) || null;
  }
}

let aiQueue = null;

if (config.REDIS_URL) {
  try {
    const { Queue } = require('bullmq');
    const IORedis = require('ioredis');
    const connection = new IORedis(config.REDIS_URL, { maxRetriesPerRequest: null });
    aiQueue = new Queue('aiQueue', { connection });
    console.log('⚡ BullMQ AI Queue initialized on Redis');
  } catch (err) {
    console.warn('⚠️ Could not connect BullMQ to Redis, using in-memory queue fallback:', err.message);
    aiQueue = new InMemoryQueue();
  }
} else {
  aiQueue = new InMemoryQueue();
}

module.exports = aiQueue;
