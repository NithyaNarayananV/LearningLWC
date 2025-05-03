public class Blz_healthTrustAPICall {
    public static String apicall(){
        try {
            Integer Ofisactive = 0;
            String dataconcat = '';
            
            // Create and configure the HTTP request
            HttpRequest req = new HttpRequest();
            req.setEndpoint('https://api.status.salesforce.com/v1/instances/DEU70/status');
            req.setMethod('GET');
            // Optionally, set headers if needed
            req.setHeader('Accept', 'application/json');
            
            Http http = new Http();
            HttpResponse res = http.send(req);
            
            // Check for successful HTTP response
            if (res.getStatusCode() == 200) {
                JSONParser parser = JSON.createParser(res.getBody());
                System.debug('Response Body: ' + res.getBody());
                System.debug('Response Status: ' + res.getStatus());
                System.debug('Response Status Code: ' + res.getStatusCode());
                
                // Advance to the first token; typically should be START_OBJECT
                if (parser.nextToken() == JSONToken.START_OBJECT) {
                    // Loop through the tokens in the JSON stream
                    while (parser.nextToken() != null) {
                        if (parser.getCurrentToken() == JSONToken.FIELD_NAME) {
                            String fieldName = parser.getText();
                            // Advance to the value of the field
                            if (parser.nextToken() != null) {
                                if (fieldName == 'environment') {
                                    dataconcat += '| Environment: <b>' + parser.getText() + '</b>';
                                } else if (fieldName == 'location') {
                                    dataconcat += '| Location: <b>' + parser.getText() + '</b>';
                                } else if (fieldName == 'status') {
                                    dataconcat += '| Status: <b>' + parser.getText() + '</b>';
                                } else if (fieldName == 'isActive' && Ofisactive == 0) {
                                    Ofisactive++;
                                    dataconcat += ' | IsActive: <b>' + parser.getText() + '</b>';
                                }
                            }
                        }
                    }
                    return dataconcat;
                } else {
                    // If the JSON structure is not as expected
                    return 'Error: Unexpected JSON structure. ' + res.getStatus() + ' | Code ' + res.getStatusCode();
                }
            } else {
                // Handle non-200 HTTP responses
                return 'HTTP Error: ' + res.getStatus() + ' | Code: ' + res.getStatusCode();
            }
        } catch (Exception e) {
            return 'Exception: ' + e.getMessage();
        }
    }
}