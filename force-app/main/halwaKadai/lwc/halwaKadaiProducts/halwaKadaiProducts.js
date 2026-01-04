import { LightningElement, wire, track } from 'lwc';
import getProducts from '@salesforce/apex/Halwakadai_HelperClass.getProductsDetails';
export default class HalwaKadaiProducts extends LightningElement {
  
    @track halwaProducts = [];

    @wire(getProducts)
    wiredProducts({ error, data }) {
        if (data) {
            this.products = data.map((prod, index) => ({
                id: prod.Id,
                url: prod.Image_URL__c, // custom field from Product2
                alt: `Halwa Kadai - Slide ${index + 1}`,
                name: prod.Name,
                description: prod.Description,
                homeVisible: prod.HomePage_Visible__c,
                tag: prod.Tag__c, 
                price: prod.Price__c
            }));
       
        } else if (error) {
              this.error = error;
              // Log everything we can, even in Locker
              // eslint-disable-next-line no-console
              console.error('Error fetching products → raw:', error);
              // eslint-disable-next-line no-console
              console.error('Error.body:', error?.body);
              // eslint-disable-next-line no-console
              console.error('Error.body.message:', error?.body?.message);
              // eslint-disable-next-line no-console
              console.error('Error.status:', error?.status, 'Error.statusText:', error?.statusText);
            }

    }
}