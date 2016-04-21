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
                loadResult(json.data);
        }).fail(function(data) {
            alert('Network error!');
        });
    };
    
    var loadResult = function(list) {
        
        $('.result-row').remove();
        for (var i = 0; i < list.length; i++) {
            var elem = list[i];
            
            var $tr = $('<tr class="result-row"></tr>')
            var $idTd = $('<td>' + elem[0] + '</td>');
            var $labelTd = $('<td>' + elem[1] + '</td>');
            
            $tr.append($idTd);
            $tr.append($labelTd);
            $('#result-table').append($tr);
            
        }
    };
    
    getResult();
});