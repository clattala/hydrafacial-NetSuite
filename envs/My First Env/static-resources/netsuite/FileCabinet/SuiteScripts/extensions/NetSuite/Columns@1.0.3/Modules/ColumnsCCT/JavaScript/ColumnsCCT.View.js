/// <amd-module name="SuiteCommerce.Columns.ColumnsCCT.View"/>
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
define("SuiteCommerce.Columns.ColumnsCCT.View", ["require", "exports", "Backbone.CollectionView", "CustomContentType.Base.View", "SuiteCommerce.Columns.ColumnsCCT.Model", "sc_columns_cct.tpl", "SuiteCommerce.Columns.ColumnsCCT.Configuration", "SuiteCommerce.Columns.Column.View", "SuiteCommerce.Columns.Instrumentation"], function (require, exports, BackboneCollectionView, CustomContentTypeBaseView, ColumnsCCT_Model_1, columnsCCTTemplate, ColumsCCT_Configuration_1, Column_View_1, Instrumentation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CCTView = /** @class */ (function (_super) {
        __extends(CCTView, _super);
        function CCTView(options) {
            var _this = _super.call(this, options) || this;
            _this.template = columnsCCTTemplate;
            _this.container = options.container;
            _this.model = new ColumnsCCT_Model_1.CCTModel();
            _this.columnsView = new BackboneCollectionView({
                childView: Column_View_1.ColumnView,
                collection: _this.model.columns,
            });
            _this.setupListeners();
            return _this;
        }
        CCTView.prototype.setupListeners = function () {
            var _this = this;
            this.model.columns.on('reset', function () { return _this.columnsView.render(); });
        };
        CCTView.prototype.install = function (settings, contextData) {
            _super.prototype.install.call(this, settings, contextData);
            this.parseSettings(settings);
            if (this.model.columns.size() > 0) {
                this.logQuantityOfColumns();
            }
            return jQuery.Deferred().resolve();
        };
        CCTView.prototype.logQuantityOfColumns = function () {
            var quantityOfColumnsLog = Instrumentation_1.default.getLog('quantityOfColumnsLog');
            quantityOfColumnsLog.setParameters({
                activity: 'Quantity of Columns used',
                instanceCount: this.model.columns.size(),
            });
            quantityOfColumnsLog.submit();
        };
        CCTView.prototype.update = function (settings) {
            _super.prototype.update.call(this, settings);
            this.parseSettings(settings);
            return jQuery.Deferred().resolve();
        };
        CCTView.prototype.parseSettings = function (settings) {
            this.model.addProperties(settings);
        };
        CCTView.prototype.validateContextDataRequest = function () {
            return true;
        };
        Object.defineProperty(CCTView.prototype, "childViews", {
            get: function () {
                var _this = this;
                return {
                    'NetSuite.ColumnsCCT.Column.View': function () {
                        return _this.columnsView;
                    },
                };
            },
            enumerable: true,
            configurable: true
        });
        CCTView.prototype.getContext = function () {
            return {
                header: this.model.header,
                isEmpty: this.model.hasContent,
                textColorClass: ColumsCCT_Configuration_1.CCTConfiguration.getTextColorClass(this.model.textColor),
                textAlignClass: ColumsCCT_Configuration_1.CCTConfiguration.getTextAlignClass(this.model.textAlign),
                isExtraPadding: this.model.isExtraPadding,
                gridClass: "grid-" + this.model.columns.size(),
                gridPhoneClass: "grid-xs-" + this.model.columns.size(),
            };
        };
        return CCTView;
    }(CustomContentTypeBaseView));
    exports.CCTView = CCTView;
});
