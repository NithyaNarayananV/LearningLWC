import { LightningElement, track,wire } from 'lwc';
import getFormDetails from '@salesforce/apex/googleFormHelper.getFormDetails';
export default class QuestionForm extends LightningElement {
    @track length; // You can set this dynamically
    @track forms =[];
    // Wire service automatically calls Apex and provides response
    @wire(getFormDetails)
    wiredForm({ error, data }) {
        if (data) {
            // clone the array so it's no longer a proxy
            this.forms = JSON.parse(JSON.stringify(data));
            this.length = this.forms.length;

            this.initializeFormRows();
        } else if (error) {
            this.error = error;
            console.error('Error:', error);
        }
    }

    initializeFormRows() {
        for (let i = 0; i < this.forms.length; i++) {
            this.forms[i].MasterLabel = "Please enter your " + this.forms[i].MasterLabel + " Number";
            this.forms[i].Document = "Attach " + this.forms[i].Label+" Document";
            this.forms[i].value = "";
            this.forms[i].index = i + 1;
        }
    }
    onChangeValueHandler(event){
        const index = event.target.dataset-index;   // get index from template
        const newValue = event.target.value;        // get input value

        // clone array to trigger reactivity
        const updatedForms = [...this.forms];
        updatedForms[index].value = newValue;
        // reassign tracked property
        this.forms = updatedForms;
    }
}
/*
DeveloperName : "Driving_License"
Has_Attachment__c : false
Id : "m0SGA000000Pwbe2AC"
Label : "Driving License"
Language : "en_US"
MasterLabel :"Driving License"
QualifiedApiName :"Driving_License"
SystemModstamp : "2025-11-23T13:06:19.000Z"
[[Prototype]] : Object
*/