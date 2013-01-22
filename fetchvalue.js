 var links = document.getElementsByName('id');
 var processid = document.getElementsByName('bm_cm_process_id');
 var versionid = document.getElementsByName('version_id');
 retValue = "";
 if (links[0] == undefined || links[0] == "undefined" || links[0].value == "-1" || links[0].value == -1) {
     retValue = "Not a Quote Page";
 } else {
     retValue = links[0].value;
 }

 if (processid[0] == undefined || processid[0] == "undefined") {
     retValue = retValue + "$$" + "Not a Quote Page";
 } else {
     retValue = retValue + "$$" + processid[0].value;
 }

 if (versionid[0] == undefined || versionid[0] == "undefined") {
     retValue = retValue + "$$" + "Not a Quote Page";
 } else {
     retValue = retValue + "$$" + versionid[0].value;
 }

 chrome.extension.sendRequest(retValue);
