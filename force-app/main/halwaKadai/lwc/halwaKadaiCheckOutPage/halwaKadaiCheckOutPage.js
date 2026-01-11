import { LightningElement } from 'lwc';
import { getState, setState , getSummary, subscribe as stateSubscribe} from 'c/halwaKadaiUtils';

export default class HalwaKadaiCheckOutPage extends LightningElement {
halwaProducts;
summary;
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

}