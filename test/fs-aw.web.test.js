import * as fsAw from '../dist/index';
import * as assert from 'assert';

describe('fs-aw-web', () => {
    it('should error not exist', async () => {
        try {
            await fsAw.readdir('/test');
        } catch (e) {
            assert.equal(e.toString(), "Error: no such directory '/test/'");
        }
    });

    it('should be a empty dir', async () => {
        const exist = await fsAw.exists('/test');
        assert.equal(exist, false);

        await fsAw.mkdir('/test');
        const dir = await fsAw.readdir('/test');
        const exist1 = await fsAw.exists('/test');
        assert.equal(exist1, true);
        assert.equal(dir.length, 0);
    });


    it('should create a dir', async () => {
        await fsAw.mkdir('/test');
        const exist = await fsAw.exists('/test');
        assert.equal(exist, true);
    });

    it('should create a file', async () => {
        const exist1 = await fsAw.exists('/test/test.txt');
        assert.equal(exist1, false);


        await fsAw.writeFile('/test/test.txt', 'test');
        const exist = await fsAw.exists('/test/test.txt');
        assert.equal(exist, true);

        const content = await fsAw.readFile('/test/test.txt', 'utf8');
        assert.equal(content, 'test');
    });

    it('should can write array buffer', async () => {
        const buffer = new ArrayBuffer(8);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < view.length; i++) {
            view[i] = i * 32;
        }
        await fsAw.writeFile('/test/test.bin', buffer);
        const exist = await fsAw.exists('/test/test.bin');
        assert.equal(exist, true);

        const content = await fsAw.readFile('/test/test.bin');
        assert.equal(content.byteLength, 8);
        const view2 = new Uint8Array(content);
        for (let i = 0; i < view2.length; i++) {
            assert.equal(view2[i], i * 32);
        }
    });

    it('dir list should read a file', async () => {
        await fsAw.writeFile('/list/test.bin', 123);
        const dir = await fsAw.readdir('/list');
        assert.equal(dir.length, 1);
        assert.equal(dir[0], 'test.bin');
    })

    it('withFileTypes should work', async () => {
        await fsAw.writeFile('/qwer/test.bin', 123);
        await fsAw.mkdir('/qwer/test2');
        const dir = await fsAw.readdir('/qwer', { withFileTypes: true });
        assert.equal(dir.length, 2);
        assert.equal(dir[0].path, '/qwer/test.bin');
        assert.equal(dir[0].name, 'test.bin');
        assert.equal(dir[0].isFile(), true);
        assert.equal(dir[0].isDirectory(), false);
        assert.equal(dir[1].path, '/qwer/test2/');
        assert.equal(dir[1].name, 'test2');
        assert.equal(dir[1].isFile(), false);
        assert.equal(dir[1].isDirectory(), true);
    })

    it('should create recursive dir', async () => {
        await fsAw.mkdir('/test/recursive/tt/cc');
        const exist = await fsAw.exists('/test/recursive/');
        assert.equal(exist, true);

        const stat = await fsAw.stat('/test/recursive/');
        assert.equal(stat.isDirectory(), true);

        const dir = await fsAw.readdir('/test/recursive/');
        assert.equal(dir.length, 1);
        assert.equal(dir[0], 'tt');
    });

    it('should remove a file', async () => {
        await fsAw.writeFile('/pc/test.txt', 'test');
        const exist1 = await fsAw.exists('/pc/test.txt');
        assert.equal(exist1, true);
        await fsAw.removeFile('/pc/test.txt');
        const exist = await fsAw.exists('/pc/test.txt');
        assert.equal(exist, false);

        const list = await fsAw.readdir('/pc/');
        assert.equal(list.length, 0);
    });


    it('should remove a dir', async () => {
        await fsAw.rmdir('/');
        const exist = await fsAw.exists('/');
        assert.equal(exist, false);
    })
})