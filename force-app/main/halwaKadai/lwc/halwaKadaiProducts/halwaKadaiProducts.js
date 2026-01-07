import { LightningElement, wire, track } from 'lwc';
import getProducts from '@salesforce/apex/Halwakadai_HelperClass.getProductsDetails';
export default class HalwaKadaiProducts extends LightningElement {
  
    @track halwaProducts = [];
    products;
    productCount=0;
    @wire(getProducts)
    wiredProducts({ error, data }) {
        if (data) {
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
        
    handleIncreaseQuantity(event) {
        const id = event.currentTarget.dataset.id;
        this.halwaProducts = this.halwaProducts.map(p => {
            console.log('handleIncreaseQuantity');
            if (p.id === id) {
                const newQty = Number(p.quantity || 0) +0.5;
                if(p.quantity==0)
                    this.productCount = this.productCount+1
                this.notifyParent() ;
                return { ...p, quantity: newQty, _dirty: true, selected:true };
            }
            return p;
        });
    }
    handleDecreaseQuantity(event) {
        const id = event.currentTarget.dataset.id;
        this.halwaProducts = this.halwaProducts.map(p => {
            console.log('handleDecreaseQuantity');
            if (p.id === id) {
                const current = Number(p.quantity || 0.5);
                const newQty = Math.max(0, current -0.5); // never below 0
                const newSelected = newQty > 0;
                if(!newSelected)
                    this.productCount = this.productCount-1
                this.notifyParent();
                return { ...p, quantity: newQty, _dirty: true, selected: newSelected };
            }
            return p;
        });
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
    }
}