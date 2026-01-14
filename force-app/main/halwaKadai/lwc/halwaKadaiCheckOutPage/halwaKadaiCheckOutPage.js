import { LightningElement } from 'lwc';
import { getState, setState , getSummary, subscribe as stateSubscribe} from 'c/halwaKadaiUtils';

export default class HalwaKadaiCheckOutPage extends LightningElement {
    halwaProducts;
    summary;
    name='';
    address='';
    phone='';
    email='';
    isPlaceOrderDisabled=true;
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
    setName(event)
    {
        this.name=event.target.value.trim();
        // If empty, show error and highlight box 
        if (!this.name) { 
            event.target.setCustomValidity("Name cannot be empty"); 
            this.isPlaceOrderDisabled=true;
            console.log('        if (!this.name) ');
        }else{ 
            event.target.setCustomValidity(""); // clear error 
            this.isPlaceOrderDisabled=false;
            console.log('  if (!this.name)   this.isPlaceOrderDisabled=false;');
        } 
                this.allValueSet();

        event.target.reportValidity(); // triggers the red highlight
    }
    setAddress(event)
    {
        this.address=event.target.value.trim();
        if (!this.address) { 
            event.target.setCustomValidity("Name cannot be empty"); 
            this.isPlaceOrderDisabled=true;
            console.log('        if (!this.name) ');
        }else{ 
            event.target.setCustomValidity(""); // clear error 
            this.isPlaceOrderDisabled=false;
            console.log('  if (!this.address)   this.isPlaceOrderDisabled=false;');
        }
        this.allValueSet();
        event.target.reportValidity(); // triggers the red highlight
    }
    setPhone(event)
    {
        this.phone=event.target.value.trim();
        if (!this.phone) { 
            event.target.setCustomValidity("Name cannot be empty"); 
            this.isPlaceOrderDisabled=true;
        }else{ 
            event.target.setCustomValidity(""); // clear error
            this.isPlaceOrderDisabled=false;
            console.log('  if (!this.phone)   this.isPlaceOrderDisabled=false;');
        } 
                this.allValueSet();

        event.target.reportValidity(); // triggers the red highlight
    }
    setEmail(event)
    {
        this.email=event.target.value.trim();
        if (!this.email) { 
            event.target.setCustomValidity("Name cannot be empty"); 
            this.isPlaceOrderDisabled=true;
        }else{ 
            event.target.setCustomValidity(""); // clear error 
            this.isPlaceOrderDisabled=false;
            console.log('  if (!this.email)   this.isPlaceOrderDisabled=false;');
        }         this.allValueSet();

        event.target.reportValidity(); // triggers the red highlight
    }
    allValueSet(){
        if(this.name!='' && this.address!='' && this.phone !='' && this.email!='')
            this.isPlaceOrderDisabled=false;
        else            
            this.isPlaceOrderDisabled=true; 
    }
    onPlaceOrderHandler(){
        console.log('onPlaceOrderHandler');


    }

}