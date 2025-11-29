/**
* @File Name : updateAttachementQueueable.cls
* @Description :
* @Author :
* @Last Modified By :
* @Last Modified On : November 27, 2025
* @Modification Log :
*==============================================================================
* Ver | Date | Author | Modification
*==============================================================================
* 1.0 | November 27, 2025 |   | Initial Version
**/


public class updateAttachementQueueable implements Queueable {
	//System.enqueueJob(new updateAttachementQueueable(listofDocID, mapDocIDname));

	private Set<String> listofDocID;
    private Map<String,String> mapDocIDname;
    private List<String> deleteDocsID;


    public updateAttachementQueueable(Set<String> listofDocID, Map<String,String> mapDocIDname, List<String> deleteDocsID){
        this.listofDocID = listofDocID;
        this.mapDocIDname = mapDocIDname;
        this.deleteDocsID = deleteDocsID;
    }

    public void execute(QueueableContext context) {
        // Use the parameters in your logic
		List<ContentVersion> docsList = [SELECT Id, ContentDocumentId,  Title , Description FROM ContentVersion WHERE ContentDocumentId = :listofDocID  ];
        List<ContentDocument> docsToDelete = [
                SELECT Id 
                FROM ContentDocument 
                WHERE Id = :deleteDocsID 
            ];
        System.debug('docsToDelete'+docsToDelete);
        System.debug('DocsList : '+docsList);
        for(ContentVersion doc: docsLIst){
            String docId = doc.ContentDocumentId;
            system.debug('Docs   : '+doc);
            system.debug('mapDocIDname  : '+mapDocIDname);
            system.debug('(String)mapDocIDname.get(docId)  : '+(String)mapDocIDname.get(docId));
            if((String)mapDocIDname.get(docId)==null)
            {
                System.debug('...');
            }
            else{
                doc.Title =  (String)mapDocIDname.get(docId);
                doc.Description = 'Active';
                System.debug( 'New Name'+(String)mapDocIDname.get(docId));
            }
        }
        delete docsToDelete;

        update docsList;
	}
}