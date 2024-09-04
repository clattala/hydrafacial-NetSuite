/// <amd-module name="SuiteCommerce.Columns.Column.Model"/>
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
define("SuiteCommerce.Columns.Column.Model", ["require", "exports", "Backbone"], function (require, exports, Backbone_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ColumnModel = /** @class */ (function (_super) {
        __extends(ColumnModel, _super);
        function ColumnModel(option) {
            return _super.call(this, option) || this;
        }
        Object.defineProperty(ColumnModel.prototype, "image", {
            get: function () {
                return this.get('image');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ColumnModel.prototype, "imageAlt", {
            get: function () {
                return this.get('imageAlt');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ColumnModel.prototype, "imageResizeId", {
            get: function () {
                return this.get('imageResizeId') || '';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ColumnModel.prototype, "caption", {
            get: function () {
                return this.get('caption');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ColumnModel.prototype, "text", {
            get: function () {
                return this.get('text');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ColumnModel.prototype, "buttonText", {
            get: function () {
                return this.get('buttonText');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ColumnModel.prototype, "buttonLink", {
            get: function () {
                return this.get('buttonLink');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ColumnModel.prototype, "target", {
            get: function () {
                var option = this.get('openInNewTab');
                return option && option === 'T' ? '_blank' : '_self';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ColumnModel.prototype, "hasText", {
            get: function () {
                var HTMLTagsRegex = /<[^>]+>/gi;
                return this.text ? !!this.text.replace(HTMLTagsRegex, '') : false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ColumnModel.prototype, "hasButton", {
            get: function () {
                return !!this.buttonText;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ColumnModel.prototype, "hasContent", {
            get: function () {
                return !!this.image || this.hasText;
            },
            enumerable: true,
            configurable: true
        });
        return ColumnModel;
    }(Backbone_1.Model));
    exports.ColumnModel = ColumnModel;
});
