// halwaKadaiUtils.js
let state = [];
let summary = { totalCount: 0, totalPrice: 0 , loggedIn: false};
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
    console.log('halwaKadaiUtils : setState = ',newProducts);


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
        ...summary, // keep loggedIn and any other flags
        totalCount: state.reduce((total, item) => {
            const qty = Number(item.quantity) || 0;
            return total + qty;
        }, 0),
        totalPrice: state.reduce((total, item) => {
            const price = Number(item.price) || 0;
            const qty = Number(item.quantity) || 0;
            return total + (price * qty);
        }, 0)
    };

    console.log('State and Summary updated:', state, summary);

    notify();
}
export function setSummary(newSummary) { 
    console.log('halwaKadaiUtils : setSummary = ', newSummary); 
    console.log('halwaKadaiUtils : setSummary : totalCount  = ', newSummary.totalCount); 
    console.log('halwaKadaiUtils : setSummary : totalPrice = ', newSummary.totalPrice); 
    console.log('halwaKadaiUtils : setSummary : loggedIn = ', newSummary.loggedIn); 
    // Merge new summary values into existing summary 
    summary = { ...summary, ...newSummary }; 
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