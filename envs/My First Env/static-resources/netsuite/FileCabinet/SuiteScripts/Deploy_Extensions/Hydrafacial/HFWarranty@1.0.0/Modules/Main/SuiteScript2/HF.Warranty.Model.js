/**
 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

define(['N/log', 'N/query', 'N/runtime'], function (log, query, runtime) {
    'use strict';

    var _recId = 'customrecord_wrm_warrantyreg';

    return {
      get: function (request) {
        var currentUser = runtime.getCurrentUser().id;
        return this.getWarranties(currentUser)
      },

      getWarranties: function getWarranties(customerId) {
        var resp = { success: true, records: [] };
        try {
          resp.records = query.runSuiteQL({
            query : 'SELECT custrecord_wrm_reg_ref_seriallot as serialnumber, custrecord_wrm_reg_serialnumber as seriallotid, custrecord_wrm_reg_warrantyexpire as expirationDate,'
              + ' custrecord_wrm_reg_registration as name, custrecord_wrm_reg_item as itemid, item.displayName, item.itemId as sku' +
              ' FROM customrecord_wrm_warrantyreg '
              + ' JOIN item on item.id = customrecord_wrm_warrantyreg.custrecord_wrm_reg_item '
              + ' WHERE customrecord_wrm_warrantyreg.custrecord_wrm_reg_customer = ' + customerId
              + ' and customrecord_wrm_warrantyreg.custrecord_wrm_reg_warrantyexpire >= BUILTIN.RELATIVE_RANGES( \'TODAY\', \'START\' )',
            params: []
          }).asMappedResults();

          for(var i = 0; i < resp.records.length; i++) {
            var rec = resp.records[i];
            if(rec.seriallotid && rec.seriallotid > 0) {
              var serials = query.runSuiteQL({
                query : 'SELECT BUILTIN.DF( InventoryNumber.Item ) as ItemID, InventoryNumber.InventoryNumber '
                  + ' FROM InventoryNumber '
                  + ' WHERE InventoryNumber.id = ' + rec.seriallotid,
                params: []
              }).asMappedResults();
              if(serials.length > 0) rec.serialnumber = serials[0].inventorynumber;
            }
          }
        } catch (e) {
          log.error('error fetching history', e);
          resp.success = false;
          resp.message = e.message;
        }
        return resp;
      }
    }
  }
)
