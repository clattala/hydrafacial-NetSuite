/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/search','N/record'],
    /**
 * @param{record} record
 */
    (search,record) => {
       
        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (context) => {

            var rec  = context.newRecord; 

            var notetype            = rec.getValue({fieldId:'notetype'});           
            var note                = rec.getValue({fieldId:'note'});  
            var trans_internal_id   = rec.getValue({fieldId:'transaction'});  


        if (notetype == 9)    // Journal - Comments  

            {
                var caseSearch = search.create({
                            
                        type: "transaction",
                        filters:
                        [
                            ["internalid","anyof",trans_internal_id]
                        ],
                        columns:
                        [
                            search.createColumn({name: "subsidiary"}),
                            search.createColumn({name: "type"})
                        ]
                    });

                var searchResults = caseSearch.run().getRange({ start: 0, end:  1});

                var subsidiary = searchResults[0].getValue({name: "subsidiary"});
        
                var record_type = searchResults[0].recordType ;
               
                log.debug({title: 'subsidiary ', details: subsidiary   });
                log.debug({title: 'record_type  ', details: record_type    });




                if ((subsidiary == 11) && (record_type=='journalentry'))     // 11 is UK 
                 
                    {
                        var setRecord = record.load({ type: 'journalentry', id: trans_internal_id  , isDynamic: true });

                        setRecord.setValue({fieldId: 'custbody_3rp_com', value: note });  

                        var callid = setRecord.save();

                        log.debug({title: 'callid ', details: callid  });

                    }

                if ((subsidiary == 11) && (record_type=='advintercompanyjournalentry'))     // 11 is UK 
                 
                    {
                        var setRecord = record.load({ type: 'advintercompanyjournalentry', id: trans_internal_id  , isDynamic: true });

                        setRecord.setValue({fieldId: 'custbody_3rp_com', value: note });  

                        var callid = setRecord.save();

                        log.debug({title: 'callid ', details: callid  });

                    }

            }
               
        }

        return {afterSubmit}

    });
