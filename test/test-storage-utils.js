import { test } from 'node:test';
import assert from 'node:assert';
import { Serializer, CRUDPatterns, Validators, RECORD_TYPES, RECORD_DEFAULTS } from '../src/index.js';
import { nowISO, createTimestamps, updateTimestamp } from '@sequential/timestamp-utilities';

test('Serializer - Object Serialization', async (t) => {
  const serializer = new Serializer();

  await t.test('serializes objects to JSON string', () => {
    const obj = { key: 'value', count: 42 };
    const result = serializer.serializeObject(obj);
    assert.equal(typeof result, 'string');
    assert.deepEqual(JSON.parse(result), obj);
  });

  await t.test('handles null values', () => {
    const result = serializer.serializeObject(null);
    assert.equal(result, null);
  });

  await t.test('handles undefined values', () => {
    const result = serializer.serializeObject(undefined);
    assert.equal(result, undefined);
  });

  await t.test('handles primitive values', () => {
    assert.equal(serializer.serializeObject('string'), 'string');
    assert.equal(serializer.serializeObject(42), 42);
    assert.equal(serializer.serializeObject(true), true);
  });

  await t.test('deserializes JSON strings', () => {
    const obj = { key: 'value', count: 42 };
    const serialized = JSON.stringify(obj);
    const result = serializer.deserializeObject(serialized);
    assert.deepEqual(result, obj);
  });

  await t.test('handles invalid JSON gracefully', () => {
    const result = serializer.deserializeObject('not valid json');
    assert.equal(result, 'not valid json');
  });

  await t.test('deserializes null values', () => {
    const result = serializer.deserializeObject(null);
    assert.equal(result, null);
  });
});

test('Serializer - Record Serialization', async (t) => {
  const serializer = new Serializer();

  await t.test('serializes record fields', () => {
    const record = {
      id: 1,
      input: { userId: 123 },
      output: { success: true },
      status: 'completed'
    };
    const result = serializer.serializeRecord(record);
    assert.equal(typeof result.input, 'string');
    assert.equal(typeof result.output, 'string');
    assert.equal(result.status, 'completed');
  });

  await t.test('deserializes record fields', () => {
    const record = {
      id: 1,
      input: '{"userId":123}',
      output: '{"success":true}',
      status: 'completed'
    };
    const result = serializer.deserializeRecord(record);
    assert.deepEqual(result.input, { userId: 123 });
    assert.deepEqual(result.output, { success: true });
  });

  await t.test('preserves non-serializable fields', () => {
    const record = {
      id: 1,
      status: 'completed',
      input: { data: 'test' }
    };
    const serialized = serializer.serializeRecord(record);
    assert.equal(serialized.id, 1);
    assert.equal(serialized.status, 'completed');
  });
});

test('Serializer - Storage Preparation', async (t) => {
  const serializer = new Serializer();

  await t.test('prepares record for storage', () => {
    const record = {
      id: 1,
      input: { userId: 123 },
      status: 'pending'
    };
    const result = serializer.prepareForStorage(record);
    assert.equal(typeof result.input, 'string');
    assert.ok(result.createdAt);
    assert.ok(result.updatedAt);
  });

  await t.test('loads record from storage', () => {
    const record = {
      id: 1,
      input: '{"userId":123}',
      status: 'completed'
    };
    const result = serializer.loadFromStorage(record);
    assert.deepEqual(result.input, { userId: 123 });
    assert.equal(result.status, 'completed');
  });

  await t.test('handles toJSON serialization', () => {
    const obj = { key: 'value' };
    const result = serializer.toJSON(obj);
    assert.equal(result, JSON.stringify(obj));
  });

  await t.test('handles toJSON with pretty printing', () => {
    const obj = { key: 'value' };
    const result = serializer.toJSON(obj, true);
    assert.equal(result, JSON.stringify(obj, null, 2));
  });

  await t.test('handles fromJSON parsing', () => {
    const json = '{"key":"value"}';
    const result = serializer.fromJSON(json);
    assert.deepEqual(result, { key: 'value' });
  });

  await t.test('handles fromJSON with invalid input', () => {
    const result = serializer.fromJSON('invalid json');
    assert.equal(result, null);
  });
});

test('Validators - UUID and Email', async (t) => {
  await t.test('validates valid UUID', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    assert.equal(Validators.isValidUuid(uuid), true);
  });

  await t.test('rejects invalid UUID', () => {
    assert.equal(Validators.isValidUuid('not-a-uuid'), false);
    assert.equal(Validators.isValidUuid(123), false);
  });

  await t.test('validates valid email', () => {
    assert.equal(Validators.isValidEmail('user@example.com'), true);
  });

  await t.test('rejects invalid email', () => {
    assert.equal(Validators.isValidEmail('invalid-email'), false);
    assert.equal(Validators.isValidEmail(123), false);
  });

  await t.test('validates timestamps', () => {
    assert.equal(Validators.isValidTimestamp('2025-01-01T00:00:00Z'), true);
    assert.equal(Validators.isValidTimestamp('invalid'), false);
  });

  await t.test('validates IDs', () => {
    assert.equal(Validators.isValidId(123), true);
    assert.equal(Validators.isValidId(0), false);
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    assert.equal(Validators.isValidId(uuid), true);
  });
});

test('Validators - Record Validation', async (t) => {
  await t.test('validates TaskRun', () => {
    const taskRun = {
      id: 1,
      task_identifier: 'my-task',
      status: 'pending'
    };
    const result = Validators.validateTaskRun(taskRun);
    assert.equal(result.valid, true);
  });

  await t.test('rejects invalid TaskRun status', () => {
    const taskRun = {
      id: 1,
      task_identifier: 'my-task',
      status: 'invalid'
    };
    const result = Validators.validateTaskRun(taskRun);
    assert.equal(result.valid, false);
  });

  await t.test('validates StackRun', () => {
    const stackRun = {
      id: 1,
      task_run_id: 10,
      status: 'running'
    };
    const result = Validators.validateStackRun(stackRun);
    assert.equal(result.valid, true);
  });

  await t.test('validates TaskFunction', () => {
    const taskFunction = {
      id: 1,
      name: 'my-task',
      code: 'export async function task() {}'
    };
    const result = Validators.validateTaskFunction(taskFunction);
    assert.equal(result.valid, true);
  });

  await t.test('validates Keystore', () => {
    const keystore = {
      key: 'api-key',
      value: 'secret'
    };
    const result = Validators.validateKeystore(keystore);
    assert.equal(result.valid, true);
  });

  await t.test('validates required fields', () => {
    const result = Validators.validateRequired({ name: 'John', age: 30 }, ['name', 'age']);
    assert.equal(result.valid, true);
  });

  await t.test('detects missing required fields', () => {
    const result = Validators.validateRequired({ name: 'John' }, ['name', 'age']);
    assert.equal(result.valid, false);
  });
});

test('CRUDPatterns - TaskRun Operations', async (t) => {
  const crud = new CRUDPatterns();

  await t.test('builds TaskRun create payload', () => {
    const input = {
      id: 1,
      task_identifier: 'my-task',
      status: 'pending',
      input: { userId: 123 }
    };
    const result = crud.buildTaskRunCreate(input);
    assert.equal(result.id, 1);
    assert.equal(result.status, 'pending');
    assert.ok(result.startedAt);
  });

  await t.test('builds TaskRun update payload', () => {
    const updates = { status: 'completed' };
    const result = crud.buildTaskRunUpdate(updates);
    assert.equal(result.status, 'completed');
    assert.ok(result.updatedAt);
  });

  await t.test('normalizes TaskRun record', () => {
    const record = {
      id: 1,
      task_identifier: 'my-task',
      status: 'completed',
      input: '{"userId":123}',
      created_at: '2025-01-01T00:00:00Z'
    };
    const result = crud.normalizeTaskRunRecord(record);
    assert.equal(result.taskName, 'my-task');
    assert.equal(result.status, 'completed');
    assert.deepEqual(result.input, { userId: 123 });
  });

  await t.test('builds TaskRun query filter', () => {
    const filter = { task_identifier: 'my-task', status: 'pending' };
    const result = crud.buildTaskRunQuery(filter);
    assert.ok(result.task_identifier || result.taskName);
    assert.equal(result.status, 'pending');
  });
});

test('CRUDPatterns - StackRun Operations', async (t) => {
  const crud = new CRUDPatterns();

  await t.test('builds StackRun create payload', () => {
    const input = {
      id: 1,
      task_run_id: 10,
      operation: 'fetch',
      status: 'pending'
    };
    const result = crud.buildStackRunCreate(input);
    assert.equal(result.id, 1);
    assert.equal(result.task_run_id, 10);
    assert.equal(result.operation, 'fetch');
    assert.ok(result.createdAt);
  });

  await t.test('normalizes StackRun record', () => {
    const record = {
      id: 1,
      task_run_id: 10,
      status: 'completed',
      operation: 'fetch',
      created_at: '2025-01-01T00:00:00Z'
    };
    const result = crud.normalizeStackRunRecord(record);
    assert.equal(result.task_run_id, 10);
    assert.equal(result.status, 'completed');
    assert.equal(result.operation, 'fetch');
  });

  await t.test('builds StackRun query filter', () => {
    const filter = { task_run_id: 10, status: 'pending' };
    const result = crud.buildStackRunQuery(filter);
    assert.equal(result.task_run_id, 10);
    assert.equal(result.status, 'pending');
  });
});

test('CRUDPatterns - TaskFunction Operations', async (t) => {
  const crud = new CRUDPatterns();

  await t.test('builds TaskFunction create payload', () => {
    const input = {
      id: 1,
      name: 'my-task',
      code: 'export async function task() {}'
    };
    const result = crud.buildTaskFunctionCreate(input);
    assert.equal(result.id, 1);
    assert.equal(result.name, 'my-task');
    assert.equal(result.code, 'export async function task() {}');
  });

  await t.test('normalizes TaskFunction record', () => {
    const record = {
      id: 1,
      name: 'my-task',
      code: 'export async function task() {}',
      created_at: '2025-01-01T00:00:00Z'
    };
    const result = crud.normalizeTaskFunctionRecord(record);
    assert.equal(result.name, 'my-task');
    assert.equal(result.code, 'export async function task() {}');
  });
});

test('CRUDPatterns - Keystore Operations', async (t) => {
  const crud = new CRUDPatterns();

  await t.test('builds Keystore create payload', () => {
    const input = { key: 'api-key', value: 'secret' };
    const result = crud.buildKeystoreCreate(input);
    assert.equal(result.key, 'api-key');
    assert.equal(result.value, 'secret');
  });

  await t.test('normalizes Keystore record', () => {
    const record = {
      key: 'api-key',
      value: 'secret',
      created_at: '2025-01-01T00:00:00Z'
    };
    const result = crud.normalizeKeystoreRecord(record);
    assert.equal(result.key, 'api-key');
    assert.equal(result.value, 'secret');
  });
});

test('CRUDPatterns - Filter Operations', async (t) => {
  const crud = new CRUDPatterns();

  await t.test('filters records by criteria', () => {
    const records = [
      { id: 1, status: 'completed' },
      { id: 2, status: 'pending' },
      { id: 3, status: 'completed' }
    ];
    const filter = { status: 'completed' };
    const result = crud.filterRecords(records, filter);
    assert.equal(result.length, 2);
    assert.ok(result.every(r => r.status === 'completed'));
  });

  await t.test('returns all records for empty filter', () => {
    const records = [
      { id: 1, status: 'completed' },
      { id: 2, status: 'pending' }
    ];
    const result = crud.filterRecords(records, {});
    assert.equal(result.length, 2);
  });

  await t.test('merges updates into original record', () => {
    const original = { id: 1, status: 'pending', name: 'task' };
    const updates = { status: 'completed' };
    const result = crud.mergeUpdates(original, updates);
    assert.equal(result.id, 1);
    assert.equal(result.status, 'completed');
    assert.equal(result.name, 'task');
  });

  await t.test('validates filter fields', () => {
    const filter = { status: 'pending', invalid: 'field' };
    const allowedFields = ['status', 'id'];
    const result = Validators.validateFilter(filter, allowedFields);
    assert.equal(result.valid, false);
  });
});

test('Constants - Export Verification', async (t) => {
  await t.test('exports RECORD_TYPES', () => {
    assert.equal(RECORD_TYPES.TASK_RUN, 'task_run');
    assert.equal(RECORD_TYPES.STACK_RUN, 'stack_run');
    assert.equal(RECORD_TYPES.TASK_FUNCTION, 'task_function');
    assert.equal(RECORD_TYPES.KEYSTORE, 'keystore');
  });

  await t.test('exports RECORD_DEFAULTS', () => {
    assert.ok(RECORD_DEFAULTS.task_run);
    assert.ok(RECORD_DEFAULTS.stack_run);
    assert.ok(RECORD_DEFAULTS.task_function);
    assert.ok(RECORD_DEFAULTS.keystore);
  });

  await t.test('defaults include required fields', () => {
    assert.equal(RECORD_DEFAULTS.task_run.status, 'pending');
    assert.deepEqual(RECORD_DEFAULTS.task_run.input, {});
    assert.equal(RECORD_DEFAULTS.stack_run.status, 'pending');
  });
});

test('CRUDPatterns - Generic Record Operations', async (t) => {
  const crud = new CRUDPatterns();

  await t.test('normalizes record by type', () => {
    const record = {
      id: 1,
      task_identifier: 'my-task',
      status: 'completed',
      input: '{"data":"test"}',
      created_at: '2025-01-01T00:00:00Z'
    };
    const result = crud.normalizeRecord(record, 'task_run');
    assert.equal(result.taskName, 'my-task');
    assert.equal(result.status, 'completed');
  });

  await t.test('builds generic filter query', () => {
    const filter = { task_run_id: 10, status: 'pending' };
    const result = crud.buildFilterQuery(filter, 'stack_run');
    assert.equal(result.task_run_id, 10);
    assert.equal(result.status, 'pending');
  });
});

test('CRUDPatterns - Error Handling', async (t) => {
  const crud = new CRUDPatterns();

  await t.test('throws on invalid TaskRun creation', () => {
    const input = { status: 'invalid' };
    assert.throws(() => crud.buildTaskRunCreate(input));
  });

  await t.test('throws on invalid StackRun creation', () => {
    const input = { status: 'invalid' };
    assert.throws(() => crud.buildStackRunCreate(input));
  });

  await t.test('throws on invalid TaskFunction creation', () => {
    const input = { name: 'task' };
    assert.throws(() => crud.buildTaskFunctionCreate(input));
  });

  await t.test('returns empty updates for null input', () => {
    const result = crud.buildTaskRunUpdate(null);
    assert.deepEqual(result, {});
  });

  await t.test('returns empty filter for null input', () => {
    const result = crud.buildTaskRunQuery(null);
    assert.deepEqual(result, {});
  });
});
