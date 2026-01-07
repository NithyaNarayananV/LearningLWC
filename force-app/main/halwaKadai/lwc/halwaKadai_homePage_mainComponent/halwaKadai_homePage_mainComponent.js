// file: halwaKadai_homePage_mainComponent.js
import { LightningElement } from 'lwc';


export default class HalwaKadai_homePage_mainComponent extends LightningElement {
   isActive_Home=true;
   isActive_About=false;
   isActive_Product=false;
   isActive_Contact=false;

   productCount=0;

  onHomeClick(){
    this.isActive_Home=true;
    this.isActive_About=false;
    this.isActive_Product=false;
    this.isActive_Contact=false;
   }
  onAboutClick(){
    this.isActive_Home=false;
    this.isActive_About=true;
    this.isActive_Product=false;
    this.isActive_Contact=false;
   }
  onProductsClick(){
    this.isActive_Home=false;
    this.isActive_About=false;
    this.isActive_Product=true;
    this.isActive_Contact=false;
   }
  onContactClick(){
    this.isActive_Home=false;
    this.isActive_About=false;
    this.isActive_Product=false;
    this.isActive_Contact=true;
   } 

  handleProductCount(event) {
    console.log('handleProductCount(event) {');
    const { productCount } = event.detail;
    // Do whatever you need: update state, call Apex, refresh UI...
    this.productCount = productCount;
    console.log('Child says:',productCount);
  }

}