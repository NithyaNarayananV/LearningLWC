import { LightningElement, wire } from 'lwc';
import { subscribe, unsubscribe, MessageContext } from 'lightning/messageService';
import PRODUCTS_LMS from '@salesforce/messageChannel/halwaKadaiLMS__c';
import SAMPLEMC from "@salesforce/messageChannel/SampleMessageChannel__c"; //(Reference a Message Channel in LWC)Need to add the Message Channel details like this

export default class HalwaKadaiCartPage extends LightningElement {
    @wire(MessageContext) messageContext;
    subscription;
    halwaProducts = [];
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
}