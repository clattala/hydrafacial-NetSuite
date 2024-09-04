/// <amd-module name="SuiteCommerce.Columns.Column.View"/>
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
define("SuiteCommerce.Columns.Column.View", ["require", "exports", "Backbone", "sc_columns_column.tpl", "SuiteCommerce.Columns.Instrumentation"], function (require, exports, Backbone_1, columnTemplate, Instrumentation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ColumnView = /** @class */ (function (_super) {
        __extends(ColumnView, _super);
        function ColumnView(options) {
            var _this = _super.call(this, options) || this;
            _this.template = columnTemplate;
            _this.events = {
                'click [data-action="navigate-to-url"]': 'navigateToUrl',
            };
            _this.model = options.model;
            return _this;
        }
        ColumnView.prototype.navigateToUrl = function () {
            var buttonUsageLog = Instrumentation_1.default.getLog('buttonUsageLog' + new Date().getTime());
            buttonUsageLog.setParameter('activity', 'Usage of the button in column');
            buttonUsageLog.submit();
        };
        ColumnView.prototype.getContext = function () {
            return {
                image: this.model.image,
                hasImage: !!this.model.image,
                imageResizeId: this.model.imageResizeId,
                buttonLink: this.model.buttonLink,
                buttonText: this.model.buttonText,
                hasButton: this.model.hasButton,
                hasText: this.model.hasText,
                alt: this.model.imageAlt,
                title: this.model.imageAlt,
                caption: this.model.caption,
                text: this.model.text,
                isCaptionPadding: !!this.model.caption && !!this.model.image,
                isTextPadding: this.model.hasText && (!!this.model.image || !!this.model.caption),
                target: this.model.target,
            };
        };
        return ColumnView;
    }(Backbone_1.View));
    exports.ColumnView = ColumnView;
});
