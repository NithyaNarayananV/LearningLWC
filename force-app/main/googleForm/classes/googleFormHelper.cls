public with sharing class googleFormHelper {
    public googleFormHelper() {

    }
    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getFormDetails() {

        List<Map<String, Object>> listMapCMT = new List<Map<String, Object>>();
        List<google_form__mdt> listCMT = [SELECT DeveloperName, MasterLabel, Label, QualifiedApiName, Has_Attachment__c, Input_Type__c FROM google_form__mdt];
        for (google_form__mdt cmt : listCMT) {
            Map<String, Object> row = new Map<String, Object>();
            row.put('DeveloperName', cmt.DeveloperName);
            row.put('MasterLabel', cmt.MasterLabel);
            row.put('Label', cmt.Label);
            row.put('QualifiedApiName', cmt.QualifiedApiName);
            row.put('Has_Attachment__c', cmt.Has_Attachment__c);
            row.put('Input_Type__c', cmt.Input_Type__c);
            row.put('pattern', '');
            row.put('InputValue', '');
            row.put('contactRecordId', '');
            row.put('oldFileName', '');
            row.put('newFileName', '');
            row.put('documentID', '');
            listMapCMT.add(row);
        }
        return listMapCMT;
    }
    @AuraEnabled(cacheable=true)
    public static void onSubmitHandler(List<Map<String, Object>> listMapCMTn){
        //this method suppose to save the fields data to the contact's description field. and rename the document uploaded.
        System.debug('inside final apex onSubmitHandler START');
        
        Set<String> listofDocID = new Set<String>();
        Map<String,String> mapDocIDname = new Map<String,String>();
         for (Map<String, Object> cmt : listMapCMTn) {
            System.debug('Inside for Loop =====================');
            String docId;
            String newFileName;
            for (String key : cmt.keySet()) {
                System.debug(key + ' => ' + cmt.get(key));
                if(key=='documentID')
                    docId = (string)cmt.get(key);
                if(key=='newFileName')
                    newFileName = (string)cmt.get(key);
            }
            System.debug('docId = (string)cmt.get(key);' + docId);
            //will add the display of all values:
            /*
            System.debug('DeveloperName ='+ cmt.get('DeveloperName'));
            System.debug('MasterLabel ='+ cmt.get('MasterLabel'));
            System.debug('Label ='+ cmt.get('Label'));
            System.debug('QualifiedApiName ='+ cmt.get('QualifiedApiName'));
            System.debug('Has_Attachment__c ='+ cmt.get('Has_Attachment__c'));
            System.debug('Input_Type__c ='+ cmt.get('Input_Type__c'));
            System.debug('pattern ='+cmt.get('pattern'));
            System.debug('InputValue =='+cmt.get('InputValue'));
            System.debug('contactRecordId ='+cmt.get('contactRecordId'));
            System.debug('oldFileName ='+ cmt.get('oldFileName'));
            System.debug('newFileName ='+cmt.get('newFileName'));
            System.debug('documentID ='+cmt.get('documentID'));
            */
            listofDocID.add(docId);
            if(docId!=null)
            mapDocIDname.put(docId, newFileName);
            system.debug('newFileName  : '+newFileName);

            system.debug('listofDocID  : '+listofDocID);
            system.debug('mapDocIDname  : '+mapDocIDname);
        }
        System.debug('inside final apex onSubmitHandler END');
        //updateDocs(listofDocID, mapDocIDname);
        //update this on 27th NOC
        System.enqueueJob(new updateAttachementQueueable(listofDocID, mapDocIDname));
        //System.enqueueJob(new updateAttachementQueueable(ids, attMap));
    }
    @AuraEnabled(cacheable=true)
    public static void renameFile(Id documentId, String newName)  {
        ContentVersion cv = [SELECT Id, Title FROM ContentVersion WHERE ContentDocumentId = :documentId ORDER BY CreatedDate DESC LIMIT 1];
        cv.Title = newName;
        update cv;
    }
    /*
    @future
    public static void updateDocs(List<String> listofDocID, Map<String,String> mapDocIDname){
        List<ContentVersion> docsList = [SELECT Id, ContentDocumentId,  Title FROM ContentVersion WHERE ContentDocumentId = :listofDocID  ];
        system.debug('DocsList : '+docsList);
        for(ContentVersion doc: docsLIst){
            String docId = doc.ContentDocumentId;
            system.debug('Docs   : '+doc);
            system.debug('mapDocIDname  : '+mapDocIDname);
            system.debug('(String)mapDocIDname.get(docId)  : '+(String)mapDocIDname.get(docId));

            doc.Title =  (String)mapDocIDname.get(docId);
            System.debug( 'New Name'+(String)mapDocIDname.get(docId));
        }
        update docsList;
    }
    */
}