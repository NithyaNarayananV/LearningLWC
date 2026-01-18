// file: halwaKadai_homePage_mainComponent.js
import { LightningElement } from 'lwc';

import { getState, setState , getSummary, subscribe as stateSubscribe} from 'c/halwaKadaiUtils';

export default class HalwaKadai_homePage_mainComponent extends LightningElement {
  isActive_Home=true;
  isActive_About=false;
  isActive_Product=false;
  isActive_Contact=false;
  isActive_OderConfimation=false;
  cartClass='slds-hide';
  homeClass='slds-show';
  productClass='slds-hide';
  checkoutClass='slds-hide';
  orderConfirmationClass='slds-hide';
  loginClass='slds-hide';

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

    disconnectedCallback() {
        // Clean up subscription to prevent memory leaks
        if (this.unsub) {
            this.unsub();
        }
    }


  onHomeClick(){
    this.hideAll();
    this.isActive_Home=true;
    this.homeClass='slds-show';
  }
  onAboutClick(){
    this.hideAll();
    this.isActive_About=true;
  } 
  onProductsClick(){
    this.hideAll();
    this.isActive_Product=true;
    this.productClass='slds-show'; 
   }
  onContactClick(){
    this.hideAll();
    this.isActive_Contact=true;
   } 
  onCartClick(){
    this.hideAll();
    this.cartClass='slds-show';
   } 
  onCheckoutClick(){
    this.hideAll();
    this.checkoutClass='slds-show';
  }
  onLoginClick(){
    this.hideAll();
    this.loginClass='slds-show';
  }

  onOrderConfirmationClick(){
    console.log('onOrderConfirmationClick()');
    // Defer state updates to avoid promise rejection during component lifecycle
    Promise.resolve().then(() => {
      this.hideAll();
      console.log('after hideAll()');
      this.orderConfirmationClass='slds-show';
      this.isActive_OderConfimation=true;
    }).catch(error => {
      console.error('Error updating order confirmation state:', error);
    });
  }
  hideAll(){
    this.isActive_Home=false;
    this.isActive_About=false;
    this.isActive_Product=false;
    this.isActive_Contact=false;
    this.isActive_OderConfimation=false;
    this.homeClass='slds-hide'; 
    this.cartClass='slds-hide';
    this.productClass='slds-hide'; 
    this.checkoutClass='slds-hide';
    this.orderConfirmationClass='slds-hide';
    this.loginClass='slds-hide';
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