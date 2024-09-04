/**
* @NApiVersion 2.1
* @NScriptType UserEventScript
*/

/**
 * Closes transfer orders after status is changed from pending receipt to received
 */
define([
    'N/search'
    , 'N/record'
], function (
    search
    , record
) {
    'use strict';

    const afterSubmit = context => {
        try {
            const { type: contextType, newRecord } = context;

            if ([
                context.UserEventType.CREATE,
                context.UserEventType.EDIT
            ].indexOf(contextType) === -1) {
                return;
            }

            const { type, id } = newRecord;
            const recordTransaction = record.load({ type, id });
            const createdfrom = recordTransaction.getValue({ fieldId: 'createdfrom' });
            if (createdfrom) {
                const createdfromtext = recordTransaction.getText({ fieldId: 'createdfrom' });
                if (
                    createdfromtext
                        .toLowerCase()
                        .indexOf('transfer') !== -1
                ) {
                    const sublistId = 'item';
                    const recordTransferOrder = record.load({
                        type: record.Type.TRANSFER_ORDER,
                        id: createdfrom,
                        isDynamic: true
                    });

                    const status = recordTransferOrder.getValue({
                        fieldId: 'status'
                    });

                    log.debug('transfer status', status)
                    if (status == 'Received') {
                        const count = recordTransferOrder.getLineCount({ sublistId });

                        for (var line = 0; line < count; line++) {
                            const isclosed = recordTransferOrder.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'isclosed',
                                line
                            });

                            log.debug('status', status)
                            log.debug('isclosed', isclosed)

                            if (isclosed === 'F' || !isclosed) {
                                recordTransferOrder.selectLine({
                                    sublistId,
                                    line
                                });
                                recordTransferOrder.setCurrentSublistValue({
                                    sublistId,
                                    fieldId: 'isclosed',
                                    value: true,
                                });
                                recordTransferOrder.commitLine({ sublistId });
                            }
                        }

                        recordTransferOrder.save({
                            ignoreMandatoryFields: true
                        });
                    }
                }
            }


        } catch (E) {
            log.error('trevera-itemreceipt-ue:aftersubmit:Error:', E);
            throw E;
        }
    }

    return {
        afterSubmit
    }
});