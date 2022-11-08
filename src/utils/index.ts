const asserAbsolutePath = (path: string) => {
    if (typeof path !== 'string') {
        throw new Error('path must be a string');
    }
    if (path[0] !== '/') {
        throw new Error('Path must be absolute');
    }
};

export {
    asserAbsolutePath,
}