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

public without sharing class Halwakadai_HelperClass {

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
            FROM Product2 WHERE RecordType.DeveloperName  = 'HalwaShop'
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

        // Create order linked to contact and with billing/shipping address
        System.debug('createOrderWithContact - Before createOrder - contactId : ' + contactId);
        Order newOrder = new Order(
            AccountId = '001GA00005KAsGgYAL',// for LWC
            ContractId = '800GA000000b86cYAA', // for LWC 
            // NN AccountId = '001g500000DtRbBAAV', 
            // NN ContractId = '800g500000HrG4rAAF',
            EffectiveDate = Date.today(),
            Status = 'Draft',
            Pricebook2Id = '01sGA00000Zwd4SYAR',
            // NN Pricebook2Id = '01sg5000002JWkcAAG',
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
            LastName = name==null? 'Unknown' : name,
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
        System.debug(conList);  
        return conList.isEmpty() ? null : conList[0].Id;
    }
    @AuraEnabled
    public static Contact searchContactF(String email) {
        if (String.isBlank(email)) return null;
        return [ SELECT Id, name, phone, email, MailingStreet, MailingCity, MailingState, MailingPostalCode, MailingCountry FROM Contact WHERE Email = :email LIMIT 1];
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
        String country,
        Id contactId
    ){
        // Check if contact exists
        //Id contactId = searchContact(email);
        if (contactId == null) {
            System.debug('No existing contact found with email: ' + email + '. Creating new contact.');
            //contactId = createContact(name, phone, email, street, city, state, postalCode, country);
        }

        // Create order linked to contact and with billing/shipping address
        System.debug('createOrderWithContact - Before createOrder - contactId : ' + contactId);
        return createOrder(products, contactId, street, city, state, postalCode, country);
    }
    public static void sendOrderConfirmation(String toAddress, String orderId, Decimal totalPrice) {
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        mail.setToAddresses(new String[] { toAddress });
        mail.setSubject('Your Halwa Kadai Order Confirmation');
        mail.setPlainTextBody(
            'Hello,\n\n' +
            'Thank you for your order ' + orderId + '.\n' +
            'Total Price: ₹' + totalPrice + '\n\n' +
            'We will notify you once it ships.\n\n' +
            'Regards,\nHalwa Kadai Team'
        );
        //Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
    }

    @AuraEnabled
    public static Integer sendEmailOTP(String email) {
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        mail.setToAddresses(new String[] { email });
        mail.setSubject('Your Halwa Kadai Login OTP');

        Integer otp = otpGenerator();

        // Build HTML body
        String htmlBody = ''
            + '<html><body style="font-family:Segoe UI,Arial,sans-serif;">'
            + '<h2 style="color:#ff6600;">Halwa Kadai Login</h2>'
            + '<p>Hello,</p>'
            + '<p>Please use this OTP to login:</p>'
            + '<div style="font-size:24px;font-weight:bold;color:#333;'
            + 'padding:10px;border:1px solid #ccc;display:inline-block;">'
            + otp
            + '</div>'
            + '<p>Regards,<br/>Halwa Kadai Team</p>'
            + '</body></html>';

        mail.setHtmlBody(htmlBody);

        //Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
        System.debug('Disabled : OTP = '+otp);
        return otp;
    }

    public static Integer otpGenerator() {
        // Generates a random number between 1000 and 9999
        Integer min = 1000;
        Integer max = 9999;
        return (Integer)Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // --- your existing methods remain unchanged ---
    // e.g. sendEmailOTP(), other helpers

    /**
     * Sends an order confirmation email to the customer after placing an order.
     *
     * @param orderId The Id of the Order__c record
     */
    @AuraEnabled
    public static void sendOrderConfirmationEmail(Id orderId) {
        // Query standard Order and related OrderItems
        System.debug('sendOrderConfirmationEmail : orderId - '+orderId);
        Order ord = [
            SELECT Id, ContractId, AccountId,
                Pricebook2Id, OriginalOrderId, EffectiveDate,
                EndDate, Status, Type,
                BillingStreet, BillingCity, BillingState,
                BillingPostalCode, BillingCountry, BillingLatitude,
                BillingLongitude, BillingGeocodeAccuracy, BillingAddress,
                ShippingStreet, ShippingCity, ShippingState,
                ShippingPostalCode, ShippingCountry, ShippingLatitude,
                ShippingLongitude, ShippingGeocodeAccuracy, ShippingAddress,
                Name, PoDate, PoNumber, OrderReferenceNumber, BillToContactId,
                ShipToContactId, ActivatedDate, ActivatedById, StatusCode,
                OrderNumber, TotalAmount, BillToContact.Email,BillToContact.Name,
                (
                    SELECT Id, Product2Id,  Product2.Name, Product2.ProductCode,  IsDeleted, OrderId,
                            PricebookEntryId, OriginalOrderItemId, AvailableQuantity,
                            Quantity, UnitPrice, ListPrice, TotalPrice, ServiceDate,
                            EndDate, Description, CreatedDate, CreatedById, OrderItemNumber
                    FROM OrderItems
                )
            FROM Order
            WHERE Id = :orderId
            LIMIT 1
        ];

        // Build item list string
        String itemList = '';
        for (OrderItem oi : ord.OrderItems) {
            itemList += oi.Product2.Name + ' x' + oi.Quantity + ' (₹' + oi.TotalPrice + '), <br> ';
        }
        if (itemList.endsWith(', ')) {
            itemList = itemList.substring(0, itemList.length() - 2);
        }

        // Build HTML body
        String htmlBody =
            '<!DOCTYPE html>' +
            '<html><head><meta charset="UTF-8"></head><body style="font-family:Arial,sans-serif;background-color:#f7f7f7;margin:0;padding:0;">' +
            '<div style="max-width:600px;margin:20px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,0.1);">' +
                '<div style="background-color:#e67e22;color:#fff;padding:20px;text-align:center;">' +
                    '<h2>🍯 Halwa Kadai – Order Confirmation</h2>' +
                '</div>' +
                '<div style="padding:20px;color:#333;">' +
                    '<p>Hi ' + (ord.BillToContact != null ? ord.BillToContact.Name : '') + ',</p>' +
                    '<p>Thank you for your order! Here are your order details:</p>' +
                    '<table style="margin-top:15px;border-collapse:collapse;width:100%;">' +
                        '<tr><th style="border:1px solid #ddd;padding:8px;background:#f2f2f2;text-align:left;">Order Number</th><td style="border:1px solid #ddd;padding:8px;">' + ord.OrderNumber + '</td></tr>' +
                        '<tr><th style="border:1px solid #ddd;padding:8px;background:#f2f2f2;text-align:left;">Order Date</th><td style="border:1px solid #ddd;padding:8px;">' + String.valueOf(ord.EffectiveDate) + '</td></tr>' +
                        '<tr><th style="border:1px solid #ddd;padding:8px;background:#f2f2f2;text-align:left;">Items</th><td style="border:1px solid #ddd;padding:8px;">' + itemList + '</td></tr>' +
                        '<tr><th style="border:1px solid #ddd;padding:8px;background:#f2f2f2;text-align:left;">Total Amount</th><td style="border:1px solid #ddd;padding:8px;">₹ ' + String.valueOf(ord.TotalAmount) + '</td></tr>' +
                    '</table>' +
                    '<p>We’ll notify you once your order is ready for delivery.</p>' +
                    '<p>Sweet regards,<br/>The Halwa Kadai Team</p>' +
                '</div>' +
                '<div style="background-color:#f2f2f2;text-align:center;padding:15px;font-size:12px;color:#555;">' +
                    '© 2026 Halwa Kadai. All rights reserved.<br/>This is an automated email, please do not reply directly.' +
                '</div>' +
            '</div>' +
            '</body></html>';

        // Create email
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        mail.setToAddresses(new String[] { ord.BillToContact.Email });
        mail.setSubject('Your Halwa Kadai Order Confirmation');
        mail.setHtmlBody(htmlBody);

        // Send email
        //Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
        System.debug('Disabled Order Confimation Email ');

    }

}