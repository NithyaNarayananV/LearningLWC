// halwaKadaiOrderConfirmation.js
import { LightningElement } from 'lwc';
import { getState, getSummary, subscribe as stateSubscribe } from 'c/halwaKadaiUtils';

export default class HalwaKadaiOrderConfirmation extends LightningElement {
    halwaProducts = [];
    summary = { totalCount: 0, totalPrice: 0 };
    unsub;

    connectedCallback() {
        console.log('HalwaKadaiOrderConfirmation : connectedCallback');

        try {
            // Initialize state safely
            const currentState = getState();
            this.halwaProducts = Array.isArray(currentState) ? currentState : [];
            console.log('Initial halwaProducts:', this.halwaProducts);

            const currentSummary = getSummary();
            this.summary = currentSummary || { totalCount: 0, totalPrice: 0 };
            console.log('Initial summary:', this.summary);
        } catch (error) {
            console.error('Error initializing state:', error);
        }

        // Subscribe to cart changes
        this.unsub = stateSubscribe((data) => {
            if (data && data.products && data.summary) {
                this.halwaProducts = data.products;
                this.summary = data.summary;
                console.log('CART Sync Complete: Count is ' + this.summary.totalCount);
            } else {
                console.warn('Subscription received invalid data:', data);
            }
        });
    }

    disconnectedCallback() {
        // Clean up subscription to avoid memory leaks
        if (this.unsub) {
            try {
                this.unsub();
                console.log('Unsubscribed from state updates');
            } catch (error) {
                console.error('Error during unsubscribe:', error);
            }
        }
    }

    handlePrint() {
        try {
            window.print();
            console.log('Print triggered');
        } catch (error) {
            console.error('Error triggering print:', error);
        }
    }
}