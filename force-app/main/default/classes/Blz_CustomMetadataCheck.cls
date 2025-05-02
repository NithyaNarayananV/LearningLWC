global class Blz_CustomMetadataCheck implements Schedulable {
    global void execute(SchedulableContext sc) {
        String TableX ='<h1 style="color:blue; text-align: center;">Custom MetaData Check - Automated</h1>';
        //Outter Table
        TableX +='<div align="center"><table border="2" style="border-collapse: collapse;" cellspacing="10" cellpadding="3" ><tr><th>Monitoring </th><th>Owner</th><th>Status</th></tr>';
        TableX +='<td>Custom Metadata</td><th>Blaze SOM-L2 </th><th>CmcList.size()</th></tr>';
        TableX +='</table></div>';//Table Closing
        System.debug('Custom Metadata | Identified '+CmcList.size()+' records with UAT suffix/prefix ');
        String Signature ='<br>';
        Signature += '<p style="color:blue;">Thanks & Regards<br>Salesforce Team<br>Tata Consultancy Services</p>';
        TableX += Signature;
        System.debug('End');
    }
}
