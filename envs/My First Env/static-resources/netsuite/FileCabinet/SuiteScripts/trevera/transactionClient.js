/**
 * transactionClient.ts
 * by shelby.severin@trevera.com
 *
 * @NScriptName HF | Transaction Client
 * @NScriptType ClientScript
 * @NApiVersion 2.1
 */
define(["require", "exports", "./Utils/treveraUtilsClient", "./Utils/hfEntityDefaults", "./Utils/hfGlobalConfig"], function (require, exports, treveraUtilsClient_1, hfEntityDefaults_1, hfGlobalConfig_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.postSourcing = exports.pageInit = exports.MODE = void 0;
    exports.MODE = '';
    let _globalConfig;
    function pageInit(context) {
        _globalConfig = (0, hfGlobalConfig_1._getConfig)();
        console.log('subsidiary', context.currentRecord.getValue({ fieldId: 'subsidiary' }));
        exports.MODE = context.mode;
        if (context.currentRecord.getValue({ fieldId: 'subsidiary' }) != '') {
            (0, treveraUtilsClient_1.getDefaultLocationForSubsidiary)();
            if (['create', 'copy'].includes(exports.MODE)) {
                const subsidiary = context.currentRecord.getValue({ fieldId: 'subsidiary' });
                const entity = Number(context.currentRecord.getValue('entity'));
                if (entity > 0)
                    if (_globalConfig.runPartnerLogicFor.includes(subsidiary))
                        (0, hfEntityDefaults_1.setInvoiceAddress)(context.currentRecord, entity.toString(), true);
            }
        }
    }
    exports.pageInit = pageInit;
    function postSourcing(context) {
        // when the entity changes, for the US, set the entity defaults
        if (context.fieldId == 'entity' && ['create', 'copy'].includes(exports.MODE)) {
            _globalConfig = (0, hfGlobalConfig_1._getConfig)();
            const subsidiary = context.currentRecord.getValue({ fieldId: 'subsidiary' });
            if (_globalConfig.runPartnerLogicFor.includes(subsidiary))
                (0, hfEntityDefaults_1.setInvoiceAddress)(context.currentRecord, context.currentRecord.getValue('entity'), true);
        }
    }
    exports.postSourcing = postSourcing;
});
