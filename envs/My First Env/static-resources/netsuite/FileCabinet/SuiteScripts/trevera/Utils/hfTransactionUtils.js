/**
 * hfTransactionUtils.ts
 * by * shelby.severin@trevera.com
 *
 * @NScriptName HF | Transaction Utils
 * @NApiVersion 2.1
 */
define(["require", "exports", "N/error", "N/log", "N/record", "N/runtime", "N/search", "./hfGlobalConfig"], function (require, exports, error, log, record, runtime, search, hfGlobalConfig_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ITEMTYPE = exports.setWebDefaults = exports.setStrikethroughPriceOnLines = exports.getPriceToUse = exports.getPromotionsFromItemsOnOrder = exports.getPurchasePromotionsCount = exports.updatePromotionItems = exports.hadRedeemedPromotion = exports.addCOTaxItem = exports.setLocationOnLines = exports.isCreatedFromSO = exports.getDefaultLocationForSubsidiary = exports.setDefaultLocationFromSubsidiary = void 0;
    const pricelevels = {
        'BlackDiamond': 28,
        'WhiteStar': 27,
        'SilverCircle': 26,
    };
    const ERRORS = {
        'ERR_ALREADY_PURCHASED': {
            "name": "ERR_ALREADY_PURCHASED",
            "message": `You have already ordered the max quantity allowed for this item.`,
            "notifyOff": true
        },
        'ERR_MAX_QUANTITY_HIT': {
            "name": "ERR_MAX_QUANTITY_HIT",
            "message": `You have already ordered the max quantity allowed for this item.`,
            "notifyOff": true
        }
    };
    function setDefaultLocationFromSubsidiary(rec) {
        const subsidiary = rec.getValue({ fieldId: 'subsidiary' });
        const currentLocation = rec.getValue({ fieldId: 'location' });
        if (subsidiary && !currentLocation) {
            const location = getDefaultLocationForSubsidiary(subsidiary);
            if (location)
                rec.setValue({ fieldId: 'location', value: location });
        }
    }
    exports.setDefaultLocationFromSubsidiary = setDefaultLocationFromSubsidiary;
    function getDefaultLocationForSubsidiary(subsidiary) {
        const locationSearch = search.create({
            type: search.Type.LOCATION,
            filters: [
                search.createFilter({ name: 'subsidiary', operator: search.Operator.ANYOF, values: subsidiary }),
                search.createFilter({ name: 'custrecord_is_default_location', operator: search.Operator.IS, values: true })
            ]
        });
        const result = locationSearch.run().getRange({ start: 0, end: 1 });
        if (result && result.length == 1) {
            return result[0].id;
        }
        else {
            log.debug('getDefaultLocationForSubsidiary', 'cant set location because there is no default for the subsidiary');
            return '';
        }
    }
    exports.getDefaultLocationForSubsidiary = getDefaultLocationForSubsidiary;
    function isCreatedFromSO(createdFrom) {
        if (Number(createdFrom) > 0) {
            const fieldLookup = search.lookupFields({ type: search.Type.TRANSACTION, id: createdFrom, columns: ['type'] });
            const createdFromType = fieldLookup['type'];
            if (createdFromType && createdFromType.length > 0 && createdFromType[0].value == 'SalesOrd') {
                return true;
            }
        }
        return false;
    }
    exports.isCreatedFromSO = isCreatedFromSO;
    function setLocationOnLines(rec) {
        const subsidiary = rec.getValue('subsidiary');
        let location = rec.getValue({ fieldId: 'location' });
        if (!location && subsidiary)
            location = getDefaultLocationForSubsidiary(subsidiary);
        const numberLines = rec.getLineCount({ sublistId: 'item' });
        for (let line = 0; line < numberLines; line++) {
            const itemType = rec.getSublistValue({ sublistId: 'item', fieldId: 'itemtype', line: line });
            if (itemType != 'EndGroup') {
                rec.setSublistValue({ sublistId: 'item', fieldId: 'location', value: location, line });
                rec.setSublistValue({ sublistId: 'item', fieldId: 'inventorylocation', value: location, line });
            }
        }
    }
    exports.setLocationOnLines = setLocationOnLines;
    function addCOTaxItem(rec) {
        const _globalConfig = (0, hfGlobalConfig_1._getConfig)();
        const subtotal = rec.getValue('subtotal');
        const addressSubRecord = rec.getSubrecord({ fieldId: 'shippingaddress' });
        const state = addressSubRecord.getValue('state').toLowerCase();
        log.debug(`checking state of shipping address`, state);
        const taxItemOnOrder = rec.findSublistLineWithValue({ sublistId: 'item', fieldId: 'item', value: _globalConfig.coloradoTaxItem });
        if (state == 'co' && subtotal > 0) { // colorado
            if (_globalConfig.coloradoTaxItemOn && _globalConfig.coloradoTaxItem) {
                if (taxItemOnOrder < 0) {
                    const line = rec.getLineCount({ sublistId: 'item' });
                    rec.insertLine({ sublistId: 'item', line });
                    rec.setSublistValue({ sublistId: 'item', fieldId: 'item', value: _globalConfig.coloradoTaxItem, line });
                }
            }
        }
        else if (taxItemOnOrder > -1 && runtime.executionContext != runtime.ContextType.USER_INTERFACE) { // Per Mark: don't remove line in User Interface, customer care wants to do it.
            rec.removeLine({ sublistId: 'item', line: taxItemOnOrder });
        }
    }
    exports.addCOTaxItem = addCOTaxItem;
    function hadRedeemedPromotion(entityId, entityField) {
        const lookup = search.lookupFields({ type: search.Type.CUSTOMER, id: entityId, columns: [entityField] });
        return lookup[entityField];
    }
    exports.hadRedeemedPromotion = hadRedeemedPromotion;
    function updatePromotionItems(rec) {
        const customerId = Number(rec.getValue({ fieldId: 'entity' }));
        const customer = record.load({ type: record.Type.CUSTOMER, id: rec.getValue({ fieldId: 'entity' }) });
        const pricelevel = Number(customer.getValue({ fieldId: 'pricelevel' }));
        const currency = Number(customer.getValue({ fieldId: 'currency' }));
        const items = [];
        for (let line = 0; line < rec.getLineCount({ sublistId: 'item' }); line++) {
            const item = rec.getSublistValue({ sublistId: 'item', fieldId: 'item', line });
            if (!items.includes(item))
                items.push(item);
        }
        const promotionMapResult = getPromotionsFromItemsOnOrder(items, currency);
        // loop the lines on the order to build the map out with num promotions on the order and if it has been redeemed
        for (let line = 0; line < rec.getLineCount({ sublistId: 'item' }); line++) {
            const item = rec.getSublistValue({ sublistId: 'item', fieldId: 'item', line });
            const promotionMap = promotionMapResult[item];
            if (promotionMap) {
                const entityField = promotionMap.entityField;
                if (entityField.length > 0 && promotionMap.limit > 0)
                    promotionMap.hasRedeemed = hadRedeemedPromotion(customerId, entityField); // has redeemed is being treated as a hard limit so if its
                // checked, they can't have it...
                promotionMap.numberOnOrder += Number(rec.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line }));
            }
        }
        log.debug('promotion map after check', promotionMapResult);
        // loop the lines again and check the map now that there is a calculation to bubble any errors
        for (let line = 0; line < rec.getLineCount({ sublistId: 'item' }); line++) {
            const item = rec.getSublistValue({ sublistId: 'item', fieldId: 'item', line });
            const promotionMap = promotionMapResult[item];
            if (promotionMap) {
                if (promotionMap.hasRedeemed && promotionMap.numberOnOrder > 0)
                    throw error.create(ERRORS.ERR_ALREADY_PURCHASED);
                if (promotionMap.numberOnOrder > promotionMap.limit && promotionMap.limit > 0)
                    throw error.create(ERRORS.ERR_MAX_QUANTITY_HIT);
                // if there is a limit and an entity field, populate the entity field
                if (promotionMap.entityField.length > 0 && promotionMap.numberOnOrder == promotionMap.limit) {
                    const values = {};
                    values[promotionMap.entityField] = true;
                    record.submitFields({ type: record.Type.CUSTOMER, id: rec.getValue({ fieldId: 'entity' }), values });
                }
            }
        }
        const entityId = Number(rec.getValue({ fieldId: 'entity' }));
        // now for each promotion confirm if they have hit the max?
        // TODO: handle when items are maxed across multiple promotions...
        for (let line = 0; line < rec.getLineCount({ sublistId: 'item' }); line++) {
            const item = rec.getSublistValue({ sublistId: 'item', fieldId: 'item', line });
            const location = rec.getSublistValue({ sublistId: 'item', fieldId: 'location', line });
            const priceToUse = getPriceToUse(pricelevel);
            const promotionMap = promotionMapResult[item];
            if (!!promotionMap) {
                log.debug(`price to use ${priceToUse}`, pricelevel);
                log.debug(`promotionMap`, promotionMap);
                const qty = Number(rec.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line }));
                if (promotionMap.entityField.length > 0 && promotionMap.limit > 0 && promotionMap.savedSearch.length > 0) {
                    const promotionsRedeemed = getPurchasePromotionsCount(entityId, promotionMap.savedSearch);
                    if (promotionsRedeemed >= promotionMap.limit)
                        throw error.create(ERRORS.ERR_ALREADY_PURCHASED);
                    if ((promotionsRedeemed + qty) > 2)
                        throw error.create(ERRORS.ERR_MAX_QUANTITY_HIT);
                }
                if (promotionMap.pricingToChildren) {
                    rec.setSublistValue({ sublistId: 'item', fieldId: 'pricelevel', value: '-1', line });
                    rec.setSublistValue({ sublistId: 'item', fieldId: 'rate', value: 0, line });
                }
                const newItems = promotionMapResult[item].items;
                newItems.forEach((promoItem, idx) => {
                    const newLine = idx + Number(line) + 1;
                    log.debug(`setting ${newLine} with new item at qty ${qty}`, `item ${promoItem.itemId}, qty: ${promoItem.quantity * qty}`);
                    rec.insertLine({ sublistId: 'item', line: newLine });
                    rec.setSublistValue({ sublistId: 'item', fieldId: 'item', value: promoItem.itemId, line: newLine, fireSlavingSync: true });
                    rec.setSublistValue({ sublistId: 'item', fieldId: 'location', value: location, line: newLine });
                    rec.setSublistValue({ sublistId: 'item', fieldId: 'quantity', value: promoItem.quantity * qty, line: newLine });
                    rec.setSublistValue({ sublistId: 'item', fieldId: 'pricelevel', value: '-1', line });
                    if (promotionMap.pricingToChildren)
                        rec.setSublistValue({ sublistId: 'item', fieldId: 'rate', value: promoItem[priceToUse], line: newLine }); // should be 0 cost.
                    else
                        rec.setSublistValue({ sublistId: 'item', fieldId: 'rate', value: 0, line: newLine }); // should be 0 cost.
                    //log.debug('checking amount', rec.getSublistValue({ sublistId: 'item', fieldId: 'rate', line: newLine }));
                    //rec.commitLine({ sublistId: 'item' });
                });
            }
        }
    }
    exports.updatePromotionItems = updatePromotionItems;
    function getPurchasePromotionsCount(customerId, searchId) {
        const searchObj = search.load({ id: searchId });
        searchObj.filterExpression = searchObj.filterExpression.concat(['AND', ['entity', 'is', customerId]]);
        const result = searchObj.run().getRange({ start: 0, end: 1 });
        if (result && result.length > 0) {
            return Number(result[0].getValue({ name: 'quantity', summary: search.Summary.SUM })) ?? 0;
        }
        return 0;
    }
    exports.getPurchasePromotionsCount = getPurchasePromotionsCount;
    function getPromotionsFromItemsOnOrder(items, currency) {
        log.debug(`checking for promotions on order`, `items ${items} and currency ${currency}`);
        const promotionSearch = search.load({ id: 'customsearch_hf_promo_item_swap' }); //[SCRIPT] Search For Promo Items
        const filters = ['AND', ['custrecord_hf_promo_item_map_trigger', 'anyof', items], 'AND', ['custrecord_hf_promo_item_map_parent.custrecord_hf_promo_item_map_currency', 'anyof', [currency]]];
        promotionSearch.filterExpression = promotionSearch.filterExpression.concat(filters);
        const promotionMapResult = {};
        promotionSearch.run().each(result => {
            const itemKey = result.getValue('custrecord_hf_promo_item_map_trigger');
            if (!promotionMapResult[itemKey])
                promotionMapResult[itemKey] =
                    { pricingToChildren: false, items: [], limit: 0, hasRedeemed: false, numRedeemed: 0, numberOnOrder: 0, entityField: '', savedSearch: '' };
            promotionMapResult[itemKey].pricingToChildren = result.getValue('custrecord_hf_promo_item_map_price_child');
            promotionMapResult[itemKey].limit = Number(result.getValue('custrecord_hf_promo_item_map_limit'));
            promotionMapResult[itemKey].entityField = result.getValue('custrecord_hf_promo_item_map_entityfield');
            promotionMapResult[itemKey].savedSearch = result.getValue('custrecord_hf_promo_item_map_search');
            log.debug('found item for swap', result.getValue({ join: 'custrecord_hf_promo_item_map_parent', name: 'custrecord_hf_promo_item_map_swap' }));
            const itemToSwap = {
                itemId: result.getValue({ join: 'custrecord_hf_promo_item_map_parent', name: 'custrecord_hf_promo_item_map_swap' }),
                quantity: Number(result.getValue({ join: 'custrecord_hf_promo_item_map_parent', name: 'custrecord_hf_promo_item_map_qty' })),
                price: Number(result.getValue({ join: 'custrecord_hf_promo_item_map_parent', name: 'custrecord_hf_promo_item_map_price' })),
                priceBlackDiamond: Number(result.getValue({ join: 'custrecord_hf_promo_item_map_parent', name: 'custrecord_hf_promo_item_map_bd' })),
                priceWhiteStar: Number(result.getValue({ join: 'custrecord_hf_promo_item_map_parent', name: 'custrecord_hf_promo_item_map_ws' })),
                priceSilverCircle: Number(result.getValue({ join: 'custrecord_hf_promo_item_map_parent', name: 'custrecord_hf_promo_item_map_sc' }))
            };
            log.debug('found item for swap', itemToSwap);
            promotionMapResult[itemKey].items.push(itemToSwap);
            return true;
        });
        log.debug(`found promotions matching for items ${items} and currency ${currency}`, promotionMapResult);
        return promotionMapResult;
    }
    exports.getPromotionsFromItemsOnOrder = getPromotionsFromItemsOnOrder;
    function getPriceToUse(priceLevel) {
        if (priceLevel == pricelevels.BlackDiamond) {
            return 'priceBlackDiamond';
        }
        if (priceLevel == pricelevels.WhiteStar) {
            return 'priceWhiteStar';
        }
        if (priceLevel == pricelevels.SilverCircle) {
            return 'priceSilverCircle';
        }
        return 'price';
    }
    exports.getPriceToUse = getPriceToUse;
    //TODO: this needs to be updated.
    function setStrikethroughPriceOnLines(rec) {
        /*const priceLevelsHybrid = {
         'Black Diamond': 31,
         'Sliver Circle': 30,
         'White Star'   : 29,
         }*/
        const priceLevelStrikeThroughs = {
            '31': '28',
            '30': '27',
            '29': '26' //Sliver Circle
        };
        const customer = record.load({ type: record.Type.CUSTOMER, id: rec.getValue({ fieldId: 'entity' }) });
        const customerPriceLevel = customer.getValue({ fieldId: 'pricelevel' });
        const priceLevelForStrikethrough = priceLevelStrikeThroughs[customerPriceLevel];
        log.debug(`customerPriceLevel ${customerPriceLevel}`, `priceLevelForStrikethrough ${priceLevelForStrikethrough}`);
        const numberLines = rec.getLineCount({ sublistId: 'item' });
        for (let line = 0; line < numberLines; line++) {
            const itemType = rec.getSublistValue({ sublistId: 'item', fieldId: 'itemtype', line });
            if (itemType != 'EndGroup') {
                const itemRecord = record.load({ type: exports.ITEMTYPE[itemType], id: rec.getSublistValue({ sublistId: 'item', fieldId: 'item', line }) });
                const usPrices = itemRecord.getLineCount({ sublistId: 'price1' });
                let priceForStrikethrough = '';
                //log.debug('usPrices', usPrices);
                for (let idx = 0; idx < usPrices; idx++) {
                    const pricelevel = itemRecord.getSublistValue({ sublistId: 'price1', fieldId: 'pricelevel', line: idx });
                    if (pricelevel == priceLevelForStrikethrough) {
                        priceForStrikethrough = itemRecord.getSublistValue({ sublistId: 'price1', fieldId: 'price_1_', line: idx });
                    }
                }
                rec.setSublistValue({ sublistId: 'item', fieldId: 'custcol_trv_strikethrough_price', value: priceForStrikethrough, line });
            }
        }
    }
    exports.setStrikethroughPriceOnLines = setStrikethroughPriceOnLines;
    function setWebDefaults(rec) {
        log.debug('running in webstore context on create', 'set defaults');
        rec.setValue({ fieldId: 'custbody_hf_order_type', value: '1' });
        rec.setValue({ fieldId: 'custbody_hf_ordersource', value: '1' });
        rec.setValue({ fieldId: 'custbody_hf_sales_area', value: '1' });
    }
    exports.setWebDefaults = setWebDefaults;
    exports.ITEMTYPE = {
        'Assembly': 'assemblyitem',
        'LotNumberedInventoryItem': 'lotnumberedinventoryitem',
        'Description': 'descriptionitem',
        'Discount': 'discountitem',
        'GiftCert': 'giftcertificateitem',
        'InvtPart': 'inventoryitem',
        'Group': 'itemgroup',
        'Kit': 'kititem',
        'Markup': 'markupitem',
        'NonInvtPart': 'noninventoryitem',
        'OthCharge': 'otherchargeitem',
        'Payment': 'paymentitem',
        'Service': 'serviceitem',
        'Subtotal': 'subtotalitem'
    };
});
