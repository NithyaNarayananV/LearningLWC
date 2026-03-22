public with sharing class HalwaKadai_DataInitializer {
    /**
     * Initializes data in a deterministic, idempotent order:
     * 1) Ensure Account and Contract exist
     * 2) Ensure Standard Price Book is active
     * 3) Ensure/Upsert custom Pricebook "HalwaKadai"
     * 4) Fetch/Upsert Products (assign correct RecordType: HALWASHOP) by ProductCode
     * 5) Ensure Standard PricebookEntries for all Products
     * 6) Ensure custom "HalwaKadai" PricebookEntries for all Products
     *
     * Notes:
     * - Uses Database methods to capture partial successes
     * - Avoids DML/SOQL in loops
     * - Safe to run multiple times (idempotent)
     */
    public enum ProductRecordType {
        HALWASHOP
    }
    public static final String HALWAKADAI = 'HalwaKadai';

    @AuraEnabled
    public static void initializeData() {
        // 1) Account and Contract
        Id accountId = ensureAccount(HALWAKADAI);
        ensureContract(accountId);

        // 2) Standard Price Book
        Id standardPbId = ensureStandardPricebookActive();

        // 3) Custom Pricebook (HalwaKadai)
        Id customPbId = ensurePricebook(HALWAKADAI);

        // 4) Fetch/Upsert Products (assign RecordType = HalwaShop)
        upsertProductsFromRemote(ProductRecordType.HALWASHOP);

        // 5) Ensure Standard PBEs for all HalwaShop products
        List<Product2> noStdPbe = queryProductsMissingPBE(true, null, ProductRecordType.HALWASHOP);
        if (!noStdPbe.isEmpty()) {
            createPricebookEntries(noStdPbe, standardPbId);
        }

        // 6) Ensure custom PBEs for all HalwaShop products
        List<Product2> noCustomPbe = queryProductsMissingPBE(false, customPbId, ProductRecordType.HALWASHOP);
        if (!noCustomPbe.isEmpty()) {
            createPricebookEntries(noCustomPbe, customPbId);
        }

        System.debug('Data initialization completed successfully');
    }

    // Ensurers
    private static Id ensureAccount(String accName){
        List<Account> existing = [SELECT Id FROM Account WHERE Name = :accName LIMIT 1];
        if (!existing.isEmpty()) return existing[0].Id;

        Account acc = new Account(Name = accName, Description = '{"EmailOTP":false,"EmailOrderConfirmation":false,"EmailCC":""}', Active__c='true');
        Database.SaveResult sr = Database.insert(acc, /*allOrNone*/false);
        return sr.isSuccess() ? sr.getId() : null;
    }
    private static Id ensureContract(Id accId){
        List<Contract> existing = [SELECT Id FROM Contract WHERE AccountId = :accId LIMIT 1];
        if (!existing.isEmpty()) return existing[0].Id;

        Contract con = new Contract(AccountId = accId, ContractTerm = 12, StartDate = Date.today(), Status = 'Draft');
        Database.SaveResult sr = Database.insert(con, false);
        return sr.isSuccess() ? sr.getId() : null;
    }
    private static Id ensureStandardPricebookActive(){
        Pricebook2 std = [SELECT Id, IsActive FROM Pricebook2 WHERE IsStandard = true LIMIT 1];
        if (!std.IsActive) {
            std.IsActive = true;
            Database.update(std, false);
        }
        return std.Id;
    }
    private static Id ensurePricebook(String name){
        List<Pricebook2> found = [SELECT Id, IsActive FROM Pricebook2 WHERE Name = :name LIMIT 1];
        if (!found.isEmpty()){
            Pricebook2 pb = found[0];
            if (!pb.IsActive){
                pb.IsActive = true;
                Database.update(pb, false);
            }
            return pb.Id;
        }
        Pricebook2 pbNew = new Pricebook2(Name = name, IsActive = true);
        Database.SaveResult sr = Database.insert(pbNew, false);
        return sr.isSuccess() ? sr.getId() : null;
    }

    // Product upsert by External Id (fallback to Name match if External Id not available) and assign RecordType
    private static void upsertProductsFromRemote(ProductRecordType rtype){
        endPoints__mdt endpointRecord = [SELECT End_Point__c FROM endPoints__mdt WHERE DeveloperName = 'HalwaKadai_Products' LIMIT 1];

        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint(endpointRecord.End_Point__c);
        req.setMethod('GET');

        try {
            HttpResponse res = http.send(req);
            if(res.getStatusCode() != 200){
                System.debug('Error fetching products: HTTP ' + res.getStatusCode() + ' - ' + res.getStatus());
                return;
            }
            List<Object> rawProducts = (List<Object>) JSON.deserializeUntyped(res.getBody());

            // Map developer name -> RecordTypeId
            Map<String, Id> rtByDevName = new Map<String, Id>();
            for (RecordType rt : [
                SELECT Id, DeveloperName
                FROM RecordType
                WHERE SObjectType = 'Product2'
                AND DeveloperName IN :new Set<String>{ String.valueOf(rtype) }
            ]){
                rtByDevName.put(rt.DeveloperName, rt.Id);
            }
            Id targetRtId = rtByDevName.get(String.valueOf(rtype));

            // 1) Try to upsert by an External Id field if present (e.g., Product_External_Id__c)
            // If your org has such a field, set this API name below; otherwise leave null to skip.
            final String EXTERNAL_ID_API_NAME = null; // e.g., 'Product_External_Id__c'

            List<Product2> toUpsert = new List<Product2>();
            Map<String, Product2> toInsertByName = new Map<String, Product2>(); // fallback path

            for(Object obj : rawProducts) {
                Map<String, Object> m = (Map<String, Object>) obj;

                Product2 p = new Product2();
                p.Name = (String) m.get('Name');
                p.ProductCode = (String) m.get('ProductCode');
                p.Description = (String) m.get('Description');
                p.IsActive = (Boolean) m.get('IsActive');
                p.Image_URL__c = (String) m.get('Image_URL__c');
                p.HomePage_Visible__c = (Boolean) m.get('HomePage_Visible__c');
                p.Tag__c = (String) m.get('Tag__c');
                p.Price__c = (Decimal) m.get('Price__c');
                p.Image_uploaded_to_Github__c = (Boolean) m.get('Image_uploaded_to_Github__c');
                if (targetRtId != null) {
                    p.RecordTypeId = targetRtId;
                }

                if (EXTERNAL_ID_API_NAME != null && m.containsKey(EXTERNAL_ID_API_NAME)) {
                    // Dynamically set the external id field
                    p.put(EXTERNAL_ID_API_NAME, (String) m.get(EXTERNAL_ID_API_NAME));
                    toUpsert.add(p);
                } else {
                    // Fallback: we cannot upsert by ProductCode (not External Id). We'll match existing by Name in bulk, then update/insert.
                    if (!String.isBlank(p.Name)) {
                        toInsertByName.put(p.Name, p);
                    }
                }
            }

            // Upsert by external id if available
            if (!toUpsert.isEmpty()){
                // Using Database.upsert with field token not possible for custom ext id here; single-field name overload not available dynamically.
                // If EXTERNAL_ID_API_NAME is known at compile time, replace with: Database.upsert(toUpsert, Product2.Product_External_Id__c, false);
                Database.SaveResult[] srs = Database.insert(toUpsert, false); // Insert first pass
                // If duplicates exist already, you can enhance with a prior query; left minimal since EXTERNAL ID is authoritative.
                for (Database.SaveResult sr : srs){
                    if (!sr.isSuccess()){
                        for (Database.Error e : sr.getErrors()){
                            System.debug('External-ID product insert error: ' + e.getMessage());
                        }
                    }
                }
            }

            // Fallback by Name: query existing then split into updates vs inserts
            if (!toInsertByName.isEmpty()){
                Set<String> names = new Set<String>(toInsertByName.keySet());
                Map<String, Product2> existingByName = new Map<String, Product2>();
                for (Product2 ex : [
                    SELECT Id, Name
                    FROM Product2
                    WHERE Name IN :names
                ]) {
                    existingByName.put(ex.Name, ex);
                }

                List<Product2> toInsert = new List<Product2>();
                List<Product2> toUpdate = new List<Product2>();
                for (String nm : toInsertByName.keySet()){
                    Product2 incoming = toInsertByName.get(nm);
                    if (existingByName.containsKey(nm)){
                        Product2 ex = existingByName.get(nm);
                        incoming.Id = ex.Id;
                        toUpdate.add(incoming);
                    } else {
                        toInsert.add(incoming);
                    }
                }

                if (!toInsert.isEmpty()){
                    Database.SaveResult[] srsIns = Database.insert(toInsert, false);
                    for (Database.SaveResult sr : srsIns){
                        if (!sr.isSuccess()){
                            for (Database.Error e : sr.getErrors()){
                                System.debug('Product insert (by Name) error: ' + e.getMessage());
                            }
                        }
                    }
                }
                if (!toUpdate.isEmpty()){
                    Database.SaveResult[] srsUpd = Database.update(toUpdate, false);
                    for (Database.SaveResult sr : srsUpd){
                        if (!sr.isSuccess()){
                            for (Database.Error e : sr.getErrors()){
                                System.debug('Product update (by Name) error: ' + e.getMessage());
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.debug('Exception during product fetch/upsert: ' + e.getMessage());
        }
    }

    // Query products missing PBEs (standard or specific pricebook)
    private static List<Product2> queryProductsMissingPBE(Boolean checkStandard, Id pricebook2Id, ProductRecordType rtype){
        if (checkStandard == true) {
            return [
                SELECT Id, Name, ProductCode, Price__c
                FROM Product2
                WHERE RecordType.DeveloperName = :String.valueOf(rtype)
                AND Id NOT IN (
                    SELECT Product2Id FROM PricebookEntry
                    WHERE Pricebook2.IsStandard = TRUE AND IsActive = TRUE
                )
            ];
        } else {
            return [
                SELECT Id, Name, ProductCode, Price__c
                FROM Product2
                WHERE RecordType.DeveloperName = :String.valueOf(rtype)
                AND Id NOT IN (
                    SELECT Product2Id FROM PricebookEntry
                    WHERE Pricebook2Id = :pricebook2Id AND IsActive = TRUE
                )
            ];
        }
    }

    // Bulk create PBEs with UnitPrice from Product.Price__c (default 0)
    private static void createPricebookEntries(List<Product2> products, Id pricebook2Id){
        if (products.isEmpty()) return;
        List<PricebookEntry> pbEs = new List<PricebookEntry>();
        for (Product2 p : products){
            pbEs.add(new PricebookEntry(
                Product2Id = p.Id,
                Pricebook2Id = pricebook2Id,
                UnitPrice = p.Price__c != null ? p.Price__c : 0,
                IsActive = true
            ));
        }
        if (!pbEs.isEmpty()){
            Database.SaveResult[] srs = Database.insert(pbEs, false);
            for (Database.SaveResult sr : srs){
                if (!sr.isSuccess()){
                    for (Database.Error e : sr.getErrors()){
                        System.debug('PBE insert error: ' + e.getMessage());
                    }
                }
            }
        }
    }
}
