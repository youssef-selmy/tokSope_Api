const userModel = require("../models/userSchema");
const functions = require("../shared/functions");
var payouthodModel = require("../models/payout_methods");
const transactionModel = require("../models/transactionSchema");

exports.customConnect = async (req, res) => {
  var response = await functions.getSettings();
  const stripe = require("stripe")(response['stripeSecretKey']);
   const account = await stripe.accounts.create({
      type: "custom",
      country: 'US',
      capabilities: {
	    card_payments: {requested: true},
	    transfers: {requested: true},
	  },
	   "email": req.body.email,
/*
	    'external_account[object]': 'bank_account',
	    'external_account[account_holder_type]': 'individual',
	    'external_account[country]': 'US',
*/
	    'business_type': 'individual',
    })
    const accountLinks = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `https://site.tokshopping.live/stripe/account/reauth?account_id=${account.id}`,
      return_url: `https://site.tokshopping.live/pay-out-success?result=${account.id}`,
      type: "account_onboarding",
    });
    console.log(accountLinks);
  res
    .status(200)
    .setHeader("Content-Type", "application/json")
    .json(accountLinks);
};


exports.createIntent = async (req, res) => {
	var response = await functions.getSettings();
	const stripe = require("stripe")(response["stripeSecretKey"]);
	let payoutdata = await payouthodModel.findOne({ userid: req.body.productOwner });
	let paymentdata = await userModel.findOne({ _id: req.body.winnerId }).populate("defaultpaymentmethod");
	console.log(paymentdata)
	try {
		let commission = (response["commission"] * req.body.amount) ;
		let paymentLoad = {
		  currency: 'usd',
		  payment_method_types: ['card'],
		  "capture_method": "automatic",
		  "application_fee_amount": parseInt(commission),
		  "amount": req.body.accountno ? req.body.amount : req.body.amount * 100,
		  "on_behalf_of": req.body.accountno ?? payoutdata['accountno'],
		  "confirm": req.body.confirm ?? false,
		  "transfer_data": {
			  "destination": req.body.accountno ?? payoutdata['accountno']
		  }
		}
		
		//incase its for auction payment intent
		if(paymentdata !=null && paymentdata["defaultpaymentmethod"] !=null){
			paymentLoad["customer"] = paymentdata["defaultpaymentmethod"]['customerid'];
		}
		//incase its for capturing payment with card token
		if(req.body.cardid){
			paymentLoad['payment_method_data'] =  {
			  "type": "card",
			  "card": {
				  'token' :req.body.cardid
			  }
		  };
		}
		const paymentIntent = await stripe.paymentIntents.create(paymentLoad);
		console.log(paymentIntent);

		res.json({response:paymentIntent["status"] == "succeeded",amount: paymentIntent["amount_received"], client_secret: paymentIntent['client_secret']});
	
	 } catch (err) {
      res.status(500).send({
        message: err.message, 
      });
    } 

}


exports.captureCardTokenPayment = async (req, res) => {
	var response = await functions.getSettings();
	const stripe = require("stripe")(response["stripeSecretKey"]);
	let payoutdata = await payouthodModel.findOne({ userid: req.body.productOwner });
	try {
		let commission = (response["commission"] * req.body.amount) ;
		const paymentIntent = await stripe.paymentIntents.create({
		  amount: req.body.amount * 100,
		  currency: 'usd',
		  payment_method_types: ['card'],
		  "capture_method": "automatic",
		  "application_fee_amount": parseInt(commission),
		  "amount": req.body.amount * 100,
		  "on_behalf_of": payoutdata['accountno'],
		  "confirm": true,
		  'payment_method_data': {
			  "type": "card",
			  "card": {
				  'token' :req.body.cardid
			  }
		  },
		  "transfer_data": {
			  "destination": req.body.accountno ?? payoutdata['accountno']
		  }
		});
	
		res.json({response:paymentIntent["status"] == "succeeded",amount: paymentIntent["amount_received"]});
	
	 } catch (err) {
      res.status(500).send({
        message: err.message, 
      });
    } 
}

exports.getStripeBankAccount = async (req, res) => {
	var response = await functions.getSettings();
	const stripe = require("stripe")(response["stripeSecretKey"]);
	
	try {
		let payoutdata = await payouthodModel.findOne({ userid: req.params.userId });
		if(payoutdata == null){
			return res.json({banks:[],status:false});
		}
		const account = await stripe.accounts.retrieve(payoutdata['accountno']);
		  if (account["external_accounts"] != null) {
	        let banks = account["external_accounts"]["data"];
	        res.json({banks:banks,status:true});
	      } else {
		      res.json({banks:[],status:false});
	      }
		
	
	 } catch (err) {
      res.send({
        message: err.message,
        status:false
      });  
    }
}

exports.stripePayout = async (req, res) => {
	var response = await functions.getSettings();
	const stripe = require("stripe")(response["stripeSecretKey"]);
	let payoutdata = await payouthodModel.findOne({ userid: req.params.userId });
	console.log(payoutdata)
	const account = await stripe.accounts.retrieve(payoutdata['accountno']);
	try {
		let banks = account["external_accounts"]["data"];
		let amount = (req.body.amount * 100) ;
		const payoutresponse = await stripe.payouts.create({
	      "amount": amount,
	      "currency": 'usd',
	      "destination": banks[0]["id"]	    },
	      {stripeAccount: payoutdata['accountno']});
		    if(payoutresponse["id"]){   
		    //save transaction
		        let newTransaction = {
					from: req.params.userId,
					to: req.params.userId,
					reason: "Withdraw Request -- Pending",
					amount: req.body.amount,
					type: "withdraw",
					deducting: true,
					status: "Completed",
					stripeBankAccount: banks[0]["id"],
					date: Date.now()
				};
			
				let transaction = await transactionModel.create(newTransaction);
			}
		    res.json({response:payoutresponse, status: true});
	
	 } catch (err) {
      res.json({
        response: err.message, status: false
      });
    }

}
stripeAccount = async (account) => {
	var response = await functions.getSettings();
	const stripe = require("stripe")(response["stripeSecretKey"]);
	let accountresponse =  await stripe.accounts.retrieveCapability(account,"card_payments");
	return accountresponse;
}
exports.stripeAccountStatus = async (req, res) => {
	let payoutdata = await payouthodModel.findOne({ userid: req.params.id });
	return res.json( await stripeAccount(payoutdata['accountno']));
}
exports.stripePayoutBalance = async (req, res) => {
	var response = await functions.getSettings();
	const stripe = require("stripe")(response["stripeSecretKey"]);
	
	try {
		let payoutdata = await payouthodModel.findOne({ userid: req.params.userId });
		const balance = await stripe.balance.retrieve({stripeAccount: payoutdata['accountno']});
		res.json(balance);		
	 } catch (err) {
      res.status(500).send({
        message: err.message,
      });
    }

}
exports.deleteAccount = async (req, res) => {
	var response = await functions.getSettings();
	const stripe = require("stripe")(response["stripeSecretKey"]);
	
	try {
		let payoutdata = await payouthodModel.findOne({ userid: req.params.id });
		console.log(payoutdata)
 
		await payouthodModel.findByIdAndDelete(payoutdata._id);
		res.json(deleteAccountResponse);		
	 } catch (err) {
      res.json({
        message: err.message,
      });
    }

}
exports.connect = async (req, res) => {
  let email = req.body.email; 
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let routing_number = req.body.routing_number;
  let account_number = req.body.account_number;
  let phone = req.body.phone;
  let country = req.body.country;
  let postal_code = req.body.postal_code;
  let line1 = req.body.address_one;
  let line2 = req.body.address_two;
  let state = req.body.state;
  let city = req.body.city;
  let day = req.body.day;
  let month = req.body.month;
  let ssn_last_4 = req.body.ssn_last_4;
  let year = req.body.year;
  let mcc = req.body.mcc ?? "5734";
  let currency = req.body.currency ?? "usd";
  let payload = {
    country: "US",
    type: "custom",
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    email: email,
    business_type: "individual",
    business_profile: { url: "www.google.com", mcc: "5734" },
    tos_acceptance: {
      date: Math.floor(Date.now() / 1000),
      ip: "120.0.0.1",
    },
    external_account: {
      object: "bank_account",
      country,
      currency,
      account_holder_type: "individual",
      routing_number,
      account_number,
    },
    individual: {
      ssn_last_4,
      email,
      last_name,
      first_name,
      phone,
      address: {
        country,
        city,
        state,
        line1,
        line2,
        postal_code,
      },
      dob: {
        day,
        month,
        year,
      },
      phone,
    },
    company: {
      address: {
        country,
        city,
        state,
        line1,
        line2,
        postal_code,
      },
    },
  };
  try {
	  const account = await functions.stripeConnect(
	    payload,
	    req.params.id,
	    first_name,
	    last_name,
	    email
	  );
	  return res.json({account, status: await stripeAccount(account.account.accountno)});
  } catch (err) {
      return res.json({
        message: err.message,
        success: false, 
      });
    }
};

