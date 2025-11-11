export const RECORD_TYPES = {
  TASK_RUN: 'task_run',
  STACK_RUN: 'stack_run',
  TASK_FUNCTION: 'task_function',
  KEYSTORE: 'keystore'
};

export const RECORD_DEFAULTS = {
  task_run: {
    status: 'pending',
    input: {},
    output: null,
    error: null,
    startedAt: null,
    completedAt: null
  },
  stack_run: {
    parent_stack_run_id: null,
    operation: null,
    status: 'pending',
    input: {},
    output: null,
    error: null
  },
  task_function: {
    code: null,
    metadata: {}
  },
  keystore: {
    value: null,
    metadata: {}
  }
};

export const TIMESTAMP_FIELDS = [
  'createdAt',
  'updatedAt',
  'startedAt',
  'completedAt',
  'suspendedAt',
  'created_at',
  'updated_at'
];

export const NULL_SAFE_FIELDS = [
  'output',
  'error',
  'result',
  'parent_stack_run_id',
  'completedAt',
  'suspendedAt',
  'resume_payload'
];

export const SERIALIZABLE_FIELDS = [
  'input',
  'output',
  'error',
  'result',
  'metadata',
  'resume_payload'
];
