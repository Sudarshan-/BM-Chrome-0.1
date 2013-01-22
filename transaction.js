var value = "";
var processid = "";
var transactionid = "";
var tabid = "";
var companyname = "";
var processInfoString = "";
var versionid = "";
var selectedprocess = "";
// Display all visible links.
function showLinks() {
    //console.log(window.location.href);
    returnvalue = value.split("$$");
    document.getElementById('transaction').value = returnvalue[0];
    chrome.tabs.get(tabid, function (tab) {
        var tabUrl = tab.url;
        var contentToLookFor = "https://";
        var pos1 = tabUrl.indexOf(contentToLookFor);
        var posEnd = pos1 + contentToLookFor.length + 45; //random number.
        var strExtract = tabUrl.substring(pos1, posEnd);
        //console.log(strExtract);
        var newPos1 = contentToLookFor.length;
        var newPosEnd = strExtract.indexOf(".big");
        companyname = strExtract.substring(newPos1, newPosEnd);
        //console.log(companyname);
    });
    if (returnvalue[0].indexOf("Not") != -1 || returnvalue[0] == "-1") {
        document.getElementById('xmlview').disabled = "disabled";
        document.getElementById('quotesearch').disabled = "disabled";
    }
    transactionid = returnvalue[0];
    processid = returnvalue[1];
    versionid = returnvalue[2];
}




// Add links to allLinks and visibleLinks, sort and show them.  send_links.js is
// injected into all frames of the active tab, so this listener may be called
// multiple times.
chrome.extension.onRequest.addListener(function (links) {
    //alert(links[0].value);
    value = links;
    showLinks();
});

function filtersearch() {
    //console.log(this.value);

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function (data) {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                //console.log(xhr.responseText);
                var defaultFilterSelected = false;
                var strToLookFor = "href='edit_column.jsp?id=";
                var currentCommerceProcPosition = xhr.responseText.indexOf(strToLookFor);
                var remainingStr = "";
                var menuElem = "";
                while (currentCommerceProcPosition != -1) {
                    if (remainingStr == "") {
                        remainingStr = xhr.responseText.substring(currentCommerceProcPosition + strToLookFor.length);
                    } else {
                        remainingStr = remainingStr.substring(currentCommerceProcPosition + strToLookFor.length);
                    }

                    var currentCommerceProcID = remainingStr.substring(0, remainingStr.indexOf("'"));
                    var endPosToLookFor = remainingStr.indexOf("</");
                    var currentCommerceProcName = remainingStr.substring(remainingStr.indexOf(">") + 1, endPosToLookFor);
                    currentCommerceProcName = currentCommerceProcName.replace(/&#32;/g, "");
                    //console.log(currentCommerceProcID);
                    //console.log(currentCommerceProcName);
                    filterId = currentCommerceProcID;
                    filterName = currentCommerceProcName;
                    if ((!defaultFilterSelected) && (filterName.indexOf("Number") > -1) && (filterName.indexOf("Quote") > -1)) {
                        menuElem = menuElem + "<option value='" + filterId + "' selected='selected'>" + filterName + "</option>";
                        defaultFilterSelected = true;
                    } else {
                        menuElem = menuElem + "<option value='" + filterId + "'>" + filterName + "</option>";
                    }
                    //console.log(menuElem);
                    remainingStr = remainingStr.substring(endPosToLookFor);
                    currentCommerceProcPosition = remainingStr.indexOf(strToLookFor);
                }


                selectcontent = "<select name='filters' id='filters'>" + menuElem + "</select>";
                document.getElementById('filtersdiv').innerHTML = selectcontent;
                document.getElementById('contentplace').innerHTML = "<input type='text' id='filterdata'></input><button id=\"go\" value=\"go\">Go!</button>";
                document.getElementById('go').onclick = results;
            }
        } else {
            //callback(null);
        }
    }


    // Note that any URL fetched here must be matched by a permission in
    // the manifest.json file!
    //https://testtcl.bigmachines.com/commerce/buyside/search/cm_search.jsp?process_id=
    var url = 'https://' + companyname + '.bigmachines.com/admin/commerce/columns/list_columns.jsp?process_id=' + this.value;
    selectedprocess = this.value;
    //console.log(url);
    xhr.open('GET', url, true);
    xhr.send();

}

function drawTable() {
    processarray = processInfoString.split("^^");
    tablecontent = "<table id=\"processcontent\">";
    for (i = 0; i < processarray.length && processarray[i] != ''; i++) {

        processdetails = processarray[i].split("~~");
        if (processdetails[0] == processid) {
            tablecontent = tablecontent + "<tr><td><input type='radio' value=" + processdetails[0] + " name='processval' id='processval" + i + "'>" + processdetails[1] + "</input></td></tr>";
        } else {
            tablecontent = tablecontent + "<tr><td><input type='radio' disabled=\"disabled\" value=" + processdetails[0] + " name='processval' id='processval" + i + "'>" + processdetails[1] + "</input></td></tr>";
        }


    }
    tablecontent = tablecontent + "</table>";
    document.getElementById('processtable').innerHTML = tablecontent;
    for (i = 0; i < processarray.length && processarray[i] != ''; i++) {
        idvalue = "processval" + i;
        //console.log(document.getElementById(idvalue));
        document.getElementById(idvalue).onchange = filtersearch;
    }
}

function searchquotes() {

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function (data) {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {

                var strToLookFor = "\"edit_process.jsp?id=";
                var currentCommerceProcPosition = xhr.responseText.indexOf(strToLookFor);
                var remainingStr = "";
                while (currentCommerceProcPosition != -1) {
                    if (remainingStr == "") {
                        remainingStr = xhr.responseText.substring(currentCommerceProcPosition + strToLookFor.length);
                    } else {
                        remainingStr = remainingStr.substring(currentCommerceProcPosition + strToLookFor.length);
                    }

                    var currentCommerceProcID = remainingStr.substring(0, remainingStr.indexOf("\""));
                    var endPosToLookFor = remainingStr.indexOf("</");
                    var currentCommerceProcName = remainingStr.substring(remainingStr.indexOf(">") + 1, endPosToLookFor);
                    currentCommerceProcName = currentCommerceProcName.replace(/&#32;/g, " ");

                    processInfoString = processInfoString + currentCommerceProcID + "~~" + currentCommerceProcName + "^^";

                    remainingStr = remainingStr.substring(endPosToLookFor);
                    currentCommerceProcPosition = remainingStr.indexOf(strToLookFor);
                }
                //console.log(processInfoString);
                if (processInfoString != "") {
                    drawTable();
                }
            }
        } else {
            //callback(null);
        }
    }


    // Note that any URL fetched here must be matched by a permission in
    // the manifest.json file!
    //https://testtcl.bigmachines.com/admin/commerce/processes/list_processes.jsp?_bm_trail_refresh_=true
    var url = 'https://' + companyname + '.bigmachines.com/admin/commerce/processes/list_processes.jsp?_bm_trail_refresh_=true';
    //console.log(url);
    xhr.open('GET', url, true);
    xhr.send();

}

function results() {
    if (document.getElementById('filters') == undefined || document.getElementById('filters') == 'undefined' || document.getElementById('filters') == undefined || document.getElementById('filters') == 'undefined') {
        document.getElementById('go').style = "display:none";
    } else {
        if (document.getElementById('filters').value != '' && document.getElementById('filterdata').value != '') {
            var searchUrl = 'https://' + companyname + '.bigmachines.com/commerce/buyside/search/search_inputs.jsp?perform_search=true';
            searchUrl = searchUrl + "&process_id=" + selectedprocess;
            searchUrl = searchUrl + "&version_id=" + versionid;
            searchUrl = searchUrl + "&page_length=25";
            searchUrl = searchUrl + "&comp_" + document.getElementById('filters').value + "=" + "_eq";
            searchUrl = searchUrl + "&value_" + document.getElementById('filters').value + "=" + document.getElementById('filterdata').value;
            searchUrl = searchUrl + "&orderHidden_" + document.getElementById('filters').value + "=1";
            searchUrl = searchUrl + "&display_as_link=" + document.getElementById('filters').value;
            searchUrl = searchUrl + "&checkedDisplayAttr=" + document.getElementById('filters').value;
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function (data) {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        console.log(xhr.responseText);
                        var contentToLookFor = "href=\"javascript:parent.window.opener.location = '";
                        var pos1 = xhr.responseText.indexOf(contentToLookFor);
                        console.log(pos1);
                        var posEnd = pos1 + contentToLookFor.length + 195; //random number.
                        var strExtract = xhr.responseText.substring(pos1, posEnd);
                        console.log(strExtract);
                        var newPos1 = contentToLookFor.length;
                        var newPosEnd = strExtract.indexOf("';parent.window");
                        console.log(newPosEnd);
                        relativeUrl = strExtract.substring(newPos1, newPosEnd);
                        url = "https://" + companyname + ".bigmachines.com" + relativeUrl;
                        if (url.indexOf('W3C') != -1) {
                            alert("No Results Found");
                        } else {
                            window.open(url);
                        }
                    }
                    //console.log(processInfoString);
                    if (processInfoString != "") {
                        drawTable();
                    }
                }
            }



            xhr.open('GET', searchUrl, true);
            xhr.send();

        } else {
            alert("Enter Search Data");
        }
    }
}

function showxml() {



    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function (data) {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                //console.log(xhr.responseText);
                var contentToLookFor = "edit_xslt.jsp?id=";
                var pos1 = xhr.responseText.indexOf(contentToLookFor);
                var posEnd = pos1 + contentToLookFor.length + 45; //random number.
                var strExtract = xhr.responseText.substring(pos1, posEnd);
                var newPos1 = contentToLookFor.length;
                var newPosEnd = strExtract.indexOf("\"");
                var xsl_id = strExtract.substring(newPos1, newPosEnd);
                //console.log(xsl_id);
                //callback(data);
                if (isNaN(xsl_id)) {
                    alert("You are not an Administrator to view the Document XML");
                } else {
                    //console.log(companyname);
                    url = "https://" + companyname + ".bigmachines.com/admin/commerce/views/preview_xml.jsp?bs_id=" + transactionid + "&xslt_id=" + xsl_id + "&view_type=document";
                    window.open(url);
                }
            } else {
                //callback(null);
            }
        }
    }

    // Note that any URL fetched here must be matched by a permission in
    // the manifest.json file!
    var url = 'https://' + companyname + '.bigmachines.com/admin/commerce/views/list_xslt.jsp?process_id=' + processid;
    //console.log(url);
    xhr.open('GET', url, true);
    xhr.send();
    //window.open("http://www.w3schools.com");
}

// Set up event handlers and inject send_links.js into all frames in the active
// tab.
window.onload = function () {
    document.getElementById('xmlview').onclick = showxml;
    document.getElementById('quotesearch').onclick = searchquotes;

    chrome.windows.getCurrent(function (currentWindow) {

        chrome.tabs.query({
            active: true,
            windowId: currentWindow.id
        },

        function (activeTabs) {
            tabid = activeTabs[0].id;
            chrome.tabs.executeScript(
            activeTabs[0].id, {
                file: 'fetchvalue.js',
                allFrames: true
            });
        });
    });
};
