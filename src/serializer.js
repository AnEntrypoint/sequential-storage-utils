import { SERIALIZABLE_FIELDS, NULL_SAFE_FIELDS } from './constants.js';
import { nowISO } from 'tasker-utils/timestamps';

export class Serializer {
  serializeObject(obj) {
    if (obj === null || obj === undefined) {
      return null;
    }
    if (typeof obj !== 'object') {
      return obj;
    }
    return JSON.stringify(obj);
  }

  deserializeObject(str) {
    if (str === null || str === undefined) {
      return null;
    }
    if (typeof str !== 'string') {
      return str;
    }
    try {
      return JSON.parse(str);
    } catch (e) {
      return str;
    }
  }

  serializeRecord(record, recordType = null) {
    if (!record || typeof record !== 'object') {
      return record;
    }

    const serialized = { ...record };

    for (const field of SERIALIZABLE_FIELDS) {
      if (field in serialized) {
        const value = serialized[field];
        if (value !== null && value !== undefined) {
          serialized[field] = this.serializeObject(value);
        }
      }
    }

    return serialized;
  }

  deserializeRecord(record, recordType = null) {
    if (!record || typeof record !== 'object') {
      return record;
    }

    const deserialized = { ...record };

    for (const field of SERIALIZABLE_FIELDS) {
      if (field in deserialized) {
        const value = deserialized[field];
        if (value !== null && value !== undefined) {
          deserialized[field] = this.deserializeObject(value);
        }
      }
    }

    return deserialized;
  }

  toJSON(obj, pretty = false) {
    if (obj === null || obj === undefined) {
      return pretty ? 'null' : JSON.stringify(null);
    }
    return pretty ? JSON.stringify(obj, null, 2) : JSON.stringify(obj);
  }

  fromJSON(str) {
    if (!str || typeof str !== 'string') {
      return str;
    }
    try {
      return JSON.parse(str);
    } catch (e) {
      return null;
    }
  }

  prepareForStorage(record, recordType = null) {
    if (!record || typeof record !== 'object') {
      return record;
    }

    const prepared = { ...record };

    for (const field of SERIALIZABLE_FIELDS) {
      if (field in prepared) {
        const value = prepared[field];
        if (value !== null && value !== undefined && typeof value === 'object') {
          prepared[field] = JSON.stringify(value);
        }
      }
    }

    if (!prepared.createdAt && !prepared.created_at) {
      prepared.createdAt = nowISO();
    }
    if (!prepared.updatedAt && !prepared.updated_at) {
      prepared.updatedAt = nowISO();
    }

    return prepared;
  }

  loadFromStorage(record, recordType = null) {
    if (!record || typeof record !== 'object') {
      return record;
    }

    const loaded = { ...record };

    for (const field of SERIALIZABLE_FIELDS) {
      if (field in loaded) {
        const value = loaded[field];
        if (value !== null && value !== undefined && typeof value === 'string') {
          try {
            loaded[field] = JSON.parse(value);
          } catch (e) {
            loaded[field] = value;
          }
        }
      }
    }

    return loaded;
  }
}
