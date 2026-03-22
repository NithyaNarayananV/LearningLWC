import { LightningElement, wire, track } from 'lwc';
import { subscribe, unsubscribe, publish, MessageContext } from 'lightning/messageService';
import PRODUCTS_LMS from '@salesforce/messageChannel/halwaKadaiLMS__c';
import { getState, setState, getSummary, getSiteUser, subscribe as stateSubscribe, setSummary, syncDraftOrder } from 'c/halwaKadaiUtils';

export default class HalwaKadaiCartPage extends LightningElement {
    @wire(MessageContext) messageContext;

    subscription;
    unsub;

    // FIX: Added @track to ensure deep reactivity when object properties change
    @track halwaProducts = [];
    @track summary = { totalCount: 0, totalPrice: 0 };

    connectedCallback() {
        this.halwaProducts = getState() || [];
        this.summary = getSummary() || { totalCount: 0, totalPrice: 0 };

        this.unsub = stateSubscribe((data) => {
            this.halwaProducts = Array.isArray(data.products) ? [...data.products] : data.products;
            this.summary = { ...data.summary };
        });

        if (!this.subscription) {
            try {
                this.subscription = subscribe(
                    this.messageContext,
                    PRODUCTS_LMS,
                    (message) => this.safeHandleMessage(message)
                );
            } catch (e) {
                console.error('HalwaKadaiCartPage [SUB] Error:', e);
            }
        }
    }

    disconnectedCallback() {
        if (this.subscription) {
            unsubscribe(this.subscription);
            this.subscription = null;
        }
        if (this.unsub) {
            this.unsub();
            this.unsub = null;
        }
    }

    safeHandleMessage(message) {
        try {
            this.handleMessage(message);
        } catch (e) {
            console.error('HalwaKadaiCartPage Handler Error:', e);
        }
    }

    handleMessage(message) {
        // FIX: The "Anti-Echo" check. Ignore messages sent by this component!
        if (message?.source === 'CartPage') {
            return; 
        }

        const products = message?.products;
        if (!Array.isArray(products)) return;
        
        this.halwaProducts = [...products];
        setState(this.halwaProducts);
        this.summary = { ...getSummary() };
    }

    updateQuantity(id, delta) {
        this.halwaProducts = this.halwaProducts.map(p => {
            if (String(p.id) !== String(id)) return p;

            const current = Number(p.quantity || 0);
            const newQty = Math.max(0, current + delta);
            
            const newSelected = newQty > 0;
            return { 
                ...p, 
                quantity: newQty, 
                _dirty: true, 
                selected: newSelected, 
                orderPrice: (Number(p.price) || 0) * newQty 
            };
        });

        setState(this.halwaProducts);
        this.notifyParent();
    }

    handleIncreaseQuantity(event) {
        this.updateQuantity(event.currentTarget.dataset.id, 1);
    }

    handleDecreaseQuantity(event) {
        this.updateQuantity(event.currentTarget.dataset.id, -1);
    }

    notifyParent() {
        const productCount = (this.summary && typeof this.summary.totalCount === 'number') ? this.summary.totalCount : 0;
        this.dispatchEvent(new CustomEvent('productcount', {
            detail: { productCount },
            bubbles: true,
            composed: true
        }));
        this.publishProducts();
    }

    async publishProducts() {
        // FIX: Add 'source' so handleMessage knows to ignore its own broadcasts
        const message = { products: this.halwaProducts, source: 'CartPage' };
        if (this.messageContext) {
            publish(this.messageContext, PRODUCTS_LMS, message);
        }
        setState(this.halwaProducts);
        await syncDraftOrder();
    }

    handleCheckoutClick() {
        if ((this.summary?.totalCount || 0) === 0) return;

        if (this.summary?.loggedIn === false) {
            setSummary({
                ...this.summary,
                previousPage: 'halwaKadaiCartPage',
                currentPage: 'halwaKadaiLogin', 
                nextPage: 'halwaKadaiCheckoutPage'
            });
            this.dispatchEvent(new CustomEvent('checkout', { bubbles: true, composed: true }));
            return;
        }

        setSummary({
            ...this.summary,
            previousPage: 'halwaKadaiCartPage',
            currentPage: 'halwaKadaiCheckoutPage',
            nextPage: 'halwaKadaiOrderConfirmationPage'
        });
        this.dispatchEvent(new CustomEvent('checkout', { bubbles: true, composed: true }));
    }
}