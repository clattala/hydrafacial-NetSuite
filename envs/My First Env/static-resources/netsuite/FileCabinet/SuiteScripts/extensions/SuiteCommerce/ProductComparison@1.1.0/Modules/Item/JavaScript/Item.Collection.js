/// <amd-module name="SuiteCommerce.ProductComparison.Item.Collection"/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define("SuiteCommerce.ProductComparison.Item.Collection", ["require", "exports", "SuiteCommerce.ProductComparison.RecordSearcher.Collection", "SuiteCommerce.ProductComparison.Item.Model", "SuiteCommerce.ProductComparison.Common.Configuration", "underscore", "SuiteCommerce.ProductComparison.Common.Utils"], function (require, exports, RecordSearcher_Collection_1, Item_Model_1, Configuration_1, _, Utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ItemCollection = /** @class */ (function (_super) {
        __extends(ItemCollection, _super);
        function ItemCollection(options) {
            var _this = _super.call(this) || this;
            if (options) {
                _this.environment = options.environment;
                _this.ids = options.ids || [];
            }
            return _this;
        }
        Object.defineProperty(ItemCollection.prototype, "url", {
            get: function () {
                return Utils_1.Utils.addParamsToUrl('/api/items', this.getSearchApiParams());
            },
            enumerable: true,
            configurable: true
        });
        ItemCollection.prototype.getModel = function () {
            return Item_Model_1.ItemModel;
        };
        ItemCollection.prototype.getSearchApiParams = function () {
            var searchApiParams = _({}).extend(this.getSearchApiMasterOptions(), this.getSessionSearchApiParams());
            if (this.ids.length > 0) {
                searchApiParams = this.isPCVEnabled() ?
                    _(searchApiParams).extend(this.getItemsParams(), this.getPCVParam()) :
                    _(searchApiParams).extend(this.getItemsParams());
            }
            return searchApiParams;
        };
        ItemCollection.prototype.getSearchApiMasterOptions = function () {
            return Configuration_1.Configuration.get('searchApiMasterOptions.itemDetails', {});
        };
        // eslint-disable-next-line complexity
        ItemCollection.prototype.getSessionSearchApiParams = function () {
            var searchApiParams = {};
            var sessionInfo = this.environment.getSession();
            var locale = (sessionInfo.language && sessionInfo.language.locale) || '';
            var language = '';
            var country = '';
            var currency = (sessionInfo.currency && sessionInfo.currency.code) || '';
            var priceLevel = sessionInfo.priceLevel || '';
            var localeTokens;
            if (locale.indexOf('_') >= 0) {
                localeTokens = locale.split('_');
                language = localeTokens[0];
                country = localeTokens[1];
            }
            else {
                language = locale;
            }
            // SET API PARAMS
            if (language) {
                searchApiParams.language = language;
            }
            if (country) {
                searchApiParams.country = country;
            }
            if (currency) {
                searchApiParams.currency = currency;
            }
            searchApiParams.pricelevel = priceLevel;
            // No cache
            if (Utils_1.Utils.parseUrlOptions(window.location.search).nocache === 'T') {
                searchApiParams.nocache = 'T';
            }
            return searchApiParams;
        };
        ItemCollection.prototype.isPCVEnabled = function () {
            return Configuration_1.Configuration.get('siteSettings.isPersonalizedCatalogViewsEnabled');
        };
        ItemCollection.prototype.getPCVParam = function () {
            return {
                use_pcv: 'T'
            };
        };
        ItemCollection.prototype.getItemsParams = function () {
            return {
                id: this.ids.join(','),
            };
        };
        ItemCollection.prototype.parse = function (response) {
            return _(response.items).compact() || null;
        };
        return ItemCollection;
    }(RecordSearcher_Collection_1.RecordSearcherCollection));
    exports.ItemCollection = ItemCollection;
});
