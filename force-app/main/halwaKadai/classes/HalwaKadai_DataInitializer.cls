public with sharing class HalwaKadai_DataInitializer {
    /*
    Execuite this Class after adding the Products with Price first.
    
    */
    public static string HALWAKADAI = 'HalwaKadai';
    public static string HALWASHOP = 'HalwaShop';
    public static string CLASSNAME = 'HalwaKadai_HelperClass';
    @AuraEnabled
    public static void initializeData() {
        System.debug('HalwaKadai_Initializer : init');
        Id accountId;
        Id contractId;
        Id pricebook2Id;
        List<Account> accountList = [SELECT Id FROM Account WHERE Name = :HALWAKADAI LIMIT 1];
        if (accountList.isEmpty()) {
            System.debug('No existing account found with name: HalwaKadai. Creating new account.');
            accountId = createAccount(HALWAKADAI);
        } else {
            accountId = accountList[0].Id;
        }
        List<Contract> contractList = [SELECT Id FROM Contract WHERE AccountId = :accountId LIMIT 1];
        if (contractList.isEmpty()) {
            System.debug('No existing Contract found with name: HalwaKadai. Creating new Contract.');
            contractId = createContract(accountId);
        } else {
            contractId = contractList[0].Id;
        }
        List<Pricebook2> pricebook2List = [SELECT Id FROM Pricebook2 WHERE Name = :HALWAKADAI LIMIT 1];
        if (pricebook2List.isEmpty()) {
            System.debug('No existing Pricebook2 found with name: HalwaKadai. Creating new Pricebook2.');
            pricebook2Id = createPricebook2(HALWAKADAI);
        } else {
            pricebook2Id = pricebook2List[0].Id;
        }

        /* // No Need to get this as we are creating the PricebookEntry for the products which do not have active PricebookEntry in the specified Pricebook2
        
        List<Product2> halwaProducts = [
            SELECT Name, ProductCode, Description, StockKeepingUnit, Image_URL__c,
                HomePage_Visible__c, Tag__c, Price__c,
                (SELECT Id, Name, UnitPrice  
                    FROM PricebookEntries 
                    WHERE IsActive = true 
                    AND Pricebook2.Id = :pricebook2Id 
                    ORDER BY CreatedDate DESC 
                    LIMIT 1)
            FROM Product2 
            WHERE RecordType.DeveloperName = 'HalwaShop'
        ];
        for (Product2 prod : halwaProducts) {
            System.debug('Product: ' + prod.Name + ' | Code: ' + prod.ProductCode);
            if (prod.PricebookEntries != null && !prod.PricebookEntries.isEmpty()) {
                PricebookEntry latestPBE = prod.PricebookEntries[0];
                System.debug('Latest Price: ' + latestPBE.UnitPrice);
            } else {
                System.debug('No active PricebookEntry found for this product in the specified Pricebook2.');
            }
        }
        
        */

        List<Product2> halwaProductsWithoutPBE = [
            SELECT Name, ProductCode, Description, StockKeepingUnit, Image_URL__c,
                HomePage_Visible__c, Tag__c, Price__c
            FROM Product2 
            WHERE RecordType.DeveloperName = :HALWASHOP
            AND Id NOT IN (
                SELECT Product2Id 
                FROM PricebookEntry 
                WHERE PriceBook2.Id = :pricebook2Id 
                AND IsActive = TRUE
            ) 
            ORDER BY Name
        ];
        if(!halwaProductsWithoutPBE.isEmpty()){
            System.debug('Products without active PricebookEntry in the specified Pricebook2:');
            createPriceBookEntriesForProducts(halwaProductsWithoutPBE, pricebook2Id);
        } else {
            System.debug('All products have active PricebookEntry in the specified Pricebook2. No PricebookEntry records need to be created.');
        }

        System.debug('accountId : ' + accountId);
        System.debug('contractId : ' + contractId);
        System.debug('pricebook2Id : ' + pricebook2Id);
        System.debug('Done with init : Continue with HalwaShop');

    }

    public static Id createAccount(String accName){
        System.debug(CLASSNAME + ': createAccount ');
        Account acc = new Account();
        acc.Name = accName;
        insert acc;
        return acc.Id;
    }
    public static Id createContract(Id accId){
        System.debug(CLASSNAME + ': createContract ');
        Contract con = new Contract();
        con.accountId = accId;
        con.ContractTerm = 12;
        con.StartDate = Date.today();
        con.Status = 'Draft';
        insert con;
        return con.Id;
    }
    public static Id createPricebook2(String pbName){
        System.debug(CLASSNAME + ': createPricebook2 ');
        Pricebook2 pb = new Pricebook2();
        pb.Name = pbName;
        pb.IsActive = true;
        insert pb;
        return pb.Id;
    }
    public static void createPriceBookEntriesForProducts(List<Product2> products, Id pricebook2Id){
        System.debug(CLASSNAME + ': createPriceBookEntriesForProducts ');
        List<PricebookEntry> pricebookEntries = new List<PricebookEntry>();
        for(Product2 prod : products){
            PricebookEntry pbe = new PricebookEntry();
            pbe.Product2Id = prod.Id;
            pbe.Pricebook2Id = pricebook2Id;
            pbe.UnitPrice = prod.Price__c != null ? prod.Price__c : 0; // Set to 0 if Price__c is null
            pbe.IsActive = true;
            pricebookEntries.add(pbe);
        }
        if(!pricebookEntries.isEmpty()){
            insert pricebookEntries;
            System.debug('Created ' + pricebookEntries.size() + ' PricebookEntry records for products without active PricebookEntry in the specified Pricebook2.');
        } else {
            System.debug('No products found without active PricebookEntry in the specified Pricebook2. No PricebookEntry records created.');
        }
    }
}