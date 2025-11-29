import { createReactiveState } from './utils/createReactiveState.js';

try {
    const state = createReactiveState({
        items: [1, 2, 3]
    });

    console.log('Attempting to spread array...');
    const spread = [...state.items];
    console.log('Spread successful:', spread);
} catch (error) {
    console.error('Caught expected error:', error);
}
