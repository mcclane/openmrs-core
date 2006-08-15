/*
	Copyright (c) 2006, The OpenMRS Cooperative
	All Rights Reserved.
*/

dojo.provide("dojo.widget.openmrs.PatientSearch");
dojo.require("dojo.widget.openmrs.OpenmrsSearch");

var openmrsSearchBase = djConfig["baseScriptUri"].substring(0, djConfig["baseScriptUri"].indexOf("/", 1));
document.write("<script type='text/javascript' src='" + openmrsSearchBase + "/dwr/interface/DWRPatientService.js'></script>");

dojo.widget.tags.addParseTreeHandler("dojo:PatientSearch");

dojo.widget.defineWidget(
	"dojo.widget.openmrs.PatientSearch",
	dojo.widget.openmrs.OpenmrsSearch,
	{
		patientId: "",
		
		initializer: function(){
			dojo.debug("initializing patientsearch");
			
			dojo.event.connect("before", this, "fillTable", this, "preFillTable");
		},
		
		postCreate: function() {
			if (this.patientId != "")
				this.selectPatient(this.patientId);
			else if (this.searchPhrase)
				DWRPatientService.findPatients(this.simpleClosure(this, "doObjectsFound"), this.searchPhrase, false);
		},
		
		selectPatient: function(patientId) {
			DWRPatientService.getPatient(this.simpleClosure(this, "select"), patientId);
		},
		
		doFindObjects: function(text) {

			var tmpIncludedVoided = (this.showIncludeVoided && this.includeVoided.checked);
			DWRPatientService.findPatients(this.simpleClosure(this, "doObjectsFound"), text, tmpIncludedVoided);
			
			return false;
		},
		
		preFillTable: function(patients) {
			if (patients == null) return;
			// if no hits
			if (patients.length < 1) {
				if (this.lastPhraseSearched.match(/\d/)) {
					if (this.isValidCheckDigit(this.lastPhraseSearched) == false) {
						//the user didn't input an identifier with a valid check digit
						this.hideHeaderRow()
						var img = this.getProblemImage();
						var tmp = " <img src='" + img.src + "' title='" + img.title + "' /> " + this.invalidCheckDigitText + this.lastPhraseSearched;
						patients.push(tmp);
						patients.push(this.noPatientsFoundText);
						patients.push(this.searchOnPatientNameText);
					}
					else {
						//the user did input a valid identifier, but we don't have it
						patients.push(this.noPatientsFoundText);
						patients.push(this.searchOnPatientNameText);
						patients.push(this.addPatientLink);
					}
				}
				else {
					// the user put in a text search
					patients.push(this.noPatientsFoundText);
					patients.push(this.addPatientLink);
				}
				//fillTable([]);	//this call sets up the table/info bar
			}
			// if hits
			else if (patients.length > 1 || this.isValidCheckDigit(this.lastPhraseSearched) == false) {
				patients.push(this.addPatientLink);	//setup links for appending to the end
			}
		},
		
		invalidCheckDigitText: "Invalid check digit for MRN: ",
		searchOnPatientNameText: "Please search on part of the patient's name. ",
		noPatientsFoundText: "No patients found. <br/> ",
		addPatientLink: "<a href='/@WEBAPP.NAME@/admin/patients/addPatient.htm'>Add a new patient</a>",
		
		getId: function(p) {
			var td = document.createElement("td");
			if (typeof p == 'string') {
				td.colSpan = 9;
				td.innerHTML = p;
			}
			else {
				td.className = "patientIdentifier";
				var obj = document.createElement("a");
				obj.appendChild(document.createTextNode(p.identifier + " "));
				td.appendChild(obj);
				if (p.identifierCheckDigit)
					if (this.isValidCheckDigit(p.identifier)==false) {
						td.appendChild(this.getProblemImage());
					}
				if (p.voided) {
					td.className += " retired";
				}
			}
			
			return td;
		},
		getGiven : function(p) { return p.givenName == null ? this.noCell() : p.givenName;  },
		getMiddle: function(p) { return p.middleName == null ? this.noCell() : p.middleName; },
		getFamily: function(p) { return p.familyName == null ? this.noCell() : p.familyName; },
		getTribe : function(p) { return p.tribe == null ? this.noCell() : p.tribe; },
		getGender: function(p) {
				if (p.gender == null) return this.noCell();
				
				var td = document.createElement("td");
				td.className = "patientGender";
				var src = "/@WEBAPP.NAME@/images/";
				if (p.gender.toUpperCase() == "F")
					src += "female.gif";
				else
					src += "male.gif";
				var img = document.createElement("img");
				td.innerHTML = "<img src='" + src + "'>";
				return td;
		},
		
		getBirthdayEstimated: function(p) {
				if (typeof p == 'string') return this.noCell();
				if (p.birthdateEstimated)
					return "&asymp;";
				else
					return "";
		},
		
		getBirthday: function(p) { 
				if (typeof p == 'string') return this.noCell();
				str = this.getDateString(p.birthdate);
				return str;
		},
		
		getAge: function(p) { 
				if (typeof p == 'string') return this.noCell();
				if (p.age == null) return "";
				var td = document.createElement("td");
				td.className = 'patientAge';
				var age = p.age;
				if (age < 1)
					age = "<1";
				td.innerHTML = age;
				return td;
		},
		
		getMother: function(p) { return p.mothersName == null ? this.noCell() : p.mothersName; },
		
		getCellFunctions: function() {
			return [this.simpleClosure(this, "getNumber"), 
					this.simpleClosure(this, "getId"), 
					this.simpleClosure(this, "getGiven"), 
					this.simpleClosure(this, "getMiddle"), 
					this.simpleClosure(this, "getFamily"),
					this.simpleClosure(this, "getAge"), 
					this.simpleClosure(this, "getGender"),
					this.simpleClosure(this, "getTribe"),
					this.simpleClosure(this, "getBirthdayEstimated"),
					this.simpleClosure(this, "getBirthday")
					];
			
		},
		
		// TODO: internationalize
		showHeaderRow: true,
		getHeaderCellContent: function() {
			return ['', 'Identifier', 'Given', 'Middle', 'Family Name', 'Age', 'Gender', 'Tribe', '', 'Birthday'];
		},
		
		getProblemImage: function() {
			var img = document.createElement("img");
			img.src = "/@WEBAPP.NAME@/images/problem.gif";
			img.title="The check digit on this identifier is invalid.  Please double check this patient";
			return img;
		},
		
		getRowHeight: function() {
			return 23;
		},
		
		rowMouseOver: function() {
			if (this.className.indexOf("searchHighlight") == -1) {
				this.className = "searchHighlight " + this.className;
				
				var other = this.nextSibling;
				if (other == null || other.firstChild.id != this.firstChild.id) {
					other = this.previousSibling;
					if (other == null || other.firstChild.id != this.firstChild.id)
						other = null;
				}
				
				if (other != null)
					other.className = "searchHighlight " + other.className;
			}
		},
		
		rowMouseOut: function() {
			var c = this.className;
			this.className = c.substring(c.indexOf(" ") + 1, c.length);
			
			var other = this.nextSibling;
			if (other == null || other.firstChild.id != this.firstChild.id) {
				other = this.previousSibling;
				if (other == null || other.firstChild.id != this.firstChild.id)
					other = null;
			}
			
			if (other != null) {
				c = other.className;
				other.className = c.substring(c.indexOf(" ") + 1, c.length);
			}
		},
		
		isValidCheckDigit: function(value) {
			if (value == null) return false;
			
			if (value.length < 3 || value.indexOf('-') != value.length - 2)
				return false;
			
			var checkDigit = value.charAt(value.length - 1).valueOf();
			
			var valueWithoutCheckDigit = value.substr(0, value.length - 2);
			
			return (checkDigit == this.getCheckDigit(valueWithoutCheckDigit));
		},
		
		getCheckDigit: function(value) {
		
			// allowable characters within identifier
			var validChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVYWXZ_";
			
			if (this.stripCharsInBag(value, validChars) != "") {
				//Invalid character in string
			}
			
			// remove whitespace
			value = value.replace([ 	], "");
			// convert to uppercase
			value = value.toUpperCase();
			
			// running total
			var sum = 0;
			
			//alert("sum: " + sum + " ch: " + ch + " digit: " + digit + " weight: " + weight);
			
			// loop through digits from right to left
			for (var i = 0; i < value.length; i++) {
				//set ch to "current" character to be processed
				var ch = value.charCodeAt(value.length - i - 1);
				var digit = ch - 48;
				var weight;
				if (i % 2 == 0) {
					// for alternating digits starting with the rightmost, we use our formula
					// this is the same as multiplying x 2 and adding digits together for values
					// 0 to 9.  Using the following formula allows us to gracefully calculate a
					// weight for non-numeric "digits" as well (from their ASCII value - 48).
					weight = (2 * digit) - Math.floor(digit / 5) * 9;
				}
				else {
					// even-positioned digits just contribute their ascii value minus 48
					weight = digit;
				}
				// keep a running total of weights
				sum = sum + weight;
			}	
		 	// avoid sum less than 10 (if characters below "0" allowed, this could happen)
		 	sum = Math.abs(sum) + 10;
			// check digit is amount needed to reach next number divisible by ten 
			return (10 - (sum % 10)) % 10;
			
		},
		
		stripCharsInBag: function(s, bag){
			var i;
		    var returnString = "";
		    // Search through string's characters one by one.
		    // If character is not in bag, append to returnString.
		    for (i = 0; i < s.length; i++){   
		        var c = s.charAt(i);
		        if (bag.indexOf(c) == -1) returnString += c;
		    }
		    return returnString;
		},
		
		autoJump: true,
		allowAutoJump: function() {
			if (this.autoJump == false) {
				this.autoJump = true;
				return false;
			}
			//	only allow the first item to be automatically selected if:
			//		the entered text is a string or the entered text is a valid identifier
			return (this.lastPhraseSearched.match(/\d/) == false || this.isValidCheckDigit(this.lastPhraseSearched));	
		}
		
	},
	"html"
);
