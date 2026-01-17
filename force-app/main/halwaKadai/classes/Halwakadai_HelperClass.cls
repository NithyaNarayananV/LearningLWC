/**
 * ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
 * Class Name      : Halwakadai_HelperClass
 * Author          : <YourName>
 * Created Date    : Jan 4, 2026
 * Last Modified By: <YourName>
 * Last Modified On: Jan 17, 2026
 * Description     : Helper class for Halwa Kadai checkout flow
 *  
 * Change History  :
 *  Date          │   Author     │   Change
 * ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
 *  Jan 4, 2026   │ <YourName>   │ Initial version
 *  Jan 17, 2026  │ <YourName>   │ Added AddressWrapper, billing/shipping address
 * ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
 */

public with sharing class Halwakadai_HelperClass {

    // Address wrapper to hold address details
    public class AddressWrapper {
        @AuraEnabled public String street;
        @AuraEnabled public String city;
        @AuraEnabled public String state;
        @AuraEnabled public String postalCode;
        @AuraEnabled public String country;

        public AddressWrapper(String street, String city, String state, String postalCode, String country) {
            this.street = street;
            this.city = city;
            this.state = state;
            this.postalCode = postalCode;
            this.country = country;
        }
    }

    // Static list to hold addresses throughout the class
    public static List<AddressWrapper> addressList = new List<AddressWrapper>();

    @AuraEnabled(cacheable=true)
    public static List<Product2> getProductsDetails() {
        return [
            SELECT Name, ProductCode, Description, StockKeepingUnit, Image_URL__c,
                   HomePage_Visible__c, Tag__c, Price__c,
                   (SELECT Id, UnitPrice FROM PricebookEntries WHERE IsActive = true ORDER BY CreatedDate DESC LIMIT 1)
            FROM Product2
            WHERE RecordType.DeveloperName = 'HalwaShop'
        ];
    }

    @AuraEnabled
    public static Id createOrder(
        List<Map<String,Object>> products,
        Id contactId,
        String street,
        String city,
        String state,
        String postalCode,
        String country
    ) {
        // Add address to static list
        addressList.add(new AddressWrapper(street, city, state, postalCode, country));

        Order newOrder = new Order(
            AccountId = '001GA00005KAsGgYAL',
            ContractId = '800GA000000b86cYAA',
            EffectiveDate = Date.today(),
            Status = 'Draft',
            Pricebook2Id = '01sGA00000Zwd4SYAR',
            BillToContactId = contactId,

            // Billing Address
            BillingStreet     = street,
            BillingCity       = city,
            BillingState      = state,
            BillingPostalCode = postalCode,
            BillingCountry    = country,

            // Shipping Address (same as billing here)
            ShippingStreet     = street,
            ShippingCity       = city,
            ShippingState      = state,
            ShippingPostalCode = postalCode,
            ShippingCountry    = country
        );
        insert newOrder;

        List<OrderItem> orderItems = new List<OrderItem>();

        for (Map<String,Object> prod : products) {
            Object qtyObj = prod.get('quantity');
            Integer quantity = 0;
            if (qtyObj != null) {
                if (qtyObj instanceof Decimal) quantity = ((Decimal) qtyObj).intValue();
                else if (qtyObj instanceof Double) quantity = ((Double) qtyObj).intValue();
                else if (qtyObj instanceof Integer) quantity = (Integer) qtyObj;
            }

            Id pricebookId = (Id) prod.get('pricebookId');
            Decimal unitPrice = (Decimal) prod.get('price');

            if (pricebookId != null && quantity > 0) {
                orderItems.add(new OrderItem(
                    OrderId = newOrder.Id,
                    PricebookEntryId = pricebookId,
                    Quantity = quantity,
                    UnitPrice = unitPrice
                ));
            }
        }

        if (!orderItems.isEmpty()) {
            insert orderItems;
        }

        return newOrder.Id;
    }

    @AuraEnabled
    public static Id createContact(
        String name,
        String phone,
        String email,
        String street,
        String city,
        String state,
        String postalCode,
        String country
    ) {
        System.debug('createContact');

        // Add address to static list
        addressList.add(new AddressWrapper(street, city, state, postalCode, country));

        Contact con = new Contact(
            LastName = name,
            Phone = phone,
            Email = email,
            MailingStreet     = street,
            MailingCity       = city,
            MailingState      = state,
            MailingPostalCode = postalCode,
            MailingCountry    = country
        );
        insert con;
        System.debug('createContact - Inserted : ' + con);
        return con.Id;
    }

    @AuraEnabled
    public static Id searchContact(String email) {
        if (String.isBlank(email)) return null;
        List<Contact> conList = [
            SELECT Id FROM Contact WHERE Email = :email LIMIT 1
        ];
        return conList.isEmpty() ? null : conList[0].Id;
    }

    @AuraEnabled
    public static Id createOrderWithContact(
        List<Map<String,Object>> products,
        String name,
        String phone,
        String email,
        String street,
        String city,
        String state,
        String postalCode,
        String country
    ) {
        // Check if contact exists
        Id contactId = searchContact(email);
        if (contactId == null) {
            contactId = createContact(name, phone, email, street, city, state, postalCode, country);
        }

        // Create order linked to contact and with billing/shipping address
        System.debug('createOrderWithContact - Before createOrder - contactId : ' + contactId);
        return createOrder(products, contactId, street, city, state, postalCode, country);
    }
}