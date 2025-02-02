global class healthCheck1 implements Schedulable {

global void execute(SchedulableContext sc) {
        Messaging.reserveSingleEmailCapacity(1);
        Messaging.SingleEmailMessage mymail = new Messaging.SingleEmailMessage();
        
        String[] toaddresses = new String[]{'cvrnishanth@gmail.com'};
            
        OrgWideEmailAddress owea = new OrgWideEmailAddress();
        owea = [ SELECT id,Address, DisplayName FROM OrgWideEmailAddress];
		mymail.setToAddresses(toaddresses);
        mymail.setSubject('Salesforce | Health Check | '+System.now().format());
        
        mymail.setPlainTextBody('This has sent via Apex');

        //UserLicense
        List<userLicense> myList = [Select Name, TotalLicenses, UsedLicenses From UserLicense];
  
        System.debug(myList);
        
        String TableHead ='<table border="1" style="border-collapse: collapse"><tr><th>Name</th><th>TotalLicenses</th><th>Used</th><th>Remaining</th></tr>';
        String TableX='';
        Integer Balance = 0;
        
    	if(myList.size()>0)
        {
            for(userLicense s:mylist)
            {
                Balance = integer.valueof(s.get('TotalLicenses'))-integer.valueof(s.get('UsedLicenses'));
                TableX = '<tr><td>'+s.get('Name')+'</td><td>'+s.get('TotalLicenses')+'</td><td>'+s.get('UsedLicenses')+'</td><th>'+Balance+'</th></tr>';
                TableHead += TableX;
            }
            TableHead += '</table>';
        }
        
    //Feature License
    	TableHead += '<br><br><h1>Feature License</h1>';
        TableHead +='<table border="1" style="border-collapse: collapse"><tr><th>Name</th>  <th>UsedLicense</th></tr>';

        List<String> FeatureLicense = new List<String>{'UserPermissionsInteractionUser','UserPermissionsMarketingUser','UserPermissionsSupportUser','UserPermissionsKnowledgeUser','UserPermissionsOfflineUser','UserPermissionsSFContentUser'};    
        List<String> FeatureLicenseName = new List<String>{			'Flow User',					'Marketing User',				'Service User',				'Knowledge User',								 	'Offline User',				'Salesforce CRM Content User'};
        if(FeatureLicense.size()>0)
        {
            for(integer i =0; i<FeatureLicense.size(); i++)
            {
                //Balance = integer.valueof(s.get('TotalLicenses'))-integer.valueof(s.get('UsedLicenses'));
				List<sObject>  XX  = Database.query('Select count(Id) From User where '+FeatureLicense[i]+' =true and isActive=true');
                //List<String> T1 = XX[0];
                System.debug(FeatureLicenseName[i] + XX );                
                TableHead += '<tr><td>'+FeatureLicenseName[i]+'</td>  <td>'+XX[0].get('expr0')+'</td></tr>';
                //T TableX;               
            }
            
        }                                   
		TableHead += '</table>';
    
        
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