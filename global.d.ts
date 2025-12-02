import * as rnxModule from './index';

export as namespace rnx;
export = rnxModule;

declare global {
    const rnx: typeof rnxModule;
}
