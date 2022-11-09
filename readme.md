# fs-aw

Multiterminal fs abstraction layer
由`Typescript`编写的一个多平台文件系统抽象层，帮助你在不同的平台，使用同一套逻辑操作文件系统

## 快速开始

### 安装

```shell
npm install fs-aw
```
> ⚠️注意：fs-aw 因为跨平台统一api的原因，只支持异步调用！
### 在H5项目中使用
```js
import fsAw from 'fs-aw';
const main = async () => {
    await fsAw.writeFile('/test/test.txt', 123);
    const content = await fsAw.readFile('/test/test.txt', 'utf8');
    console.log(content);
}
main();
// 123
```

### 在小程序项目中使用
```js
// 为了保证引入项目最小的体积，可以根据不同的平台选用不同的抽象层，但是所有平台的API行为都是完全相同的
import fsAw from 'fs-aw/index.miniapp';
const main = async () => {
    await fsAw.writeFile('/test/test.txt', 123);
    const content = await fsAw.readFile('/test/test.txt', 'utf8');
    console.log(content);
}
main();
// 123
```


## 支持平台

|  平台   | 是否支持 | 测试通过 |实现方式|
|  ----  | ----  |----|----|
| web平台  | ✅ |✅|`IndexDB`|
| 支付宝小程序  | ✅ |✅|`FileSystemManager`|
| 微信小程序  | ✅ |❌|`FileSystemManager`|
| 字节小程序  | ✅ |❌|`FileSystemManager`|
| 小程序  | ✅ |❌|`FileSystemManager`|
| node  | ❌ |❌|`fs`模块|
| Weex | ❌| ❌ | `localStorage`|

> 还有很多常用的JS平台与常用的API没有实现，欢迎大家共建

## API

```ts
// 读取文件
declare const readFile: (fileName: string, encoding?: EncodingType) => Promise<any>;
// 写入文件(默认递归创建文件夹)
declare const writeFile: (fileName: string, data: any) => Promise<boolean>;
// 删除文件
declare const removeFile: (fileName: string) => Promise<boolean>;
// 读取文件夹
declare const readdir: (directoryName: string, options?: {
    withFileTypes?: boolean;
}) => Promise<DirectoryEntry[]>;
interface Stat {
    isFile(): boolean;
    isDirectory(): boolean;
}
// 获取文件状态
declare const stat: (filePath: string) => Promise<Stat | null>;
// 创建文件夹（默认递归创建）
declare const mkdir: (fullPath: string) => Promise<boolean>;
// 删除文件夹（默认递归删除）
declare const rmdir: (fullPath: string) => any;
// 判断路径是否存在 (同名文件与文件夹均会存在)
declare const exists: (filePath: string) => Promise<boolean>;
```


## Test
所有API都通过对应平台测试
### web
```shell
# install
pnpm install

# build
pnpm run build

# test
pnpm run test
```

### alipay-miniapp
注意！部分版本的支付宝小程序开发者工具文件操作系统api不完全，请在真机调试内测试
```shell
1. 使用支付宝小程序开发者工具打开 `test/alipay-test` 文件夹
2. 使用真机调试编译
3. 编译完成后扫码观察控制台所有测试用例通过
```