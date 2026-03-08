// halwaKadaiOrderConfirmation.js
import { LightningElement } from 'lwc';
import { getState, getSummary, subscribe as stateSubscribe, setSummary } from 'c/halwaKadaiUtils';

const KEYhalwaProducts = 'halwaKadai:halwaProducts'; // namespace your key to avoid collisions
const KEYsummary = 'halwaKadai:summary'; // namespace your key to avoid collisions

export default class HalwaKadaiOrderConfirmation extends LightningElement {
    halwaProducts = [];
    summary = { totalCount: 0, totalPrice: 0 };
    unsub;

    connectedCallback() {
        console.log('HalwaKadaiOrderConfirmation : connectedCallback');
        const rawhalwaProducts = window.localStorage.getItem(KEYhalwaProducts);
        const rawsummary = window.localStorage.getItem(KEYsummary);
        if (rawhalwaProducts) {
            this.halwaProducts = JSON.parse(rawhalwaProducts);
        }
        if (rawsummary) {
            this.summary = JSON.parse(rawsummary);
        }
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
        //setSummary({ totalCount: 0, totalPrice: 0, loggedIn: this.summary.loggedIn, orderPlaced: true, newUser: false });

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
        console.log('HalwaKadaiOrderConfirmation : disconnectedCallback');

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
    handleContinueShopping() {
        console.log('handleContinueShopping()');
        const continueShoppingEvent = new CustomEvent('continueshopping', {
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(continueShoppingEvent);
    }
    handleBackToHome() {
        console.log('handleBackToHome()');
        const backToHomeEvent = new CustomEvent('backtohome', {
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(backToHomeEvent);
    }
}