/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
 define(['N/record', 'N/search', 'N/format','./moment.min.js'],
 /**
* @param{record} record
*/
 (record, search, format, moment) => {

     /***
      * Defines the Scheduled script trigger point.
      * @param {Object} scriptContext
      * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
      * @since 2015.2
      */
     const execute = (context) => {


         //-------- initialization -----------------------------------------

         var today = new Date();
         var today_string = moment(today).format('l');
         var subsidiary_id = 0;
         var subsidiary_name ="";
       
        //------ Searching out all Subsidiary --------------------------------

         var subsidiarySearch    = search.create({type: "subsidiary",
                                   filters: [ ["isinactive","is","F"]],
                                   columns: [ search.createColumn({ name: "name"})]
                                });
                                
         var subsidiaryResults = subsidiarySearch.run().getRange({ start: 0, end: 999});


         for (let k = 0; k < subsidiaryResults.length ; k++) 

        {
          
            subsidiary_id    = subsidiaryResults[k].id; 
            subsidiary_name  = subsidiaryResults[k].getValue({name:'name'});
         
         //------ Search if Working Calendar -------------------------------

         var check = 0;
         var caseSearch = search.create({
             type: 'customrecord_3rp_hf_dl_working_calendar',
             title: 'Finding out the Working Day',

         filters: [

             search.createFilter({ name: 'custrecord_3rp_hf_dl_wc_pass', operator: search.Operator.IS, values: false }),
             search.createFilter({ name: 'custrecord_3rp_hf_dl_wc_type', operator: search.Operator.IS, values: '1' }),
             search.createFilter({ name: 'custrecordcustrecord_3rp_hf_dl_wc_sub', operator: search.Operator.IS, values: subsidiary_id })
         ],

         columns:[
                     search.createColumn({name: 'custrecord_3rp_hf_dl_wc_date',sort: search.Sort.ASC}), 
                     search.createColumn({name: 'custrecord_3rp_hf_dl_wc_pass'}), 
                     search.createColumn({name: 'custrecord_3rp_hf_dl_wc_type'}), 
               
                 ] 
         
         });
     
         var searchResults = caseSearch.run().getRange({ start: 0, end: 999});

         //log.debug({title: 'Date', details: searchResults  });

         // ------ Loop to check out if Today is Working Day ---------------------

         for (let i = 0; i < searchResults.length ; i++) 

             {
                 var second_working_date = searchResults[i].getValue({name:'custrecord_3rp_hf_dl_wc_date'});
                  
                 if (second_working_date == today_string)
                    check = check+1;

                 if (moment(second_working_date ).isBefore(today_string))
                  {
                     var rec = record.load({type: 'customrecord_3rp_hf_dl_working_calendar',id: searchResults[i].id , isDynamic : true});
                     rec.setValue({fieldId: 'custrecord_3rp_hf_dl_wc_pass', value:  true  });
                     rec.save();
                  }   

             }
            
         // ------ Update the Subsidary Fields (TODAY IS SECOND WORKING DAY) -------------

             if (check == 1 )
                {
                    var rec1 = record.load({type: 'subsidiary',id: subsidiary_id , isDynamic : true});
                    rec1.setValue({fieldId: 'custrecord_3rp_hf_dl_sub_second_day', value:  true  });
                    rec1.save();
                }
             else
                {
                    var rec1 = record.load({type: 'subsidiary',id: subsidiary_id , isDynamic : true});
                    rec1.setValue({fieldId: 'custrecord_3rp_hf_dl_sub_second_day', value:  false  });
                    rec1.save();

                }

                log.debug({title: 'Subsidiary Name', details:   subsidiary_name  });
                log.debug({title: 'Today is second workday (1 or 0)', details:  check  });
        
        }
            
            var today_check = moment(today).format('LLLL');
            log.debug({title: 'Today (system Timeslot) is', details:  today_check  });
            
     
    }

     return {execute}

 });
