/// <amd-module name="SuiteCommerce.FeaturedProduct.Item.Collection"/>
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
define("SuiteCommerce.FeaturedProduct.Item.Collection", ["require", "exports", "SuiteCommerce.FeaturedProduct.Item.Model", "SC.FeaturedProduct.Common.Utils", "underscore", "SC.FeaturedProduct.Common.Configuration", "Backbone.CachedCollection"], function (require, exports, Item_Model_1, Common_Utils_1, _, Common_Configuration_1, BackboneCachedCollection) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ItemCollection = /** @class */ (function (_super) {
        __extends(ItemCollection, _super);
        function ItemCollection(elements, options) {
            var _this = _super.call(this, elements, options) || this;
            _this.url = function () {
                return Common_Utils_1.default.addParamsToUrl('/api/items', _this.getSearchApiParams());
            };
            if (options) {
                _this.environment = options.environment;
                _this.ids = options.ids || [];
            }
            return _this;
        }
        ItemCollection.prototype.getSearchApiParams = function () {
            return _({}).extend(this.getSearchApiMasterOptions(), this.getSessionSearchApiParams(), this.getItemsParams());
        };
        ItemCollection.prototype.getSearchApiMasterOptions = function () {
            return Common_Configuration_1.Configuration.get('searchApiMasterOptions.itemDetails') || {};
        };
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
            if (_(window.location.search).parseUrlOptions().nocache === 'T') {
                searchApiParams.nocache = 'T';
            }
            return searchApiParams;
        };
        ItemCollection.prototype.getItemsParams = function () {
            return {
                id: this.ids.join(','),
            };
        };
        ItemCollection.prototype.parse = function (response) {
            var items = _.map(response.items, function (item) { return new Item_Model_1.default(item); });
            return _(items).compact() || null;
        };
        return ItemCollection;
    }(BackboneCachedCollection));
    exports.default = ItemCollection;
});
