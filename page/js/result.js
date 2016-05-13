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
                if(type != 'assoc')
                    data = data.map(function(e){return [e[0], e[1], JSON.parse(e[2])]});
                //window.data = data;
                var totalPage = Math.floor((data.length - 1) / pageCap) + 1;
                loadPagBar(1, totalPage, data);
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
    
    var loadCharts = function(list) {
        
        var keyList = keys(list[0][2]);
        
        loadTotalChart(list);
        loadDistChart(list, keyList.slice(0, 2));
        
        var $keyOptions = keyList.map(function(k){return $('<option value="' + k + '">' + k + '</option>');});
        $('#col1-combo').append($keyOptions);
        $keyOptions = keyList.map(function(k){return $('<option value="' + k + '">' + k + '</option>');});
        $('#col2-combo').append($keyOptions);
        $('#gen-btn').click(function(){genDistChart(list);});
    };
    
    var loadTotalChart = function(list) {
        if(type != 'cluster' && type != 'classify') {
            $('.visual-panel').addClass('hidden');
            return;
        }
        
        $('#total-svg').empty();
        
        var labelCountMap = {};
        for (var i = 0; i < list.length; i++) {
            var elem = list[i];
            var label = elem[1];
            var num = labelCountMap[label] || 0;
            labelCountMap[label] = num + 1;
        }
        var labels = keys(labelCountMap);
        var counts = values(labelCountMap);
        
        var svg = d3.select("#total-svg")
            .attr('width', 400).attr('height', 400);
        var width = svg.attr("width");
        var height = svg.attr("height") - 20;
        var xScale = d3.scale.ordinal()
            .domain(d3.range(counts.length))
            .rangeRoundBands([0, width]);
        var yScale = d3.scale.linear()
            .domain([0,d3.max(counts)])
            .range([height, 0]);
        var rectPadding = 4;
        var rects = svg.selectAll(".rect")
            .data(counts)
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
                return labelToColor(labels[i]);
            });
            
        var texts = svg.selectAll(".text")
            .data(counts)
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
            .attr('fill', 'white');
            
        var texts = svg.selectAll(".label")
            .data(labels)
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
            .attr('fill', 'black');
    };
    
    var genDistChart = function(data) {
        var col1 = $('#col1-combo').val();
        var col2 = $('#col2-combo').val();
        if(!col1 || !col2) return;
        loadDistChart(data, [col1, col2]);
    };
    
    var loadDistChart = function(data, cols) {
        if(type != 'cluster' && type != 'classify') {
            //$('.visual-panel').addClass('hidden');
            return;
        }
        
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
            
        // 绘制凸包
        var pointsByLabel = {};
        for (var i = 0; i < data.length; i++) {
            var elem = data[i];
            var label = elem[1];
            var arr = pointsByLabel[label] || [];
            var p = {x: elem[2][xCol], y: elem[2][yCol]};
            arr.push(p);
            pointsByLabel[label] = arr;
        }
        
        for (var label in pointsByLabel) {
            console.log('label: ' + label);
            console.log('points: ' + JSON.stringify(pointsByLabel[label]));
            var convex = graham(pointsByLabel[label]);
            var linesData = [];
            for(var i = 0; i < convex.length - 1; i++)
                linesData.push([convex[i], convex[i + 1]]);
            linesData.push([convex[convex.length - 1], convex[0]]);
            console.log('lines: ' + JSON.stringify(linesData));
            
            var lines = svg.selectAll('.line')
                .data(linesData)
                .enter()
                .append('line')
                .attr('x1', function(d) {return xScale(d[0].x);})
                .attr('y1', function(d) {return yScale(d[0].y);})
                .attr('x2', function(d) {return xScale(d[1].x);})
                .attr('y2', function(d) {return yScale(d[1].y);})
                .attr("transform","translate(" + padding.left + "," + padding.top + ")")
                .attr('stroke', labelToColor(label));
        }
    };
    
    getResult();
});