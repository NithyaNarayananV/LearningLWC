import { LightningElement } from 'lwc';
import myImage from '@salesforce/resourceUrl/NNImage';
export default class HelloWorld extends LightningElement {
        greeting = 'World';
        imageUrl = myImage;
        changeHandler(event) {
        this.greeting = event.target.value;
        }
}