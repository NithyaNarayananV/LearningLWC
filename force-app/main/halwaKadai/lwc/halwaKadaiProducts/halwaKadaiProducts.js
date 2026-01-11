import { LightningElement, wire, track } from 'lwc';
import getProducts from '@salesforce/apex/Halwakadai_HelperClass.getProductsDetails';

import { publish, MessageContext } from 'lightning/messageService';
import PRODUCTS_LMS from '@salesforce/messageChannel/halwaKadaiLMS__c';
import { getState, setState , getSummary, subscribe as stateSubscribe} from 'c/halwaKadaiUtils';

export default class HalwaKadaiProducts extends LightningElement {

    halwaProducts;
    summary = { totalCount: 0, totalPrice: 0 };

    products;
    productCount=0;
    @wire(getProducts)
    wiredProducts({ error, data}) {
        if (data){
            console.log('wiredProducts');
            this.products = data.map((prod, index) => ({
                id: prod.Id,
                url: prod.Image_URL__c, // custom field from Product2
                alt: `Halwa Kadai - Slide ${index + 1}`,
                name: prod.Name,
                description: prod.Description,
                homeVisible: prod.HomePage_Visible__c,
                tag: prod.Tag__c, 
                price: prod.Price__c
            }));
            
            // Create the editable working copy with extra fields
            this.halwaProducts = this.products.map(p => ({
                ...p,
                // client-only fields
                quantity: 0,
                notes: '',
                isFeatured: false,
                // helper fields for UI state
                _dirty: false,
                selected: false,
            }));

        } else if (error) {
              this.error = error;
              // Log everything we can, even in Locker
              // eslint-disable-next-line no-console
              console.error('Error fetching products → raw:', error);
              // eslint-disable-next-line no-console
              console.error('Error.body:', error?.body);
              // eslint-disable-next-line no-console
              console.error('Error.body.message:', error?.body?.message);
              // eslint-disable-next-line no-console
              console.error('Error.status:', error?.status, 'Error.statusText:', error?.statusText);
            }

    }
        connectedCallback() {
        // 1. Initial Load
        this.halwaProducts = getState();
        this.summary = getSummary();

        // 2. Subscribe to future changes
        this.unsub = stateSubscribe((data) => {
            // This ensures both variables stay in sync with the utility
            this.halwaProducts = data.products;
            this.summary = data.summary;
            console.log('Sync Complete: Count is ' + this.summary.totalCount);
        });
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
                return { ...p, quantity: newQty, _dirty: true, selected:true };
            }
            return p;
        });
        this.notifyParent() ;
    }
    handleDecreaseQuantity(event) {
        const id = event.currentTarget.dataset.id;
        this.halwaProducts = this.halwaProducts.map(p => {
            console.log('handleDecreaseQuantity');
            if (p.id === id) {
                const current = Number(p.quantity || 1);
                const newQty = Math.max(0, current - 1); // never below 0
                const newSelected = newQty > 0;
                this.summary = {
                    ...this.summary,
                    totalCount: this.summary.totalCount - 1,
                    totalPrice: this.summary.totalPrice - p.price
                };
                return { ...p, quantity: newQty, _dirty: true, selected: newSelected };
            }
            return p;
        });
        this.notifyParent();
    }

    notifyParent() {
        // Send any payload you want in `detail`
        console.log(' notifyParent() {');
        this.dispatchEvent(
            new CustomEvent('productcount', {            
                detail : { productCount : this.productCount },
                bubbles : true, // allow bubbling through DOM
                composed : true // allow crossing Shadow DOM boundary to ancestors
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
        setState(this.halwaProducts);
        setState(this.summary);
        console.log('VALUE SET FOR STATE ');
    }
}