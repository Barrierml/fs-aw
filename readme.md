# fs-aw

Multiterminal fs abstraction layer
由`Typescript`编写的一个多平台文件系统抽象层，帮助你在不同的平台，使用同一套逻辑操作文件系统，默认支持`Tree Shaking`

使用场景
1. 需要在 `H5` 或 `小程序` 或 `WEEX` 内存储文件
2. 在使用`Taro` 或者 `uniapp` 开发多平台跨端应用时，碰到一些大文件(大于5MB)的缓存需求，但因为web、小程序、weex等平台的文件操作API，或者是根本没有相关的文件缓存API，一切都需要需要重新设计实现，`fs-aw` 提供了一套行为完全一致的文件系统，借鉴 `node` 的 `fs` 模块实现的前端工具库，帮助你快速的在不同的平台拥有一个文件管理系统。
## 快速开始

### 安装

```shell
npm install fs-aw
```


> ⚠️注意：`fs-aw` 因为跨平台统一api的原因，只支持异步调用！


> `fs-aw`设计为按需引入，请根据你当前的平台自行选择抽象层，所有平台的API行为均一致
### 在H5项目中使用
```js
// 主文件默认导出为web平台
import { webFs as fs } from 'fs-aw';
const main = async () => {
    await fs.writeFile('/test/test.txt', 123);
    const content = await fs.readFile('/test/test.txt', 'utf8');
    console.log(content);
}
main();
// 123
```

### 在小程序项目中使用
```js
// 引入小程序专用抽象层
import { miniFs as fs } from 'fs-aw';
const main = async () => {
    await fs.writeFile('/test/test.txt', 123);
    const content = await fs.readFile('/test/test.txt', 'utf8');
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
| 百度小程序  | ✅ |❌|`FileSystemManager`|
| ReactNative|❌| ❌| `暂无`|
| Weex | ❌| ❌ | `localStorage`|
| node  | ❌ |❌|`fs`模块|


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