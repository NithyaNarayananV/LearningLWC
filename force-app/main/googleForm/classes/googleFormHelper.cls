public with sharing class googleFormHelper {
    public googleFormHelper() {

    }
    @AuraEnabled(cacheable=true)
    public static List<google_form__mdt> getFormDetails() {
        return [
            SELECT Id, DeveloperName, MasterLabel, Language, NamespacePrefix, Label, QualifiedApiName, SystemModstamp, Has_Attachment__c FROM google_form__mdt
        ];
    }
}