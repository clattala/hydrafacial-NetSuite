/**
* @NApiVersion 2.1
* @NScriptType Suitelet
*/

/**
 * Suitelet script for printing Customer Purchase Agreement.
 * @author sahil v <emailsahilv@gmail.com>
 */

define([
    'N/record'
    , 'N/search'
    , 'N/runtime'
    , 'N/render'
    , "../lib/js-htmlencode.min"
    , 'N/ui/message'
    , 'N/ui/serverWidget'
], function (
    record
    , search
    , runtime
    , render
    , jsHtmlEncode
    , message
    , serverWidget
) {
    'use strict';
    /**
     * return invlaid request string message
     * @returns {string}
     */
    const invalidRequestProcess = () => 'INVALID_REQUEST_PROCESS';

    const srchBillOfMaterial = assemblyId => {
        try {
            let billOfMaterialId = null;

            search
                .create({
                    type: "bom",
                    filters: [
                        ["assemblyitem.assembly", "anyof", assemblyId],
                        "AND",
                        ["isinactive", "is", "F"]
                    ],
                    columns: [
                        search.createColumn({ name: "name" }),
                        search.createColumn({ name: "revisionname" }),
                        search.createColumn({ name: "assembly", join: "assemblyItem" })
                    ]
                })
                .run()
                .each(function (result) {
                    billOfMaterialId = result.id;
                    return false;
                });

            return billOfMaterialId;

        } catch (E) {
            log.error('srchBillOfMaterial: Error', E);
            throw E;
        }
    }

    const srchRevision = billOfMaterialId => {
        try {
            const oComponents = [];
            const searchCols = {
                item: search
                    .createColumn({
                        name: "item",
                        join: "component"
                    })
                , description: search
                    .createColumn({
                        name: "description",
                        join: "component"
                    })
                , units: search
                    .createColumn({
                        name: "units",
                        join: "component",
                        label: "Units"
                    })
                , qty: search
                    .createColumn({
                        name: "bomquantity",
                        join: "component",
                        label: "BoM Quantity"
                    })
            };

            search
                .create({
                    type: "bomrevision",
                    filters:
                        [
                            ["billofmaterials", "anyof", billOfMaterialId]
                        ],
                    columns: Object.values(searchCols)
                })
                .run()
                .each(function (result) {
                    const rowInfo = {};
                    for (let key in searchCols) {
                        if (searchCols.hasOwnProperty(key)) {
                            rowInfo[key] = {
                                text: result.getText(searchCols[key])
                                , value: result.getValue(searchCols[key])
                            }
                        }
                    }

                    oComponents.push(rowInfo);
                    return true;
                });

            log.debug('oComponents', oComponents);
            return oComponents;

        } catch (E) {
            log.error('srchRevision:Error', E);
            throw E;
        }
    }

    const srchAssemblyDetails = (recSalesOrder) => {
        try {
            const sublistId = 'item';
            const lineCount = recSalesOrder.getLineCount({ sublistId });
            const oAssembly = {};
            let components = [];
            let assemblyId = null;

            for (let line = 0; line < lineCount; line++) {
                const itemtype = recSalesOrder.getSublistValue({ sublistId, line, fieldId: 'itemtype' });
                if (itemtype === 'Assembly') {
                    assemblyId = recSalesOrder.getSublistValue({ sublistId, line, fieldId: 'item' });
                    const item = recSalesOrder.getSublistText({ sublistId, line, fieldId: 'item' });
                    const billOfMaterialId = srchBillOfMaterial(assemblyId);
                    components = srchRevision(billOfMaterialId);

                    oAssembly[item] = {
                        item
                        , components
                        , description: recSalesOrder.getSublistValue({ sublistId, line, fieldId: 'description' })
                        , rate: recSalesOrder.getSublistValue({ sublistId, line, fieldId: 'rate' })
                        , amount: recSalesOrder.getSublistValue({ sublistId, line, fieldId: 'amount' })
                    }

                    break;
                }
            }

            log.debug('oAssembly', oAssembly);
            // return oAssembly;
            return components;

        } catch (E) {
            log.error('srchAssemblyDetails:Error', E);
            throw E;
        }
    }

    const onRequest = context => {
        const { request, response } = context;
        let { parameters, body, method } = request;
        log.debug('context.request', JSON.stringify({ parameters, body, method }));
        const script = runtime.getCurrentScript();

        switch (method) {
            case 'GET':
                try {
                    const { custparam_salesorderid: salesOrderId } = parameters;
                    const cstmrPrchAgTemplateId = script.getParameter({ name: 'custscript_pk_prchagrmnt_tmpl' });
                    log.debug('cstmrPrchAgTemplateId', cstmrPrchAgTemplateId);

                    const recSalesOrder = record.load({
                        //  type: record.Type.SALES_ORDER,
                        type: record.Type.ESTIMATE
                        , id: salesOrderId
                    });
                    const customerId = recSalesOrder.getValue('entity')
                    var renderer = render.create();
                    //add record as data source
                   renderer.addRecord({
                        templateName: 'record',
                        record: recSalesOrder
                    })
                  const customer = record.load({
                    type : 'customer',
                    id : customerId
                  })
                  log.debug('customer', customer)

                  renderer.addRecord({
                        templateName: 'customer',
                        record: customer
                    })
                    /*
                    //add a custom data source - fetch revision components
                    const components = srchAssemblyDetails(recSalesOrder);
                    log.debug('components', components);

                    renderer.addCustomDataSource({
                        format: render.DataSource.OBJECT,
                        alias: "components",
                        data: { components }
                    });*/

                    renderer.setTemplateById(cstmrPrchAgTemplateId);
                    return response.writeFile({ file: renderer.renderAsPdf(), isInline: true })
                    // return response.write(renderer.renderAsString())
                    break;
                } catch (E) {
                    const purchAgrmntForm = serverWidget
                        .createForm({ title: 'Customer Purchase Agreement' })
                     log.debug('error ' + E.message, E )
                    purchAgrmntForm.addPageInitMessage({
                        type: message.Type.WARNING
                        , title: 'Incurred Error'
                        , message: 'Please check the Bill of Materials is complete. Error Text: ' + E.message || E
                    })

                    response.writePage(purchAgrmntForm)
                }
            default:
                response.write(invalidRequestProcess())
                break;
        }
    }

    return {
        onRequest
    }
});