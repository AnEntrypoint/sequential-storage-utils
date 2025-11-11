import { RECORD_DEFAULTS } from './constants.js';
import { Serializer } from './serializer.js';
import { Validators } from './validators.js';
import { nowISO } from 'tasker-utils/timestamps';

export class CRUDPatterns {
  constructor() {
    this.serializer = new Serializer();
  }

  buildTaskRunCreate(input) {
    const defaults = RECORD_DEFAULTS.task_run;
    const record = {
      ...defaults,
      ...input
    };

    if (!record.startedAt) {
      record.startedAt = nowISO();
    }

    const validation = Validators.validateTaskRun(record);
    if (!validation.valid) {
      throw new Error(`Invalid TaskRun: ${validation.errors.join(', ')}`);
    }

    return this.serializer.prepareForStorage(record, 'task_run');
  }

  buildTaskRunUpdate(input) {
    if (!input || typeof input !== 'object') {
      return {};
    }

    const updates = { ...input };
    updates.updatedAt = nowISO();

    return this.serializer.prepareForStorage(updates, 'task_run');
  }

  buildTaskRunQuery(filter) {
    if (!filter || typeof filter !== 'object') {
      return {};
    }

    const query = {};
    const allowedFields = ['taskName', 'task_identifier', 'status', 'id'];

    for (const [key, value] of Object.entries(filter)) {
      if (allowedFields.includes(key) && value !== null && value !== undefined) {
        query[key] = value;
      }
    }

    return query;
  }

  normalizeTaskRunRecord(record) {
    if (!record || typeof record !== 'object') {
      return null;
    }

    const normalized = this.serializer.loadFromStorage(record, 'task_run');

    return {
      id: normalized.id,
      taskName: normalized.taskName || normalized.task_identifier,
      status: normalized.status || 'pending',
      input: normalized.input || {},
      output: normalized.output || null,
      error: normalized.error || null,
      startedAt: normalized.startedAt || normalized.created_at,
      completedAt: normalized.completedAt,
      createdAt: normalized.created_at || normalized.startedAt,
      updatedAt: normalized.updated_at || normalized.startedAt
    };
  }

  buildStackRunCreate(input) {
    const defaults = RECORD_DEFAULTS.stack_run;
    const record = {
      ...defaults,
      ...input
    };

    if (!record.createdAt) {
      record.createdAt = nowISO();
    }

    const validation = Validators.validateStackRun(record);
    if (!validation.valid) {
      throw new Error(`Invalid StackRun: ${validation.errors.join(', ')}`);
    }

    return this.serializer.prepareForStorage(record, 'stack_run');
  }

  buildStackRunUpdate(input) {
    if (!input || typeof input !== 'object') {
      return {};
    }

    const updates = { ...input };
    updates.updatedAt = nowISO();

    return this.serializer.prepareForStorage(updates, 'stack_run');
  }

  buildStackRunQuery(filter) {
    if (!filter || typeof filter !== 'object') {
      return {};
    }

    const query = {};
    const allowedFields = ['task_run_id', 'parent_stack_run_id', 'status', 'id', 'operation'];

    for (const [key, value] of Object.entries(filter)) {
      if (allowedFields.includes(key) && value !== null && value !== undefined) {
        query[key] = value;
      }
    }

    return query;
  }

  normalizeStackRunRecord(record) {
    if (!record || typeof record !== 'object') {
      return null;
    }

    const normalized = this.serializer.loadFromStorage(record, 'stack_run');

    return {
      id: normalized.id,
      task_run_id: normalized.task_run_id,
      parent_stack_run_id: normalized.parent_stack_run_id,
      operation: normalized.operation,
      status: normalized.status || 'pending',
      input: normalized.input || {},
      output: normalized.output || null,
      error: normalized.error || null,
      createdAt: normalized.createdAt || normalized.created_at,
      updatedAt: normalized.updatedAt || normalized.updated_at
    };
  }

  buildTaskFunctionCreate(input) {
    const defaults = RECORD_DEFAULTS.task_function;
    const record = {
      ...defaults,
      ...input
    };

    const validation = Validators.validateTaskFunction(record);
    if (!validation.valid) {
      throw new Error(`Invalid TaskFunction: ${validation.errors.join(', ')}`);
    }

    return this.serializer.prepareForStorage(record, 'task_function');
  }

  buildTaskFunctionUpdate(input) {
    if (!input || typeof input !== 'object') {
      return {};
    }

    const updates = { ...input };
    updates.updatedAt = nowISO();

    return this.serializer.prepareForStorage(updates, 'task_function');
  }

  normalizeTaskFunctionRecord(record) {
    if (!record || typeof record !== 'object') {
      return null;
    }

    const normalized = this.serializer.loadFromStorage(record, 'task_function');

    return {
      id: normalized.id,
      name: normalized.name,
      code: normalized.code,
      metadata: normalized.metadata || {},
      createdAt: normalized.createdAt || normalized.created_at,
      updatedAt: normalized.updatedAt || normalized.updated_at
    };
  }

  buildKeystoreCreate(input) {
    const defaults = RECORD_DEFAULTS.keystore;
    const record = {
      ...defaults,
      ...input
    };

    const validation = Validators.validateKeystore(record);
    if (!validation.valid) {
      throw new Error(`Invalid Keystore: ${validation.errors.join(', ')}`);
    }

    return this.serializer.prepareForStorage(record, 'keystore');
  }

  buildKeystoreUpdate(input) {
    if (!input || typeof input !== 'object') {
      return {};
    }

    const updates = { ...input };
    updates.updatedAt = nowISO();

    return this.serializer.prepareForStorage(updates, 'keystore');
  }

  normalizeKeystoreRecord(record) {
    if (!record || typeof record !== 'object') {
      return null;
    }

    const normalized = this.serializer.loadFromStorage(record, 'keystore');

    return {
      key: normalized.key,
      value: normalized.value,
      metadata: normalized.metadata || {},
      createdAt: normalized.createdAt || normalized.created_at,
      updatedAt: normalized.updatedAt || normalized.updated_at
    };
  }

  buildFilterQuery(filter, recordType = null) {
    const fieldMap = {
      task_run: ['taskName', 'task_identifier', 'status', 'id'],
      stack_run: ['task_run_id', 'parent_stack_run_id', 'status', 'id', 'operation'],
      task_function: ['id', 'name'],
      keystore: ['key']
    };

    const allowedFields = fieldMap[recordType] || Object.keys(filter);
    const query = {};

    for (const [key, value] of Object.entries(filter)) {
      if (allowedFields.includes(key) && value !== null && value !== undefined) {
        query[key] = value;
      }
    }

    return query;
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
    const normalizers = {
      task_run: this.normalizeTaskRunRecord.bind(this),
      stack_run: this.normalizeStackRunRecord.bind(this),
      task_function: this.normalizeTaskFunctionRecord.bind(this),
      keystore: this.normalizeKeystoreRecord.bind(this)
    };

    if (normalizers[recordType]) {
      return normalizers[recordType](record);
    }

    return this.serializer.loadFromStorage(record, recordType);
  }
}
