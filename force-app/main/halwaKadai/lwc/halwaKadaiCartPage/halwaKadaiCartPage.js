import { LightningElement, wire } from 'lwc';
import { subscribe, unsubscribe, publish, MessageContext } from 'lightning/messageService';
import PRODUCTS_LMS from '@salesforce/messageChannel/halwaKadaiLMS__c';
import { getState, setState, getSummary, subscribe as stateSubscribe, setSummary } from 'c/halwaKadaiUtils';

export default class HalwaKadaiCartPage extends LightningElement {
    // Single wire declaration (remove duplicate later in file)
    @wire(MessageContext) messageContext;

    subscription;
    unsub;

    // Local reactive state
    halwaProducts = [];
    summary = { totalCount: 0, totalPrice: 0};

    connectedCallback() {
        // Initial load from shared utils
        this.halwaProducts = getState();
        this.summary = getSummary();

        // React to shared state changes
        this.unsub = stateSubscribe((data) => {
            this.halwaProducts = data.products;
            this.summary = data.summary;
            console.log('CART Sync Complete: Count is ' + this.summary.totalCount);
        });
    }

    disconnectedCallback() {
        if (this.subscription) {
            unsubscribe(this.subscription);
            this.subscription = null;
            console.log('[SUB] 🔚 Unsubscribed from PRODUCTS_LMS');
        }
        if (this.unsub) {
            this.unsub();
            this.unsub = null;
        }
    }

    // LMS subscription on first render when MessageContext is ready
    renderedCallback() {
        if (this.subscription || !this.messageContext) {
            return;
        }
        try {
            this.subscription = subscribe(
                this.messageContext,
                PRODUCTS_LMS,
                (message) => this.safeHandleMessage(message)
            );
            console.log('[SUB] ✅ Subscribed to PRODUCTS_LMS');
        } catch (e) {
            console.error('[SUB] ❌ Subscribe threw:', e);
        }
    }

    // Defensive wrapper for handler
    safeHandleMessage(message) {
        try {
            console.log('[SUB] 📨 Received message (raw):', JSON.stringify(message));
            this.handleMessage(message);
        } catch (e) {
            console.error('[SUB] ❌ Error inside handler:', e);
        }
    }

    handleMessage(message) {
        const products = message?.products;
        if (!Array.isArray(products)) {
            console.warn('[SUB] "products" payload is not an array:', products);
            return;
        }
        // Replace array reference for LWC reactivity
        this.halwaProducts = [...products];
        console.log('[SUB] Updated halwaProducts count:', this.halwaProducts.length);
    }

    // Consolidated quantity update to remove duplication
    updateQuantity(id, delta) {
        console.log('halwaKadaiCartPage.updateQuantity called with id:', id, 'delta:', delta);
        let deltaCount = 0;
        let deltaPrice = 0;

        this.halwaProducts = this.halwaProducts.map(p => {
            if (p.id !== id) return p;

            const current = Number(p.quantity || 0);
            const newQty = Math.max(0, current + delta);
            const appliedDelta = newQty - current; // may be 0 if floor at 0
            if (appliedDelta !== 0) {
                deltaCount += appliedDelta;
                deltaPrice += appliedDelta * (Number(p.price) || 0);
            }
            const newSelected = newQty > 0;
            return { ...p, quantity: newQty, _dirty: true, selected: newSelected, orderPrice: (Number(p.price) || 0) * newQty };
        });

        // Update summary based on net delta
        if (deltaCount !== 0 || deltaPrice !== 0) {
            const newSummary = {
                ...this.summary,
                totalCount: Math.max(0, (Number(this.summary.totalCount) || 0) + deltaCount),
                totalPrice: Math.max(0, (Number(this.summary.totalPrice) || 0) + deltaPrice)
            };
            this.summary = newSummary;
            setSummary(newSummary);
        }

        // Notify and persist
        this.notifyParent();
    }

    handleIncreaseQuantity(event) {
        const id = event.currentTarget.dataset.id;
        this.updateQuantity(id, +1);
    }

    handleDecreaseQuantity(event) {
        const id = event.currentTarget.dataset.id;
        this.updateQuantity(id, -1);
    }

    notifyParent() {
        // Bubble a simple count change if needed by parent
        const productCount = (this.summary && typeof this.summary.totalCount === 'number') ? this.summary.totalCount : 0;
        this.dispatchEvent(new CustomEvent('productcount', {
            detail: { productCount },
            bubbles: true,
            composed: true
        }));
        this.publishProducts();
    }

    publishProducts() {
        const message = { products: this.halwaProducts };
        if (this.messageContext) {
            publish(this.messageContext, PRODUCTS_LMS, message);
            console.log('[PUB] ✅ Published products over LMS');
        }
        // persist shared array (also recomputes derived totals in utils)
        setState(this.halwaProducts);
    }

    handleCheckoutClick() {
        if ((this.summary?.totalCount || 0) === 0) {
            console.warn('Checkout attempted with empty cart');
            return;
        }

        // If not logged in: set nav path Cart -> Login -> Checkout and route to login
        if (this.summary?.loggedIn === false) {
            console.warn('Checkout attempted by non-logged-in user');
            setSummary({
                ...this.summary,
                previousPage: 'halwaKadaiCartPage',
                currentPage: 'halwaKadaiLogin', 
                nextPage: 'halwaKadaiCheckoutPage'
            });
            // Tell parent to navigate (parent will read summary and route accordingly)
            this.dispatchEvent(new CustomEvent('checkout', { bubbles: true, composed: true }));
            return;
        }

        // If logged in: go directly to checkout
        setSummary({
            ...this.summary,
            previousPage: 'halwaKadaiCartPage',
            currentPage: 'halwaKadaiCheckoutPage',
            nextPage: 'halwaKadaiOrderConfirmationPage'
        });
        this.dispatchEvent(new CustomEvent('checkout', { bubbles: true, composed: true }));
    }
}