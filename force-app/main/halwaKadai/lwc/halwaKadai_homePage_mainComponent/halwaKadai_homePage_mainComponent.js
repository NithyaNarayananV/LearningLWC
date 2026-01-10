// file: halwaKadai_homePage_mainComponent.js
import { LightningElement } from 'lwc';


export default class HalwaKadai_homePage_mainComponent extends LightningElement {
  isActive_Home=true;
  isActive_About=false;
  isActive_Product=false;
  isActive_Contact=false;
  cartClass='slds-hide';
  homeClass='slds-show';
  productClass='slds-hide';
  productCount=0;

  onHomeClick(){
    this.isActive_Home=true;
    this.isActive_About=false;
    this.isActive_Product=false;
    this.isActive_Contact=false;
    this.cartClass='slds-hide';
    this.homeClass='slds-show';
    this.productClass='slds-hide';
   }
  onAboutClick(){
    this.isActive_Home=false;
    this.isActive_About=true;
    this.isActive_Product=false;
    this.isActive_Contact=false;
    this.cartClass='slds-hide';
    this.homeClass='slds-hide'; 
    this.productClass='slds-hide';
   }
  onProductsClick(){
    this.isActive_Home=false;
    this.isActive_About=false;
    this.isActive_Product=true;
    this.isActive_Contact=false;
    this.cartClass='slds-hide';
    this.homeClass='slds-hide'; 
    this.productClass='slds-show'; 
   }
  onContactClick(){
    this.isActive_Home=false;
    this.isActive_About=false;
    this.isActive_Product=false;
    this.isActive_Contact=true;
    this.cartClass='slds-hide';
    this.homeClass='slds-hide'; 
    this.productClass='slds-hide'; 
   } 
  onCartClick(){
    this.isActive_Home=false;
    this.isActive_About=false;
    this.isActive_Product=false;
    this.isActive_Contact=false;
    this.cartClass='slds-show';
    this.homeClass='slds-hide'; 
    this.productClass='slds-hide'; 
   } 

  handleProductCount(event) {
    console.log('handleProductCount(event) {');
    const { productCount } = event.detail;
    // Do whatever you need: update state, call Apex, refresh UI...
    this.productCount = productCount;
    console.log('Child says:',productCount);
  }

}