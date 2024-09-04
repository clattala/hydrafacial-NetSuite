/**
 * hfEntityDefaults.ts
 * by shelby.severin@trevera.com
 *
 * @NScriptName HF | Entity Utils
 * @NApiVersion 2.1
 */
define(["require", "exports", "N/log", "N/query", "N/record", "N/search", "./hfGlobalConfig"], function (require, exports, log, query, record, search, hfGlobalConfig_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.setInvoiceAddress = exports.setVatNumber = exports.setEntityDefaults = void 0;
    function setEntityDefaults(rec, isClient) {
        const _globalConfig = (0, hfGlobalConfig_1._getConfig)();
        const subsidiary = rec.getValue('subsidiary');
        const entity = rec.getValue('entity');
        const intercompany = rec.getValue('intercompany');
        if (entity && subsidiary && !intercompany) {
            try {
                if (entity) {
                    const defaults = search.lookupFields({ type: search.Type.CUSTOMER, id: entity, columns: ['custentity_hf_shipaccount', 'custentity_hf_shiptype', 'custentity_hf_class'] });
                    const entityClass = defaults['custentity_hf_class']; // Region on Form, Class on Sales Order
                    if (entityClass && entityClass.length == 1)
                        rec.setValue('class', entityClass[0].value);
                    const paymentType = defaults['custentity_hf_shiptype'];
                    const shipAccount = defaults['custentity_hf_shipaccount'];
                    if (paymentType && paymentType.length == 1)
                        rec.setValue('custbody_hf_ship_pymt_type', paymentType[0].value);
                    if (shipAccount)
                        rec.setValue('custbody_hf_shippayacct', shipAccount);
                    if (_globalConfig.ukSubsidiary.toString() == subsidiary)
                        setVatNumber(rec, entity);
                    if (_globalConfig.runPartnerLogicFor.includes(subsidiary))
                        setInvoiceAddress(rec, entity, isClient);
                    return entityClass && entityClass.length == 1 ? entityClass[0].value : '';
                }
            }
            catch (e) {
                log.error('setEntityDefaults', `error setting entity defaults: ${e.message}`);
            }
        }
        return '';
    }
    exports.setEntityDefaults = setEntityDefaults;
    function setVatNumber(rec, entityId) {
        const defaults = search.lookupFields({ type: search.Type.CUSTOMER, id: entityId, columns: ['custentity_hf_class'] });
        const vatNumber = defaults['custentity_vat_reg_no'];
        if (vatNumber)
            rec.setValue('vatregnum', vatNumber);
    }
    exports.setVatNumber = setVatNumber;
    function setInvoiceAddress(rec, entityId, isClient) {
        try {
            const financialLeasingPartner = rec.getValue('custbody_hf_de_fin_leasing_company');
            log.debug('setInvoiceAddress', `financialLeasingPartner: ${financialLeasingPartner}`);
            if (financialLeasingPartner) {
                const partner = record.load({ type: 'customrecord_hf_fin_leasing_partner', id: financialLeasingPartner });
                rec.setValue('custbody_hf_de_invoice_address', partner.getValue('custrecord_address_of_finance_partner'));
                const countryLookup = getCountryById(partner.getValue('custrecord_hf_fin_country'));
                if (countryLookup.length > 0) {
                    rec.setValue('billaddress', '');
                    var address = rec.getSubrecord({ fieldId: 'billingaddress' });
                    address.setValue({ fieldId: 'country', value: countryLookup[0].id, ignoreFieldChange: false }); //Country must be set before setting the other address fields
                    address.setValue({ fieldId: 'addressee', value: partner.getValue('custrecord_hf_fin_company'), ignoreFieldChange: false });
                    address.setValue({ fieldId: 'attention', value: partner.getValue('custrecord_hf_fin_address_attn'), ignoreFieldChange: false });
                    address.setValue({ fieldId: 'addr1', value: partner.getValue('custrecord_hf_fin_address_line_1'), ignoreFieldChange: false });
                    address.setValue({ fieldId: 'addr2', value: partner.getValue('custrecord_hf_fin_address_line_2'), ignoreFieldChange: false });
                    address.setValue({ fieldId: 'state', value: partner.getValue('custrecord_hf_fin_state'), ignoreFieldChange: false });
                    address.setValue({ fieldId: 'city', value: partner.getValue('custrecord_hf_fin_city'), ignoreFieldChange: false });
                    address.setValue({ fieldId: 'zip', value: partner.getValue('custrecord_hf_fin_postalcode'), ignoreFieldChange: false });
                    address.setValue({ fieldId: 'addrphone', value: '', ignoreFieldChange: false });
                    address.setValue({ fieldId: 'label', value: '', ignoreFieldChange: false });
                    const addressText = address.getValue({ fieldId: 'addrtext' });
                    rec.setValue('billaddress', addressText);
                    if (isClient)
                        nlapiSetFieldValue('billaddress', addressText);
                }
            }
            else {
                const customer = record.load({ type: record.Type.CUSTOMER, id: entityId });
                const defaultBillingLine = customer.findSublistLineWithValue({ sublistId: 'addressbook', fieldId: 'defaultbilling', value: true });
                log.audit('setInvoiceAddress', defaultBillingLine);
                if (defaultBillingLine > -1) {
                    const address = customer.getSublistSubrecord({ sublistId: 'addressbook', fieldId: 'addressbookaddress', line: defaultBillingLine });
                    const addressText = address.getValue({ fieldId: 'addrtext' });
                    rec.setValue('custbody_hf_de_invoice_address', addressText);
                    log.audit('setInvoiceAddress', JSON.stringify(addressText.replace(/\n/g, '\r')));
                    if (isClient)
                        nlapiSetFieldValue('custbody_hf_de_invoice_address', addressText);
                }
            }
        }
        catch (e) {
            log.error('setInvoiceAddress', e);
        }
    }
    exports.setInvoiceAddress = setInvoiceAddress;
    function getCountryById(id) {
        return query.runSuiteQL({
            query: `SELECT id, name, uniquekey FROM country WHERE uniquekey = ?`,
            params: [id]
        }).asMappedResults();
    }
});
/*
 HF | EU | Populate VAT and Address
 - Set address based on if finance partner is filled in
 - Set VAT Number from Customer

 Add to quote and invoice

 HF Customer Region Default UK & DE
 * Custom Form = HF | DE | Sales Order,HydraFacial | EMEA | Sales Order,HF | UK | Sales Order
 * - Set class field based on customer region and set it on the line
 * */
