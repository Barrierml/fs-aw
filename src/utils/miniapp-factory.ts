// @ts-nocheck
const getCurrentFactory = (): [any, string] => {
    let factory: any;
    let baseUrl: string = '';
    if (typeof wx !== 'undefined') {
        factory = wx;
        baseUrl = wx.env.USER_DATA_PATH;
    } else if (typeof my !== 'undefined') {
        factory = my;
        baseUrl = my.env.USER_DATA_PATH;
    } else if (typeof swan !== 'undefined') {
        factory = swan;
    } else if (typeof tt !== 'undefined') {
        factory = tt;
    } else if (typeof qq !== 'undefined') {
        factory = qq;
    } else if (typeof dd !== 'undefined') {
        factory = dd;
    }
    return [factory, baseUrl];
}

export { getCurrentFactory }