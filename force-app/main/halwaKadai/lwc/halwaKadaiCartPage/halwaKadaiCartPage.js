import { LightningElement, wire } from 'lwc';
import { subscribe, unsubscribe, publish, MessageContext } from 'lightning/messageService';
import PRODUCTS_LMS from '@salesforce/messageChannel/halwaKadaiLMS__c';
import { getState, setState , subscribe as stateSubscribe} from 'c/halwaKadaiUtils';

export default class HalwaKadaiCartPage extends LightningElement {
    @wire(MessageContext) messageContext;
    subscription;
    halwaProducts = [];


////////////////

connectedCallback() {
    // initialize from shared state (array)
    this.halwaProducts = getState();
    stateSubscribe((newState) => {
        this.halwaProducts = newState;
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
                const newQty = Number(p.quantity || 0) + 0.5;
                return { ...p, quantity: newQty, _dirty: true, selected: true };
            }
            return p;
        });
        // persist to shared state and propagate
        setState(this.halwaProducts);
        this.notifyParent();
    }
    handleDecreaseQuantity(event) {
        const id = event.currentTarget.dataset.id;
        this.halwaProducts = this.halwaProducts.map(p => {
            console.log('handleDecreaseQuantity');
            if (p.id === id) {
                const current = Number(p.quantity || 0.5);
                const newQty = Math.max(0, current - 0.5);
                const newSelected = newQty > 0;
                return { ...p, quantity: newQty, _dirty: true, selected: newSelected };
            }
            return p;
        });
        setState(this.halwaProducts);
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


}