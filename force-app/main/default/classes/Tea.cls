public class Tea {
    public static void orderTea(){

        List<String> FeatureLicense = new List<String>{'UserPermissionsInteractionUser','UserPermissionsMarketingUser','UserPermissionsSupportUser','UserPermissionsKnowledgeUser','UserPermissionsOfflineUser','UserPermissionsSFContentUser'};    
            List<String> FeatureLicenseName = new List<String>{			'Flow User',					'Marketing User',				'Service User',				'Knowledge User',								 	'Offline User',				'Salesforce CRM Content User'};
        if(FeatureLicense.size()>0)
        {Integer i= 0;
            for( i =0; i<FeatureLicense.size(); i++)
            {
                //Balance = integer.valueof(s.get('TotalLicenses'))-integer.valueof(s.get('UsedLicenses'));
                
                //TableX = '<tr><td>'+FeatureLicenseName+'</td><td>'+Database.query('Select count(Id) From User where '+FeatureLicense[i]+' =true and isActive=true')['expr0']+'</td></tr>';
                //TableHead += TableX;
                List<sObject>  XX  = Database.query('Select count(Id) From User where '+FeatureLicense[i]+' =true and isActive=true');
                //List<String> T1 = XX[0];
                System.debug(FeatureLicenseName[i] + XX );
                /*
                 String s = 'UserPermissionsMarketingUser';
                    String Query ='Select count() From User where '+s+' =true and isActive=true';
                    //sObject a=  Database.query(Query);
                    System.debug(Database.query('Select count(Id) From User where '+s+' =true and isActive=true')); 
                 * */
                 
            }
            
        }   
    }

}
//
//
//
/*


9 hrs - Working
6 hrs - Sleeping
9 hrs - (30 mins - salesforce practices - LWC - 1 hr - 6.5 hrs - 3 hrs - 3.5 hrs)
 
My suggestions 
2 hrs - Technical Books
1 hr- Morning 1 hr Evening
1 hr - 15 learning - 15 revise - 15 learn - 15 revise
 
 
Create Time schedule
Interact with friends looking or achieve the same goals - creating comunity
 
 
Salesforce Trailhead 
Udemy
Practice more on technical side..
Complete the super badge 
Admin Specialist
Apex Specialist
Aura Specialist
Advanced Specialist
LWC Specialist
Lot of trails in terms of apex development..
 
 
Apex Development
Salesforce Apex Class
APex Trigger
Wrapper CLass
Unit test class
Batch APex
Future Methods
Queueable Method
REST INtegration
COnnect Apps, AUth Provider, NamedCrdentials
 
 
Configuration
 
OWD, Sharing Settings - Sharing Rule, Email to Case , Web to case , Approval Process, Flows, Process Builder
 
ttps://partners.salesforce.com/partnersignup/invitedPartner?b=wuArOpVhymL2S%2BEhS%2F527ANe7jchUBqPy%2BlH87JGOgM8mg4SWSeyFmIAwgYZD1kEb7%2FrkgrkDkaYfDFc4wSMUA%3D%3D



https://teams.microsoft.com/l/meetup-join/19%3ameeting_NjgyM2Q5ZGMtZDBiMy00OTczLWE0NDctNmNjZmIwYTBiNWVh%40thread.v2/0?context=%7b%22Tid%22%3a%22404b1967-6507-45ab-8a6d-7374a3f478be%22%2c%22Oid%22%3a%2202a3ed59-6ce3-4af3-9b5b-f3549663ccef%22%7d
 */