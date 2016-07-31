(function() {

    var scriptbase = _spPageContextInfo.webServerRelativeUrl === '/' ? "/_layouts/15/" : _spPageContextInfo.webServerRelativeUrl + '/_layouts/15/';
      $.getScript(scriptbase + "sp.runtime.js", function() {
        $.getScript(scriptbase + "sp.js", function() {
            $.getScript(scriptbase + "sp.Taxonomy.js", function() {
                init();
              });
          });
         });
  

   

    function getTermLinks() {

        var d = $.Deferred(); 
        var context = SP.ClientContext.get_current();
        var session = SP.Taxonomy.TaxonomySession.getTaxonomySession(context);
        var termStore = session.getDefaultSiteCollectionTermStore();
        var TargetTermSet = termStore.getTermSet("d88c7627-ae30-48d5-a348-4c6fa3000360");
        var terms = TargetTermSet.getAllTerms();

        context.load(terms, 'Include(IsRoot, Labels, TermsCount, CustomSortOrder, Id, IsAvailableForTagging, Name, PathOfTerm, Parent, TermSet.Name,LocalCustomProperties)');

        var o = {
            d: d,
            terms: terms
        };

        context.executeQueryAsync(Function.createDelegate(o, successCallback), Function.createDelegate(o, failCallback));
        return d.promise();
    }

    function successCallback() {
        this.d.resolve(this.terms);
    }

    function failCallback() {
        this.d.reject("something bad happened");
    }

    function init() {

            
     	var navViewModel = {
     		items: ko.observableArray(),
     		currNode: ko.observable(0)
     	}

     //get current node 
			function getCurNode(navArr){
				var url = location.href.split('/').slice(3);
				url =  "/"+url.join('/');
				 var curTermIndx= 0;
				 menu.forEach(function(itm,indx){
					if(itm.url){				
					 if(url.indexOf(itm.url) >=0){
						navViewModel.currNode(indx);
					}
				  }	
				})				
			}

        var prm = getTermLinks();
        prm.done(function(result) {
           
            var NavTerms = function(term) {
                this.id = term.get_id().toString();
                try {
                    this.parentid = term.get_parent().get_id().toString();
                } catch (err) {
                    this.parentid = null;
                }
                this.name = term.get_name();
                this.childs = term.get_termsCount();
                this.url = term.get_localCustomProperties()['_Sys_Nav_TargetUrl'];

            }
            var collection;
            var htmloutput = "";
            var CollectionArray = new Array();

            var enumu = result.getEnumerator();
            while (enumu.moveNext()) {
                var currentTerm = enumu.get_current();
                var term = new NavTerms(currentTerm);
                console.log(term.name, term.url);
                CollectionArray.push(term);
            }

            createTree(CollectionArray);
            ko.applyBindings(navViewModel , document.getElementById('TopNav'));
        });
        prm.fail(function(result) {

            var error = result;
            console.log(error);
        });
        
        
         function createTree(terms) {
        function NodeItem(data) {
            this.data = data;      
        }
        var nodesById = {};
        // convert all nodes to NodeItem instance
        var nodeCollection = terms.map(function(node) {
        	node = new NodeItem(node)
            nodesById[node.data.id] = node;
            return node;
        });
        
        var ItemsContainer = ko.observableArray();
        
        for (var i = 0; i < nodeCollection.length; i++) {
            var term = nodeCollection[i];
             if (nodesById[term.data.parentid]) {
                if (!nodesById[term.data.parentid].child)
                    nodesById[term.data.parentid].child = [];
                nodesById[term.data.parentid].child.push(term)
            } else {
                navViewModel.items.push(term);
            }
        }
  
      }

    }

   
})();
