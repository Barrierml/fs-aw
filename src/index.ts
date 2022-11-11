import { asserAbsolutePath } from './utils';
import * as path from './utils/path'

const DB_NAME = window.location.host + '_filesystem';
const OS_NAME = 'files';
const DIR_IDX = 'dir';

const enum InitOSType {
  READONLY = 'readonly',
  READWRITE = 'readwrite',
}

const enum OSObjectType {
  file = 'file',
  directory = 'directory',
}

export const enum EncodingType {
  utf8 = 'utf8',
  'utf-8' = 'utf-8',
  base64 = 'base64',
}

export type EncodingStringType = 'utf8' | 'utf-8' | 'base64';

interface OSObject<T = any> {
  type: OSObjectType;
  name: string;
  path: string;
  data: T;
}

class DirectoryEntry {
  public path: string;
  public name: string;
  public dir: string;
  public type: OSObjectType;

  constructor(fullPath: string, type: OSObjectType) {
    this.path = fullPath;
    this.name = path.basename(fullPath);
    this.dir = path.dirname(fullPath);
    this.type = type;
  }

  isFile() {
    return this.type === OSObjectType.file;
  }

  isDirectory() {
    return this.type === OSObjectType.directory;
  }
}

function ab2str(buf: ArrayBuffer) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}
function str2ab(str: string) {
  const buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  const bufView = new Uint16Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

const init = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const req = window.indexedDB.open(DB_NAME, 1);

    req.onupgradeneeded = function (e: any) {
      const db = e.target.result;

      const objectStore = db.createObjectStore(OS_NAME, { keyPath: 'path' });
      objectStore.createIndex(DIR_IDX, 'dir', { unique: false });
    };

    req.onsuccess = function (e: any) {
      resolve(e.target.result);
    };

    req.onerror = reject;
  });
}

const initOS = async (type: InitOSType) => {
  const db = await init();
  const trans = db.transaction([OS_NAME], type);
  return trans.objectStore(OS_NAME);
}

const readFrom = async (fileName: string): Promise<OSObject> => {
  const os = await initOS(InitOSType.READONLY);
  const req = os.get(fileName);
  return new Promise((resolve, reject) => {
    req.onsuccess = function (e: any) {
      resolve(e.target.result);
    }
    req.onerror = reject;
  });
};

const readFile = async (fileName: string, encoding?: EncodingStringType) => {
  asserAbsolutePath(fileName);
  let data = await readFrom(fileName);
  const content = data.data;
  const isBuffer = content instanceof ArrayBuffer;
  switch (encoding) {
    case EncodingType.utf8:
    case EncodingType['utf-8']:
      return isBuffer ? ab2str(content) : String(content);
    default:
      return isBuffer ? content : str2ab(content.toString());
  }
}

const writeFile = async (fileName: string, data: any): Promise<boolean> => {
  asserAbsolutePath(fileName);
  const dir = path.withTrailingSlash(path.dirname(fileName));
  // auto mkdir
  const dirStat = await stat(dir);
  if (!(dirStat && dirStat.isDirectory())) {
    await mkdir(dir);
  }
  const os = await initOS(InitOSType.READWRITE);
  const req = os.put({
    "path": fileName,
    "dir": dir, 
    "type": OSObjectType.file,
    "name": path.basename(fileName),
    "data": data
  });
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(true);
    req.onerror = reject;
  });
};

const removeFile = async (fileName: string): Promise<boolean> => {
  asserAbsolutePath(fileName);
  const os = await initOS(InitOSType.READWRITE);
  const req = os.delete(fileName);
  return new Promise((resolve, reject) => {
    req.onsuccess = function () {
      resolve(true);
    }
    req.onerror = reject;
  });
};

const readdir = async (directoryName: string, options?: { withFileTypes?: boolean }): Promise<BasicStat[] | string[]> => {
  asserAbsolutePath(directoryName);
  const dir = path.withTrailingSlash(directoryName);

  const dirStat = await stat(dir);
  if (!(dirStat && dirStat.isDirectory())) {
    throw new Error(`no such directory '${dir}'`);
  }

  const os = await initOS(InitOSType.READONLY);
  const idx = os.index(DIR_IDX);
  const range = window.IDBKeyRange.only(dir);
  const req = idx.openCursor(range);
  return new Promise((resolve, reject) => {
    const results: DirectoryEntry[] = [];
    req.onerror = reject;
    req.onsuccess = (e: any) => {
      const cursor = e.target.result;
      if (cursor) {
        const value = cursor.value;
        if (options?.withFileTypes) {
          results.push(new DirectoryEntry(value.path, value.type));
        } else {
          results.push(value.name);
        }
        cursor.continue();
      } else {
        resolve(results);
      }
    }
  });
};

export interface BasicStat {
  isFile(): boolean;
  isDirectory(): boolean;
}

export interface Stat extends BasicStat {
    /** 文件大小，单位：B */
    size: number;
    /** 文件最近一次被存取或被执行的时间 */
    lastAccessedTime: number;
    /** 文件最后一次被修改的时间 */
    lastModifiedTime: number;
}


const stat = async (filePath: string): Promise<BasicStat | null> => {
  asserAbsolutePath(filePath);
  const os = await initOS(InitOSType.READONLY);
  const req = os.get(filePath);
  return new Promise(function (resolve, reject) {
    req.onerror = reject;
    req.onsuccess = function (e: any) {
      const data = e.target.result;
      if (!data) {
        resolve(null);
      } else {
        resolve(new DirectoryEntry(data.path, data.type));
      }
    };
  });
}


const mkdir = async (fullPath: string): Promise<boolean> => {
  asserAbsolutePath(fullPath);
  const dir = path.withTrailingSlash(fullPath);

  // loop mkdir
  if (dir !== '/') {
    let parentDir = path.withTrailingSlash(path.dirname(dir));
    const parentDirStat = await stat(parentDir);
    if (!(parentDirStat && parentDirStat.isDirectory())) {
      await mkdir(parentDir);
    }
  }

  const os = await initOS(InitOSType.READWRITE);
  const req = os.put({
    "path": dir,
    "dir": path.withTrailingSlash(path.dirname(dir)),
    "type": OSObjectType.directory,
    "name": path.basename(dir),
  });

  return new Promise(function (resolve, reject) {
    req.onerror = reject;
    req.onsuccess = function () {
      resolve(true);
    };
  });
};

const rmdir = async (fullPath: string): Promise<boolean> => {
  asserAbsolutePath(fullPath);
  const delList = await readdir(fullPath, { withFileTypes: true });
  if (!delList || !delList.length) {
    return removeFile(fullPath);
  }

  const tasks = delList.map(async (file) => {
    if (file.path === path.withTrailingSlash(fullPath)) {
      return;
    }
    if (file.isDirectory()) {
      return rmdir(path.withTrailingSlash(file.path));
    } else {
      return removeFile(file.path);
    }
  })

  return Promise.all(tasks).then(() => removeFile(fullPath));
};

const exists = async (filePath: string): Promise<boolean> => {
  asserAbsolutePath(filePath);
  const fileExists = await stat(filePath);
  return (!!fileExists || !!(await stat(path.withTrailingSlash(filePath))));
}


export {
  readFile,
  writeFile,
  removeFile,
  readdir,
  mkdir,
  rmdir,
  exists,
  stat,
};