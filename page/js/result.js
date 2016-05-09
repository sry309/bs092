var data = null;
var curPage = 1;
var totalPage = 0;

$(function() {
    
    var id = localStorage.getItem('resultId');
    var type = localStorage.getItem('resultType');
    var rsrc = localStorage.getItem('resultRsrc');
    $('#rsrc-name').text(rsrc);
    
    $resultHeadTr = $('#result-head');
    if(type == 'assoc')
    {
        $('<th>关联规则</th>').appendTo($resultHeadTr);
        $('<th>支持度</th>').appendTo($resultHeadTr);
    }
    else if(type == 'classify' || type == 'cluster')
    {
        $('<th>id</th>').appendTo($resultHeadTr);
        $('<th>原始数据</th>').appendTo($resultHeadTr);
        $('<th>标签</th>').appendTo($resultHeadTr);
    }
    else
        throw new Error();
    
    var getResult = function() {
        $.ajax({
            type: "GET",
            url: "result/" + id + '/',
            dataType: "json"
        }).done(function(json) {
            if (!json.succ) 
                alert(json.errmsg);
            else {
                data = json.data;
                totalPage = Math.floor((data.length - 1) / pageCap) + 1;
                loadPagBar(1, totalPage);
                loadResult(data.slice(0, pageCap));
                loadCharts(data);
            }
        }).fail(function(data) {
            alert('Network error!');
        });
    };
    
    
    var loadResult = function(list) {
        
        
        $('.result-row').remove();
        for (var i = 0; i < list.length; i++) {
            var elem = list[i];
            
            var $tr = $('<tr class="result-row"></tr>')
            
            if(type == 'assoc')
            {
                var $ruleTd = $('<td>' + elem[2] + '</td>');
                var $confTd = $('<td>' + elem[1] + '</td>');
                $tr.append($ruleTd);
                $tr.append($confTd);
            }
            else if(type == 'cluster' || type == 'classify')
            {
                var dataStr = htmlSpecialChars(formatData(JSON.parse(elem[2])));
                //var $idTd = $('<td><span data-toggle="tooltip" data-placement="right" title="' + 
                //    dataStr + '">' + elem[0] + '</span></td>');
                var $idTd = $('<td>' + elem[0] + '</td>');
                var $dataTd = $('<td>' + dataStr + '</td>');
                var $labelTd = $('<td>' + elem[1] + '</td>');
                $tr.append($idTd);
                $tr.append($dataTd);
                $tr.append($labelTd);
            }
            else
                throw new Error();

            $('#result-table').append($tr);
        }
        //$('[data-toggle="tooltip"]').tooltip()
    };
    window.loadResult = loadResult;
    
    var formatData = function(data) {
        var arr = [];
        for(var k in data)
            arr.push(k + ': ' + data[k]);
        return arr.join(', ');
    };
    
    var loadCharts = function(list) {
        if(type != 'cluster' && type != 'classify')
            return;
        
        var arr = [];
        for (var i = 0; i < list.length; i++) {
            var elem = list[i];
            var label = elem[1];
            var num = arr[label] || 0;
            arr[label] = num + 1;
        }
        
        var svg = d3.select("#total-svg")
            .attr('width', 400).attr('height', 400);
        var width = svg.attr("width");
        var height = svg.attr("height");
        var xScale = d3.scale.ordinal()
            .domain(d3.range(arr.length))
            .rangeRoundBands([0, width]);
        var yScale = d3.scale.linear()
            .domain([0,d3.max(arr)])
            .range([height, 0]);
        var rectPadding = 4;
        var rects = svg.selectAll("rect")
            .data(arr)
            .enter()
            .append("rect")
            //.attr("class", "MyRect")
            //.attr("transform", "translate(" + padding.left + "," + padding.top + ")")
            .attr("x", function(d,i){
                return xScale(i) + rectPadding/2;
            } )
            .attr("y",function(d){
                return yScale(d);
            })
            .attr("width", xScale.rangeBand() - rectPadding )
            .attr("height", function(d){
                return height - yScale(d);
            })
            .style("fill", "#337ab7");
    };
    
    getResult();
});