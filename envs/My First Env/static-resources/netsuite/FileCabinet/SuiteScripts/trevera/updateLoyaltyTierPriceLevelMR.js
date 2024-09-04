/**
 * updateLoyaltyTierPriceLevelMR.ts
 * © 2022 shelby.severin@trevera.com
 *
 * @NScriptName HF | Update Loyalty Tier Pricing
 * @NScriptType MapReduceScript
 * @NApiVersion 2.1
 */
define(["N/log", "N/record", "N/search", "N"], function (log, record, search, N_1) {
    var exports = {};
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.summarize = exports.reduce = exports.getInputData = void 0;
    exports.getInputData = function () {
        var searchResults = mapResults('customsearch_trv_loyalty_customers'); //[SCRIPT] Loyalty Customers
        return searchResults;
    };
    var priceLevelsSB3 = {
        'Black Diamond': 25,
        'White Star': 27,
        'Silver Circle': 26,
    };
    var priceLevelsNameSB3 = {
        25: 'Black Diamond',
        27: 'White Star',
        26: 'Silver Circle'
    };
    var priceLevelsPROD = {
        'Black Diamond': 28,
        'White Star': 27,
        'Silver Circle': 26,
    };
    var priceLevelsNamePROD = {
        28: 'Black Diamond',
        27: 'White Star',
        26: 'Silver Circle'
    };
    /*const priceLevelsHybrid = {
     'Black Diamond': 31,
     'White Star'   : 30,
     'Silver Circle': 29,
     }*/
    exports.reduce = function (context) {
        var valueObjs = context.values;
        //log.debug('valueObjs', valueObjs)
        valueObjs.forEach(function (val) {
            var mapObj = JSON.parse(val);
            if (mapObj.pricelevelNameLookup != mapObj.loyaltyTier) {
                if (N_1.runtime.envType == N_1.runtime.EnvType.SANDBOX) {
                    if (Number(priceLevelsSB3[mapObj.loyaltyTier]) > 0) {
                        log.audit("Customer id: " + mapObj.id + " has loyalty tiers " + mapObj.loyaltyTier, "this doesn't match their pricelevel " + mapObj.pricelevelNameLookup);
                        record.submitFields({
                            type: record.Type.CUSTOMER,
                            id: mapObj.id,
                            values: {
                                pricelevel: priceLevelsSB3[mapObj.loyaltyTier]
                            },
                            options: {
                                ignoreMandatoryFields: true,
                                enableSourcing: false
                            }
                        });
                    }
                }
                else {
                    if (Number(priceLevelsPROD[mapObj.loyaltyTier]) > 0) {
                        log.audit("Customer id: " + mapObj.id + " has loyalty tiers " + mapObj.loyaltyTier, "this doesn't match their pricelevel " + mapObj.pricelevelNameLookup);
                        record.submitFields({
                            type: record.Type.CUSTOMER,
                            id: mapObj.id,
                            values: {
                                pricelevel: priceLevelsPROD[mapObj.loyaltyTier]
                            },
                            options: {
                                ignoreMandatoryFields: true,
                                enableSourcing: false
                            }
                        });
                    }
                }
            }
        });
        context.write(context.key, JSON.stringify(context.values));
    };
    exports.summarize = function (context) {
        log.debug('script complete', 'customers updated');
    };
    function mapResults(searchID) {
        var searchObj = search.load({ id: searchID });
        var pageData = searchObj.runPaged({ pageSize: 1000 });
        var results = [];
        pageData.pageRanges.forEach(function (pageRange) {
            var page = pageData.fetch({ index: pageRange.index });
            page.data.forEach(function (result) {
                results.push({
                    id: result.id,
                    pricelevel: Number(result.getValue('pricelevel')),
                    pricelevelName: result.getText('pricelevel'),
                    pricelevelNameLookup: N_1.runtime.envType == N_1.runtime.EnvType.SANDBOX ? priceLevelsNameSB3[Number(result.getValue('pricelevel'))] : priceLevelsNamePROD[Number(result.getValue('pricelevel'))],
                    loyaltyTier: result.getValue('custentity_annex_cloud_li_current_tier')
                });
            });
        });
        return results;
    }
    return exports;
});
