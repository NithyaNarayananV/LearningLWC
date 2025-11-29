import { LightningElement, track,wire } from 'lwc';
import getFormDetails from '@salesforce/apex/googleFormHelper.getFormDetails';

import renameFile from '@salesforce/apex/googleFormHelper.renameFile';
import submitHandler from '@salesforce/apex/googleFormHelper.onSubmitHandler';

import { createRecord } from 'lightning/uiRecordApi';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import LASTNAME_FIELD from '@salesforce/schema/Contact.LastName';
const FIELDS = [ LASTNAME_FIELD];

export default class QuestionForm extends LightningElement {
    @track length; // You can set this dynamically
    @track forms =[];
    inactivityTimeout;
    timeoutDuration = 30000; 
    isSubmitted=false;
    deleteDocsID=[];
    _forms;

    set forms(value) {
        this._forms = value; 
    }

    get forms() {
        return this._forms;
    }

    // Wire service automatically calls Apex and provides response
    @wire(getFormDetails)
    wiredForm({ error, data }) {
        if (data) {
            this.forms = JSON.parse(JSON.stringify(data));
            this.length = this.forms.length;
            console.log('From JS after SOQL:', this.forms);
            this.initializeFormRows();

        } else if (error) {
            this.error = error;
            console.error('Error:', error);
        }
    }
    display(i){
            console.log('DeveloperName =', this.forms[i].DeveloperName);
            console.log('MasterLabel =', this.forms[i].MasterLabel);
            console.log('Label =', this.forms[i].Label);
            console.log('QualifiedApiName =', this.forms[i].QualifiedApiName);
            console.log('Has_Attachment__c =', this.forms[i].Has_Attachment__c);
            console.log('Input_Type__c =', this.forms[i].Input_Type__c);
            console.log('pattern =',this.forms[i].pattern);
            console.log('InputValue ==',this.forms[i].InputValue);
            console.log('contactRecordId =',this.forms[i].contactRecordId);
            console.log('oldFileName =', this.forms[i].oldFileName);
            console.log('newFileName =',this.forms[i].newFileName);
            console.log('documentID =',this.forms[i].documentID);
    }
    initializeFormRows() {
        for (let i = 0; i < this.forms.length; i++) {
            console.log('B4 Initialization : ', this.forms[i]);
            this.display(i);
            this.forms[i].MasterLabel = "Please enter your " + this.forms[i].MasterLabel + " Number";
            this.forms[i].Document = "Attach " + this.forms[i].Label+" Document";
            if(this.forms[i].Input_Type__c==='Number Only')
                this.forms[i].pattern = "[0-9]*";
            else if(this.forms[i].Input_Type__c==='Alpha Only')
                this.forms[i].pattern = "[A-Za-z]*";
            else if(this.forms[i].Input_Type__c==='Alpha Numerical')
                this.forms[i].pattern = "[A-Za-z0-9]*";
            else
                this.forms[i].pattern = "[A-Za-z0-9]*";
            this.forms[i].docsUploaded=false;
            this.forms[i].value = "";
            this.forms[i].disableUpload = true;

            this.forms[i].index = i + 1;
            console.log('After Initialization:', this.forms[i]);
            this.display(i);
        }
    }
    onChangeValueHandler(event){
        const index = event.target.dataset.index;   // get index from template
        const newValue = event.target.value;        // get input value
        const updatedForms = [...this.forms];
        this.forms[index].value = newValue;
        this.forms[index].disableUpload = false;
        this.forms[index].contactRecordId= this.contactId;
        this.forms[index].newFileName= newValue;
        //this.forms = updatedForms;
        console.log(this.forms);
        this.display(index);
    }
    contactName='';
    contactId='';
    onChangeNameHandler(event){
        this.contactName = event.target.value;
        console.log("Contact's Name : ",this.contactName);
    }
    onSubmitHandler(){
        this.isSubmitted=true;

        //this method suppose to call a apex method which will :  suppose to save the fields data to the contact's description field. and rename the document uploaded.
        //submitHandler
        console.log('From JS Before Sumbit Apex:', this.forms);
        console.log('Complete forms:', JSON.stringify(this.forms));
        console.log('Complete forms:', JSON.stringify(this.forms, null, 2));
        this.forms.forEach((form, index) => {
            console.log(`Form ${index}:`, form);
        });
        console.table(this.forms);

        Promise.resolve().then(() => {
            console.log('After update:', JSON.stringify(this.forms));
        });

        //this.display();
        submitHandler({ listMapCMTn: this.forms })
            .then(() => {
                console.log(' successfully');
            })
            .catch(error => {
                console.error(' file:', error);
            });
    }
    onCreateContactClick(){
        const fields = {};
        fields[LASTNAME_FIELD.fieldApiName] = this.contactName;
        const recordInput = { apiName: CONTACT_OBJECT.objectApiName, fields };

        createRecord(recordInput)
            .then(contact => {
                console.log('Contact created with Id: ', contact.id);
                //alert('Contact created successfully! Id: ' + contact.id);
                this.contactId=contact.id;
            })
            .catch(error => {
                console.error('Error creating contact: ', error);
                alert('Error: ' + error.body.message);
            });
    }
    handleUploadFinished(event){
        const uploadedFiles = event.detail.files;

        console.log("Details : ",event.detail);
        console.log("Target : ",event.target);

        const fileUploadComponent = event.target;

        // Access dynamic attributes from template
        const index = fileUploadComponent.dataset.index;   // get index from template
        const label = fileUploadComponent.label; // form.Document
        const fileName = fileUploadComponent.name; // form.fileName
        const recordId = fileUploadComponent.recordId; // form.contactRecordId

        //if the reuploding on a particular item, to prevent duplication, we store the old id and delete it later.
        console.log('this.forms[index].documentID ',this.forms[index].documentID);

        const lenDoc = this.forms[index].documentID.length;
        console.log('length of docID : ',lenDoc);
        if(lenDoc>0){
            console.log('delete docs id added : ',deleteDocsID);
            deleteDocsID.push(this.forms[index].documentID);
        }

        console.log('Uploaded Files:', uploadedFiles);
        console.log('Label:', label);
        console.log('Custom Name:', fileName);
        console.log('Linked Record Id:', recordId);
        uploadedFiles.forEach(file => {
            console.log('Uploaded file:', file.name, 'Document Id:', file.documentId);
 
            const updatedForms = [...this.forms];
            updatedForms[index] = {
                ...updatedForms[index], // keep existing fields
                disableUpload:true,
                docsUploaded:true,
                documentId: file.documentId,
                downloadUrl: `/sfc/servlet.shepherd/document/download/${file.documentId}`,
                downloadUrlPDF: `/sfc/servlet.shepherd/document/download/${file.documentId}?operation=VIEW`,

                defaultName: file.name
            };

            console.log('updatedForms[index].documentId', updatedForms[index].documentId, 'updatedForms[index].defaultName ', updatedForms[index].defaultName );

            this.forms = updatedForms;
            console.log('this.forms[index].documentId', this.forms[index].documentId, 'this.forms[index].defaultName ', this.forms[index].defaultName );

            this.forms.forEach((form, index) => {
                console.log(`Form ${index}:`, form);
            });

            console.log(this.forms);
            // Call Apex to rename
            /*renameFile({ documentId: file.documentId, newName: updatedForms[index].fileName })
                .then(() => {
                    console.log('File renamed successfully');
                })
                .catch(error => {
                    console.error('Error renaming file:', error);
                });
                */
        });
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