// file: halwaKadai_homePage_mainComponent.js
import { LightningElement } from 'lwc';

import { getState, setState , getSummary, subscribe as stateSubscribe} from 'c/halwaKadaiUtils';

export default class HalwaKadai_homePage_mainComponent extends LightningElement {
  isActive_Home=true;
  isActive_About=false;
  isActive_Product=false;
  isActive_Contact=false;
  cartClass='slds-hide';
  homeClass='slds-show';
  productClass='slds-hide';
  checkoutClass='slds-hide';
  orderConfirmationClass=false;

  productCount=0;
  summary = { totalCount: 0, totalPrice: 0 };
  
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


  onHomeClick(){
    this.isActive_Home=true;
    this.isActive_About=false;
    this.isActive_Product=false;
    this.isActive_Contact=false;
    this.hideAll();
    this.homeClass='slds-show';

   }
  onAboutClick(){
    this.isActive_Home=false;
    this.isActive_About=true;
    this.isActive_Product=false;
    this.isActive_Contact=false;
    this.hideAll();
   }
  onProductsClick(){
    this.isActive_Home=false;
    this.isActive_About=false;
    this.isActive_Product=true;
    this.isActive_Contact=false;
    this.hideAll();
    this.productClass='slds-show'; 
   }
  onContactClick(){
    this.isActive_Home=false;
    this.isActive_About=false;
    this.isActive_Product=false;
    this.isActive_Contact=true;
    this.hideAll();
   } 
  onCartClick(){
    this.isActive_Home=false;
    this.isActive_About=false;
    this.isActive_Product=false;
    this.isActive_Contact=false;
    this.hideAll();
    this.cartClass='slds-show';
   } 
  onCheckoutClick(){
    this.hideAll();
    this.checkoutClass='slds-show';
  }

   onOrderConfirmationClick(){
    console.log('onOrderConfirmationClick()');
    this.hideAll();
    console.log('after hideAll()');

    this.orderConfirmationClass=true;
   }
   hideAll(){
    this.homeClass='slds-hide'; 
    this.cartClass='slds-hide';
    this.productClass='slds-hide'; 
    this.checkoutClass='slds-hide';
    this.orderConfirmationClass=false;
    this.handleScrollTop();
   }

  handleProductCount(event) {
    console.log('handleProductCount(event) {');
    const { productCount } = event.detail;
    // Do whatever you need: update state, call Apex, refresh UI...
    this.productCount = productCount;
    console.log('Child says:',productCount);
  }
  handleCheckOut(event) {
    console.log('handleCheckOut(event) {');
    this.onCheckoutClick();
    this.handleScrollTop();
  }

  handleOrderConfirmationClick() {
    console.log('handleOrderConfirmationClick() {');
    this.onOrderConfirmationClick();
    this.handleScrollTop();
  }

  handleScrollTop() { // Scroll the entire window to the top 
    window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
        // adds smooth animation
    }); 
  }


}