{{#if node.showChildren}}

<button class="menu-tree-node" aria-expanded="false" data-target="#menu-tree-node-{{node.id}}" data-action="expander" aria-controls="menu-tree-{{node.id}}" data-type="menu-tree-node-expandable" data-type="menu-tree-node-expandable" data-id='{{node.id}}' data-permissions="{{node.permission}}" data-permissions-operator="{{node.permissionOperator}}">
	<a class="menu-tree-node-item-anchor" data-id="{{node.id}}">
		{{node.name}}
		<i class="menu-tree-node-item-icon"></i>
	</a>
</button>

<div id="menu-tree-node-{{node.id}}" data-type="menu-tree-node-expander" class="menu-tree-node-submenu menu-tree-node-submenu-level-{{level}} collapse">
		<div class="menu-tree-node-submenu-wrapper" data-view="MenuItems.Collection"></div>
</div>

{{else}}

<div class="menu-tree-node" data-type="menu-tree-node" data-permissions="{{node.permission}}" data-permissions-operator="{{node.permissionOperator}}">

	<a class="menu-tree-node-item-anchor" href="{{node.url}}" target="{{node.target}}" data-id="{{node.id}}">{{node.name}}</a>

</div>

{{/if}}



{{!----
Use the following context variables when customizing this template:

	node (Object)
	node.id (String)
	node.name (String)
	node.url (String)
	node.index (Number)
	node.children (Array)
	node.showChildren (Boolean)
	level (Number)

----}}
