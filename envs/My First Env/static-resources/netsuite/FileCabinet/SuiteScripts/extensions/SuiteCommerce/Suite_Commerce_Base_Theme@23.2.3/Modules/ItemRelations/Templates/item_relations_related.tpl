{{#if showCells}}
	<aside class="item-relations-related" title="{{translate 'You may also like' 'Name of the aside section containing related items'}}">
		<h3>{{translate 'You may also like'}}</h3>
		<div class="item-relations-related-row">
			<div data-type="backbone.collection.view.rows"></div>
		</div>
	</aside>
{{/if}}



{{!----
Use the following context variables when customizing this template:

	collection (Array)
	showCells (Boolean)

----}}
