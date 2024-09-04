define('HF.Loyalty.Shopping'
  , [
    'HF.Loyalty.Cart.View',
    'HF.Loyalty.Promotions.View',
    'HF.Loyalty.PDP.View',
    'HF.Loyalty.Facets.View',
    'HF.Loyalty.Main.SS2Model',
    'underscore'
  ]
  , function (
    HFCartPointsView,
    HFCartPromotionsView,
    HFPDPPointsView,
    HFPLPPointsView,
    LoyaltyConfigModel,
    _
  ) {
    'use strict';

    return {
      mountToApp: function mountToApp(container) {
        var LAYOUT        = container.getComponent('Layout');
        var PDP           = container.getComponent('PDP');
        var PLP           = container.getComponent('PLP');
        var CART          = container.getComponent('Cart');
        var PROFILE       = container.getComponent('UserProfile');
        var MYACCOUNTMENU = container.getComponent('MyAccountMenu');

        var self = this;
        this.profile;
        this.loyaltyConfig = new LoyaltyConfigModel();
        PROFILE.getUserProfile().then(function (data) {
          self.profile = data;
          if (self.profile.isloggedin) {
            self.loyaltyConfig.fetch({ data: { action: 'getUserPoints' } }).done(function (data) {
              self.loyaltyConfig.set(data);
            })
          }
        });

        if (PLP) {
          LAYOUT.addChildViews(PLP.PLP_VIEW, {
            'ProductViewsPrice.Price': {
              'HF.PDP.Points': {
                childViewIndex      : 2,
                childViewConstructor: function () {
                  return new HFPLPPointsView({ application: container, loyaltyConfig: self.loyaltyConfig });
                }
              }
            }
          });
        }

        if (PDP) {
          LAYOUT.addChildViews(PDP.PDP_FULL_VIEW, {
            'Product.Price': {
              'HF.PDP.Points': {
                childViewIndex      : 10,
                childViewConstructor: function () {
                  return new HFPDPPointsView({ application: container, loyaltyConfig: self.loyaltyConfig });
                }
              }
            }
          });
          LAYOUT.addChildViews(PDP.PDP_QUICK_VIEW, {
            'Product.Price': {
              'HF.PDP.Points': {
                childViewIndex      : 10,
                childViewConstructor: function () {
                  return new HFPDPPointsView({ application: container, loyaltyConfig: self.loyaltyConfig });
                }
              }
            }
          });
        }

        if (CART) {
          CART.addChildViews('Cart.Detailed.View', {
            'CartPromocodeListView': {
              'LoyaltyPoints.View': {
                childViewIndex      : 6,
                childViewConstructor: function () {
                  return new HFCartPointsView({ application: container });
                }
              }
            }
          });
          // we want to override the native view here
          CART.addChildView('CartPromocodeListView', function PromocodeList() {
            return new HFCartPromotionsView({ application: container });
          });
        }

        if (MYACCOUNTMENU) {
          MYACCOUNTMENU.addGroup({
            id   : 'loyalty',
            index: 6,
            url  : 'loyalty',
            name : _.translate('Loyalty Rewards')
          });
        }

      }
    };
  });
