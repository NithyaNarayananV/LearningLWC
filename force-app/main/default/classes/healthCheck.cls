global class healthCheck implements Schedulable {

global void execute(SchedulableContext sc) {
        Messaging.reserveSingleEmailCapacity(1);
        Messaging.SingleEmailMessage mymail = new Messaging.SingleEmailMessage();
        
        String[] toaddresses = new String[]{'cvrnishanth@gmail.com'};
            
        OrgWideEmailAddress owea = new OrgWideEmailAddress();
        owea = [ SELECT id,Address, DisplayName FROM OrgWideEmailAddress];
        
        //UserLicense
        List<userLicense> myList = [Select Name, TotalLicenses, UsedLicenses From UserLicense];
   
        System.debug(myList);
        mymail.setToAddresses(toaddresses);
        mymail.setSubject('Salesforce | Health Check | '+System.now().format());
        
        mymail.setPlainTextBody('This has sent via Apex');
        
        String TableHead ='<table><tr><th>Name</th><th>TotalLicenses</th><th>Used</th><th>Remaining</th></tr>';
        String TableX='';
        Integer Balance = 0;
        if(myList.size()>0)
        {
            for(userLicense s:mylist)
            {
                Balance = integer.valueof(s.get('TotalLicenses'))-integer.valueof(s.get('UsedLicenses'));
                TableX = '<tr><td>'+s.get('Name')+'</td><td>'+s.get('TotalLicenses')+'</td><td>'+s.get('UsedLicenses')+'</td><th>'+Balance+'</th></tr>';
                TableHead = TableHead + TableX;
            }
            TableHead = TableHead + '</table>';
        }
        
        
        //     String TableRow1 ='<tr><td>'+myList[0].get('Name')+'</td><td>'+myList[0].get('TotalLicenses')+'</td<td>'+myList[0].get('UsedLicenses')+'</td></tr>';
        //     String TableRow2 ='<tr><td>'+myList[1].get('Name')+'</td><td>'+myList[1].get('TotalLicenses')+'</td<td>'+myList[1].get('UsedLicenses')+'</td></tr>';
        //     String TableRow3 ='<tr><td>'+myList[2].get('Name')+'</td><td>'+myList[2].get('TotalLicenses')+'</td<td>'+myList[2].get('UsedLicenses')+'</td></tr>';
		//     String Table = TableHead+TableRow1+TableRow2+TableRow3+'</table>';
        //
        //<tr><td>Centro comercial Moctezuma</td><td>Francisco Chang</td><td>Mexico</td></tr></table>';
        mymail.setHtmlBody(TableHead);
        mymail.setOrgWideEmailAddressId(owea.Id);
        
        Messaging.sendEmail(new Messaging.SingleEMailMEssage[]{mymail});//List<Messaging.Email> emailMessages);
        System.debug('End');
    }

}