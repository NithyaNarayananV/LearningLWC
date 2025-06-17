import { LightningElement } from 'lwc';
import {loadStyle} from 'lightning/platformResourceLoader'
import fontawesome from '@salesforce/resourceUrl/fontawesome'
export default class MemoryGameLwc extends LightningElement {
    renderedcallback(){
        //reduce the repeated loding of the rendered callback method, we are using the below:
        if(this.isLibLoaded){
            return;
        }else{
                loadstyle(this,fontawesome+'/fontawesome/css/font-awesome.min.css').this(()=>{
                console.log('Font Awesome loaded successfully')
            }).catch(error => {
                console.error('Error loading Font Awesome:', error);
            });
            this.isLibLoaded = true; // Set the flag to true after loading
        }
    }
}