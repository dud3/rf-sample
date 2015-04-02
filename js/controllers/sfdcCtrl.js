app.controller('sfdcCtrl', function($scope, opServices){  

   $scope.showSubscriptionPage = false;
   $scope.showProductPage = false;
   $scope.OpportunityId = "";
   
   var query = window.location.search.substring(1);
   var vars = query.split("&");
   for (var i=0; i < vars.length; i++) {
       var pair = vars[i].split("=");
       if(pair[0] == "id"){
           $scope.OpportunityId = pair[1];
       }
   }             
         
  opServices.getOppInfo($scope.OpportunityId);

   var showProductPage = false;
   var currency = 'USD';            
   var conn = new jsforce.Connection({ accessToken: '{!$Api.Session_Id}' });
   var oppSummary = "select name, CurrencyIsoCode, account.name, acv__c, amount, acv_plus__c from Opportunity where id = '" + $scope.OpportunityId + "'";
                
   $scope.loading = true;
   conn.query(oppSummary, function(error, res){
       if (error){
       } else {
           $scope.OpportunityName = res.records[0].Name;
           $scope.OpportunityAmount = res.records[0].Amount;                     
           $scope.OpportunityACV = res.records[0].ACV__c;
           $scope.OpportunityACVPlus = res.records[0].ACV_Plus__c;                                          
           $scope.OpportunityAccount = res.records[0].Account.Name; 
           $scope.OpportunityCurrency = res.records[0].CurrencyIsoCode;
           $scope.loading = false;
           $scope.$apply();
       }
   });

   var pbEntries = "select Id, ProductCode, product2.name, product2.Family, UnitPrice, CurrencyIsoCode from PricebookEntry where pricebook2.name = 'Couchbase Standard Pricebook' and isActive = True and product2.isActive = True and CurrencyIsoCode = '" + currency + "' order by product2.name";
   var oppLines = "select id, Name, ProductCode, Quantity, Number_Of_Nodes__c, CurrencyIsoCode, UnitPrice, TotalPrice, Product2.Name, Product2.Family from OpportunityLineItem where OpportunityId = '" + $scope.OpportunityId + "'";

   $scope.loading = true;                                         
   conn.query(pbEntries , function(error, res) {
       if (error) {
          console.log("error");
       } else {
           $scope.PriceBookEntries = res.records;
           $scope.loading = false;
           $scope.$apply();

       }
   });

   conn.query(oppLines , function(error, res) {
       if (error) {
          console.log("error");
       } else {
           $scope.OppLineItems = res.records;    
           console.log(res.records);         
           $scope.$apply();                         
       }
   });             
   
   $scope.showEntry = function(entry) {                 	
       if (entry.Product2.Family == "Subscription") {
           $scope.showSubscriptionPage = true;
           $scope.showProductPage = false;
       }
       else {
           $scope.showSubscriptionPage = false;
           $scope.showProductPage = true;
       }
       $scope.selectedEntry = entry;
   }
   
   $scope.addEntry = function() {
       $scope.loading = true;
   
       var noOfNodes = $scope.nodes;
       if (! noOfNodes) { noOfNodes = 1; }
       
       var terms = $scope.terms;
       if (! terms) { terms = 1; }
       
       var uom = $scope.UoM;
       if (! uom) { uom = ''; }
                                                          
       var qty = noOfNodes * terms;
       var acv = $scope.selectedEntry.UnitPrice * noOfNodes;

       conn.sobject("OpportunityLineItem").create({ 
           OpportunityId : $scope.OpportunityId, PricebookEntryId: $scope.selectedEntry.Id, Quantity: qty, 
           UnitPrice: $scope.selectedEntry.UnitPrice, Number_of_Nodes__c: noOfNodes, Subscription_Terms__c: terms,
           UoM__c: uom, ACV__c: acv
       }, function(err, ret) {

       if (err || !ret.success) { 
           return console.error(err, ret); 
       }

         $scope.nodes = "";
         $scope.terms = "";
         $scope.UoM = "";
         
           conn.query(oppLines , function(error, res) {
               if (error) {
                  console.log("error");
               } else {
                   $scope.OppLineItems = res.records;    
                   $scope.showSubscriptionPage = false;   
                   $scope.showProductPage = false;    
               }
           });       
           
           conn.query(oppSummary, function(error, res){
               if (error){
                   console.log(error);
               } else {
                   console.log(res.records);
                   $scope.OpportunityName = res.records[0].Name;
                   $scope.OpportunityAmount = res.records[0].Amount;                     
                   $scope.OpportunityACV = res.records[0].ACV__c;
                   $scope.OpportunityACVPlus = res.records[0].ACV_Plus__c;                                          
                   $scope.OpportunityAccount = res.records[0].Account.Name; 
                   $scope.OpportunityCurrency = res.records[0].CurrencyIsoCode;
      
                   $scope.loading = false;
                   
                   $scope.$apply();                                                      
               }
           });
                                   

       });
   }
   

   $scope.removeEntry = function(entryId) {
       $scope.loading = true;
   
       conn.sobject("OpportunityLineItem").destroy( entryId, function(err, ret) {
         if (err || !ret.success) { 
             return console.error(err, ret); 
         }

         conn.query(oppLines , function(error, res) {
             if (error) {
                console.log("error");
             } else {
                 $scope.OppLineItems = res.records;    
                 $scope.showSubscriptionPage = false;       
             }
         });       

         conn.query(oppSummary, function(error, res){
             if (error){
                 console.log(error);
             } else {

                 $scope.OpportunityAmount = '';                     
                 $scope.OpportunityACV = '';
                 $scope.OpportunityACVPlus = '';

                 $scope.OpportunityName = res.records[0].Name;
                 $scope.OpportunityAmount = res.records[0].Amount;                     
                 $scope.OpportunityACV = res.records[0].ACV__c;
                 $scope.OpportunityACVPlus = res.records[0].ACV_Plus__c;                                          
                 $scope.OpportunityAccount = res.records[0].Account.Name; 
                 $scope.OpportunityCurrency = res.records[0].CurrencyIsoCode;
                 $scope.loading = false;
                 
                 $scope.$apply();                         
                 
             }
         });

       });
   }
   
   $scope.refreshProducts = function() {
       conn.query(oppLines , function(error, res) {
           if (error) {
              console.log("error");
           } else {
               $scope.OppLineItems = res.records;             
               $scope.$apply();                         
           }
       });             
   }
   
});