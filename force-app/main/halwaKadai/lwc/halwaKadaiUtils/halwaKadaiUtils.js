// halwaKadaiUtils.js
let productsCONSTANT = [];
let state = [];
let summary = { totalCount: 0, totalPrice: 0 , loggedIn: false, orderPlaced: false, newUser: true};
let siteUser = {id:'newContact', Name : '', Email: '', Street: '', City: '', State: '', PostalCode: '', Country: 'India', MobilePhone: ''};

const listeners = [];
const KEYhalwaProducts = 'halwaKadai:halwaProducts'; // namespace your key to avoid collisions
const KEYsummary = 'halwaKadai:summary'; // namespace your key to avoid collisions
const KEYsiteUser = 'halwaKadai:siteUser'; // namespace your key to avoid collisions

export function getProductsCONSTANT() {
    console.log('halwaKadaiUtils : getProductsCONSTANT ');
    return [...productsCONSTANT];
}

export function getState() {
    console.log('halwaKadaiUtils : getState ');
    return [...state];
}

export function setSiteUser(newSiteUser) {
    siteUser = { ...siteUser, ...newSiteUser };
    console.log('halwaKadaiUtils : setUser = ', siteUser);
    window.localStorage.setItem(KEYsiteUser, JSON.stringify(siteUser));
    /*
    if(siteUser.id !== 'newContact')
        summary = { ...summary, loggedIn: true };
    else
        summary = { ...summary, loggedIn: false };
    */
    notify();
}

export function getSiteUser() {
        const rawSiteUser = window.localStorage.getItem(KEYsiteUser);
        if (rawSiteUser) {
            try {
                siteUser = JSON.parse(rawSiteUser);
                console.log('halwaKadaiUtils : getSiteUser : window.localStorage : rawSiteUser = ' + rawSiteUser);
            } catch (e) {
                window.localStorage.removeItem(KEYsiteUser);
                console.log('Error parsing localStorage for siteUser:', e);
                console.log('ERROR : rawSiteUser = ' + rawSiteUser);
            }
        }
    console.log('halwaKadaiUtils : getSiteUser = ', siteUser);
    return siteUser;
}

export function getSummary() {
    console.log('halwaKadaiUtils : getSummary ');
    return summary;
}
export function setProductsCONSTANT(newProducts) {
    console.log('halwaKadaiUtils : setProductsCONSTANT = ', newProducts);
    if (Array.isArray(newProducts)) {
        productsCONSTANT = [...newProducts];
    } else if (newProducts && Array.isArray(newProducts.value)) {
        productsCONSTANT = [...newProducts.value];
    } else {
        productsCONSTANT = newProducts;
    }    console.log('halwaKadaiUtils : setProductsCONSTANT : productsCONSTANT = ', productsCONSTANT);
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
    try {
        window.localStorage.setItem(KEYhalwaProducts, JSON.stringify(state));
        console.log('halwaKadaiUtils : setState : state = ', state);
        console.log('window.localStorage.setItem(KEYhalwaProducts, JSON.stringify(state));');
    } catch (e) {
        console.log('Error setting localStorage:', e);
        console.log('ERROR : window.localStorage.setItem(KEYhalwaProducts, JSON.stringify(state));');
    }
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
    try {
        window.localStorage.setItem(KEYsummary, JSON.stringify(summary));
        console.log('halwaKadaiUtils : setSummary : summary = ', summary);
        console.log('window.localStorage.setItem(KEYsummary, JSON.stringify(summary));');
    } catch (e) {
        console.log('Error setting localStorage:', e);
        console.log('ERROR : window.localStorage.setItem(KEYsummary, JSON.stringify(summary));'); 
    }
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
        summary: summary,
        siteUser: siteUser
    }));
}