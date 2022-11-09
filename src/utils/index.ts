const invariant = (condition: boolean, errorMsg: string) => {
    if (condition) {
        throw new Error(errorMsg);
    }
}

const asserAbsolutePath = (path: string) => {
    invariant(typeof path !== 'string' || path.length === 0, 'Path must be a non empty string');
    invariant(path.includes('..'), 'path not allow include ..')
};

export {
    invariant,
    asserAbsolutePath,
}