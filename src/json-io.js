import { promises as fs, existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { dirname } from 'path';

const JSON_OPTIONS = {
  indent: 2,
  encoding: 'utf8'
};

export const JsonIO = {
  async read(filePath, defaultValue = null) {
    try {
      const content = await fs.readFile(filePath, JSON_OPTIONS.encoding);
      return JSON.parse(content);
    } catch (e) {
      if (e.code === 'ENOENT') {
        return defaultValue;
      }
      throw e;
    }
  },

  async write(filePath, data, options = {}) {
    const dir = dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    const content = JSON.stringify(data, null, options.indent || JSON_OPTIONS.indent);
    await fs.writeFile(filePath, content, options.encoding || JSON_OPTIONS.encoding);
  },

  readSync(filePath, defaultValue = null) {
    try {
      const content = readFileSync(filePath, JSON_OPTIONS.encoding);
      return JSON.parse(content);
    } catch (e) {
      if (e.code === 'ENOENT') {
        return defaultValue;
      }
      throw e;
    }
  },

  writeSync(filePath, data, options = {}) {
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const content = JSON.stringify(data, null, options.indent || JSON_OPTIONS.indent);
    writeFileSync(filePath, content, options.encoding || JSON_OPTIONS.encoding);
  }
};
