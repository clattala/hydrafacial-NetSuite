/**
 * updateLoyaltyTierPriceLevelMR.ts
 * © 2022 shelby.severin@trevera.com
 *
 * @NScriptName HF | Update Loyalty Tier Pricing
 * @NScriptType MapReduceScript
 * @NApiVersion 2.1
 */
define(["N/log", "N/record", "N/search"], function (log, record, search) {
    var exports = {};
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.summarize = exports.reduce = exports.getInputData = void 0;
    exports.getInputData = function () {
        var searchResults = mapResults('customsearch_trv_loyalty_customers'); //[SCRIPT] Loyalty Customers
        return searchResults;
    };
    /*const priceLevels = {
     'Black Diamond': 28,
     'Silver Circle': 26,
     'White Star'   : 27,
     }*/
    var priceLevelsHybrid = {
        'Black Diamond': 31,
        'White Star': 30,
        'Silver Circle': 29,
    };
    var priceLevelsName = {
        31: 'Black Diamond',
        30: 'White Star',
        29: 'Silver Circle'
    };
    exports.reduce = function (context) {
        var valueObjs = context.values;
        //log.debug('valueObjs', valueObjs)
        valueObjs.forEach(function (val) {
            var mapObj = JSON.parse(val);
            if (mapObj.pricelevelNameLookup != mapObj.loyaltyTier) {
                if (Number(priceLevelsHybrid[mapObj.loyaltyTier]) > 0) {
                    log.audit("Customer id: " + mapObj.id + " has loyalty tiers " + mapObj.loyaltyTier, "this doesn't match their pricelevel " + mapObj.pricelevelNameLookup);
                    record.submitFields({
                        type: record.Type.CUSTOMER,
                        id: mapObj.id,
                        values: {
                            pricelevel: priceLevelsHybrid[mapObj.loyaltyTier]
                        },
                        options: {
                            ignoreMandatoryFields: true,
                            enableSourcing: false
                        }
                    });
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
                    pricelevelNameLookup: priceLevelsName[Number(result.getValue('pricelevel'))],
                    loyaltyTier: result.getValue('custentity_annex_cloud_li_current_tier')
                });
            });
        });
        return results;
    }
    return exports;
});
