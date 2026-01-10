// sharedState.js
// Store the shared products array directly as `state` (array)
let state = [];
const listeners = [];

export function getState() {
    return state;
}

export function setState(newState) {
    console.log('setState');
    // Accept either an array or an object like { value: [...] }
    if (Array.isArray(newState)) {
        state = [...newState];
    } else if (newState && Array.isArray(newState.value)) {
        state = [...newState.value];
    } else {
        state = newState;
    }
    notify();
}

export function subscribe(callback) {
    listeners.push(callback);
}

function notify() {
    listeners.forEach(cb => cb(state));
}
