global class healthCheck2 implements Schedulable {

global void execute(SchedulableContext sc) {
    //Mailing Start
    Messaging.reserveSingleEmailCapacity(1);
    Messaging.SingleEmailMessage mymail = new Messaging.SingleEmailMessage();
    
    String[] toaddresses = new String[]{'cvrnishanth@gmail.com','nithyanarayanancvr@gmail.com','nithyanarayanan.cvr@tcs.com'};
        
    OrgWideEmailAddress owea = new OrgWideEmailAddress();
    owea = [ SELECT id,Address, DisplayName FROM OrgWideEmailAddress];
    mymail.setToAddresses(toaddresses);
    mymail.setSubject('Salesforce | Health Check | '+System.now().format());    
    mymail.setPlainTextBody('This has sent via Apex');
    //Mailing End
    //style="text-align: center;"
    // TableX ='<style>h1 {text-align: center;}p {text-align: center;}div {text-align: center;}</style>';
    String TableX ='<h1 style="color:blue; text-align: center;">Blaze Health Check - Automated</h1>';
    //Outter Table 
    //TableX +='<style>.center-table { margin-left: auto;  margin-right: auto;    } </style>';
    //<table class="center-table">
    TableX +='<div align="center"><table border="2"  style="border-collapse: collapse; " cellspacing="10" cellpadding="3"  ><tr>';
    
    
    //UserLicense-----------------------------------------------------------
    List<userLicense> UserLicenseList = [Select Name, TotalLicenses, UsedLicenses From UserLicense];
    //System.debug(myList);
    TableX += '<br><h1 style="border-collapse: collapse; text-align: center;">User License</h1>';
    //String TableX='';
    //if(UserLicenseList.size()>0)
    //{
    Integer BalanceLicenses = 0;     
    //Opening User Licenses Table
    TableX +='<table border="1" style="border-collapse: collapse; align: center;"><tr><th> Name </th><th> TotalLicenses </th><th>Used</th><th> Remaining </th></tr>';
    for(userLicense s:UserLicenseList)
    {
        BalanceLicenses = integer.valueof(s.get('TotalLicenses'))-integer.valueof(s.get('UsedLicenses'));
        if (BalanceLicenses <1)
        {
             TableX += '<tr style="background-color: red;">';
        }
        else if ((integer.valueof(s.get('TotalLicenses')))/10 > BalanceLicenses )
         	TableX += '<tr style="background-color: yellow;">';
        else
            TableX +='<tr>';
        TableX += '<td>'+s.get('Name')+'</td><th>'+s.get('TotalLicenses')+'</th><th>'+s.get('UsedLicenses')+'</th><th>'+BalanceLicenses+'</th></tr>';
        //TableHead += TableX;
    }
    TableX += '</table>';//Closing User Licenses Table===========================
    //}
    TableX +='</tr><tr>';
    
    
    //Feature License    --------------------------------------------------------
    TableX += '<div align="center"><br><br><h1 style="border-collapse: collapse; text-align: center;">Feature License</h1>';   
    //Opening Feature Licenses Table
    TableX +='<table border="1" style="border-collapse: collapse; align: center;"><tr><th> Name </th>  <th> UsedLicense </th></tr>';
    
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
            TableX += '<tr><td>'+FeatureLicenseName[i]+'</td>  <th>'+XX[0].get('expr0')+'</th></tr>';
            //T TableX;               
        }
        TableX += '</table></div>';//Closing Feature Licenses Table
	}          
    TableX +='</tr>';
    
    TableX += '</table></div>';//Outter Table Closing
    
    String Signature ='<br>';
    Signature += '<p style="color:blue;">Thanks & Regards<br>Nithya Narayanan<br>Tata Consultancy Services - From Apex ORG - empathetic-impala-tsuncd-dev-ed.</p>';
    
    TableX += Signature;
    TableX +='<img src="https://media.licdn.com/dms/image/v2/D4D0BAQGsGR9p4ikS5w/company-logo_200_200/company-logo_200_200/0/1708946550425/tata_consultancy_services_logo?e=1733961600&v=beta&t=G0uMDAeWF5JRPJ1iPYC2LDv8s4ERLs70rBl22f_sZu8" alt="TCSLogo" style="width:42px;height:42px;">';
    TableX +='<img src="https://media.licdn.com/dms/image/v2/C4D0BAQGN30g7aSl4NA/company-logo_200_200/company-logo_200_200/0/1631303787196?e=1733961600&v=beta&t=ziEEQywbr1yHnNuF_22D6C4mZ82hmecOOF1mThG-JYo" alt="ShellLogo" style="width:42px;height:42px;">';
	
    TableX +='<iframe src="https://status.salesforce.com/instances/AP22" height="2000" width="3000" title="Iframe Example"></iframe>';
    //Messaging Start
    mymail.setHtmlBody(TableX);
    mymail.setOrgWideEmailAddressId(owea.Id);
    
    Messaging.sendEmail(new Messaging.SingleEMailMEssage[]{mymail});//List<Messaging.Email> emailMessages);
    //Messaging End
    System.debug('End');
    }
}