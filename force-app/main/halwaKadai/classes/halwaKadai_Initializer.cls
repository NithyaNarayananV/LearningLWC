public with sharing class halwaKadai_Initializer {
    /*
    Execuite this Class after adding the Products with Price first.
    
    */
    public halwaKadai_Initializer() {


    }
    public static void init() {
        System.debug('halwaKadai_Initializer : init');
        Id accountId;
        Id contractId;
        Id pricebook2Id;
        List<Account> accountList = [SELECT Id FROM Account WHERE Name = 'HalwaKadai' LIMIT 1];
        if (accountList.isEmpty()) {
            System.debug('No existing account found with name: HalwaKadai. Creating new account.');
            accountId = createAccount('HalwaKadai');
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
        List<Pricebook2> pricebook2List = [SELECT Id FROM Pricebook2 WHERE Name = 'HalwaKadai' LIMIT 1];
        if (pricebook2List.isEmpty()) {
            System.debug('No existing Pricebook2 found with name: HalwaKadai. Creating new Pricebook2.');
            pricebook2Id = createPricebook2('HalwaKadai');
        } else {
            pricebook2Id = pricebook2List[0].Id;
        }

       /* [
            SELECT Name, ProductCode, Description, StockKeepingUnit, Image_URL__c,
                   HomePage_Visible__c, Tag__c, Price__c,
                   (SELECT Id, UnitPrice FROM PricebookEntries WHERE IsActive = true ORDER BY CreatedDate DESC LIMIT 1)
            FROM Product2 WHERE RecordType.DeveloperName  = 'HalwaShop'
        ];

        SELECT Id, Name, ProductCode FROM Product2 WHERE RecordType.DeveloperName = 'HalwaShop'
        AND Id NOT IN (
            SELECT Product2Id FROM PricebookEntry WHERE PriceBook2.Name = 'HalwaShop_Test1' AND IsActive = TRUE
        ) ORDER BY Name
        */
        System.debug('accountId : ' + accountId);
        System.debug('contractId : ' + contractId);
        System.debug('pricebook2Id : ' + pricebook2Id);
        System.debug('Done with init : Continue with HalwaShop');


        /*Order newOrder = new Order(
             for LWC Org
            accountId = '001GA00005KAsGgYAL',// for LWC
            contractId = '800GA000000b86cYAA', // for LWC 
            pricebook2Id = '01sGA00000Zwd4SYAR',

            
            Status = 'Draft',
            EffectiveDate = Date.today(),
            BillToContactId = contactId,

        )
        */
    }
    public static Id createAccount(String accName){
        System.debug('HalwaKadai_HelperClass : createAccount ');
        Account acc = new Account();
        acc.Name = accName;
        insert acc;
        return acc.Id;
    }
    public static Id createContract(Id accId){
        System.debug('HalwaKadai_HelperClass : createContract ');
        Contract con = new Contract();
        con.accountId = accId;
        con.ContractTerm = 12;
        con.StartDate = Date.today();
        con.Status = 'Draft';
        insert con;
        return con.Id;
    }
    public static Id createPricebook2(String pbName){
        System.debug('HalwaKadai_HelperClass : createPricebook2 ');
        Pricebook2 pb = new Pricebook2();
        pb.Name = pbName;
        pb.IsActive = true;
        insert pb;
        return pb.Id;
    }
}
