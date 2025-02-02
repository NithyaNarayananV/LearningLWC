public class AccountHandler {
    public static void insertAccount(Integer noOfNewAccounts){
        List <Account> addAccounts = new List<Account>();
        Integer n=1;
        while(n<=noOfNewAccounts){
            Account store = new Account();
            store.Name = 'Acme Inc'+n;
            store.AccountNumber = 'A000'+n;
            n=n+1;
            addAccounts.add(store);  
        }
        insert addAccounts;
    }

}