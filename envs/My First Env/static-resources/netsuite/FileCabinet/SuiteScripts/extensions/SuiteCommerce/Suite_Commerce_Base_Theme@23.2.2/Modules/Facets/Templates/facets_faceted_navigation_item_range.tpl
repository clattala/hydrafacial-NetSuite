{{#if showFacet}}
	<div class="facets-faceted-navigation-item-range-facet-group" id="{{htmlId}}" data-type="rendered-facet" data-facet-id="{{facetId}}">
		{{#if showHeading}}
			{{#if isUncollapsible}}
				<div class="facets-faceted-navigation-item-range-facet-group-expander">
					<h4 class="facets-faceted-navigation-item-range-facet-group-title">
						{{facetDisplayName}}
						{{#if showRemoveLink}}
						<a aria-label="{{translate 'Clear $(0) filter' facetDisplayName 'Link that clears the selected filter'}}" class="facets-faceted-navigation-item-range-filter-delete" href="{{removeLink}}">
							<i class="facets-faceted-navigation-item-range-filter-delete-icon"></i>
						</a>
						{{/if}}
					</h4>
				</div>
			{{else}}
				<a href="#" class="facets-faceted-navigation-item-range-facet-group-expander" data-toggle="collapse" data-target="#{{htmlId}} .facets-faceted-navigation-item-range-facet-group-wrapper" data-type="collapse" title="{{facetDisplayName}}">
					<i class="facets-faceted-navigation-item-range-facet-group-expander-icon"></i>
					<h4 class="facets-faceted-navigation-item-range-facet-group-title">{{facetDisplayName}}</h4>
					{{#if showRemoveLink}}
						<a aria-label="{{translate 'Clear $(0) filter' facetDisplayName 'Link that clears the selected filter'}}" class="facets-faceted-navigation-item-range-filter-delete" href="{{removeLink}}">
							<i class="facets-faceted-navigation-item-range-filter-delete-icon"></i>
						</a>
					{{/if}}
				</a>
			{{/if}}
		{{/if}}

	{{#if isUncollapsible}}
	<div class="facets-faceted-navigation-item-range-facet-group-wrapper">
	{{else}}
	<div class="facets-faceted-navigation-item-range-facet-group-wrapper {{#if isCollapsed}} collapse{{else}} in{{/if}}">
	{{/if}}
		<span class="facets-faceted-navigation-item-range-end" data-range-indicator="end">{{rangeToLabel}}</span>
		<span class="facets-faceted-navigation-item-range-start" data-range-indicator="start">{{rangeFromLabel}}</span>

		<div
			class="facets-faceted-navigation-item-range-slider"
			data-toggle="slider"
			data-facet-id="{{facetId}}"
			data-min="{{rangeMin}}"
			data-max="{{rangeMax}}"
			data-low="{{rangeFrom}}"
			data-high="{{rangeTo}}">
						<div class="facets-faceted-navigation-item-range-slider-bar" data-control="bar" style="left: 0%; width: 100%;"></div>
						<button
						    aria-label="{{translate '$(0) minimum value thumb' facetDisplayName 'Button that allows changing the minimum value of the slider'}}"
						    aria-description="{{translate 'Use the right and left arrow keys to increase or decrease the slider value'}}"
						    aria-orientation="horizontal"
						    aria-valuemin="{{rangeMin}}"
                            aria-valuemax="{{rangeMax}}"
                            aria-valuenow="{{rangeFrom}}"
						    class="facets-faceted-navigation-item-range-slider-bar-right" data-control="low" style="left: 0%;"
						    role="slider"></button>
						<button
						    aria-label="{{translate '$(0) maximum value thumb' facetDisplayName 'Button that allows changing the maximum value of the slider'}}"
						    aria-description="{{translate 'Use the right and left arrow keys to increase or decrease the slider value'}}"
						    aria-orientation="horizontal"
						    aria-valuemin="{{rangeMin}}"
                            aria-valuemax="{{rangeMax}}"
                            aria-valuenow="{{rangeTo}}"
						    class="facets-faceted-navigation-item-range-slider-bar-left" data-control="high" style="left: 100%;"
						    role="slider"></button>
					</div>

	</div>
</div>
{{/if}}



{{!----
Use the following context variables when customizing this template:

	htmlId (String)
	facetId (String)
	showFacet (Boolean)
	showHeading (Boolean)
	isUncollapsible (Boolean)
	isCollapsed (Boolean)
	isMultiSelect (Boolean)
	showRemoveLink (Boolean)
	removeLink (String)
	facetDisplayName (String)
	values (Array)
	extraValues (Array)
	showExtraValues (Boolean)
	isRange (Boolean)
	rangeValues (Array)
	rangeMin (Number)
	rangeMax (Number)
	rangeFrom (Number)
	rangeFromLabel (String)
	rangeTo (Number)
	rangeToLabel (String)

----}}
