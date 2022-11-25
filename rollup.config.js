// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import alias from '@rollup/plugin-alias';
import { nodeResolve } from '@rollup/plugin-node-resolve'
const customResolver = nodeResolve({ extensions: ['.mjs', '.js', '.jsx', '.json', '.sass', '.scss', '.css'] });


const plugins = [
    typescript(),
    alias({
        customResolver
    }),
];
const config = [
    {
        input: './src/index.ts',
        output: [
            {
                file: './dist/index.js',
                format: 'cjs',
            },
            {
                file: './dist/index.es.js',
                format: 'es',
            },
        ]
    },
];

const configs = config.map((item) => {
    return {
        ...item,
        plugins,
    };
});

export default configs;
