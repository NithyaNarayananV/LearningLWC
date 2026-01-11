import { LightningElement, wire } from 'lwc';
import { subscribe, unsubscribe, publish, MessageContext } from 'lightning/messageService';
import PRODUCTS_LMS from '@salesforce/messageChannel/halwaKadaiLMS__c';
import { getState, setState , getSummary, subscribe as stateSubscribe} from 'c/halwaKadaiUtils';

export default class HalwaKadaiCartPage extends LightningElement {
    @wire(MessageContext) messageContext;
    subscription;
    
    halwaProducts = [];
    summary = { totalCount: 0, totalPrice: 0 };
    unsub;

    connectedCallback() {
        // 1. Initial Load
        this.halwaProducts = getState();
        this.summary = getSummary();

        // 2. Subscribe to future changes
        this.unsub = stateSubscribe((data) => {
            // This ensures both variables stay in sync with the utility
            this.halwaProducts = data.products;
            this.summary = data.summary;
            console.log('CART Sync Complete: Count is ' + this.summary.totalCount);
        });
    }

///////////////////

    receivedMessage = 'No message received';
    renderedCallback() {
        if (this.subscription) {return;}
        if (!this.messageContext) {
            console.log('[SUB] MessageContext not ready yet; will try next render');
            return;
        }
        try {
            this.subscription = subscribe(
                this.messageContext,
                PRODUCTS_LMS,
                (message) => {                    
                    console.log('[SUB] 📨 Callback entered');  // <— prove handler 
                    this.safeHandleMessage(message) 
                },
            );
           
            console.log('[SUB] ✅ Subscribed to PRODUCTS_LMS:', this.subscription);
        } catch (e) {
            console.error('[SUB] ❌ Subscribe threw:', e);
        }
    }

    disconnectedCallback() {
        if (this.subscription) {
            unsubscribe(this.subscription);
            this.subscription = null;
            console.log('[SUB] 🔚 Unsubscribed from PRODUCTS_LMS');
        }
    }

    // Wrapper to ensure you see a log even if handleMessage throws early
    safeHandleMessage(message) {
        try {
            console.log('[SUB] 📨 Received message (raw):', JSON.stringify(message));
            this.handleMessage(message);
        } catch (e) {
            console.error('[SUB] ❌ Error inside handler:', e);
        }
    }

    handleMessage(message) {
        console.log('[SUB] handleMessage entry');

        const products = message?.products;
        if (!Array.isArray(products)) {
            console.warn('[SUB] "products" payload is not an array:', products);
            this.receivedMessage = 'Payload is not an array';
            return;
        }
        // Replace the array reference for LWC reactivity
        this.halwaProducts = [...products];

        // Example: set a simple status string
        this.receivedMessage = `Received ${this.halwaProducts.length} products`;

        console.log('[SUB] Updated halwaProducts count:', this.halwaProducts.length);
    }

    handleIncreaseQuantity(event) {
        const id = event.currentTarget.dataset.id;
        this.halwaProducts = this.halwaProducts.map(p => {
            console.log('handleIncreaseQuantity');
            if (p.id === id) {
                const newQty = Number(p.quantity || 0) + 1;
                this.summary = {
                    ...this.summary,
                    totalCount: this.summary.totalCount + 1,
                    totalPrice: this.summary.totalPrice + p.price
                };
                return { ...p, quantity: newQty, _dirty: true, selected: true, orderPrice: p.price * newQty };
            }
            return p;
        });
        // persist to shared state and propagate
        //setState(this.halwaProducts);
        this.notifyParent();
    }
    handleDecreaseQuantity(event) {
        const id = event.currentTarget.dataset.id;
        this.halwaProducts = this.halwaProducts.map(p => {
            console.log('handleDecreaseQuantity');
            if (p.id === id) {
                const current = Number(p.quantity || 1);
                const newQty = Math.max(0, current - 1);
                const newSelected = newQty > 0;
                this.summary = {
                    ...this.summary,
                    totalCount: this.summary.totalCount - 1,
                    totalPrice: this.summary.totalPrice - p.price
                };          
                return { ...p, quantity: newQty, _dirty: true, selected: newSelected, orderPrice: p.price * newQty };
            }
            return p;
        });
        //setState(this.halwaProducts);
        this.notifyParent();
    }

    notifyParent() {
        // Send any payload you want in `detail`
        console.log(' notifyParent() {');
        this.dispatchEvent(
        new CustomEvent('productcount', {
            
            detail: {  productCount: this.productCount },
            bubbles: true,    // allow bubbling through DOM
            composed: true    // allow crossing Shadow DOM boundary to ancestors
        })
        );
        this.publishProducts();
    }

    @wire(MessageContext) messageContext;

    publishProducts() {
        console.log('publishProducts()');
        const message = { products: this.halwaProducts }; // Option A (array directly)
        publish(this.messageContext, PRODUCTS_LMS, message);
        console.log('[PUB] ✅ Published:', JSON.parse(JSON.stringify(message)));
        // persist shared array
        setState(this.halwaProducts);
        console.log('VALUE SET FOR STATE ');

    }
    handleCheckoutClick() {
        console.log('handleCheckoutClick()');
        const checkoutEvent = new CustomEvent('checkout', {
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(checkoutEvent);
    }


}