/**
 * treveraUtilsClient.ts
 * by Trevera
 * shelby.severin@trevera.com
 *
 * @NScriptName Trevera Utils - Client
 * @NApiVersion 2.1
 */
define(["require", "exports", "N/currentRecord", "N/runtime", "N/search", "./hfGlobalConfig"], function (require, exports, currentRecord, runtime, search, hfGlobalConfig_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.setDefaultReceivingLocation = exports.getSearchTypeFromItemType = exports.isShippingValid = exports.requireInventoryLocationOnLine = exports.requireLocationOnLines = exports.requireLocationOnLine = exports.setLineLocationFromHeader = exports.setDefaultsOnLines = exports.getDefaultLocationForSubsidiary = void 0;
    function getDefaultLocationForSubsidiary() {
        currentRecord.get.promise().then((rec) => {
            const subsidiary = rec.getValue({ fieldId: 'subsidiary' });
            const currentLocation = rec.getValue({ fieldId: 'location' });
            if (subsidiary.length > 0 && currentLocation == '') {
                const locationSearch = search.create({
                    type: search.Type.LOCATION,
                    filters: [
                        search.createFilter({ name: 'subsidiary', operator: search.Operator.ANYOF, values: subsidiary }),
                        search.createFilter({ name: 'custrecord_is_default_location', operator: search.Operator.IS, values: true })
                    ]
                });
                const result = locationSearch.run().getRange({ start: 0, end: 1 });
                if (result && result.length == 1) {
                    rec.setValue({ fieldId: 'location', value: result[0].id });
                }
                else {
                    console.log('cant set location because there is no default for the subsidiary');
                }
            }
        });
    }
    exports.getDefaultLocationForSubsidiary = getDefaultLocationForSubsidiary;
    function setDefaultsOnLines(rec) {
    }
    exports.setDefaultsOnLines = setDefaultsOnLines;
    function setLineLocationFromHeader(ITEMS, setInventoryLocation) {
        const rec = currentRecord.get();
        const item = rec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'item' });
        const line = rec.getCurrentSublistIndex({ sublistId: 'item' });
        if (ITEMS[line] == item)
            return; // item didn't change
        const currentLineLocation = rec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'location' });
        const currentHeaderLocation = rec.getValue('location');
        const currentClass = rec.getValue('class');
        if (!currentLineLocation || currentLineLocation == '' || currentLineLocation == currentHeaderLocation || ITEMS[line] != item) {
            rec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'location', value: currentHeaderLocation, fireSlavingSync: true });
            rec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'class', value: currentClass, fireSlavingSync: true });
            if (setInventoryLocation) {
                rec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'inventorylocation', value: currentHeaderLocation, fireSlavingSync: true });
            }
        }
    }
    exports.setLineLocationFromHeader = setLineLocationFromHeader;
    function requireLocationOnLine(rec) {
        const location = rec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'location' });
        if (location == '') {
            alert('Please Enter an Inventory Location');
            return false;
        }
        return true;
    }
    exports.requireLocationOnLine = requireLocationOnLine;
    function requireLocationOnLines(rec) {
        let hasLocation = true;
        let hasInvLocation = true;
        for (let line = 0; line < rec.getLineCount({ sublistId: 'item' }); line++) {
            const location = rec.getSublistValue({ sublistId: 'item', fieldId: 'location', line });
            if (!location || location == '') {
                hasLocation = false;
                break;
            }
        }
        if (!hasLocation || !hasInvLocation) {
            if (!hasLocation && !hasInvLocation)
                alert('Please Enter a Location and an Inventory Location for all lines');
            else if (!hasLocation)
                alert('Please Enter a Location for all lines');
            else if (!hasInvLocation)
                alert('Please Enter an Inventory Location for all lines');
            return false;
        }
        return true;
    }
    exports.requireLocationOnLines = requireLocationOnLines;
    function requireInventoryLocationOnLine(rec) {
        const inventorylocation = rec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'inventorylocation' });
        if (inventorylocation == '') {
            alert('Please Enter an Inventory Location');
            return false;
        }
        return true;
    }
    exports.requireInventoryLocationOnLine = requireInventoryLocationOnLine;
    function isShippingValid() {
        const _globalConfig = (0, hfGlobalConfig_1._getConfig)();
        const logging = runtime.envType == runtime.EnvType.SANDBOX;
        const rec = currentRecord.get();
        const shipPaymentType = rec.getValue('custbody_hf_ship_pymt_type');
        const shipPaymentAccount = rec.getValue('custbody_hf_shippayacct');
        const shipCountry = rec.getText('shipcountry');
        const shippingMethodName = rec.getText('shipmethod'); // Retrieve the complete shipping method name
        let message = '';
        if (logging)
            console.log('shipPaymentType: ', shipPaymentType, 'shippingMethodName: ', shippingMethodName);
        /** Shipment Method Validation: If the shipment method is either UPS or FedEx, the validation script should be executed to ensure that the details align with the specific requirements of these carriers. */
        if (shippingMethodName.includes('UPS') || shippingMethodName.includes('FEDEX')) {
            /** Removed as a criteria
             * If the shipment payment type is either Third Party, CFR (for Canada), or DDP (for non-US/non-Canadian destinations), the Shipping Method field must be filled in. If it is left blank, an alert
             * is issued indicating that the Shipping Method is mandatory for the selected Shipment Payment Type.
             if ([thirdParty, cfr, ddp].includes(shipPaymentType) && shippingMethod < 1) {
             message = 'For Ship Payment Type of DDP (Delivered Duty Paid), or Third Party, a shipping method is required. Please select a shipping method.';
             }
             */
            /** Removed as a criteria
             * Shipment Account Requirement: If the shipment payment type is either Third Party or CFR (for Canada), the Shipment Account field must be filled in. If it is left blank, an alert is issued
             * indicating that the Shipment Account is mandatory for the selected Shipment Payment Type.
             if ([thirdParty, cfr].includes(shipPaymentType) && shipPaymentAccount.length < 1) {
             message = 'Shipment Account is mandatory for the selected Shipment Payment Type. Please enter a Shipment Account in order to continue.';
             }
             */
            if (logging)
                console.log('Shipping Method is UPS/FEDEX', shippingMethodName);
            /** If the 'ship-to' country is the United States, the shipment payment type must be either Prepaid or Third Party. If any other payment type is selected, an alert is issued indicating that only Prepaid or Third Party is allowed.
             * For shipments going to the United States, the Shipment Payment Type must be set as Prepaid. This means that HydraFacial (HF) will cover the shipping charges.
             * */
            if (shipCountry == _globalConfig.shipCountryCodeUS) {
                if (![_globalConfig.prepaymentTypePrepaid.toString(), _globalConfig.prepaymentTypeThirdParty.toString()].includes(shipPaymentType))
                    message =
                        'For domestic shipments, Ship Payment Type must be Prepaid or Third Party. Please update the Shipment Payment Type.';
                else if (shipPaymentAccount.length < 1 && shipPaymentType != _globalConfig.prepaymentTypePrepaid.toString())
                    message =
                        'For domestic shipments with no Third Party Account, the Payment Type must be PREPAID. Please update the Payment Type.';
                else if (shipPaymentAccount.length > 0 && shipPaymentType != _globalConfig.prepaymentTypeThirdParty.toString())
                    message =
                        'For domestic shipments with a Third Party Account, the Payment Type must be Third Party. Please update the Payment Type.';
            }
            /** Canadian Shipments: If the 'ship-to' country is Canada, the payment type is DDP (Delivered Duty Paid), or Third Party if the customer is paying the freight and all other import expenses.*/
            if (shipCountry == _globalConfig.shipCountryCodeCA) {
                if (![_globalConfig.prepaymentTypeDDP.toString(), _globalConfig.prepaymentTypeThirdParty.toString()].includes(shipPaymentType))
                    message =
                        'For shipments to Canada, Ship Payment Type must be DDP (Delivered Duty Paid), or Third Party. Please update the Shipment Payment Type.';
                else if (shipPaymentAccount == 'C058Y9' && shipPaymentType != _globalConfig.prepaymentTypeDDP.toString())
                    message = 'For payment account C058Y9, Payment Type must be DDP. Please update the Payment Type.';
                else if (shipPaymentAccount != 'C058Y9' && shipPaymentAccount.length > 0 && shipPaymentType != _globalConfig.prepaymentTypeThirdParty.toString())
                    message =
                        'For payment accounts other than C058Y9, Payment Type must be THIRD PARTY. Please update the Payment Type.';
                else if (shipPaymentAccount.length < 1 && shipPaymentType != _globalConfig.prepaymentTypeDDP.toString())
                    message =
                        'For shipments to Canada, Ship Payment Type must be DDP (Delivered Duty Paid) if there is no Account on file. Please update the Payment Type.';
            }
            /** Non-US/Non-Canadian Shipments: If the 'ship-to' country is neither the United States nor Canada, the shipment payment type must be either Third Party or Delivery Duty Paid (DDP). If any other payment type is selected, an alert is issued indicating that only Third Party or DDP is acceptable.  */
            if (![_globalConfig.shipCountryCodeUS, _globalConfig.shipCountryCodeCA].includes(shipCountry)) {
                if (shipPaymentAccount.length < 1 && shipPaymentType != _globalConfig.prepaymentTypeDDP.toString())
                    message =
                        'For international shipments with no account, Ship Payment Type must be DDP (Delivered Duty Paid). Please update the Ship Payment Type.';
                else if (shipPaymentAccount.length > 0 && shipPaymentType != _globalConfig.prepaymentTypeThirdParty.toString())
                    message =
                        'For international shipments with an account, Ship Payment Type must be Third Party. Please update the Ship Payment Type.';
                else if (![_globalConfig.prepaymentTypeDDP.toString(), _globalConfig.prepaymentTypeThirdParty.toString()].includes(shipPaymentType))
                    message =
                        'For international shipments, Ship Payment Type must be DDP (Delivered Duty Paid), or Third Party. Please update the Ship Payment Type.';
            }
        }
        return message;
    }
    exports.isShippingValid = isShippingValid;
    function getSearchTypeFromItemType(itemType) {
        switch (itemType) {
            case 'Service':
                return search.Type.SERVICE_ITEM;
            case 'InvtPart':
                return search.Type.INVENTORY_ITEM;
            case 'NonInvtPart':
                return search.Type.NON_INVENTORY_ITEM;
            case 'Assembly':
                return search.Type.ASSEMBLY_ITEM;
            case 'Kit':
                return search.Type.KIT_ITEM;
            default:
                break;
        }
    }
    exports.getSearchTypeFromItemType = getSearchTypeFromItemType;
    function setDefaultReceivingLocation(currentForm) {
        currentRecord.get.promise().then(function (rec) {
            const _globalConfig = (0, hfGlobalConfig_1._getConfig)();
            const subsidiary = rec.getValue({ fieldId: 'subsidiary' });
            const currentLocation = rec.getValue({ fieldId: 'location' });
            if (subsidiary.length > 0 && currentLocation == '' && !_globalConfig.outsourcedPOForms.includes(currentForm))
                rec.setValue('location', _globalConfig.defaultReceivingLocation);
        });
    }
    exports.setDefaultReceivingLocation = setDefaultReceivingLocation;
});
