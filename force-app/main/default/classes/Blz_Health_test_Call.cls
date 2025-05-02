@isTest
public class Blz_Health_test_Call {
    @isTest
    static void test_method(){
        // Test scenario 1: Successful callout simulation
        // When the API returns a proper JSON response, the method constructs an HTML string.
        // The expected output is formatted as in the callout:
        // | Environment: <b>production</b>| Location: <b>EMEA</b>| Status: <b>OK</b> | IsActive: <b>true</b>
        String T1 = '| Environment: <b>production</b>| Location: <b>EMEA</b>| Status: <b>OK</b> | IsActive: <b>true</b>';
        String validResponse = '{"environment":"production","location":"EMEA","status":"OK","isActive":"true"}';
        Test.setMock(HttpCalloutMock.class, new Blz_Health_Test_mock(200, 'OK', validResponse));
        String resultSuccess = Blz_healthTrustAPICall.apicall();
        System.assertEquals(T1, resultSuccess, 
            'The API call should return the expected concatenated string for a valid JSON response.');

        // Test scenario 2: API response with invalid JSON simulation
        // When the callout returns a response that cannot be parsed correctly,
        // the method catches the exception and returns a message starting with 'Exception:'
        String invalidResponse = 'Invalid JSON';
        Test.setMock(HttpCalloutMock.class, new Blz_Health_Test_mock(200, 'OK', invalidResponse));
        String resultException = Blz_healthTrustAPICall.apicall();
        System.assert(resultException != null && resultException.startsWith('Exception:'), 
            'The API call should return an exception message when the JSON is invalid.');
    }
}
