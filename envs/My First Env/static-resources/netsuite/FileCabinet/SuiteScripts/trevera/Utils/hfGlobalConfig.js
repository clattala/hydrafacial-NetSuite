/**
 * hfGlobalConfig.ts
 * by shelby.severin@trevera.com
 *
 * @NScriptName HF | Global Config
 * @NApiVersion 2.1
 */
define(["require", "exports", "N/log", "N/record"], function (require, exports, log, record) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports._getConfig = exports._setConfig = exports._HF_GLOBAL_CONFIG = void 0;
    const _recordId = 'customrecord_hf_global_config';
    exports._HF_GLOBAL_CONFIG = {
        initialized: false,
        usSubsidiary: 0,
        ukSubsidiary: 0,
        defaultReceivingLocation: 0,
        runPartnerLogicFor: [],
        outsourcedPOForms: [],
        coloradoTaxItemOn: false,
        coloradoTaxItem: 0,
        cfrAccount: '',
        shipCountryCodeUS: '',
        shipCountryCodeCA: '',
        prepaymentTypePrepaid: null,
        prepaymentTypeDDP: null,
        prepaymentTypeThirdParty: null,
        prepaymentCFR: null,
        fulfillmentEmailTemplate: 0
    };
    function _setConfig() {
        const config = record.load({ type: _recordId, id: 1 });
        const partnerSubsidiaries = config.getValue('custrecord_hf_config_fin_partner_logic');
        const outsourcedPOForms = config.getValue('custrecord_hf_config_outsourced_po_forms');
        exports._HF_GLOBAL_CONFIG.usSubsidiary = Number(config.getValue('custrecord_hf_config_us_subsidiary'));
        exports._HF_GLOBAL_CONFIG.ukSubsidiary = Number(config.getValue('custrecord_hf_config_uk_subsidiary'));
        exports._HF_GLOBAL_CONFIG.defaultReceivingLocation = Number(config.getValue('custrecord_hf_default_receiving_location'));
        exports._HF_GLOBAL_CONFIG.runPartnerLogicFor = partnerSubsidiaries;
        exports._HF_GLOBAL_CONFIG.coloradoTaxItemOn = config.getValue('custrecord_hf_config_colorado_tax_on');
        exports._HF_GLOBAL_CONFIG.coloradoTaxItem = Number(config.getValue('custrecord_hf_config_tax_item'));
        exports._HF_GLOBAL_CONFIG.cfrAccount = config.getValue('custrecord_hf_config_cfr_account');
        exports._HF_GLOBAL_CONFIG.shipCountryCodeUS = config.getValue('custrecord_hf_config_country_code_us');
        exports._HF_GLOBAL_CONFIG.shipCountryCodeCA = config.getValue('custrecord_hf_config_country_code_ca');
        exports._HF_GLOBAL_CONFIG.prepaymentTypePrepaid = Number(config.getValue('custrecord_hf_config_prepaid'));
        exports._HF_GLOBAL_CONFIG.prepaymentTypeDDP = Number(config.getValue('custrecord_hf_config_ddp'));
        exports._HF_GLOBAL_CONFIG.prepaymentTypeThirdParty = Number(config.getValue('custrecord_hf_config_third_party'));
        exports._HF_GLOBAL_CONFIG.prepaymentCFR = Number(config.getValue('custrecord_hf_config_cfr'));
        exports._HF_GLOBAL_CONFIG.fulfillmentEmailTemplate = Number(config.getValue('custrecord_hf_config_fulfillment_email'));
        exports._HF_GLOBAL_CONFIG.outsourcedPOForms = outsourcedPOForms;
        exports._HF_GLOBAL_CONFIG.initialized = true;
        log.debug('_HF_GLOBAL_CONFIG', exports._HF_GLOBAL_CONFIG);
    }
    exports._setConfig = _setConfig;
    function _getConfig() {
        if (exports._HF_GLOBAL_CONFIG.initialized) {
            return exports._HF_GLOBAL_CONFIG;
        }
        else {
            _setConfig();
            return exports._HF_GLOBAL_CONFIG;
        }
    }
    exports._getConfig = _getConfig;
});
