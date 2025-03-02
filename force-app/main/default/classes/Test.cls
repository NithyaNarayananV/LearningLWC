public class Test {
    public static void TestTable()
    {
    List<userLicense> myList = [Select Name, TotalLicenses, UsedLicenses From UserLicense];
   
        System.debug(myList);
   
        
        String TableX='';
        if(myList.size()>0)
        {
            for(userLicense s:mylist)
            {
                TableX='';
            }
        }
    }

}