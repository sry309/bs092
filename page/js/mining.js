$(function(){
    
    var selected = {};
    
    
    var getCols = function() {
        
        var user = getUser();
        var proj = localStorage.getItem('proj');
        var token = localStorage.getItem('token');
        var rsrc = localStorage.getItem('rsrc');
        $('#rsrc-name').text(rsrc);
        
        var url = getUrl() + '/System/Resource?userid=' + user.id + '&project=' + 
            token + '/' + proj + '&resource=' + rsrc
        $.ajax({
            type: "GET", 
            url: url, 
            dataType: "xml",
            beforeSend: function (request) {
                request.setRequestHeader("passwd", user.pw);
            }
        }).done(function(data){
            var $data = $(data);
            var errmsg = $data.find("error").text();
            if (errmsg.length !== 0)
                alert(errmsg);
            else
                loadCols($(data).find("Column"));

        }).fail(function(data, status, e){
            alert("network error");
        });
    };
    
    var loadCols = function($list) {
        $('.cols-row').remove();
        for(var i = 0; i < $list.length; i++)
        {
            var $item = $list.eq(i);
            var name = $item.children('ColumnName').text();
            var alias = $item.children('AttributeName').text();
            var size = $item.children('Size').text();
            var isNotNull = $item.children('NotNull').text();
            var type = $item.children('Type').text();
            if(size) type += ' * ' + size;
            
            var $tr = $('<tr class="cols-row"></tr>');
            var $nameTd = $('<td class="cols-name">' + name + '</td>');
            var $aliasTd = $('<td>' + alias + '</td>');
            var $typeTd = $('<td>' + type + '</td>');
            var $isNotNullTd = $('<td>' + isNotNull + '</td>');
            var $opTd = $('<td></td>');
            var $selectCheck = $('<input type="checkbox" class="cols-select" />');
            $opTd.append($selectCheck);
            $tr.append($nameTd);
            $tr.append($aliasTd);
            $tr.append($typeTd);
            $tr.append($isNotNullTd);
            $tr.append($opTd);
            $('#cols-table').append($tr);
        }
        $('.cols-select').click(selectCol);
    };
    
    var selectCol = function() {
        
        var $this = $(this);        
        var name = $this.parent().parent().children('.cols-name').text();
        
        if($this.is(':checked'))
            selected[name] = name;
        else
            delete selected[name];
        
        console.log(selected);
    };
    
    var mining = function() {
        
        var user = getUser();
        var proj = localStorage.getItem('proj');
        var token = localStorage.getItem('token');
        var rsrc = localStorage.getItem('rsrc');
        
        var type = $('#type-combo').val();
        var algo = $('#algo-combo').val();
        var start = $('#start-num').val();
        var count = $('#count-num').val();
        if(count == "-1") count = "";
        
        var predictStart = $('#predict-start-num').val();
        var predictCount = $('#predict-count-num').val();
        if(predictCount == "-1") predictCount = "";
        var label = $('#predict-label-text').val();
        if(type == "classify" && label == "")
        {
            alert('请填写标签。');
            return;
        }
        
        var cols = [];
        for(var k in selected)
            cols.push(k);
        
        if(cols.length == 0)
        {
            alert('请选择要挖掘的列！');
            return;
        }
        cols = JSON.stringify(cols);
        
        var url = './mining/' + token + '/' + proj + '/' + rsrc + '/';
        var data = 'algo=' + algo + '&start=' + start + "&count=" + 
            count + '&cols=' + cols;
        if(type == "classify")
        {
            data += '&predictStart=' + predictStart + '&predictCount=' + 
                predictCount + '&label=' + label;
        }
        
        $.ajax({
            type: "POST", 
            url: url, 
            data: data,
            dataType: "json",
            contentType: "application/x-www-form-urlencoded"
        }).done(function(data){
           if(!data.succ)
               alert(data.msg);
           else {
               alert('已提交。');
               location.href = './history.html';
           }
        }).fail(function(data, status, e){
            alert("network error");
        });
    };
    
    var initAlgoType = function() {
        
        var $typeCombo = $('#type-combo');
        for(type in algos)
            $('<option value="' + type + '">' + algoDict[type] + '</option>').appendTo($typeCombo);
        $typeCombo.on('change', changeAlgoType);
        changeAlgoType.call($typeCombo);
    };
    
    var changeAlgoType = function() {
        
        var type = $(this).val();
        var $algoCombo = $('#algo-combo');
        $algoCombo.empty();
        for(var i in algos[type])
        {
            var algo = algos[type][i];
            $('<option value="' + algo + '">' + algoDict[algo] + '</option>').appendTo($algoCombo);
        }
        
        if(type == "classify")
            $('.classify-req').removeClass('hidden');
        else
            $('.classify-req').addClass('hidden');
    };
    
    getCols();
    initAlgoType();
    $('#mining-btn').click(mining);
});