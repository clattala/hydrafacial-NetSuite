/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 
 
/*********************************************************************************
 * JIRA# 		: NGO-7247 
 * Description	: To Default Country as Germany on Online Lead Form
 * Date   : 03/27/2023 
 * Author : Kaleru Pavan
 
*********************************************************************************/
 
define(['N/currentRecord'],
    function(currentRecord) {
  
        function pageInit(context) {
          try{
           var currRecord = currentRecord.get();
            currRecord.setValue({
                fieldId: 'country',
                value: 'DE'
            });
          }catch(error){
            alert('Error while setting country to germany '  + error.message)
          }
        }
        return {
            pageInit: pageInit
        };
    });