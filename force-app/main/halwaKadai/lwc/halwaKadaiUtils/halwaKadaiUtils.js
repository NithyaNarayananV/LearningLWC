// halwaKadaiUtils.js
let state = [];
let summary = { totalCount: 0, totalPrice: 0 };
const listeners = [];

export function getState() {
    console.log('halwaKadaiUtils : getState ');
    return [...state];
}

export function getSummary() {
    console.log('halwaKadaiUtils : getSummary ');
    return summary;
}

export function setState(newProducts) {
    console.log('halwaKadaiUtils : setState ');

    // 1. Update the Products Array
    if (Array.isArray(newProducts)) {
        state = [...newProducts];
    } else if (newProducts && Array.isArray(newProducts.value)) {
        state = [...newProducts.value];
    } else {
        state = newProducts;
    }

    // 2. Automatically sync the Summary based on the new products
    summary = {
        totalCount:  state.reduce((total, item) => {
            // Ensure we handle price and quantity correctly
            const qty = Number(item.quantity) || 0;
            return total +  qty;
        }, 0),
        totalPrice: state.reduce((total, item) => {
            // Ensure we handle price and quantity correctly
            const price = Number(item.price) || 0;
            const qty = Number(item.quantity) || 0;
            return total + (price * qty);
        }, 0)
    };
    console.log('State and Summary updated:', state, summary);

    notify();
}

export function subscribe(callback) {
    listeners.push(callback);
    // Return unsubscribe function to prevent memory leaks
    return () => {
        const index = listeners.indexOf(callback);
        if (index > -1) listeners.splice(index, 1);
    };
}

function notify() {
    // We send BOTH variables inside one object
    listeners.forEach(cb => cb({
        products: state,
        summary: summary
    }));
}