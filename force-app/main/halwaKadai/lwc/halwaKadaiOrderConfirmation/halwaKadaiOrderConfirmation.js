import { LightningElement } from 'lwc';
import { getState, getSummary, subscribe as stateSubscribe } from 'c/halwaKadaiUtils';

export default class HalwaKadaiOrderConfirmation extends LightningElement {
    halwaProducts;
    summary;
    
    connectedCallback() {
        // Initial load
        this.halwaProducts = getState();
        this.summary = getSummary();

        // Subscribe to cart changes
        this.unsub = stateSubscribe((data) => {
            this.halwaProducts = data.products;
            this.summary = data.summary;
            console.log('CART Sync Complete: Count is ' + this.summary.totalCount);
        });
    }
    
    handlePrint() {
        window.print();
    }
}