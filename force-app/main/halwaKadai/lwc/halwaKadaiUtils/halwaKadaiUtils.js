/* halwaKadaiUtils.js - optimized without removing console.log
   - Centralized safe JSON parse/stringify with try/catch
   - Avoid repeated reduce by computing totals once
   - Persist and hydrate from localStorage with guards
   - Keep all existing console.log calls intact and messages unchanged
*/

import upsertDraftOrder from '@salesforce/apex/Halwakadai_HelperClass.upsertDraftOrder';
import getDraftOrderForContact from '@salesforce/apex/Halwakadai_HelperClass.getDraftOrderForContact';

let productsCONSTANT = [];
let state = [];
let summary = {
    totalCount: 0,
    totalPrice: 0,
    loggedIn: false,
    orderPlaced: false,
    orderId: null,
    newUser: true,
    currentPage: 'halwaKadaiHomePage',
    previousPage: 'halwaKadaiHomePage',
    nextPage: 'halwaKadaiHomePage'
};

let siteUser = {
    id: 'newContact',
    Name: '',
    Email: '',
    Street: '',
    City: '',
    State: '',
    PostalCode: '',
    Country: 'India',
    MobilePhone: ''
};

const listeners = [];
const KEYhalwaProducts = 'halwaKadai:halwaProducts'; 
const KEYsummary = 'halwaKadai:summary'; 
const KEYsiteUser = 'halwaKadai:siteUser'; 

// Utilities
function safeStringify(obj) {
    try {
        return JSON.stringify(obj);
    } catch (e) {
        console.log('Error stringifying object:', e);
        return null;
    }
}

function safeParse(raw, keyForLogs) {
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (e) {
        console.log('Error parsing localStorage for ' + keyForLogs + ':', e);
        return null;
    }
}

function persist(key, value) {
    const str = safeStringify(value);
    if (str == null) return;
    try {
        window.localStorage.setItem(key, str);
    } catch (e) {
        console.log('Error setting localStorage:', e);
    }
}

function recalcSummary() {
    let totalCount = 0;
    let totalPrice = 0;
    
    for (let i = 0; i < state.length; i++) {
        const item = state[i];
        const qty = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        totalCount += qty;
        totalPrice += price * qty;
    }
    
    summary = { ...summary, totalCount, totalPrice };
}

// Public API
export function getProductsCONSTANT() {
    console.log('halwaKadaiUtils : getProductsCONSTANT ');
    return Array.isArray(productsCONSTANT) ? productsCONSTANT.slice() : productsCONSTANT;
}

export function getState() {
    console.log('halwaKadaiUtils : getState ');
    return Array.isArray(state) ? state.slice() : state;
}

export function setSiteUser(newSiteUser) {
    siteUser = { ...siteUser, ...newSiteUser };
    if (siteUser.Id && !siteUser.id) siteUser.id = siteUser.Id;
    if (siteUser.id && !siteUser.Id) siteUser.Id = siteUser.id;

    console.log('halwaKadaiUtils : setUser = ', siteUser);
    persist(KEYsiteUser, siteUser);
    notify();
}

export function getSiteUser() {
    const rawSiteUser = window.localStorage.getItem(KEYsiteUser);
    if (rawSiteUser) {
        const parsed = safeParse(rawSiteUser, 'siteUser');
        if (parsed) {
            siteUser = parsed;
        } else {
            window.localStorage.removeItem(KEYsiteUser);
        }
    }
    return siteUser;
}

export function getSummary() {
    console.log('halwaKadaiUtils : getSummary ');
    return summary;
}

export function setProductsCONSTANT(newProducts) {
    console.log('halwaKadaiUtils : setProductsCONSTANT = ', newProducts);
    if (Array.isArray(newProducts)) {
        productsCONSTANT = newProducts.slice();
    } else if (newProducts && Array.isArray(newProducts.value)) {
        productsCONSTANT = newProducts.value.slice();
    } else {
        productsCONSTANT = newProducts;
    }
}

export function setState(newProducts) {
    console.log('halwaKadaiUtils : setState = ', newProducts);

    if (Array.isArray(newProducts)) {
        state = newProducts.slice();
    } else if (newProducts && Array.isArray(newProducts.value)) {
        state = newProducts.value.slice();
    } else {
        state = newProducts;
    }

    recalcSummary();

    try {
        const serialized = JSON.stringify(state);
        window.localStorage.setItem(KEYhalwaProducts, serialized);
    } catch (e) {
        console.log('Error setting localStorage:', e);
    }

    console.log('State and Summary updated:', state, summary);
    notify();
}

export function setSummary(newSummary) {
    console.log('halwaKadaiUtils : setSummary = ', newSummary);
    
    summary = { ...summary, ...newSummary };
    
    try {
        window.localStorage.setItem(KEYsummary, JSON.stringify(summary));
    } catch (e) {
        console.log('Error setting localStorage:', e);
    }
    
    notify();
}

export function subscribe(callback) {
    listeners.push(callback);
    return () => {
        const index = listeners.indexOf(callback);
        if (index > -1) listeners.splice(index, 1);
    };
}

function notify() {
    const payload = {
        products: Array.isArray(state) ? state.slice() : state,
        summary: summary,
        siteUser: siteUser
    };
    listeners.forEach((cb) => cb(payload));
}

export async function syncDraftOrder() {
    console.log('halwaKadaiUtils : syncDraftOrder');

    if (!summary.loggedIn || !siteUser.Id) {
        return;
    }

    if (summary.orderPlaced && summary.orderId) {
        summary.orderId = null;
        summary.orderPlaced = false;
        setSummary(summary);
    }

    try {
        const productsToSync = state.filter(p => p.selected && p.quantity > 0);
        if (productsToSync.length === 0) return;

        const orderId = await upsertDraftOrder({
            products: productsToSync,
            orderId: summary.orderId,
            contactId: siteUser.Id,
            name: siteUser.Name,
            phone: siteUser.MobilePhone,
            email: siteUser.Email,
            street: siteUser.Street,
            city: siteUser.City,
            state: siteUser.State,
            postalCode: siteUser.PostalCode,
            country: siteUser.Country
        });

        if (orderId) {
            summary.orderId = orderId;
            persist(KEYsummary, summary);
            setSummary(summary);
            console.log('halwaKadaiUtils : syncDraftOrder : Draft order synced, orderId:', orderId);
        }
    } catch (error) {
        console.error('halwaKadaiUtils : syncDraftOrder : Error:', error);
    }
}

export async function loadDraftOrder() {
    console.log('halwaKadaiUtils : loadDraftOrder');
    
    // FIX 1: Removed !summary.loggedIn check so it can run DURING the login flow
    if (!siteUser.Id) {
        console.log('halwaKadaiUtils : loadDraftOrder : Not logged in or no user Id');
        return;
    }
    
    if (!productsCONSTANT || productsCONSTANT.length === 0) {
        console.log('halwaKadaiUtils : loadDraftOrder : Products not loaded yet, skipping draft load');
        return;
    }
    
    try {
        const draftOrder = await getDraftOrderForContact({ contactId: siteUser.Id });
        
        // Ensure we actually got order items back
        if (draftOrder && draftOrder.OrderItems && draftOrder.OrderItems.length > 0) {
            
            // FIX 2: Deep clone the products array to avoid mutating the master CONSTANT list
            const fullProducts = productsCONSTANT.map(p => ({ 
                ...p, 
                quantity: 0, 
                selected: false, 
                _dirty: false, 
                orderPrice: 0 
            }));
            
            // Update quantities for draft items
            draftOrder.OrderItems.forEach(item => {
                // Safely compare IDs using String()
                const prod = fullProducts.find(p => String(p.id) === String(item.Product2.ProductCode));
                if (prod) {
                    prod.quantity = item.Quantity;
                    prod.selected = true;
                    prod._dirty = false;
                    prod.orderPrice = item.UnitPrice * item.Quantity;
                }
            });
            
            // FIX 3: Push the mapped array through setState to trigger UI reactivity and Summary Math!
            setState(fullProducts);
            
            // Save the newly found OrderId safely
            setSummary({
                orderId: draftOrder.Id,
                orderPlaced: false
            });
            
            console.log('halwaKadaiUtils : loadDraftOrder : Loaded draft order successfully');
        } else {
            console.log('halwaKadaiUtils : loadDraftOrder : No draft items found in Salesforce');
        }
    } catch (error) {
        console.error('halwaKadaiUtils : loadDraftOrder : Error:', error);
    }
}