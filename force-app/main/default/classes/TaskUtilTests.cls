@IsTest
private class TaskUtilTests {
  @IsTest
  static void testGetTaskPriorityNormal () {
    //GIVEN
    String  Val= 'CB';
    //WHEN
    Test.startTest();
      String Op = TaskUtil.getTaskPriority(Val);
    Test.stopTest();
    //THEN
    Assert.areEqual('Normal',Op);
  }
  @IsTest
  static void testGetTaskPriorityHigh () {
    //GIVEN
    String  Val= 'CA';
    //WHEN
    Test.startTest();
      String Op = TaskUtil.getTaskPriority(Val);
    Test.stopTest();
    //THEN
    Assert.areEqual('High',Op);
  }
 
}