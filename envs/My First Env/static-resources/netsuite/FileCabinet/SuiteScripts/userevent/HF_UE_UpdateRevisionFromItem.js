/**
* @NScriptType UserEventScript
* @NApiVersion 2.x
* @author Nilesh Khude
* @NModuleScope SameAccount
* @description Script to populate the revision code on PO after submit
*
*  Date            Author                Version                   Description
* 4.7.2022         Nilesh Khude             1.0                   Resolved NGO-2190
*/

define(['N/record', 'N/search'], function(record, search) {
  function afterSubmit(context) {
    try {
      if (context.type !== context.UserEventType.DELETE) {
          var rec = context.newRecord;

          if (!rec) {
            rec = context.oldRecord;
          }
          var poType = rec.type || '';
          var poId = rec.id || '';

          if(poId) {
              var poDetails = getPoLines(poId) || {};

              log.debug('poDetails', { poDetails: poDetails });
              var load = record.load({
                type: poType,
                id: poId
              });
              var lineCount = load.getLineCount({
                sublistId: 'item'
              });

              for (var i = 0; i < lineCount; i++) {
                var itemId = load.getSublistValue({
                  sublistId: 'item',
                  fieldId: 'item',
                  line: i
                });

                if (!isEmpty(poDetails)) {
                  var revision = poDetails[itemId];

                  log.debug('revision', { itemId: itemId, revision: revision });
                  if (revision) {
                    load.setSublistValue({
                      sublistId: 'item',
                      fieldId: 'custcol_hf_revision',
                      line: i,
                      value: revision
                    });
                  }
                }
              }
              load.save();
          }
       }
    } catch (e) {
      log.error('Error', e.message);
    }
  }

  function getPoLines(poId) {
    var itemMap = {};
    var poSearch = search.create({
      type: 'transaction',
      filters:
      [
        [
          'internalidnumber',
          'equalto',
          poId
        ],
        'AND',
        [
          'mainline',
          'is',
          'F'
        ],
        'AND',
        [
          'taxline',
          'is',
          'F'
        ],
        'AND',
        [
          'shipping',
          'is',
          'F'
        ]
      ],
      columns:
      [
        search.createColumn({ name: 'item' }),
        search.createColumn({
          name: 'custitem_hf_revision',
          join: 'item'
        })
      ]
    });

    poSearch.run().each(function(result) {
      var itemName = result.getValue('item');
      var revison = result.getValue({
        name: 'custitem_hf_revision',
        join: 'item'
      });

      itemMap[itemName] = revison;

      return true;
    });

    return itemMap;
  }

  function isEmpty(obj) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) { return false; }
    }

    return true;
  }

  return {
    afterSubmit: afterSubmit
  };
});
