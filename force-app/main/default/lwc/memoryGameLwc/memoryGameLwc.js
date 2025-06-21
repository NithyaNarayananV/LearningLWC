import { LightningElement } from 'lwc';
import {loadStyle} from 'lightning/platformResourceLoader'
import fontawesome from '@salesforce/resourceUrl/fontawesome'
export default class MemoryGameLwc extends LightningElement {
    isLibLoaded = false; // Flag to check if the library is loaded
cards = [
    { id: 1,  listClass: "card", type: 'diamond',   icon: 'fa fa-diamond' },
    { id: 2,  listClass: "card", type: 'heart',     icon: 'fa fa-heart' },
    { id: 3,  listClass: "card", type: 'star',      icon: 'fa fa-star' },
    { id: 4,  listClass: "card", type: 'circle',    icon: 'fa fa-circle' },
    { id: 5,  listClass: "card", type: 'square',    icon: 'fa fa-square' },
    { id: 6,  listClass: "card", type: 'triangle',  icon: 'fa fa-play' }, // Triangle substitute
    { id: 7,  listClass: "card", type: 'hexagon',   icon: 'fa fa-diamond' }, // Closest match
    { id: 8,  listClass: "card", type: 'pentagon',  icon: 'fa fa-heart' }, // Use same fallback
    { id: 9,  listClass: "card", type: 'octagon',   icon: 'fa fa-star' }, // Octagon-like
    { id: 10, listClass: "card", type: 'cross',     icon: 'fa fa-circle' },
    { id: 11, listClass: "card", type: 'arrow',     icon: 'fa fa-arrow-right' },
    { id: 12, listClass: "card", type: 'star-half', icon: 'fa fa-star' },
    { id: 13, listClass: "card", type: 'bell',      icon: 'fa fa-bell' },
    { id: 14, listClass: "card", type: 'leaf',      icon: 'fa fa-leaf' },
    { id: 15, listClass: "card", type: 'sun',       icon: 'fa fa-heart' },
    { id: 16, listClass: "card", type: 'moon',      icon: 'fa fa-star' }
];




    renderedCallback(){
        //reduce the repeated loding of the rendered callback method, we are using the below:
        if(this.isLibLoaded){
            return;
        }else{
                loadStyle(this,fontawesome+'/fontawesome/css/font-awesome.min.css').then(()=>{
                console.log('Font Awesome loaded successfully')
            }).catch(error => {
                console.error('Error loading Font Awesome:', error);
            });
            this.isLibLoaded = true; // Set the flag to true after loading
        }
    }
}