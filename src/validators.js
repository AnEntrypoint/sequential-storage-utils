export class Validators {
  static isValidUuid(str) {
    if (typeof str !== 'string') {
      return false;
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  static isValidEmail(str) {
    if (typeof str !== 'string') {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
  }

  static validateRequired(obj, fields) {
    if (!obj || typeof obj !== 'object') {
      return { valid: false, errors: ['Object is required'] };
    }

    const errors = [];
    for (const field of fields) {
      if (!(field in obj) || obj[field] === null || obj[field] === undefined) {
        errors.push(`Field '${field}' is required`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateTaskRun(taskRun) {
    const errors = [];

    if (!taskRun || typeof taskRun !== 'object') {
      return { valid: false, errors: ['TaskRun must be an object'] };
    }

    if (!('id' in taskRun) || !taskRun.id) {
      errors.push('TaskRun.id is required');
    }

    if (!('taskName' in taskRun) && !('task_identifier' in taskRun)) {
      errors.push('TaskRun must have taskName or task_identifier');
    }

    if ('status' in taskRun && taskRun.status) {
      const validStatuses = ['pending', 'running', 'completed', 'failed', 'suspended'];
      if (!validStatuses.includes(taskRun.status)) {
        errors.push(`TaskRun.status must be one of: ${validStatuses.join(', ')}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateStackRun(stackRun) {
    const errors = [];

    if (!stackRun || typeof stackRun !== 'object') {
      return { valid: false, errors: ['StackRun must be an object'] };
    }

    if (!('id' in stackRun) || !stackRun.id) {
      errors.push('StackRun.id is required');
    }

    if (!('task_run_id' in stackRun) || !stackRun.task_run_id) {
      errors.push('StackRun.task_run_id is required');
    }

    if ('status' in stackRun && stackRun.status) {
      const validStatuses = ['pending', 'running', 'completed', 'failed', 'suspended'];
      if (!validStatuses.includes(stackRun.status)) {
        errors.push(`StackRun.status must be one of: ${validStatuses.join(', ')}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateTaskFunction(taskFunction) {
    const errors = [];

    if (!taskFunction || typeof taskFunction !== 'object') {
      return { valid: false, errors: ['TaskFunction must be an object'] };
    }

    if (!('id' in taskFunction) || !taskFunction.id) {
      errors.push('TaskFunction.id is required');
    }

    if (!('name' in taskFunction) || !taskFunction.name) {
      errors.push('TaskFunction.name is required');
    }

    if (!('code' in taskFunction) || !taskFunction.code) {
      errors.push('TaskFunction.code is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateKeystore(keystoreEntry) {
    const errors = [];

    if (!keystoreEntry || typeof keystoreEntry !== 'object') {
      return { valid: false, errors: ['Keystore entry must be an object'] };
    }

    if (!('key' in keystoreEntry) || !keystoreEntry.key) {
      errors.push('Keystore.key is required');
    }

    if (!('value' in keystoreEntry) && keystoreEntry.value === null) {
      errors.push('Keystore.value is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateFilter(filter, allowedFields) {
    const errors = [];

    if (!filter || typeof filter !== 'object') {
      return { valid: true, errors: [] };
    }

    for (const key of Object.keys(filter)) {
      if (allowedFields && !allowedFields.includes(key)) {
        errors.push(`Filter field '${key}' is not allowed`);
      }

      const value = filter[key];
      if (value !== null && value !== undefined && typeof value === 'object') {
        errors.push(`Filter value for '${key}' must be a primitive type, not object`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static isValidTimestamp(str) {
    if (typeof str !== 'string') {
      return false;
    }
    try {
      new Date(str);
      return !isNaN(new Date(str).getTime());
    } catch (e) {
      return false;
    }
  }

  static isValidId(id) {
    if (typeof id === 'number') {
      return id > 0;
    }
    if (typeof id === 'string') {
      return this.isValidUuid(id);
    }
    return false;
  }
}
