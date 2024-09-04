/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(["N/record", 'N/search'], function (record, search) {
   function afterSubmit(context) {
      var newrecord = context.newRecord;
      log.debug('newrecord', newrecord);
      try {
         if (context.type === context.UserEventType.EDIT) {
            var revId = newrecord.id;
            var revisionName = newrecord.getValue({
               fieldId: 'id'
            });
            log.debug('revisionName', revisionName);
            var objBmR = record.load({
               type: record.Type.BOM_REVISION,
               id: revId,
               isDynamic: true,
            }); //log.debug('objBmR',objBmR);
            objBmR.setValue({
               fieldId: 'custrecord_hf_rev_updated',
               value: true
            });
            log.debug('TEST');
            objBmR.save({
               ignoreMandatoryFields: true
            });
            var workorderSearchObj = search.create({
               type: "workorder",
               filters: [
                  ["type", "anyof", "WorkOrd"],
                  "AND",
                  ["status", "anyof", "WorkOrd:A"],
                  "AND",
                  ["mainline", "is", "T"]
               ],
               columns: ["internalid",
                  "trandate",

                  "statusref",

                  search.createColumn({
                     name: "internalid",
                     join: "bomRevision"
                  }),
                  search.createColumn({
                     name: "name",
                     join: "bomRevision"
                  }),
                  "custbody_hf_rev_updated",
                  search.createColumn({
                     name: "custrecord_hf_rev_updated",
                     join: "bomRevision"
                  })
               ]
            });
            var myResultSet = workorderSearchObj.run();
            var resultRange = myResultSet.getRange({
               start: 0,
               end: 1000
            });
            //////////////////////////// End Saved Search Using Script //////////////////////////////////

            for (var i = 0; i < resultRange.length; i++) {
               var searchrevisionName = resultRange[i].getText({
                  name: "internalid",
                  join: "bomRevision"
               }); // log.debug('searchrevisionName',searchrevisionName);

               if (revisionName == searchrevisionName) {
                  var seworkId = resultRange[i].getText({
                     name: "internalid",
                  });
                  log.debug('seworkId', seworkId);
                  var objwok = record.load({
                     type: record.Type.WORK_ORDER,
                     id: seworkId,
                     isDynamic: true
                  });
                  objwok.setValue({
                     fieldId: 'custbody_hf_rev_updated',
                     value: true
                  });

                  objwok.save({
                     ignoreMandatoryFields: true
                  });
               }

            }
         }
      } catch (e) {
         log.debug({
            title: "Exception",
            details: e
         });
      }

   }
   return {
      afterSubmit: afterSubmit
   };
});