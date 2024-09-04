function processOrdersCreatedToday( type )
{
    try{
    var Savedsearch = nlapiLoadSearch('transaction','customsearch_search_4_vb_invoices');
    var searchResult=Savedsearch.runSearch();
    var results=searchResult.getResults(0,600);
    nlapiLogExecution("debug",results.length);
    for(var i=0;i<results.length;i++)
    {
        //nlapiDeleteRecord("salesorder",results[i].getValue("internalid"));
        nlapiLogExecution("debug","id",results[i].getValue("internalid"));

        var record=nlapiLoadRecord("vendorbill",1736896);
        record.setFieldValue("nextapprover",173530);
        nlapiSubmitRecord(record);
    }
}
catch(e)
{
    nlapiLogExecution("error","error",e);

}
} 