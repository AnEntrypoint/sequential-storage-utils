import { RECORD_DEFAULTS } from './constants.js';
import { Serializer } from './serializer.js';
import { Validators } from './validators.js';
import { nowISO } from '@sequential/sequential-utils/timestamps';
import { nowISO, createTimestamps, updateTimestamp } from '@sequential/timestamp-utilities';

const FIELD_MAP = {
  task_run: ['taskName', 'task_identifier', 'status', 'id'],
  stack_run: ['task_run_id', 'parent_stack_run_id', 'status', 'id', 'operation'],
  task_function: ['id', 'name'],
  keystore: ['key']
};

const NORMALIZERS = {
  task_run: (n) => ({
    id: n.id,
    taskName: n.taskName || n.task_identifier,
    status: n.status || 'pending',
    input: n.input || {},
    output: n.output || null,
    error: n.error || null,
    startedAt: n.startedAt || n.created_at,
    completedAt: n.completedAt,
    createdAt: n.created_at || n.startedAt,
    updatedAt: n.updated_at || n.startedAt
  }),
  stack_run: (n) => ({
    id: n.id,
    task_run_id: n.task_run_id,
    parent_stack_run_id: n.parent_stack_run_id,
    operation: n.operation,
    status: n.status || 'pending',
    input: n.input || {},
    output: n.output || null,
    error: n.error || null,
    createdAt: n.createdAt || n.created_at,
    updatedAt: n.updatedAt || n.updated_at
  }),
  task_function: (n) => ({
    id: n.id,
    name: n.name,
    code: n.code,
    metadata: n.metadata || {},
    createdAt: n.createdAt || n.created_at,
    updatedAt: n.updatedAt || n.updated_at
  }),
  keystore: (n) => ({
    key: n.key,
    value: n.value,
    metadata: n.metadata || {},
    createdAt: n.createdAt || n.created_at,
    updatedAt: n.updatedAt || n.updated_at
  })
};

export class CRUDPatterns {
  constructor() {
    this.serializer = new Serializer();
  }

  #buildCreate(input, recordType, timestampField = 'updatedAt') {
    const defaults = RECORD_DEFAULTS[recordType];
    const record = { ...defaults, ...input };

    if (timestampField && !record[timestampField]) {
      record[timestampField] = nowISO();
    }

    const validation = Validators[`validate${recordType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).replace(/ /g, '')}`]?.(record);
    if (validation && !validation.valid) {
      throw new Error(`Invalid ${recordType}: ${validation.errors.join(', ')}`);
    }

    return this.serializer.prepareForStorage(record, recordType);
  }

  #buildUpdate(input, recordType) {
    if (!input || typeof input !== 'object') {
      return {};
    }

    const updates = { ...input };
    updates.updatedAt = nowISO();
    return this.serializer.prepareForStorage(updates, recordType);
  }

  #buildQuery(filter, recordType) {
    if (!filter || typeof filter !== 'object') {
      return {};
    }

    const query = {};
    const allowedFields = FIELD_MAP[recordType] || Object.keys(filter);

    for (const [key, value] of Object.entries(filter)) {
      if (allowedFields.includes(key) && value !== null && value !== undefined) {
        query[key] = value;
      }
    }

    return query;
  }

  #normalizeRecord(record, recordType) {
    if (!record || typeof record !== 'object') {
      return null;
    }

    const normalized = this.serializer.loadFromStorage(record, recordType);
    const normalizer = NORMALIZERS[recordType];
    return normalizer ? normalizer(normalized) : normalized;
  }

  buildTaskRunCreate(input) {
    return this.#buildCreate(input, 'task_run', 'startedAt');
  }

  buildTaskRunUpdate(input) {
    return this.#buildUpdate(input, 'task_run');
  }

  buildTaskRunQuery(filter) {
    return this.#buildQuery(filter, 'task_run');
  }

  normalizeTaskRunRecord(record) {
    return this.#normalizeRecord(record, 'task_run');
  }

  buildStackRunCreate(input) {
    return this.#buildCreate(input, 'stack_run', 'createdAt');
  }

  buildStackRunUpdate(input) {
    return this.#buildUpdate(input, 'stack_run');
  }

  buildStackRunQuery(filter) {
    return this.#buildQuery(filter, 'stack_run');
  }

  normalizeStackRunRecord(record) {
    return this.#normalizeRecord(record, 'stack_run');
  }

  buildTaskFunctionCreate(input) {
    return this.#buildCreate(input, 'task_function', null);
  }

  buildTaskFunctionUpdate(input) {
    return this.#buildUpdate(input, 'task_function');
  }

  normalizeTaskFunctionRecord(record) {
    return this.#normalizeRecord(record, 'task_function');
  }

  buildKeystoreCreate(input) {
    return this.#buildCreate(input, 'keystore', null);
  }

  buildKeystoreUpdate(input) {
    return this.#buildUpdate(input, 'keystore');
  }

  normalizeKeystoreRecord(record) {
    return this.#normalizeRecord(record, 'keystore');
  }

  buildFilterQuery(filter, recordType = null) {
    return this.#buildQuery(filter, recordType);
  }

  filterRecords(records, filter) {
    if (!Array.isArray(records)) {
      return [];
    }

    if (!filter || typeof filter !== 'object' || Object.keys(filter).length === 0) {
      return records;
    }

    return records.filter(record => {
      for (const [key, value] of Object.entries(filter)) {
        if (!(key in record)) {
          return false;
        }
        if (record[key] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  mergeUpdates(original, updates) {
    if (!original || typeof original !== 'object') {
      return updates;
    }

    if (!updates || typeof updates !== 'object') {
      return original;
    }

    const merged = { ...original };

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        merged[key] = value;
      }
    }

    return merged;
  }

  normalizeRecord(record, recordType = null) {
    return this.#normalizeRecord(record, recordType);
  }
}
