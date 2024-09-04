/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
 define(['N/url','N/record','N/currentRecord','N/search','N/format'],
 /**
  * @param{dataset} dataset
  */
 function(url,record,currentRecord,search,format) {
     
     /**
      * Function to be executed after page is initialized.
      *
      * @param {Object} scriptContext
      * @param {Record} scriptContext.currentRecord - Current form record
      * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
      *
      * @since 2015.2
      */
     function pageInit(context) {
         
 
     }
 
     function getLastChasedValue(){
 
         var recObj = currentRecord.get();
         var recId  = recObj.id;
 
             log.debug('record-Id', recId);
 
         var recType = recObj.type
             
             log.debug('reccord-Type', recType);
         
         var recordData = record.load({type: recType, id: recId});
         var lastValueGet= recordData.getValue({fieldId:'custentity_esc_last_modified_date'});
         var customerSearchObj = search.create({
            type: "customer",
            filters:
            [
               ["internalid","anyof",recId]
            ],
            columns:
            [
               search.createColumn({
                  name: "date",
                  join: "systemNotes",
                  summary: "MAX",
                  sort: search.Sort.DESC,
                  label: "Date"
               }),
               search.createColumn({
                  name: "newvalue",
                  join: "systemNotes",
                  summary: "MAX",
                  label: "New Value"
               }),
               search.createColumn({
                  name: "oldvalue",
                  join: "systemNotes",
                  summary: "MAX",
                  label: "Old Value"
               }),
               search.createColumn({
                  name: "field",
                  join: "systemNotes",
                  summary: "GROUP",
                  label: "Field"
               })
            ]
         });
         var run_search = customerSearchObj.run();
         var startCount=0;
          var endCount=startCount+1000
        
        //query the results by their start and end times

        while(true)
        {
        var results = run_search.getRange({
          start: startCount,
          end: endCount,
        });
          if(results&&results.length>0)
		{
            for(var i=0;i<results.length;i++)
            {
                var last_field_name = results[i].getText({
                    name: "field",
                    join: "systemNotes",
                    summary: "GROUP",
                });
                if(last_field_name=="Comments"){
                    var last_date_field_name = results[i].getValue({
                        name: "date",
                        join: "systemNotes",
                        summary: "MAX",
                    });
                    
                    var initialFormattedDateString = last_date_field_name;
                                        var parsedDateStringAsRawDateObject = format.parse({
                                            value: initialFormattedDateString,
                                            type: format.Type.DATE
                                        });
                     //window.confirm("last_field_name3:" +parsedDateStringAsRawDateObject);

                    recordData.setValue({fieldId:'custentity_last_chased',value:parsedDateStringAsRawDateObject});
                    break;
                    
                }
        }
        startCount=endCount;
        endCount=startCount+1000;
        }
        else{
            break;
        }
    }
         
         recordData.save();
         location.reload();
 
     }
     return {
         pageInit: pageInit,
         getLastChasedValue : getLastChasedValue
     };
     
 });
 