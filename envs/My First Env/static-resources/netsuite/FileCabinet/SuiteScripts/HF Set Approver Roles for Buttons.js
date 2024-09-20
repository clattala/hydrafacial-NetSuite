  /**
   * @NApiVersion 2.x
   * @NScriptType WorkflowActionScript
   */
  define(['N/record', 'N/search', 'N/runtime'], function(record, search, runtime) {

      function onAction(scriptContext) {
          log.debug({
              title: 'Start Script'
          });
          var approverLevel = runtime.getCurrentScript().getParameter('custscript_hf_approver_level');
          var newRecord = scriptContext.newRecord;
          var type = newRecord.type;
          var vbSubsidiary = newRecord.getValue('subsidiary');
        
          var customrecord_hf_vb_approver_limit_roleSearchObj = search.create({
              type: "customrecord_hf_vb_approver_limit_role",
              filters: [
                  ["custrecord_hf_vb_subsidiary", "anyof", vbSubsidiary]
              ],
              columns: [
                  search.createColumn({
                      name: "custrecord_hf_approver_level",
                      label: "Level",
                      sort: search.Sort.ASC
                  }),
                  search.createColumn({
                      name: "custrecord_hf_approver_limit",
                      label: "Approver Limit"
                  }),
                  search.createColumn({
                      name: "custrecord_hf_approver_role",
                      label: "Approver Role"
                  }),
                  search.createColumn({
                      name: "custrecord_hf_vb_subsidiary",
                      label: "Subsidiary"
                  })
              ]
          });
          if (approverLevel) {
              customrecord_hf_vb_approver_limit_roleSearchObj.filters.push(search.createFilter({
                  name: 'custrecord_hf_approver_level',
                  operator: 'greaterthanorequalto',
                  values: approverLevel
              }));
          }

          var roleList = [];
          var searchResults = customrecord_hf_vb_approver_limit_roleSearchObj.run().getRange(0, 1000);
          if (searchResults.length) {
              if (searchResults.length > 1) {
                  for (var i = 0; i < searchResults.length; i++) {
                      var role = searchResults[i].getValue({
                          name: 'custrecord_hf_approver_role'
                      });
                      roleList.push(role);
                  }
                  newRecord.setValue({
                      fieldId: 'custbody_hf_approver_roles',
                      value: roleList
                  });
              }


              var approverRecId = searchResults[0].id;
              if (approverRecId) {
                  return approverRecId;
              } else {
                  return '';
              }

          }


      }


      return {
          onAction: onAction
      };
  });