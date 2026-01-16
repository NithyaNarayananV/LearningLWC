/**
 * ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
 * Class Name      : Halwa_HelperClass
 * Author          : <YourName>
 * Created Date    : Jan 4, 2026
 * Last Modified By: <YourName>
 * Last Modified On: Jan 4, 2026
 * Description     : This class implements for......
 *  
 * Change History  :
 *  Date          │   Author     │   Change
 * ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
 *  Jan 4, 2026  │ <YourName>   │ Initial version
 * ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
 */

public class Halwakadai_HelperClass {

	@AuraEnabled(cacheable=true)
	public static List<Product2>  getProductsDetails() {
		List<Product2> halwaList = [SELECT  Name, ProductCode, Description, StockKeepingUnit, Image_URL__c, HomePage_Visible__c, Tag__c, Price__c,(SELECT Id, UnitPrice FROM PricebookEntries WHERE IsActive = true ORDER BY CreatedDate DESC LIMIT 1) FROM Product2 WHERE RecordType.DeveloperName  = 'HalwaShop'];
		for(Product2 halwa : halwaList){
			system.debug(halwa);
		}
		return halwaList;
	}

}