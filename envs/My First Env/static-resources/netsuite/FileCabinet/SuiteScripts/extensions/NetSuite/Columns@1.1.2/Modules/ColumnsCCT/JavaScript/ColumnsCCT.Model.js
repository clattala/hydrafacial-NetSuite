/// <amd-module name="SuiteCommerce.Columns.ColumnsCCT.Model"/>
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
define("SuiteCommerce.Columns.ColumnsCCT.Model", ["require", "exports", "Backbone", "jQuery", "SuiteCommerce.Columns.Column.Collection", "SuiteCommerce.Columns.Column.Model"], function (require, exports, Backbone_1, jQuery, Column_Collection_1, Column_Model_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CCTFields;
    (function (CCTFields) {
        CCTFields["header"] = "custrecord_cct_ns_cols_header";
        CCTFields["textColor"] = "custrecord_cct_ns_cols_color";
        CCTFields["textAlign"] = "custrecord_cct_ns_cols_textalign";
        CCTFields["fullWidth"] = "custrecord_cct_ns_cols_fullwidth";
        CCTFields["openInNewTab"] = "custrecord_cct_ns_cols_newtab";
        CCTFields["imageResizeId"] = "custrecord_cct_ns_cols_image_resize_id";
        CCTFields["col1Image"] = "custrecord_cct_ns_cols_1_image";
        CCTFields["col1ImageAlt"] = "custrecord_cct_ns_cols_1_alt";
        CCTFields["col1Caption"] = "custrecord_cct_ns_cols_1_caption";
        CCTFields["col1Text"] = "custrecord_cct_ns_cols_1_text";
        CCTFields["col1ButtonText"] = "custrecord_cct_ns_cols_1_buttontext";
        CCTFields["col1ButtonLink"] = "custrecord_cct_ns_cols_1_buttonlink";
        CCTFields["col2Image"] = "custrecord_cct_ns_cols_2_image";
        CCTFields["col2ImageAlt"] = "custrecord_cct_ns_cols_2_alt";
        CCTFields["col2Caption"] = "custrecord_cct_ns_cols_2_caption";
        CCTFields["col2Text"] = "custrecord_cct_ns_cols_2_text";
        CCTFields["col2ButtonText"] = "custrecord_cct_ns_cols_2_buttontext";
        CCTFields["col2ButtonLink"] = "custrecord_cct_ns_cols_2_buttonlink";
        CCTFields["col3Image"] = "custrecord_cct_ns_cols_3_image";
        CCTFields["col3ImageAlt"] = "custrecord_cct_ns_cols_3_alt";
        CCTFields["col3Caption"] = "custrecord_cct_ns_cols_3_caption";
        CCTFields["col3Text"] = "custrecord_cct_ns_cols_3_text";
        CCTFields["col3ButtonText"] = "custrecord_cct_ns_cols_3_buttontext";
        CCTFields["col3ButtonLink"] = "custrecord_cct_ns_cols_3_buttonlink";
    })(CCTFields = exports.CCTFields || (exports.CCTFields = {}));
    var CCTModel = /** @class */ (function (_super) {
        __extends(CCTModel, _super);
        function CCTModel() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(CCTModel.prototype, "header", {
            get: function () {
                return this.getSetting(CCTFields.header);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CCTModel.prototype, "textColor", {
            get: function () {
                return this.getSetting(CCTFields.textColor);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CCTModel.prototype, "textAlign", {
            get: function () {
                return this.getSetting(CCTFields.textAlign);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CCTModel.prototype, "fullWidth", {
            get: function () {
                return this.getSetting(CCTFields.fullWidth);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CCTModel.prototype, "isExtraPadding", {
            get: function () {
                return this.fullWidth !== 'T';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CCTModel.prototype, "openInNewTab", {
            get: function () {
                return this.getSetting(CCTFields.openInNewTab);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CCTModel.prototype, "columns", {
            get: function () {
                if (!this.get('columns')) {
                    this.columns = new Column_Collection_1.ColumnCollection();
                }
                return this.get('columns');
            },
            set: function (columns) {
                this.set('columns', columns);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CCTModel.prototype, "hasContent", {
            get: function () {
                return !this.header && this.columns.size() === 0;
            },
            enumerable: true,
            configurable: true
        });
        CCTModel.prototype.addProperties = function (properties) {
            this.set(properties);
            this.updateColumnsContent();
        };
        CCTModel.prototype.updateColumnsContent = function () {
            var columns = [this.column1, this.column2, this.column3];
            columns = columns.filter(function (column) {
                return column.hasContent;
            });
            this.columns.reset(columns);
        };
        Object.defineProperty(CCTModel.prototype, "column1", {
            get: function () {
                return new Column_Model_1.ColumnModel({
                    buttonLink: this.getSetting(CCTFields.col1ButtonLink),
                    buttonText: this.getSetting(CCTFields.col1ButtonText),
                    caption: this.getSetting(CCTFields.col1Caption),
                    image: this.getImageUrl(CCTFields.col1Image),
                    imageAlt: this.getSetting(CCTFields.col1ImageAlt),
                    imageResizeId: this.getSetting(CCTFields.imageResizeId),
                    text: this.getSetting(CCTFields.col1Text),
                    openInNewTab: this.openInNewTab,
                });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CCTModel.prototype, "column2", {
            get: function () {
                return new Column_Model_1.ColumnModel({
                    buttonLink: this.getSetting(CCTFields.col2ButtonLink),
                    buttonText: this.getSetting(CCTFields.col2ButtonText),
                    caption: this.getSetting(CCTFields.col2Caption),
                    image: this.getImageUrl(CCTFields.col2Image),
                    imageAlt: this.getSetting(CCTFields.col2ImageAlt),
                    imageResizeId: this.getSetting(CCTFields.imageResizeId),
                    text: this.getSetting(CCTFields.col2Text),
                    openInNewTab: this.openInNewTab,
                });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CCTModel.prototype, "column3", {
            get: function () {
                return new Column_Model_1.ColumnModel({
                    buttonLink: this.getSetting(CCTFields.col3ButtonLink),
                    buttonText: this.getSetting(CCTFields.col3ButtonText),
                    caption: this.getSetting(CCTFields.col3Caption),
                    image: this.getImageUrl(CCTFields.col3Image),
                    imageAlt: this.getSetting(CCTFields.col3ImageAlt),
                    imageResizeId: this.getSetting(CCTFields.imageResizeId),
                    text: this.getSetting(CCTFields.col3Text),
                    openInNewTab: this.openInNewTab,
                });
            },
            enumerable: true,
            configurable: true
        });
        CCTModel.prototype.getImageUrl = function (field) {
            var imageId = this.getSetting(field);
            return imageId &&
                this.get(field + "_url") &&
                this.get(field + "_url").indexOf(imageId) !== -1
                ? this.get(field + "_url")
                : '';
        };
        CCTModel.prototype.getSetting = function (field) {
            return jQuery.trim(this.get(field));
        };
        return CCTModel;
    }(Backbone_1.Model));
    exports.CCTModel = CCTModel;
});
