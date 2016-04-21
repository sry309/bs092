$(function() {
    
    var id = localStorage.getItem('resultId');
    var type = localStorage.getItem('resultType');
    var rsrc = localStorage.getItem('resultRsrc');
    $('#rsrc-name').text(rsrc);

    
    var getResult = function() {
        $.ajax({
            type: "GET",
            url: "result/" + id + '/',
            dataType: "json"
        }).done(function(json) {
            if (!json.succ) 
                alert(json.errmsg);
            else
                getData(json.data);
        }).fail(function(data) {
            alert('Network error!');
        });
    };
    
    var getData = function(result) {
        
        var rsrcName = rsrc.split('/')[2];
        var url = getUrl() + '/Entity/' + rsrc + '/';
        $.ajax({
            type: "GET",
            url: url,
            dataType: "json"
        }).done(function(json) {
            if (!json[rsrcName]) 
                alert('Network error!');
            else
                loadResult(result, json[rsrcName]);
        }).fail(function(data) {
            alert('Network error!');
        });
    };
    
    var loadResult = function(result, data) {
        
        /*// deal with data
        if(data.length == 0)
            throw new Error();
        
        var keys = {}
        for(var k in data[0]);
            
        
        var dataMap = {}
        for(var i = 0; i < data.length; i++)
        {
            var elem = data[i];
            var id = elem.id;
            delete elem.id;
            dataMap[id] = elem;
        }
        
        $('.result-row').remove();
        for (var i = 0; i < list.length; i++) {
            var elem = list[i];
            
            var $tr = $('<tr class="result-row"></tr>')
            var $idTd = $('<td>' + elem[0] + '</td>');
            var $labelTd = $('<td>' + elem[1] + '</td>');
            
            $tr.append($idTd);
            $tr.append($labelTd);
            $('#result-table').append($tr);
            
        }*/
    };
    
    getResult();
});