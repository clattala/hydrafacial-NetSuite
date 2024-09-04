/**
 * @NApiVersion 2.0
 * @NModuleScope Public
 *
 * HF_LIB_GeneralHelpers.js
 *
 * Author: mfrancisco
 *
 * Modifications:
 *
 * 1.0      2021-06-03      cfrancisco      Initial version
 *
*/
var DEPENDENCIES = ['N/search', 'N/format'];
define(
    DEPENDENCIES,
    function(_search, _format) {
        var __SETTINGS = {
            DEFAULTS: {
                PAGESIZE: 1000
            }
        }

        return {
            INITIALIZE: function() {
                var _self = {};

                /**
                 * Return true if object is empty
                 *
                 * @param {any} stValue
                 * @returns {boolean}
                 */
                _self.isEmpty = function(stValue) {
                    try {
                        return ((stValue === '' || stValue == null || stValue == undefined) ||
                            (stValue.constructor === Array && stValue.length == 0) ||
                            (stValue.constructor === Object && (function (v) {
                                for (var k in v) return false;
                                return true;
                            })(stValue)));
                    } catch (ex) {
                        return true;
                    }
                }

                /**
                 * Return true if parameter is equivalent to boolean true
                 *
                 * @param {any} stValue
                 * @returns {boolean}
                 */
                _self.equalsTrue = function (stValue) {
                    return ((stValue == 'T' || stValue == 'true' || stValue == true));
                }

                // ------------------------------------------------------------------------------------------------------------------------------------------------ //
                // DATA TYPE MANIPULATION
                // ------------------------------------------------------------------------------------------------------------------------------------------------ //

                _self.forceInt = function(stValue) {
                    var intValue = parseInt(stValue);

                    if (isNaN(intValue) || (stValue == Infinity)) {
                        return 0;
                    }

                    return intValue;
                }


                _self.forceFloat = function(stValue) {
                    var flValue = parseFloat(stValue);

                    if (isNaN(flValue) || (stValue == Infinity)) {
                        return 0.00;
                    }

                    return flValue;
                };

                // ------------------------------------------------------------------------------------------------------------------------------------------------ //
                // MISCELLANEOUS HELPERS
                // ------------------------------------------------------------------------------------------------------------------------------------------------ //
                _self.getErrorMessage = function (exception) {
                    return ((typeof exception == 'object' && 'message' in exception) ? exception.message : exception);
                }

                // ------------------------------------------------------------------------------------------------------------------------------------------------ //
                // SEARCH HELPERS
                // ------------------------------------------------------------------------------------------------------------------------------------------------ //

                /**
                 *
                 *
                 * @param {search.search} savedSearch The Search object
                 * @param {number} pages The number of pages to return
                 * @returns Array
                 */
                _self.returnSearchResults = function (savedSearch, pages) {
                    try {
                        var arrResults = [];
                        var pagedData = savedSearch.runPaged({
                            pageSize: 1000
                        });

                        var pages = (pages != undefined) ? pages : pagedData.pageRanges.length;
                        var nActualPages = (pages > pagedData.pageRanges.length) ? pagedData.pageRanges.length : pages;

                        for (var i = 0; i < nActualPages; i++) {
                            var currPage = pagedData.fetch(i);
                            arrResults = arrResults.concat(currPage.data);
                        }

                        return arrResults;
                    } catch (ex) {
                        log.error('returnSearchResults error', JSON.stringify(ex));
                        return [];
                    }
                }

                /**
                 * @param  {NSearch.search} savedSearch The search object
                 * @param  {object} pageSettings The container for the pagination settings
                 * @param  {object} pageSettings.pageSize The size of a single page - max of 1000
                 * @param  {object} pageSettings.pageIndex The index of the page to start retrieving for
                 * @param  {object} pageSettings.pageCount Total number of pages to get
                 *
                 */
                _self.returnPagedSearchResults = function(savedSearch, pageSettings) {
                    try {
                        var pageSize = (isEmpty(pageSettings.pageSize) ? __SETTINGS.DEFAULTS.PAGESIZE : forceInt(pageSettings.pageSize));

                        var pageIndex = (isEmpty(pageSettings.pageIndex) ? 0 : pageSettings.pageIndex);
                        pageIndex = forceInt(pageIndex);


                        var arrResults = [];
                        var pagedData = savedSearch.runPaged({
                            pageSize: pageSize
                        });


                        var nMaxIndex = pagedData.pageRanges.length - 1;

                        pageIndex = pageIndex > nMaxIndex ? nMaxIndex : pageIndex;
                        pageIndex = (pageIndex < 0) ? 0 : pageIndex;

                        var nPageCount = pagedData.pageRanges.length;
                        var nPageCountSetting = forceInt(pageSettings.pageCount) || 1;

                        if (nPageCountSetting != 0 && nPageCountSetting < nPageCount) {
                            nPageCount = nPageCountSetting;
                        }

                        for (var i = pageIndex, ctr = 0; ctr < nPageCount; ctr++) {
                            var currPage = pagedData.fetch(i + ctr);
                            arrResults = arrResults.concat(currPage.data);
                        }


                        return {
                            index: pageIndex,
                            pageCount: nPageCount,
                            totalPages: pagedData.pageRanges.length,
                            results: arrResults
                        };
                    } catch (ex) {
                        log.error('returnPagedSearchResults', ex);
                        return {
                            index: 0,
                            pageCount: 0,
                            totalPages: 0,
                            results: []
                        };
                    }
                }

                return _self;
            }
        }
    }
)