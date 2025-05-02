public class Blz_healthTrustAPICall {
    public static String apicall(){
        try { // Create a new HTTP request
            Integer Ofisactive = 0;
            String dataconcat = '';
            HttpRequest req = new HttpRequest();
            req.setEndpoint('https://api.status.salesforce.com/v1/instances/DEU70/status');
            req.setMethod('GET');
            Http http = new Http();
            HttpResponse res = http.send(req);
            if (res.getStatusCode() == 200) {
                JSONParser parser = JSON.createParser(res.getBody());
                system.debug('Response Body: ' + res.getBody());
                system.debug('Response Status: ' + res.getStatus());
                system.debug('Response Status Code: ' + res.getStatusCode());
                system.debug('Response parser.getCurrentToken(): ' + parser.getCurrentToken());
                system.debug('Response JSONToken.FIELD_NAME: ' + JSONToken.FIELD_NAME);
                if (parser.getCurrentToken() == JSONToken.FIELD_NAME) {
                    while (parser.nextToken() != null) {
                        if (parser.getCurrentToken() == JSONToken.FIELD_NAME) {
                            String fieldName = parser.getText();
                            parser.nextToken();
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
                    return dataconcat;
                } else {
                    return 'Error: ' + res.getStatus() + '| Code ' +res.getStatusCode();
                }
            }
        } catch (Exception e) {
            return 'Exception: ' + e.getMessage();
        }
        return null;
    }
}
