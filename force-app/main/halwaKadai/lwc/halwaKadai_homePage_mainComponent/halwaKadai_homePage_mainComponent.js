// file: halwaKadai_homePage_mainComponent.js
import { LightningElement } from 'lwc';

import { getState, setState ,setSummary, getSummary, subscribe as stateSubscribe, getProductsCONSTANT} from 'c/halwaKadaiUtils';

const KEYhalwaProducts = 'myApp:halwaProducts'; // namespace your key to avoid collisions
const KEYsummary = 'myApp:summary'; // namespace your key to avoid collisions
const KEYsiteUser = 'myApp:siteUser'; // namespace your key to avoid collisions

export default class HalwaKadai_homePage_mainComponent extends LightningElement {
  isActive_Home=true;
  isActive_About=false;
  isActive_Product=false;
  isActive_Contact=false;
  isActive_OderConfimation=false;
  isActive_CheckOut=false;
  cartClass='slds-hide';
  homeClass='slds-show';
  productClass='slds-hide';
  checkoutClass='slds-hide';
  orderConfirmationClass='slds-hide';
  loginClass='slds-hide';
  halwaProducts;
  productCount=0;
  summary = { totalCount: 0, totalPrice: 0, loggedIn:false };
  
  halwaProducts = null;
  summary = null;
  
  connectedCallback() {
    const rawhalwaProducts = window.localStorage.getItem(KEYhalwaProducts);
    const rawsummary = window.localStorage.getItem(KEYsummary);
    if (rawhalwaProducts) {
      try {
        this.halwaProducts = JSON.parse(rawhalwaProducts);
        console.log('HalwaKadai_homePage_mainComponent : connectedCallback : window.localStorage : rawhalwaProducts = ' + rawhalwaProducts);
        setState(this.halwaProducts);
      } catch (e) {
        window.localStorage.removeItem(KEYhalwaProducts);
        console.log('Error parsing localStorage:', e);
        console.log('ERROR : rawhalwaProducts = ' + rawhalwaProducts);
      }
    }else{
      console.log('HalwaKadai_homePage_mainComponent : connectedCallback : No localStorage data found for KEYhalwaProducts, using default state');
      this.halwaProducts = getState();
    }
    if (rawsummary) {
      try {
        this.summary = JSON.parse(rawsummary);
        console.log('HalwaKadai_homePage_mainComponent : connectedCallback : window.localStorage : rawsummary = ' + rawsummary);
        setSummary(this.summary);
      } catch (e) {
        window.localStorage.removeItem(KEYsummary);
        console.log('Error parsing localStorage:', e);
        console.log('ERROR : rawsummary = ' + rawsummary);
      }
    }else{
      console.log('HalwaKadai_homePage_mainComponent : connectedCallback : No localStorage data found for KEYsummary, using default summary');
      this.summary = getSummary();
    }
    // 1. Initial Load
    // 2. Subscribe to future changes
    this.unsub = stateSubscribe((data) => {
        // This ensures both variables stay in sync with the utility
        this.halwaProducts = data.products;
        this.summary = data.summary;
        console.log('HalwaKadai_homePage_mainComponent : connectedCallback :stateSubscribe : summary.totalCount = ' + this.summary.totalCount);
        console.log('HalwaKadai_homePage_mainComponent : connectedCallback :stateSubscribe : summary.totalPrice = ' + this.summary.totalPrice);
        console.log('HalwaKadai_homePage_mainComponent : connectedCallback :stateSubscribe : summary.loggedIn = ' + this.summary.loggedIn);
    });
  }
  
  disconnectedCallback() {
    // Clean up subscription to prevent memory leaks
    console.log('DisconnectedCallBack : HalwaKadai_homePage_mainComponent ')
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
    this.isActive_CheckOut=true;
  }
  onLoginClick(){
    this.hideAll();
    this.loginClass='slds-show';
  }
  onLogOutClick(){
    this.hideAll();
    this.isActive_Home=true;
    this.homeClass='slds-show';
    //Need to Process and remove the login.
    setState(getProductsCONSTANT());
    setSummary({ totalCount: 0, totalPrice: 0 , loggedIn: false, orderPlaced: false, newUser: true});
    window.localStorage.removeItem(KEYhalwaProducts);
    window.localStorage.removeItem(KEYsummary);
    window.localStorage.removeItem(KEYsiteUser);

  }
  onClearCacheClick(){
    console.log('onClearCacheClick()');
    try {
      console.log('Clearing localStorage...');
      console.log('halwaKadaiUtils : onClearCacheClick : before clearing localStorage, state = ', this.halwaProducts);
      console.log('halwaKadaiUtils : onClearCacheClick : before clearing localStorage, summary = ', this.summary);
        window.localStorage.removeItem(KEYhalwaProducts);
        window.localStorage.removeItem(KEYsummary);
        window.localStorage.removeItem(KEYsiteUser);
        console.log('Local storage cleared for keys:', KEYhalwaProducts, KEYsummary, KEYsiteUser);
        console.log('halwaKadaiUtils : onClearCacheClick : after clearing localStorage, state = ', this.halwaProducts);
        console.log('halwaKadaiUtils : onClearCacheClick : after clearing localStorage, summary = ', this.summary);
    } catch (e) {
        console.log('Error clearing localStorage:', e);
        console.log('ERROR : window.localStorage.removeItem for keys:', KEYhalwaProducts, KEYsummary, KEYsiteUser);
    }
    // Reset state and summary to defaults after clearing cache
    //setState([]);
    //setSummary({ totalCount: 0, totalPrice: 0, loggedIn:false });
  }
  onClearCartClick(){
    console.log('onClearCartClick()');
    setState(getProductsCONSTANT());
    setSummary({ ...this.summary, totalCount: 0, totalPrice: 0, orderPlaced: false });
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
  handleBackToHome() {
    console.log('handleBackToHome()');
    //reset state and summary to defaults when going back to home
    setState(getProductsCONSTANT());
    setSummary({ totalCount: 0, totalPrice: 0 , loggedIn: true, orderPlaced: false, newUser: false});
    this.onHomeClick();

  }
  handleContinueShopping() {
    console.log('handleContinueShopping()');
    //reset state and summary to defaults when going back to home
    setState(getProductsCONSTANT());
    setSummary({ totalCount: 0, totalPrice: 0 , loggedIn: true, orderPlaced: false, newUser: false});
    this.onProductsClick();
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
  handleLogin(){
    console.log('HalwaKadai_homePage_mainComponent : handleLogin() ');
    this.onProductsClick();
  }
  handleScrollTop() { // Scroll the entire window to the top 
    window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
        // adds smooth animation
    });
  }
}