define(
  'Promotions.Extension'
  , [
    'Promotions.Extension.View',
    'Promotions.Extension.Model',
    'Promotions.CartLine.View',
    'Promotions.Helpers',
    'underscore'
  ]
  , function (
    ExtensionView,
    PromotionsModel,
    PromotionsCartLineView,
    Helpers,
    _
  ) {
    'use strict';

    return {
      mountToApp: function mountToApp(container) {
        var PAGETYPE      = container.getComponent("PageType");
        var MYACCOUNTMENU = container.getComponent("MyAccountMenu");
        var ENVIRONMENT   = container.getComponent("Environment");
        this.CART         = container.getComponent("Cart");
        this.PROFILE      = container.getComponent("UserProfile");
        this.LAYOUT       = container.getComponent("Layout");
        var config        = {};

        var self               = this;
        this.lines             = []
        this.triggeringLine    = 0;
        this.promotions        = {};
        this.appliedPromotions = {};

        if (this.CART) {
          //if cart exists, check for auto apply promotions
          this.CART.getLines().then(function (lines) {
            if (lines.length > 0) {
              _.each(lines, function (line) {
                //console.log('Trv.Promotions.CartLine.' + line.internalid)
                var cartPromotionView = new PromotionsCartLineView({
                  application      : container,
                  line             : line,
                  appliedPromotions: self.appliedPromotions
                });
                self.CART.registerView('Trv.Promotions.CartLine.' + line.internalid, function () {
                  return cartPromotionView;
                });
                cartPromotionView.setElement(jQuery('Trv.Promotions.CartLine.' + line.internalid)).delegateEvents().render();
              })
              //self.cartChanged();
            }
          })


          this.CART.cancelableOn('beforeShowContent', function () {
            self.getCurrentlyAppliedPromotions(false);
          })

          this.CART.on('afterUpdateLine', function (line) {
            console.log('afterUpdateLine', line);
            if (self.triggeringLine == line.line.internalid) return;
            self.triggeringLine = line.line.internalid;
            self.cartChanged();
          })

          this.CART.on('afterRemoveLine', function (line) {
            console.log('afterRemoveLine', line);
            self.cartChanged();
          })

          this.CART.on('afterAddLine', function (line) {
            self.CART.getLatestAddition().then(function (newline) {
              if (newline.internalid == line.result) {
                self.cartChanged();
              }
            })
          });

          this.LAYOUT.addToViewEventsDefinition(
            'Cart.Lines.View',
            'click [data-action="remove-promotion-item"]',
            function (evt) {
              var $target = jQuery(evt.currentTarget);
              var lineID  = $target.data('internalid');
              self.CART.removeLine({
                line_id: lineID
              }).then(function () {
                self.cartChanged();
              });
            });

          this.CART.addToViewEventsDefinition(
            'Cart.PromocodeForm.View',
            'submit [data-action="apply-promocode-custom"]',
            function (event) {
              event.preventDefault();
              event.stopPropagation();
              var code = jQuery('[name="promocode"]').val();
              var customPromotionsModel = new PromotionsModel();
              customPromotionsModel.set('promo_code', code);
              customPromotionsModel.save().done(function (resp) {
                console.log('resp from promotions', resp);
                if (resp) {
                  if(resp.message == 'Apply Standard') {
                    var promoObj = jQuery('form[data-action="apply-promocode-custom"]').serializeObject();
                    self.CART.addPromotion(promoObj).then(function (promotion) {
                      jQuery('#order-wizard-promocode').collapse('hide')
                      console.log('added successfully', promotion);
                    }, function (jqXhr) {
                      self.showErrorMessageForPromoCode(jqXhr)
                    });
                  }
                  else {
                    // reload cart
                    jQuery('[data-type="promocode-error-placeholder"]').empty();
                    if (resp.success) {
                      setTimeout(function () {
                        self.LAYOUT.showMessage({
                          message : 'Promotion added successfully.',
                          type    : 'success',
                          selector: 'promocode-error-placeholder'
                        }, 100);

                        self.CART.clearEstimateShipping();

                      })
                    }
                    else {
                      setTimeout(function () {
                        self.LAYOUT.showMessage({
                          message : 'This promotion is not valid',
                          type    : 'error',
                          selector: 'promocode-error-placeholder'
                        }, 100);
                      })
                    }
                  }
                }
                else {
                  var promoObj = jQuery('form[data-action="apply-promocode-custom"]').serializeObject();
                  self.CART.addPromotion(promoObj).then(function (promotion) {
                    jQuery('#order-wizard-promocode').collapse('hide')
                    console.log('added successfully', promotion);
                  }, function (jqXhr) {
                    self.showErrorMessageForPromoCode(jqXhr)
                  });
                }
              });

              return false;
            }
          )
        }

        try {
          //TODO: finish if HF Requests
          PAGETYPE.registerPageType({
            name           : 'trevera_cleaningkits',
            routes         : ['cleaningkits', 'cleaningkits/?:options', 'cleaningkitsadded'],
            view           : ExtensionView,
            options        : {
              application: container
            },
            defaultTemplate: {
              name       : 'trevera_myaccount_cleaningkits.tpl',
              displayName: 'Cleaning Kits'
            }
          });
        } catch (e) {
          console.log(e)
        }

        this.addViewContextVariables(container);
      },

      showErrorMessageForPromoCode: function showErrorMessageForPromoCode(jqXhr) {
        var self     = this;
        var current_key;
        var message  = 'Problem Adding Promotion';
        var response = JSON.parse(jqXhr.responseText);
        if (response) {
          message = response.errorMessage;
        }
        setTimeout(function () {
          self.LAYOUT.showMessage({
            message : message,
            type    : 'error',
            selector: 'promocode-error-placeholder'
          }, 100);
        })
      },

      cartChanged: function cartChanged() {
        var customPromotionsModel = new PromotionsModel();
        customPromotionsModel.fetch({data: {action: 'autoapply'}}).done(function (resp) {
          console.log('resp from promtions', resp);
        });
        this.getCurrentlyAppliedPromotions(true);
      },

      getCurrentlyAppliedPromotions: function getCurrentlyAppliedPromotions(changed) {
        var self    = this;
        var doFetch = _.size(this.appliedPromotions) < 1 || changed;
        if (doFetch) {
          var customPromotionsModel = new PromotionsModel();
          this.CART.getLines().then(function (lines) {
            if (lines.length > 0) {
              var promotions = [];
              _.each(lines, function (line) {
                var promotionField = _.findWhere(line.options, {cartOptionId: 'custcol_custom_promotion_used'});
                if (promotionField && promotionField.value) {
                  promotions.push(promotionField.value.internalid);
                }
              })
              customPromotionsModel.fetch({data: {promo_codes: promotions.toString()}}).done(function (resp) {
                self.appliedPromotions = resp;
                console.log('getCurrentlyAppliedPromotions: ', resp);
                self.LAYOUT.cancelableTrigger('appliedPromotions:loaded', resp)
              });
            }
          })
        }
      },

      addViewContextVariables: function addViewContextVariables(container) {
        var self = this;
        if (this.LAYOUT) {
          this.LAYOUT.addToViewContextDefinition(
            'Cart.Lines.View'
            , 'trvPromotionExtras'
            , 'string'
            , function trvPromotionExtras(context) {
              var options        = context.line && context.line.options;
              var ctx            = {isPromoLine: false, showControls: true};
              if (_.size(options) > 0) {
                var promotionField = _.findWhere(options, {cartOptionId: 'custcol_custom_promotion_used'});
                if (promotionField && promotionField.value) {
                  var matchingPromotion = _.where(this.appliedPromotions, {promo_code: promotionField.value.internalid});
                  if (promotionField.value) {
                    _.extend(ctx, {
                      isPromoLine    : true,
                      hideControls   : true,
                      promocodeToShow: promotionField.value.internalid
                    })
                  }
                  if (matchingPromotion) {
                    _.extend(ctx, {
                      hideRemove: !!matchingPromotion ? matchingPromotion.is_auto_apply : false
                    })
                  }
                }
              }
              return ctx
            }
          );

          this.LAYOUT.addToViewContextDefinition(
            'Cart.Item.Summary.View'
            , 'trvPromotionExtras'
            , 'string'
            , function trvExtras(context) {
              var options = context.line && context.line.options;
              var ctx     = {
                isPromoLine : false,
                hideControls: false
              };
              if (_.size(options) > 0) {
                var promotionField = _.findWhere(options, {cartOptionId: 'custcol_custom_promotion_used'});
                if (promotionField) {
                  if (promotionField.value) {
                    console.log('promotionField: updating');
                    _.extend(ctx, {
                      isPromoLine    : true,
                      hideControls   : true,
                      promocodeToShow: promotionField.value.internalid
                    })
                  }
                }
              }
              return ctx
            }
          );
        }
      }

    };
  });
