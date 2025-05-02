@isTest
public class Blz_Health_Test_mock implements HttpCalloutMock{
    protected integer responsecode;
    protected string status;
    protected string body;

    public Blz_Health_Test_mock(integer responsecode, string status, string body){
        this.responsecode = responsecode;
        this.status = status;
        this.body = body;
    }

    public HttpResponse respond(HttpRequest req){
        HttpResponse res = new HttpResponse();
        res.setStatusCode(this.responsecode);
        res.setStatus(this.status);
        res.setBody(this.body);
        return res;
    }
}
