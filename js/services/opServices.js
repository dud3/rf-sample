app.service('opServices', function() {

    var conn = new jsforce.Connection({ accessToken: '{!$Api.Session_Id}' });

    this.getOppInfo = function(OpportunityId) {

       var oppSummary = "select name, CurrencyIsoCode, account.name, acv__c, amount, acv_plus__c from Opportunity where id = '" + OpportunityId + "'";
       conn.query(oppSummary, function(error, res){
           if (error){
               console.log(error);
           } else {
               return(res.records);
           }
       });

    }

});