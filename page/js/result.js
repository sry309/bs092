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
                var data = json.data;
                data = data.map(function(e){return [e[0], e[1], JSON.parse(e[2])]});
                //window.data = data;
                var totalPage = Math.floor((data.length - 1) / pageCap) + 1;
                loadPagBar(1, totalPage, data);
                loadResult(data.slice(0, pageCap));
                loadTotalChart(data);
                loadDistChart(data, keys(data[0][2]).slice(0, 2));
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
                var dataStr = htmlSpecialChars(formatData(elem[2]));
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
    
    var loadTotalChart = function(list) {
        if(type != 'cluster' && type != 'classify')
            return;
        
        $('#total-svg').empty();
        
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
        var height = svg.attr("height") - 20;
        var xScale = d3.scale.ordinal()
            .domain(d3.range(arr.length))
            .rangeRoundBands([0, width]);
        var yScale = d3.scale.linear()
            .domain([0,d3.max(arr)])
            .range([height, 0]);
        var rectPadding = 4;
        var rects = svg.selectAll(".rect")
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
            .attr("fill", function(d, i) {
                return labelToColor(i);
            });
            
        var texts = svg.selectAll(".text")
            .data(arr)
            .enter()
            .append("text")
            //.attr("class","MyText")
            //.attr("transform","translate(" + padding.left + "," + padding.top + ")")
            .attr("x", function(d,i){
                return xScale(i) + rectPadding/2;
            } )
            .attr("y",function(d){
                return yScale(d);
            })
            .attr("dx",function(){
                return (xScale.rangeBand() - rectPadding)/2 - 10;
            })
            .attr("dy", 20)
            .text(function(d){
                return d;
            })
            .style('fill', 'white');
            
        var xAxis = keys(arr);
        var texts = svg.selectAll(".label")
            .data(xAxis)
            .enter()
            .append("text")
            //.attr("class","MyText")
            //.attr("transform","translate(" + padding.left + "," + padding.top + ")")
            .attr("x", function(d,i){
                return xScale(i) + rectPadding/2;
            } )
            .attr("y", height)
            .attr("dx",function(){
                return (xScale.rangeBand() - rectPadding)/2 - 5;
            })
            .attr("dy", 20)
            .text(function(d){
                return d;
            })
            .style('fill', 'black');
    };
    
    var loadDistChart = function(data, cols) {
        if(type != 'cluster' && type != 'classify')
            return;
        
        $('#dist-svg').empty();
        
        var xCol = cols[0];
        if(!xCol) throw new Error();
        var yCol = cols[1] || cols[0];
        var xArr = data.map(function(e){return e[2][xCol];})
        var yArr = data.map(function(e){return e[2][yCol];})
        
        var padding = {left: 30, right: 10, top: 10, bottom: 20};
        var svg = d3.select("#dist-svg")
            .attr('width', 400).attr('height', 400);
        var width = svg.attr("width") - padding.left - padding.right;
        var height = svg.attr("height") - padding.top - padding.bottom;
        var xScale = d3.scale.linear()
            .domain([0, d3.max(xArr)])
            .range([0, width]);
        var yScale = d3.scale.linear()
            .domain([0, d3.max(yArr)])
            .range([height, 0]);
        
        var circles = svg.selectAll('.circle')
            .data(data)
            .enter()
            .append("circle")
            .attr('cx', function(d) {
                return xScale(d[2][xCol]);
                console.log(d);
            })
            .attr('cy', function(d) {
                return yScale(d[2][yCol]);
            })
            .attr('r', 3)
            .attr("transform","translate(" + padding.left + "," + padding.top + ")")
            .attr('fill', function(d) {
                return labelToColor(d[1]);
            });
        
        var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left");
        svg.append("g")
            .attr("class","axis")
            .attr("transform","translate(" + padding.left + "," + padding.top + ")")
            .call(yAxis);
            
        var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom");
        svg.append("g")
            .attr("class","axis")
            .attr("transform","translate(" + padding.left + "," + (height + padding.top) + ")")
            .call(xAxis); 
    };
    
    getResult();
});