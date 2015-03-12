function Bracket( ) {
	this.tree = null;
	this.first_key = null;
}
function Node(id, team) {
	this.id = id;
	this.team = defaultFor(team, null);
	this.left = null;
	this.right = null;
	this.top = null;
}
Node.prototype = {
	setTop: function(top){
		this.top = top;
	},
	setLeft: function(left){
		this.left = left;
	},
	setRight: function(right){
		this.right = right;
	},
	getId: function(){
		return this.id;
	}
};
// Define the "instance" methods using the prototype
// and standard prototypal inheritance.
Bracket.prototype = {
	makeTree: function(elements){
		this.tree = {};
		var next_row = [];
		var first_elem = new Node(1);
		this.first_key = 1;
		this.tree[1] = first_elem;
		var cur_node = first_elem;
		var nodes_added = 1;
		console.log(cur_node);
		while(nodes_added < elements){
			var newLeftNode = new Node(nodes_added+1);
			cur_node.setLeft(nodes_added+1);
			newLeftNode.setTop(cur_node.getId());
			next_row.push(newLeftNode);
			this.tree[nodes_added+1] = newLeftNode;
			nodes_added += 1;
			if(nodes_added < elements){
				var newRightNode = new Node(nodes_added+1);
				cur_node.setRight(nodes_added+1);
				newRightNode.setTop(cur_node.getId());
				next_row.push(newRightNode);
				this.tree[nodes_added+1] = newRightNode;
				nodes_added += 1;
			}
			cur_node = next_row.shift();
		}
	},
	insertToBottom: function(data, key) {
		var node = this.tree[defaultFor(key, this.first_key)];
		if(node['left'] == null){
			node['team']= data;
		}else if(this.isFull(node['left'])){
			this.insertToBottom(data, node['right']);
		}else{
			this.insertToBottom(data, node['left']);
		}
	},
	isFull: function(key) {
		var node = this.tree[defaultFor(key, this.first_key)];
		if(node['team'] != null){
			return true;
		}
		if(node['left'] == null && node['right'] == null){
			return false;
		}
		return (this.isFull(node['left']) && this.isFull(node['right']))
	}
};

function defaultFor(arg, val){
	return typeof arg !== 'undefined' ? arg : val;
}


module.exports = exports = Bracket;