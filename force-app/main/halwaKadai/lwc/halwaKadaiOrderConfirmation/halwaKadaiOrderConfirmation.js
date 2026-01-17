import { LightningElement } from 'lwc';

export default class HalwaKadaiOrderConfirmation extends LightningElement {
    handlePrint() {
        window.print();
    }
}