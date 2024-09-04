/**
* @NApiVersion 2.1
* @NScriptType WorkflowActionScript
*/

/**
 * WorkflowActionScript on aftersubmit to return
 */
 define([
    'N/runtime'
    , 'N/search'
    , 'N/record'
], function (
    runtime
    , search
    , record
) {
    'use strict';

    /**
     * returns a string INVENTORY_LOW if quantity on any order line is more than available quantity
     * @param {string} id internal id of order
     * @returns {string}
     */
    const srchIsInventoryLow = (id) => {
        try {
            let isInventoryLow = 'FAILED';
            const searchCols = {
                entity: search.createColumn({ name: "entity" }),
                tranid: search.createColumn({ name: "tranid" }),
                item: search.createColumn({ name: "item" }),
                quantity: search.createColumn({ name: "quantity" }),
                location: search.createColumn({ name: "location" }),
                locationAvailable: search.createColumn({
                    name: "locationquantityavailable",
                    join: "item",
                    label: "Location Available"
                })
            }

            search
                .create({
                    type: "salesorder",
                    filters:
                        [

                            ["type", "anyof", "SalesOrd"],
                            "AND",
                            ["mainline", "is", "F"],
                            "AND",
                          //  ["amount", "greaterthan", "0.00"],
                          //  "AND",
                            ["item", "noneof", "@NONE@"],
                            "AND",
                            ["shipping", "is", "F"],
                            "AND",
                            ["taxline", "is", "F"],
                            "AND",
                            ["internalidnumber", "equalto", id],
                            "AND",
                            ["formulatext: case when {location} = {item.inventorylocation} then 1 else 0 end", "is", "1"],
                            "AND",
                            ["status", "anyof", "SalesOrd:A"]

                        ],
                    columns: Object.values(searchCols)
                })
                .run()
                .each(function (result) {
                    log.debug('***In Each Function***');
                    const locationAvailable = Number(result.getValue(searchCols.locationAvailable))
                    log.debug('Sales Order Int ID', id);
                    log.debug('Location Available', locationAvailable);
                    //isInventoryLow = locationAvailable ? 'INVENTORY_CHECK_PASSED' : 'INVENTORY_LOW'
                    isInventoryLow = locationAvailable ? 'PASSED' : 'FAILED'
                    return false;
                });

            // .runPaged().count;
            log.debug('isInventoryLow', isInventoryLow);
            return isInventoryLow;

        } catch (E) {
            log.error('srchIsInventoryLow:Error:', E);
            throw E;
        }
    }

    const onAction = context => {
        try {
            const { type: contextType, newRecord } = context;
            const { type, id } = newRecord;

            return srchIsInventoryLow(id);

        } catch (E) {
            log.error('trevera-salestransactions-ue:beforeload:Error:', E);
            throw E;
        }
    }

    return { onAction }
});