/// <amd-module name="SuiteCommerce.ProductComparison.Item.ImageHelper"/>
define("SuiteCommerce.ProductComparison.Item.ImageHelper", ["require", "exports", "underscore", "SuiteCommerce.ProductComparison.Common.Utils"], function (require, exports, _, Utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ThumbnailKey;
    (function (ThumbnailKey) {
        ThumbnailKey["default"] = "default";
        ThumbnailKey["thumbnail"] = "thumbnail";
    })(ThumbnailKey || (ThumbnailKey = {}));
    var ItemImageHelper = /** @class */ (function () {
        function ItemImageHelper() {
        }
        ItemImageHelper.getThumbnailExisting = function (itemModel, itemImagesDetailArg) {
            var key = this.getThumbnailKeyByPreference(itemImagesDetailArg);
            if (_.isArray(itemImagesDetailArg[key].urls)) {
                var imageLines = itemImagesDetailArg[key].urls;
                return imageLines[0];
            }
            return itemImagesDetailArg[key];
        };
        ItemImageHelper.getThumbnailKeyByPreference = function (itemImagesDetail) {
            return itemImagesDetail.thumbnail ? ThumbnailKey.thumbnail : ThumbnailKey.default;
        };
        ItemImageHelper.getThumbnailFromAll = function (itemModel, itemImagesDetailArg) {
            var flattenedImages;
            var itemImagesDetail = itemImagesDetailArg;
            itemImagesDetail = (itemImagesDetail.media || itemImagesDetail);
            flattenedImages = Utils_1.Utils.imageFlatten(itemImagesDetail);
            if (flattenedImages.length) {
                return flattenedImages[0];
            }
            return null;
        };
        return ItemImageHelper;
    }());
    exports.ItemImageHelper = ItemImageHelper;
});
