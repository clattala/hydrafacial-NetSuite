/**
* @NApiVersion 2.1
* @NScriptType UserEventScript
*/

/**
 * user event script on gl determination custom record
 */
define([
    'N/search'
    , 'N/record'
    , 'N/task'
], function (
    search
    , record
    , task
) {
    'use strict';

    const beforeSubmit = context => {
        try {
            const { type: contextType, newRecord } = context;
            const { type, id } = newRecord;
            const customer = newRecord.getValue({ fieldId: 'custrecord4' });
            const salesgrp = newRecord.getValue({ fieldId: 'custrecord_customer_salesgroup' });

            if (Number(customer)) {
                const arAccount = newRecord.getValue({ fieldId: 'custrecord_cus_receivables_account' });
                const recordCustomer = record.load({ type: record.Type.CUSTOMER, id: customer });
                const customerARAccount = recordCustomer.getValue({ fieldId: 'receivablesaccount' });

                if (Number(arAccount) !== Number(customerARAccount)) {
                    recordCustomer.setValue({ fieldId: 'receivablesaccount', value: arAccount });
                    recordCustomer.save();
                }
            } else if (Number(salesgrp)) {
                // change default receivable for all the customers matching this salesgroup
                task
                    .create({
                        taskType: task.TaskType.MAP_REDUCE
                        , scriptId: `customscript_pk_gldetermination_mr`
                        , params: {
                            custscript_pk_salesgrp: salesgrp
                            , custscript_pk_recacctid: newRecord.getValue({ fieldId: 'custrecord_cus_receivables_account' })
                        }
                    })
                    .submit();
            }

        } catch (E) {
            log.error('pk-gldetermination-ue:beforeSubmit:Error:', E);
            throw E;
        }
    }

    return {
        beforeSubmit
    }
});