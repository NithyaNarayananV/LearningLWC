import { LightningElement, wire, track } from 'lwc';
import getProducts from '@salesforce/apex/Halwakadai_HelperClass.getProductsDetails';

import { publish, MessageContext } from 'lightning/messageService';
import PRODUCTS_LMS from '@salesforce/messageChannel/halwaKadaiLMS__c';
import { getState, setState, getSummary, getSiteUser, subscribe as stateSubscribe, setProductsCONSTANT, setSummary, syncDraftOrder, loadDraftOrder } from 'c/halwaKadaiUtils';

export default class HalwaKadaiProducts extends LightningElement {

    @track halwaProducts = [];
    @track summary = { totalCount: 0, totalPrice: 0, loggedIn: false };
    halwaProductsCONSTANT;

    products;
    productCount = 0;
    unsub;

    @wire(MessageContext) messageContext;

    @wire(getProducts)
    wiredProducts({ error, data }) {
        if (data) {
            console.log('wiredProducts');
            this.products = data.map((prod, index) => ({
                id: prod.ProductCode,
                url: prod.Image_URL__c, 
                alt: `Halwa Kadai - Slide ${index + 1}`,
                name: prod.Name,
                description: prod.Description,
                homeVisible: prod.HomePage_Visible__c,
                tag: prod.Tag__c, 
                pricebookId: prod.PricebookEntries?.length ? prod.PricebookEntries[0].Id : null,
                price: prod.PricebookEntries?.length ? prod.PricebookEntries[0].UnitPrice : null
            }));
            
            // Create the editable working copy with extra fields
            this.halwaProducts = this.products.map(p => ({
                ...p,
                quantity: 0,
                notes: '',
                isFeatured: false,
                _dirty: false,
                selected: false,
                orderPrice: 0
            }));
            
            this.halwaProductsCONSTANT = this.halwaProducts;
            setProductsCONSTANT(this.halwaProductsCONSTANT);
            
            // Load draft order if logged in and products are now available
            loadDraftOrder();
            
            // Only hydrate from state if we already have items in the cart
            const currentState = getState();
            if (currentState && currentState.length > 0) {
                this.halwaProducts = currentState;
            } else {
                setState(this.halwaProducts);
            }
            
        } else if (error) {
            console.error('Error fetching products → raw:', error);
            console.error('Error.body:', error?.body);
            console.error('Error.body.message:', error?.body?.message);
        }
    }

    connectedCallback() {
        console.log('HalwaKadaiProducts : connectedCallback');
        
        // 1. Initial Load
        this.halwaProducts = getState();
        this.summary = getSummary();

        // 2. Subscribe to future changes (Listen to the Single Source of Truth)
        this.unsub = stateSubscribe((data) => {
            this.halwaProducts = Array.isArray(data.products) ? [...data.products] : data.products;
            this.summary = { ...data.summary };
        });
    }

    disconnectedCallback() {
        if (this.unsub) {
            this.unsub();
            this.unsub = null;
        }
    }

    handleIncreaseQuantity(event) {
        const id = event.currentTarget.dataset.id;
        
        this.halwaProducts = this.halwaProducts.map(p => {
            // FIX: Safe string comparison
            if (String(p.id) === String(id)) {
                const newQty = Number(p.quantity || 0) + 1;
                return { ...p, quantity: newQty, _dirty: true, selected: true, orderPrice: p.price * newQty };
            }
            return p;
        });
        
        this.notifyParent();
    }

    handleDecreaseQuantity(event) {
        const id = event.currentTarget.dataset.id;
        
        this.halwaProducts = this.halwaProducts.map(p => {
            // FIX: Safe string comparison
            if (String(p.id) === String(id)) {
                const current = Number(p.quantity || 1);
                const newQty = Math.max(0, current - 1); 
                const newSelected = newQty > 0;
                return { ...p, quantity: newQty, _dirty: true, selected: newSelected, orderPrice: p.price * newQty };
            }
            return p;
        });
        
        this.notifyParent();
    }

    notifyParent() {
        console.log('notifyParent()');
        this.dispatchEvent(
            new CustomEvent('productcount', {            
                detail : { productCount : this.productCount },
                bubbles : true, 
                composed : true 
            })
        );
        this.publishProducts();
    }

    async publishProducts() {
        console.log('publishProducts()');
        
        // 1. Send Array to the Utils (This triggers the math recalculation!)
        setState(this.halwaProducts);
        
        // 2. Publish to LMS with a source tag to prevent Echo Bugs
        const message = { products: this.halwaProducts, source: 'ProductsPage' }; 
        if (this.messageContext) {
            publish(this.messageContext, PRODUCTS_LMS, message);
            console.log('[PUB] ✅ Published:', JSON.parse(JSON.stringify(message)));
        }

        await syncDraftOrder();
        
        // FIX: Removed setSummary(this.summary) to stop the double-dip bug
    }
}