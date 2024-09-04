/*
 © 2021 Trevera

 Category Helpers.
 Add modifications for catgegories here

 */

define(
	'Trevera.CategoryHelpers'
	, [
		'Backbone'
		, 'underscore'
	]
	, function (
		Backbone
		, _
	) {
		'use strict';

		function getAdditionalFields(ENVIRONMENT, source, config_path) {
			const additionalFields = {};
			const fields           = ENVIRONMENT.getConfig(config_path, []);

			_.each(fields, function (field) {
				additionalFields[field] = source[field];
			});

			return additionalFields;
		}

		//TODO document what these do
		return {

			calculateCategoriesToShow: function calculateCategoriesToShow(container, excludedCategories) {
				var PLP         = container.getComponent('PLP')
					, ENVIRONMENT = container.getComponent('Environment');

				var thisCategory = PLP.getCategoryInfo()
					, level        = _.compact(thisCategory.idpath.split("|")).length;

				var children = ((level === 3) ? thisCategory && thisCategory.siblings : thisCategory && thisCategory.categories) || [];

				if (excludedCategories && excludedCategories.length > 0) {
					children = _.filter(children, function (category) {
						return excludedCategories.indexOf(category.internalid) < 0;
					});
				}

				var values = [];

				if (level === 3) {
					// push the current category.
					// this fixes a bug where the current category would never appear because it's never added to the values
					values.push({
						displayName     : thisCategory.name,
						label           : thisCategory.name,
						link            : thisCategory.fullurl,
						isActive        : thisCategory.fullurl === (Backbone.history.fragment.indexOf('/') === 0 ? Backbone.history.fragment : "/" + Backbone.history.fragment),
						additionalFields: getAdditionalFields(
							ENVIRONMENT,
							thisCategory,
							'categories.sideMenu.additionalFields'
						)
						, sequencenumber: thisCategory.sequencenumber
					});
				}

				_.each(children, function (category) {
					values.push({
						displayName     : category.name,
						label           : category.name,
						link            : category.fullurl,
						isActive        : category.fullurl === (Backbone.history.fragment.indexOf('/') === 0 ? Backbone.history.fragment : "/" + Backbone.history.fragment),
						additionalFields: getAdditionalFields(
							ENVIRONMENT,
							category,
							'categories.sideMenu.additionalFields'
						)
						, sequencenumber: category.sequencenumber
					});
				});


				// add sorting by sequence number
				return _.sortBy(values, function (val) {
					return parseInt(val.sequencenumber);
				});

			}

			, getExcludedCategories: function getExcludedCategories(ENVIRONMENT) {
				var excludedCategories = ENVIRONMENT.getConfig('trevera.header.excludeCategoriesFromNavigation') || "";

				if (excludedCategories && excludedCategories.length > 0) {
					excludedCategories = _.without(excludedCategories.split(","), "", " ");
				}

				return excludedCategories;

			}

			, getCustomTemplateMapping: function getCustomTemplateMapping(ENVIRONMENT, categoryInfo) {
				// check for internalid first
				var customTemplates = ENVIRONMENT.getConfig('trevera.categories.customTemplates', {})
					, template        = _.find(customTemplates, function (template) {
					return template.categoryInternalID.toString() === categoryInfo.internalid
				});

				if (!template) {
					var idsToCheck = _.compact(categoryInfo.idpath.split("|")) || [];

					_.each(idsToCheck, function (id) {
						var parentTemplate = _.find(customTemplates, function (template) {
							return template.categoryInternalID.toString() === id
						});

						if (parentTemplate && parentTemplate.childrenInherit) {
							template = parentTemplate;
						}
					})
				}

				return template;
			}

			// copied from Categories Module
			, makeNavigationTab: function (ENVIRONMENT, categories, excludedCategories, level, deepness) {
				var result     = [];
				var self       = this;
				var currentURL = Backbone.history.fragment;

				categories = _.sortBy(categories, function (cat) {
					return cat.additionalFields && parseInt(cat.additionalFields.sequencenumber) || 1000
				});

				_.each(categories, function (category) {
					var href = category.fullurl;
					var tab  = {
						href       : href,
						// use page heading if available - name is internal name
						text       : category.pageheading || category.name,
						data       : {
							hashtag   : '#' + href,
							touchpoint: 'home'
						},
						class      : 'header-menu-level' + (level) + '-anchor' + (currentURL === category.href ? " active" : ""),
						'data-type': 'commercecategory'
					};

					tab.additionalFields = getAdditionalFields(
						ENVIRONMENT,
						category,
						'categories.menu.fields'
					);

					category.categories = _.sortBy(category.categories, function (cat) {
						return cat.additionalFields && parseInt(cat.additionalFields.sequencenumber) || 1000
					});

					if (category.categories) {

						if (level + 1 <= deepness) {
							tab.categories = self.makeNavigationTab(ENVIRONMENT, category.categories, excludedCategories, level + 1, deepness);
						}
					}

					if (!!excludedCategories && excludedCategories.indexOf(category.internalid) < 0) {

						result.push(tab);
					}
					else {

						result.push(tab);
					}
				});

				return result;
			}

			// Adds support to use categories for sub menus
			, makeSubMenuFromCategoryID: function makeSubMenuFromCategoryID(ENVIRONMENT, navigationData, excludedCategories, profile) {

				var self   = this
					, result = [];

				_.each(navigationData, function (category) {

					var tab = _.extend(category, {});

					tab.text = tab.textOverride && tab.textOverride.length > 0 ? tab.textOverride : tab.text;

					if (category.categoryIDForSubMenu && category.placeholder === "Categories Sub Menu") {

						var menuCategories = self.getCategoryByID(category.categoryIDForSubMenu, SC.CATEGORIES);

						var level = parseInt(tab.level);

						if (!!menuCategories) {
							var deepness   = parseInt(category.subMenuDeepness) || parseInt(ENVIRONMENT.getConfig('categories.menuLevel'));
							tab.categories = self.makeNavigationTab(ENVIRONMENT, menuCategories.categories, excludedCategories, level + 1, deepness);
						}
					}
					else {
						// loop through children
						tab.categories = self.makeSubMenuFromCategoryID(ENVIRONMENT, category.categories, excludedCategories, profile)
					}

					result.push(tab);
				});

				return result;
			}

			, getParentCategoryNavigation: function (ENVIRONMENT, navigation, excludedCategories, profile) {

				var parent = this.getParentCategoryFromOverride(ENVIRONMENT);

				if (parent && parent.length === 1) {
					// remap the categories into the navigation menu
					var deepness = parseInt(ENVIRONMENT.getConfig('categories.menuLevel'));
					var result   = this.makeNavigationTab(ENVIRONMENT, parent[0].categories, excludedCategories, 1, deepness);

					var nonCategoryNavigation = _.filter(navigation, function (nav) {
						return !nav.additionalFields;
					});

					return nonCategoryNavigation.concat(result);

				}

				return false;
			}

			, getParentCategoryFromOverride: function (ENVIRONMENT) {
				var parentCategoryOverride = ENVIRONMENT.getConfig('trevera.header.parentCategoryOverride') || "265";

				if (!!parentCategoryOverride) {

					return this.getCategoryByID(parentCategoryOverride, SC.CATEGORIES);
				}

				return [];
			}

			, getCategoryByID: function (id, categories) {
				var self = this;
				var ids  = _.pluck(categories, 'internalid');

				var returnObj;

				if (ids.indexOf(id) > -1) {
					returnObj = _.find(categories, {'internalid': id});
				}
				else {
					_.find(categories, function (category) {
						if (category.categories && category.categories.length) {
							var test = self.getCategoryByID(id, category.categories);

							if (!!test) {
								returnObj = test;
							}

							return false;

						}
					})
				}

				return returnObj;

			}
		}
	});

