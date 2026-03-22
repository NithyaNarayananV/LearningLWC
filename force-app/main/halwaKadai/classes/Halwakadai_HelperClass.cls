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

    // Class constants
    private static final String CLASSNAME = 'Halwakadai_HelperClass';
    private static final String HALWASHOP = 'HalwaShop';
    private static final String HALWAKADAI = 'HalwaKadai';
    private static Account halwaKadaiAccount;// = [SELECT Id, Description FROM Account WHERE Name = :HALWAKADAI LIMIT 1];
    private static Contract halwaKadaiContract;// = [SELECT Id FROM Contract WHERE AccountId = :halwaKadaiAccount.Id LIMIT 1];
    private static Pricebook2 halwaKadaiPricebook;// = [SELECT Id FROM Pricebook2 WHERE Name = :HALWAKADAI LIMIT 1];


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
    private static void initializeData(){
        if (halwaKadaiAccount == null || halwaKadaiContract == null || halwaKadaiPricebook == null) {
            // Use USER_MODE for access control and add SECURITY_ENFORCED for field/security checks where supported
            halwaKadaiAccount = [
                SELECT Id, Description
                FROM Account
                WHERE Name = :HALWAKADAI
                LIMIT 1 
            ];
            halwaKadaiContract = [
                SELECT Id
                FROM Contract
                WHERE AccountId = :halwaKadaiAccount.Id
                LIMIT 1 
            ];
            halwaKadaiPricebook = [
                SELECT Id
                FROM Pricebook2
                WHERE Name = :HALWAKADAI
                LIMIT 1 
            ];
        }
    }

    // Static list to hold addresses throughout the class
    public static List<AddressWrapper> addressList = new List<AddressWrapper>();

    @AuraEnabled(cacheable=true)
    public static List<Product2> getProductsDetails() {
        return [
            SELECT Name, ProductCode, Description, StockKeepingUnit, Image_URL__c,
                   HomePage_Visible__c, Tag__c, Price__c,
                   (SELECT Id, UnitPrice FROM PricebookEntries WHERE IsActive = true AND Pricebook2.Name = :HALWAKADAI ORDER BY CreatedDate DESC LIMIT 1)
            FROM Product2
            WHERE RecordType.DeveloperName = :HALWASHOP 
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
        initializeData();
        Order newOrder = new Order(

            AccountId = halwaKadaiAccount.Id,
            ContractId = halwaKadaiContract.Id, 
            Pricebook2Id = halwaKadaiPricebook.Id,
            
            Status = 'Draft',
            EffectiveDate = Date.today(),
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
        Database.SaveResult srOrder = Database.insert(newOrder, /*allOrNone*/false, AccessLevel.USER_MODE);
        if (!srOrder.isSuccess()) {
            // Return early on failure
            return null;
        }
        newOrder.Id = srOrder.getId();

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
            Database.SaveResult[] oiResults = Database.insert(orderItems, /*allOrNone*/false, AccessLevel.USER_MODE);
            // Optional: could aggregate errors; behavior-preserving minimal handling
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
        Database.SaveResult sr = Database.insert(con, /*allOrNone*/false, AccessLevel.USER_MODE);
        if (!sr.isSuccess()) {
            return null;
        }
        con.Id = sr.getId();
        System.debug('createContact - Inserted : ' + con);
        return con.Id;
    }

    @AuraEnabled
    public static void updateContact(
        Id contactId,
        String name,
        String phone,
        String email,
        String street,
        String city,
        String state,
        String postalCode,
        String country
    ) {
        System.debug('updateContact - contactId: ' + contactId);
        
        // Query the existing contact
        Contact con = [SELECT Id, LastName, Phone, Email, MailingStreet, MailingCity, MailingState, MailingPostalCode, MailingCountry FROM Contact WHERE Id = :contactId LIMIT 1];
        
        if (con != null) {
            // Update fields
            con.LastName = name == null ? 'Unknown' : name;
            con.Phone = phone;
            con.Email = email;
            con.MailingStreet = street;
            con.MailingCity = city;
            con.MailingState = state;
            con.MailingPostalCode = postalCode;
            con.MailingCountry = country;
            
            Database.SaveResult sr = Database.update(con, /*allOrNone*/false, AccessLevel.USER_MODE);
            if (!sr.isSuccess()) {
                // no-op; keep behavior minimal
            }
            System.debug('updateContact - Updated: ' + con);
        } else {
            System.debug('updateContact - Contact not found for Id: ' + contactId);
        }
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
        List<Contact> conList = [
            SELECT Id, Name, Phone, Email, MailingStreet, MailingCity, MailingState, MailingPostalCode, MailingCountry
            FROM Contact
            WHERE Email = :email
            LIMIT 1
         ];
        System.debug(CLASSNAME + ' : searchContactF - Found contacts: ' + conList.size()   + ' for email: ' + email);
        System.debug(CLASSNAME + ' : searchContactF - Found contacts: ' + conList   + ' for email: ' + email);
        return conList.isEmpty() ? null : conList[0]; 
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
        System.debug(CLASSNAME + ': sentEmailOTP');
        Boolean sendEmailOTP = false;
        List<String> emailCCList = new List<String>();

        Integer otp = otpGenerator();
        try {
            System.debug(CLASSNAME + ': sentEmailOTP : optGenerated : '+otp);
            
            // 2. Get the Template ID - Added null check
            EmailTemplate etOTP = [
                SELECT Id, Subject, HtmlValue
                FROM EmailTemplate
                WHERE DeveloperName LIKE :('HalwaKadai_Sent_OTP%')
                LIMIT 1
             ];
            
            if (halwaKadaiAccount == null) {
                initializeData();
            }

            if(halwaKadaiAccount != null){
                // Parse the Account.Description JSON
                Map<String, Object> parsedMap = (Map<String, Object>) JSON.deserializeUntyped((String)halwaKadaiAccount.Description);
                // Extract EmailOTP flag
                sendEmailOTP = parsedMap.containsKey('EmailOTP') 
                    ? (Boolean) parsedMap.get('EmailOTP') 
                    : false;

                // Extract EmailCC list
                emailCCList = new List<String>();
                if (parsedMap.containsKey('EmailCC')) {
                    // EmailCC is already a nested JSON object, so cast directly
                    Map<String, Object> parsedMapEmailCC = (Map<String, Object>) parsedMap.get('EmailCC');

                    for (String key : parsedMapEmailCC.keySet()) {
                        emailCCList.add((String) parsedMapEmailCC.get(key));
                    }
                }
                System.debug(CLASSNAME + ': sentEmailOTP : EmailOTP from Account Description : '+sendEmailOTP);
            }
            if (etOTP == null || etOTP.Id == null) {
                System.debug('No Email Template found with DeveloperName LIKE HalwaKadai_Sent_OTP%');
            }

            // 3. Process the HTML Body
            String htmlBody = etOTP.HtmlValue;
            
            // Check if the template contains the expected placeholder
            if (htmlBody.contains('[[OTP_CODE]]')) {
                String finalBody = htmlBody.replace('[[OTP_CODE]]', String.valueOf(otp));
                
                // 4. Prepare the message
                Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
                mail.setToAddresses(new String[] { email });

                mail.setCcAddresses(emailCCList);
                System.debug(CLASSNAME + ': sentEmailOTP : CC Email from Account Description : '+emailCCList);
                System.debug(CLASSNAME + ': sentEmailOTP : CC Email from Account Description : '+(emailCCList != null ? emailCCList[0] : 'No CC Email'));
                mail.setSubject(etOTP.Subject); 
                mail.setHtmlBody(finalBody);
                
                if((Boolean)sendEmailOTP)
                { 
                    System.debug(CLASSNAME + ': sentEmailOTP : Email will be sent to  : ' + email);
                    System.debug(CLASSNAME + ': sentEmailOTP : Email body  : ' + mail.getHtmlBody());

                    Messaging.SendEmailResult[] results = Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{mail});
                    
                    if (results[0].isSuccess()) {
                        System.debug(CLASSNAME + ': sentEmailOTP : Email Sent Successfully with OTP : ' + otp);
                    } else {
                        System.debug(CLASSNAME + ': sentEmailOTP : Email failed: ' + results[0].getErrors()[0].getMessage());
                    }
                }
                System.debug(CLASSNAME + ': sentEmailOTP : OTP Sent Successfully: ' + otp);
            } else {
                System.debug(CLASSNAME + ': sentEmailOTP : Email template does not contain [[OTP_CODE]] placeholder');
            }
        } catch (Exception e) {
            System.debug(CLASSNAME + ': sentEmailOTP : Error in sendEmailOTP: ' + e.getMessage());
        }
        return otp;
    }

    public static Integer otpGenerator() {
        System.debug(CLASSNAME + ': otpGenerator');
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
         try {
            // 1. Fetch the Email Template
            EmailTemplate et = [
                SELECT Id, Subject, HtmlValue 
                FROM EmailTemplate 
                WHERE DeveloperName LIKE 'HalwaKadai_Order_Confimation%' 
                LIMIT 1
            ];

            // 2. Optimized SOQL: Query only necessary fields
            Order ord = [
                SELECT Id, EffectiveDate, OrderNumber, TotalAmount,
                       BillToContact.Email, BillToContact.Name,
                       (SELECT Id, Product2.Name, Quantity, TotalPrice FROM OrderItems)
                FROM Order
                WHERE Id = :orderId
                LIMIT 1
             ];

            if (ord.BillToContact == null || String.isBlank(ord.BillToContact.Email)) {
                System.debug('Error: Order has no BillToContact or Email address.');
                return;
            }

            // 3. Build the Item List string for the placeholder
            List<String> itemParts = new List<String>();
            for (OrderItem oi : ord.OrderItems) {
                itemParts.add(oi.Product2.Name + ' x' + oi.Quantity + ' (₹' + oi.TotalPrice + ')');
            }
            String itemListHtml = String.join(itemParts, ', <br/>');

            // 4. Perform Manual Merge (Replacing Placeholders in Template)
            String htmlBody = et.HtmlValue;
            htmlBody = htmlBody.replace('[[Customer_Name]]', ord.BillToContact.Name);
            htmlBody = htmlBody.replace('[[Order_Number]]', ord.OrderNumber);
            htmlBody = htmlBody.replace('[[Order_Date]]', ord.EffectiveDate.format());
            htmlBody = htmlBody.replace('[[Item_List]]', itemListHtml);
            htmlBody = htmlBody.replace('[[Total_Amount]]', String.valueOf(ord.TotalAmount));

            // 5. Create and Send Email (toggle by Account flag if available)
            Boolean sendEmail = false;
            if (halwaKadaiAccount == null) {
                initializeData();
            }
            if (halwaKadaiAccount != null && String.isNotBlank(halwaKadaiAccount.Description)) {
                try {
                    Map<String, Object> flags = (Map<String, Object>) JSON.deserializeUntyped((String)halwaKadaiAccount.Description);
                    Object flagVal = flags.get('EmailOrderConfirmation');
                    if (flagVal instanceof Boolean) {
                        sendEmail = (Boolean) flagVal;
                    }
                } catch (Exception ignore) {}
            }

            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            mail.setToAddresses(new List<String>{ ord.BillToContact.Email });
            mail.setSubject(et.Subject);
            mail.setHtmlBody(htmlBody);
            if (sendEmail) {
                Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
            }

        } catch (Exception e) {
            System.debug('Error in sendOrderConfirmationEmail: ' + e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static User getCurrentUser() {
        User currentUser = [
            SELECT Id, Name, Email, Username, Profile.Name, UserRole.Name, Department, Title
            FROM User
            WHERE Id = :UserInfo.getUserId()
        ];

        System.debug('User Full Name: ' + currentUser.Name);
        System.debug('User Email: ' + currentUser.Email);
        System.debug('User Profile: ' + currentUser.Profile.Name);
        System.debug('User Role: ' + currentUser.UserRole.Name);
        System.debug('User Department: ' + currentUser.Department);
        System.debug('User Title: ' + currentUser.Title);
        return currentUser;
    }

}