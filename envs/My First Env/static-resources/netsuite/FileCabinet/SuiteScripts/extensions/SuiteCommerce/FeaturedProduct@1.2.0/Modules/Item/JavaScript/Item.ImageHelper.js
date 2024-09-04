/// <amd-module name="SuiteCommerce.FeaturedProduct.Item.ImageHelper"/>
define("SuiteCommerce.FeaturedProduct.Item.ImageHelper", ["require", "exports", "underscore", "SC.FeaturedProduct.Common.Utils", "SC.FeaturedProduct.Common.Configuration"], function (require, exports, _, Common_Utils_1, Common_Configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        getThumbnailExisting: function (itemModel, itemImagesDetailArg) {
            var itemImagesDetail = itemImagesDetailArg;
            itemImagesDetail = this.filterImagesBySelectedOption(itemModel, itemImagesDetail.thumbnail);
            if (_.isArray(itemImagesDetail.thumbnail.urls) &&
                itemImagesDetail.thumbnail.urls.length) {
                return itemImagesDetail.thumbnail.urls[0];
            }
            return itemImagesDetail.thumbnail;
        },
        getThumbnailFromAll: function (itemModel, itemImagesDetailArg) {
            var flattenedImages;
            var itemImagesDetail = itemImagesDetailArg;
            itemImagesDetail = itemImagesDetail.media || itemImagesDetail;
            itemImagesDetail = this.filterImagesBySelectedOption(itemModel, itemImagesDetail);
            flattenedImages = Common_Utils_1.default.imageFlatten(itemImagesDetail);
            if (flattenedImages.length) {
                return flattenedImages[0];
            }
            return null;
        },
        filterImagesBySelectedOption: function (itemModel, itemImagesDetail) {
            var filterImageOptionIds = Common_Configuration_1.Configuration.get('productline.multiImageOption') || [];
            var itemOptions = itemModel.getItemOptions();
            var filteredImages = itemImagesDetail;
            _(filterImageOptionIds).each(function (itemIoptionId) {
                var itemOptionToFilter = itemOptions.findWhere({
                    cartOptionId: itemIoptionId,
                });
                var filterValue;
                var label;
                // if the option/dimension has a value set
                if (itemOptionToFilter) {
                    filterValue = itemOptionToFilter.get('value');
                    if (filterValue.label) {
                        label = filterValue.label.toLowerCase();
                        _(filteredImages).each(function (value, key) {
                            if (key.toLowerCase() === label) {
                                filteredImages = value;
                            }
                        });
                    }
                }
            });
            return filteredImages;
        },
    };
});
