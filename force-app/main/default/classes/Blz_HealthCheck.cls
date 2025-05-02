global class Blz_HealthCheck implements Schedulable {
    global void execute(SchedulableContext sc) {
        Messaging.reserveSingleEmailCapacity(1);
        Messaging.SingleEmailMessage mymail = new Messaging.SingleEmailMessage();
        String[] toaddresses = new String[]{'cvrnishanth@gmail.com'};
        mymail.setToAddresses(toaddresses);
        mymail.setSubject('Salesforce | Health Check - Automated | '+System.now().format());
        mymail.setPlainTextBody('This has been sent via Apex');
        //Mailing End
        Integer ContactMonitoring = [Select id, name from user].size();
        System.debug('ContactMonitoring | '+ContactMonitoring);
        String TableX ='<div align="center"><table border="2" style="border-collapse:collapse;" cellspacing="10" cellpadding="3";align: center;><tr><th>';
        //Outer Table
        TableX += '<h1 style="color:blue; text-align: center;">Blaze Health Check - Automated</h1></tr><tr><th>';
        String TableMain = '<table border="1" style="border-collapse: collapse; align: center;"><tr><th> Monitoring </th><th> Status </th></tr>';
        TableMain += '<tr><td>'+'Contacts having status indicator as Failed '+'</td><th>'+ContactMonitoring+' Failed Records. '+'</th></tr>';
        TableMain += '</table>';
        TableX += TableMain;
        TableX += '</table></div>';//Outer Table Closing
        String Signature ='<br>';
        Signature += '<p style="color:blue;">Thanks & Regards<br>Nithya Narayanan<br>Tata Consultancy Services</p>';
        TableX += Signature;
        //Messaging Start
        mymail.setHtmlBody(TableX);
        Messaging.sendEmail(new Messaging.SingleEmailMessage[]{mymail});//List<Messaging.Email> emailMessages;
        //Messaging End
        System.debug('End');
    }
}
