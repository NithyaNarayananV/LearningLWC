// file: halwaKadai_homePage_mainComponent.js
import { LightningElement, wire } from 'lwc';
import getCurrentUser from '@salesforce/apex/Halwakadai_HelperClass.getCurrentUser';
import initializeData from '@salesforce/apex/HalwaKadai_DataInitializer.initializeData';
import { getState, setState ,setSummary, setSiteUser, getSummary, subscribe as stateSubscribe, getProductsCONSTANT} from 'c/halwaKadaiUtils';


const KEYhalwaProducts = 'halwaKadai:halwaProducts'; // namespace your key to avoid collisions
const KEYsummary = 'halwaKadai:summary'; // namespace your key to avoid collisions
const KEYsiteUser = 'halwaKadai:siteUser'; // namespace your key to avoid collisions

const CLASSNAME = 'halwaKadai_homePage_mainComponent';
const HOMEPAGE = 'halwaKadaiHomePage';
const ABOUTPAGE = 'halwaKadaiAboutPage';
const PRODUCTSPAGE = 'halwaKadaiProductsPage';
const CARTPAGE = 'halwaKadaiCartPage';
const CHECKOUTPAGE = 'halwaKadaiCheckoutPage';
const ORDERCONFIRMATIONPAGE = 'halwaKadaiOrderConfirmationPage';
const LOGINPAGE = 'halwaKadaiLogin';  
const CONTACTPAGE = 'halwaKadaiContactPage';

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
  isAdmin = false;

  // Navigation helpers to reduce duplication and ensure consistent summary updates
  setSectionVisibility(section) {
    // reset flags
    this.isActive_Home = this.isActive_About = this.isActive_Product = this.isActive_Contact = this.isActive_OderConfimation = this.isActive_CheckOut = false;
    // reset classes
    this.homeClass = this.cartClass = this.productClass = this.checkoutClass = this.orderConfirmationClass = this.loginClass = 'slds-hide';
    switch (section) {
      case 'Home': this.isActive_Home = true; this.homeClass = 'slds-show';break; // this.summary.nextPage = this.summary.loggedIn? PRODUCTSPAGE : LOGINPAGE; 
      case 'About': this.isActive_About = true; break; // this.summary.nextPage = this.summary.loggedIn? PRODUCTSPAGE : LOGINPAGE; 
      case 'Products': this.isActive_Product = true; this.productClass = 'slds-show'; break;
      case 'Contact': this.isActive_Contact = true; break;
      case 'Cart': this.isActive_Cart = true; this.cartClass = 'slds-show'; break;
      case 'Checkout': this.isActive_CheckOut = true; this.checkoutClass = 'slds-show'; break;
      case 'OrderConfirmation': this.isActive_OderConfimation = true; this.orderConfirmationClass = 'slds-show'; break;
      case 'Login': this.isActive_Login = true; this.loginClass = 'slds-show'; break;
      default: break;
    }
    this.handleScrollTop();
  }

  navigateTo(pageConst, uiSectionLabel, nextConst) {
    this.setSectionVisibility(uiSectionLabel);
    this.updateDocumentTitle(uiSectionLabel);
    const prev = (this.summary && this.summary.currentPage) ? this.summary.currentPage : HOMEPAGE;
    const newSummary = {
      ...this.summary,
      previousPage: prev,
      currentPage: pageConst,
      nextPage: nextConst || pageConst
    };
    setSummary(newSummary);
    this.summary = newSummary;
    console.log(`${CLASSNAME} : navigateTo(${uiSectionLabel}) : summary = `, this.summary);
  }
  
  
  
  @wire(getCurrentUser)
  userDetails(result) {
  if(result.data){
    console.log('getCurrentUser result: ', result.data);
    this.currentUserProfile = result.data.Profile.Name;
    if(this.currentUserProfile === 'System Administrator'){
      this.isAdmin = true;
    }else{
      this.isAdmin = false;
    }
    } else if(result.error){
      console.error('Error in getCurrentUser: ', result.error);
    }
  }

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

  updateDocumentTitle(currentPage = 'Home') {
    document.title = currentPage+' - Halwa Kadai';
  }

  onHomeClick(){
    this.navigateTo(HOMEPAGE, 'Home', this.summary && this.summary.loggedIn ? PRODUCTSPAGE : LOGINPAGE);
  }
  onAboutClick(){
    console.log('HalwaKadai_homePage_mainComponent : onAboutClick');
    this.navigateTo(ABOUTPAGE, 'About', this.summary && this.summary.loggedIn ? PRODUCTSPAGE : LOGINPAGE);
  } 
  onProductsClick(){
    this.navigateTo(PRODUCTSPAGE, 'Products', this.summary && this.summary.loggedIn ? CARTPAGE : LOGINPAGE);
  }
  onContactClick(){
    this.navigateTo(CONTACTPAGE, 'Contact', this.summary && this.summary.loggedIn ? PRODUCTSPAGE : LOGINPAGE);
  } 
  onCartClick(){
    const next = (this.summary && this.summary.loggedIn) ? CHECKOUTPAGE : LOGINPAGE;
    this.navigateTo(CARTPAGE, 'Cart', next);
   } 
  onCheckoutClick(){
    // If not logged in, force Login first, then Checkout
    if (this.summary && this.summary.loggedIn === false) {
      setSummary({
        ...this.summary,
        previousPage: CARTPAGE,
        currentPage: LOGINPAGE,
        nextPage: CHECKOUTPAGE
      });
      this.onLoginClick();
      return;
    }
    // Logged-in users go directly to Checkout
    this.navigateTo(CHECKOUTPAGE, 'Checkout', ORDERCONFIRMATIONPAGE);
  }
  onLoginClick(){
    // Preserve intent to go to Checkout if coming from Cart, else default to Products
    const nextAfterLogin = (this.summary && this.summary.previousPage === CARTPAGE) ? CHECKOUTPAGE : PRODUCTSPAGE;
    this.navigateTo(LOGINPAGE, 'Login', nextAfterLogin);
  }
  onLogOutClick(){
    this.hideAll();
    //Need to Process and remove the login.
    setState(getProductsCONSTANT());
    setSummary({ totalCount: 0, totalPrice: 0 , loggedIn: false, orderPlaced: false, newUser: true});
    setSiteUser({id:'newContact', Name : '', Email: '', Street: '', City: '', State: '', PostalCode: '', Country: '', MobilePhone: ''});
    
    window.localStorage.removeItem(KEYhalwaProducts);
    window.localStorage.removeItem(KEYsummary);
    window.localStorage.removeItem(KEYsiteUser);
    this.summary = { ...this.summary, 
      previousPage: this.summary.currentPage,
      currentPage: HOMEPAGE };

    this.onHomeClick();
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
    console.log('HalwaKadai_homePage_mainComponent : onOrderConfirmationClick');
    // Defer state updates to avoid promise rejection during component lifecycle
    Promise.resolve().then(() => {
      this.hideAll();
      console.log('after hideAll()');
      this.orderConfirmationClass='slds-show';
      this.isActive_OderConfimation=true;
      this.updateDocumentTitle('Order Confirmation');
    }).catch(error => {
      console.error('Error updating order confirmation state:', error);
    });
  }
  handleBackToHome() {
    console.log('handleBackToHome()');
    //reset state and summary to defaults when going back to home
    setState(getProductsCONSTANT());
    setSummary({ totalCount: 0, totalPrice: 0 , loggedIn: true, orderPlaced: false, newUser: false , previousPage: 'halwaKadaiOrderConfirmation', currentPage: 'halwaKadaiHomePage', nextPage: 'halwaKadaiProductsPage' });
    this.onHomeClick();
  }
  handleContinueShopping() {
    console.log('handleContinueShopping()');
    //reset state and summary to defaults when going back to home
    setState(getProductsCONSTANT());
    setSummary({ totalCount: 0, totalPrice: 0 , loggedIn: true, orderPlaced: false, newUser: false, previousPage: 'halwaKadaiOrderConfirmation', currentPage: 'halwaKadaiProductsPage', nextPage: 'halwaKadaiCartPage' });
    this.onProductsClick();
  }
  hideAll(){
    // Retained for backward compatibility; now handled by setSectionVisibility
    this.setSectionVisibility(); // no-op reset
  }

  handleProductCount(event) {
    console.log('handleProductCount(event) {');
    const { productCount } = event.detail;
    // Do whatever you need: update state, call Apex, refresh UI...
    this.productCount = productCount;
    console.log('Child says:',productCount);
  }

  handleCheckOut(event) {
    console.log(`${CLASSNAME} :  handleCheckOut`);
    this.summary = getSummary();
    console.log('HalwaKadai_homePage_mainComponent : handleCheckOut : summary = ', this.summary);

    // If not logged in, route Cart -> Login -> Checkout
    if (this.summary && this.summary.loggedIn === false) {
      setSummary({
        ...this.summary,
        previousPage: CARTPAGE,
        currentPage: LOGINPAGE,
        nextPage: CHECKOUTPAGE
      });
      this.onLoginClick();
      this.handleScrollTop();
      return;
    }

    // Logged in: go straight to Checkout
    setSummary({
      ...this.summary,
      previousPage: CARTPAGE,
      currentPage: CHECKOUTPAGE,
      nextPage: ORDERCONFIRMATIONPAGE
    });
    this.onCheckoutClick();
    this.handleScrollTop();
  }

  handleOrderConfirmationClick() {
    console.log('HalwaKadai_homePage_mainComponent : handleOrderConfirmationClick');
    this.onOrderConfirmationClick();
    this.handleScrollTop();
  }
  handleLogin(){
    console.log('HalwaKadai_homePage_mainComponent : handleLogin() ');
    this.summary = getSummary();
    console.log('HalwaKadai_homePage_mainComponent : handleLogin() : summary = ', this.summary);
    if(this.summary.nextPage === CHECKOUTPAGE){ 
      setSummary({ ...this.summary, 
        previousPage: this.summary.currentPage,
        currentPage: CHECKOUTPAGE, 
        nextPage: ORDERCONFIRMATIONPAGE });
      this.onCheckoutClick();
    } else {
      setSummary({ ...this.summary,
        currentPage: PRODUCTSPAGE, 
        nextPage: CARTPAGE });
      this.onProductsClick();
    }
  }
  handleScrollTop() { // Scroll the entire window to the top 
    window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
        // adds smooth animation
    });
  }
  onInitializeDataClick(){
    console.log('HalwaKadai_homePage_mainComponent : onInitializeDataClick() ');
    initializeData().then(() => {
      console.log('Data initialization successful');
      // Optionally, you can refresh the page or re-fetch data here to reflect the initialized data
    })
    .catch(error => {
      console.error('Error initializing data:', error);
    });
    // Call Apex method to initialize data
  }
}