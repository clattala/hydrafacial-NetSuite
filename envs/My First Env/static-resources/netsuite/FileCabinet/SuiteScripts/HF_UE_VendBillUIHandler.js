/**
 * HF_UE_VendBillUIHandler.js
 *
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 *
 *
 */
define(['N/ui/serverWidget', 'N/runtime'], function( SERVERWIDGET, RUNTIME ) {

    function beforeLoad(context) {
        beforeLoad_hideItemsSubStandaloneBill( context );
    }



    function beforeLoad_hideItemsSubStandaloneBill( context ) {
        const stLogTitle = 'beforeLoad_hideItemsSubStandaloneBill';
        const FX_CONFIG = {
            ALLOWED_CONTEXT_TYPES: [ 'copy', 'create', 'edit', 'view' ],
            TARGET_EXECUTION_CONTEXT: 'USERINTERFACE'
        };

        log.debug( stLogTitle, `context.type: ${context.type}` );
        log.debug( stLogTitle, `RUNTIME.executionContext: ${RUNTIME.executionContext}` );

        if ( !FX_CONFIG.ALLOWED_CONTEXT_TYPES.includes( context.type ) || !context.request  || RUNTIME.executionContext != FX_CONFIG.TARGET_EXECUTION_CONTEXT ) {
            return;
        }

        try {
            let params = context.request.parameters;
            let bHideItemSublist = false;

            if ( context.type == 'create' ) {
                // Check if from Bill button on Purchase Order
                let bIsCreateTransform = ( 'transform' in params ) && ( 'id' in params ) ;

                bHideItemSublist = !bIsCreateTransform;
            }
            else if ( context.type == 'copy' ) {
                let recVendBill = context.newRecord;
                let objRecJSON = recVendBill.toJSON();

                // When copying, purchase orders are not available
                // Just check if there are item lines and display as necessary
                let bHasItemLines = ( objRecJSON.sublists && objRecJSON.sublists.item && ( 'line 0' in objRecJSON.sublists.item || 'line 1' in objRecJSON.sublists.item ) );

                bHideItemSublist = !bHasItemLines;
            }
            else if ( context.type == 'view' || context.type == 'edit' ) {
                let recVendBill = context.newRecord;

                let objRecJSON = recVendBill.toJSON();

                let bFromPurch = ( objRecJSON.sublists && objRecJSON.sublists.purchaseorders && ( 'line 0' in objRecJSON.sublists.purchaseorders || 'line 1' in objRecJSON.sublists.purchaseorders) );
                let bHasItemLines = ( objRecJSON.sublists && objRecJSON.sublists.item && ( 'line 0' in objRecJSON.sublists.item || 'line 1' in objRecJSON.sublists.item ) );

                // Still display item sublist if bill was somehow saved with item lines
                bHideItemSublist = !bFromPurch && !bHasItemLines;
            }

            log.debug( stLogTitle, `context.type: ${context.type}: ` + bHideItemSublist );


            // Hide item sublist if a condition has been fulfilled
            log.error( stLogTitle, 'bHideItemSublist: ' + bHideItemSublist );
            if ( bHideItemSublist ) {
                let objRecForm = context.form;

                let objItemSublist = objRecForm.getSublist({ id: 'item' });
                if ( objItemSublist ) {
                    objItemSublist.displayType = SERVERWIDGET.SublistDisplayType.HIDDEN;
                }
            }
        }
        catch ( ex ) {
            log.error( stLogTitle, 'Error: ' + ex );
        }


    }

    return {
        beforeLoad: beforeLoad,
    }
});
