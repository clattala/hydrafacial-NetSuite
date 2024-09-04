/// <amd-module name="SuiteCommerce.ProductComparison.RecordSearcher.Collection"/>
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
define("SuiteCommerce.ProductComparison.RecordSearcher.Collection", ["require", "exports", "SuiteCommerce.ProductComparison.RecordSearcher.EventsCatalog", "SuiteCommerce.ProductComparison.Common.DependencyProvider"], function (require, exports, RecordSearcher_EventsCatalog_1, DependencyProvider_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var RecordSearcherCollection = /** @class */ (function (_super) {
        __extends(RecordSearcherCollection, _super);
        function RecordSearcherCollection() {
            var _this = _super.call(this) || this;
            _this.model = _this.getModel();
            _this.registerRecordSearcherEvents();
            return _this;
        }
        RecordSearcherCollection.prototype.registerRecordSearcherEvents = function () {
            var _this = this;
            this.on(RecordSearcher_EventsCatalog_1.EventsCatalog.EXECUTE_SEARCH, function (queryParam) {
                _this.searchForRecord(queryParam);
            });
        };
        RecordSearcherCollection.prototype.searchForRecord = function (queryParam) {
            var _this = this;
            var fetchPromise = this.fetch({
                data: queryParam,
                killerId: DependencyProvider_1.AjaxRequestsKiller.getKillerId(),
            });
            fetchPromise.done(function () {
                _this.trigger(RecordSearcher_EventsCatalog_1.EventsCatalog.OPEN_SUGGESTIONS);
            });
        };
        return RecordSearcherCollection;
    }(DependencyProvider_1.BackboneCachedCollection));
    exports.RecordSearcherCollection = RecordSearcherCollection;
});
