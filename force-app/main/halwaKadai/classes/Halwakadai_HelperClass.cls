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

    @AuraEnabled
	public static Id createOrder(List<Map<String,Object>> products) {
		Order newOrder = new Order(
			AccountId = '001GA00005KAsGgYAL',
			ContractId = '800GA000000b86cYAA',
			EffectiveDate = Date.today(),
			Status = 'Draft',
			Pricebook2Id = '01sGA00000Zwd4SYAR'
		);
		insert newOrder;

		List<OrderItem> orderItems = new List<OrderItem>();

	for (Map<String,Object> prod : products) {
		if(((Decimal) prod.get('quantity')).intValue()>0){
			Id pricebookId   = (Id) prod.get('pricebookId');
			system.debug(pricebookId);
			Decimal unitPrice = (Decimal) prod.get('price');

			// Safe conversion for quantity
			Integer quantity = 0;
			Object qtyObj = prod.get('quantity');
			if (qtyObj != null) {
				if (qtyObj instanceof Decimal) {
					quantity = ((Decimal) qtyObj).intValue();
				} else if (qtyObj instanceof Double) {
					quantity = ((Double) qtyObj).intValue();
				} else if (qtyObj instanceof Integer) {
					quantity = (Integer) qtyObj;
				}
			}

			if (pricebookId != null && quantity > 0) {
				orderItems.add(new OrderItem(
					OrderId = newOrder.Id,
					PricebookEntryId = pricebookId,
					Quantity = quantity,
					UnitPrice = unitPrice
				));
			}
		}
	}


		if (!orderItems.isEmpty()) {
			insert orderItems;
		}

		return newOrder.Id;
	}



}