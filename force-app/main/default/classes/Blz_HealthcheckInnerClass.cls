public class Blz_HealthcheckInnerClass {
    @AuraEnabled
    public static string getPrepareHealthcheck(){
        Double OmniPer; Integer FlowCount; Integer OcrClosed;
        Messaging.reserveSingleEmailCapacity(1);
        Messaging.SingleEmailMessage mymail = new Messaging.SingleEmailMessage();
        String[] toaddresses = new String[]{'cvrnishanth@gmail.com'};
        mymail.setToAddresses(toaddresses);
        mymail.setSubject('Salesforce | Health Check - Demo Automated | '+System.now().format());
        mymail.setPlainTextBody('This has sent via Apex');

        String TableHealthMain = '<div style="padding:10px 0px 10px 0px;"><h2 style="font-weight:bold;text-align: center;">Blaze Health Check</h2></div>';
        String TableHealth = '<table width=100% border="2" style="border-spacing: 30px;border: 1px solid #000000;border-collapse:collapse" cellspacing="10" cellpadding="3;">' +
            '<tr><th colspan=2 style="background-color:#76C1F4;padding:10px 0px 10px 0px;"><h3 style="font-weight:bold;text-align: center;">Functionality Details</h3></th>' +
            '</tr>';
        TableHealth += '</table>';
        TableHealthMain += TableHealth;
        String datareturnStatus = Blz_healthTrustAPIcall.apicall();
        /********** order an d delivery**********/
        String TableOrderDelivery = '<table width=100% border="2" style="border-spacing: 30px;border: 1px solid #000000;border-collapse:collapse" cellspacing="10" cellpadding="3;">' +
            '<tr><th colspan="2" style="padding:10px 0px 10px 0px;background-color:#76C1F4;font-weight:bold;text-align: center;"> Order Delivery Update </th>' +
            '</tr><tr><th style="padding:10px 10px 10px 2px;font-weight:bold;text-align: Center;"> Order Update </th><th style="padding:10px 10px 10px 2px;font-weight:bold;text-align: Center;"> Delivery Update </th></tr>' +
            '<tr><td style="padding:10px 10px 10px 2px;border: 1px solid #000000;">NA</td><td style="padding:10px 10px 10px 2px;border: 1px solid #000000;">NA</td></tr></table>';
        TableHealthMain += TableOrderDelivery;
        TableHealthMain += '<div style="padding:10px;color:#ffffff;background-color:#76C1F4;"> <b>Salesforce Trust Update</b>: ' + datareturnStatus + '</div>';
        mymail.setHtmlBody(TableHealthMain);
        
        //Messaging.sendEmail(new Messaging.SingleEMailMEssage[]{mymail});//List<Messaging.Email> emailMessages);
        System.debug('End');
        return TableHealthMain;
    }
}