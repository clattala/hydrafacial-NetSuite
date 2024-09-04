/**
 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */
define(['N/https', 'N/log', 'N/query', 'N/record', 'N/runtime', 'N/search'], function (https, log, query, record, runtime, search) {
    'use strict';

    var loyaltyPointsRecordId = 'customrecord_hf_loyalty';

    return {
      get: function (request) {
        var currentUser = runtime.getCurrentUser().id;
        return this.getPointsHistory(currentUser)
      },

      getPointsHistory: function getPointsHistory(customerId) {
        var resp = {success: true, records: []};
        try {
          const queryObj     = query.create({type: loyaltyPointsRecordId});
          const inActive     = queryObj.createCondition({fieldId: 'isinactive', operator: query.Operator.IS, values: false});
          const customer     = queryObj.createCondition({fieldId: 'custrecord_hf_loyalty_customer', operator: query.Operator.ANY_OF, values: customerId});
          //const transactionJoin = queryObj.autoJoin({fieldId: 'custrecord_hf_loyalty_transaction'})
          queryObj.condition = queryObj.and(inActive, customer);
          queryObj.columns   = [
            queryObj.createColumn({fieldId: 'id'}),
            queryObj.createColumn({fieldId: 'custrecord_hf_loyalty_action', alias: 'actionId'}),
            queryObj.createColumn({fieldId: 'custrecord_hf_loyalty_action', alias: 'actionName', context: query.FieldContext.DISPLAY}),
            queryObj.createColumn({fieldId: 'custrecord_hf_loyalty_points', alias: 'points'}),
            queryObj.createColumn({fieldId: 'custrecord_hf_loyalty_total', alias: 'newTotal'}),
            queryObj.createColumn({fieldId: 'custrecord_hf_loyalty_expiration_date', alias: 'expirationDate'}),
            queryObj.createColumn({fieldId: 'custrecord_hf_loyalty_is_expired', alias: 'isExpired'}),
            queryObj.createColumn({fieldId: 'custrecord_hf_loyalty_transaction', alias: 'transactionID'}),
            queryObj.createColumn({fieldId: 'custrecord_hf_loyalty_transaction', alias: 'transactionName', context: query.FieldContext.DISPLAY}),
            queryObj.createColumn({fieldId: 'custrecord_hf_loyalty_trandate', alias: 'transactionDate'})/*,
            transactionJoin.createColumn({fieldId: 'otherrefnum', alias: 'poNumber'})*/
          ]

          queryObj.sort = [
            queryObj.createSort({column: queryObj.columns[0], ascending: false})
          ]
          var runQuery  = queryObj.run();
          var iterator  = runQuery.iterator();
          iterator.each(function (result) {
            var resultObj = result.value.asMap();
            if (resultObj.actionName == 'Redeem') resultObj.actionNameTranslated = 'Points Redeemed At Checkout';
            else if (resultObj.actionName == 'Earned') resultObj.actionNameTranslated = 'Points From ' + resultObj.transactionName;
            else if (resultObj.actionName == 'Cancelled') resultObj.actionNameTranslated = 'Points Redemption Cancelled ' + resultObj.transactionName;
            else if (resultObj.actionName == 'Pending') resultObj.actionNameTranslated = 'Pending Redemption for ' + resultObj.transactionName;
            else resultObj.actionNameTranslated = resultObj.actionName;
            log.debug('history result', resultObj);
            resp.records.push(resultObj);
            return true;
          });
        } catch (e) {
          log.error('error fetching history', e);
          resp.success = false;
          resp.message = e.message;
        }
        return resp;
      },
    }
  }
)
