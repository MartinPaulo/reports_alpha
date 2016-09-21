'use strict';

var report = report || {};

report.d3 = function () {

    utils.createFacultyButtons();
    utils.createDateButtons();
    /* mixin method to return colour value from colour classes */

    var getColour = function (key) {
        return key in this && typeof this[key] === 'string' ? this[key] : 'black';
    };

    var facultyColours = {
        'VCAMCM': '#1f77b4',
        'VAS': '#ff7f0e',
        'FoS': '#2ca02c',
        'MDHS': '#d62728',
        'MLS': '#9467bd',
        'MSE': '#8c564b',
        'MGSE': '#e377c2',
        'FBE': '#7f7f7f',
        'FoA': '#bcbd22',
        'ABP': '#17becf',
        'services': 'red',
        'external': 'green',
        'unknown': 'blue',

        get: getColour
    };

    var render = function () {
        //var data_path = '/reports/manufactured/faculty_allocated/?from=' + utils.findFrom() + '&type=' + utils.findType();
        var data_path = '/reports/actual/?from=' + utils.findFrom() + '&model=StorageAllocatedByFaculty';
        d3.select('#a_data').attr('href', data_path);
        //d3.json(data_path, utils.getStorageChart({'useFacultyColours': true}));
        d3.csv(data_path, function (error, csv) {
            if (error) {
                console.log('Error on loading data: ' + error);
                return;
            }
            csv.sort(function (a, b) {
                return new Date(a['date']) - new Date(b['date']);
            });

            // convert the csv passed in as an argument into the format that nvd3 prefers.
            var nvd3Data = [];
            var types = ['VCAMCM', 'VAS', 'FoS', 'MDHS', 'MLS', 'MSE', 'MGSE',
                'FBE', 'FoA', 'ABP', 'services', 'external', 'unknown'];
            for (var i = 0; i < types.length; i++) {
                var o = {};
                o.key = types[i];
                o.values = csv.map(function (d) {
                    return [new Date(d['date']).getTime(), parseInt(d[types[i].toLowerCase()])];
                });
                nvd3Data.push(o)
            }
            var chart = nv.models.stackedAreaChart()
                .margin({right: 100})
                .x(function (d) {
                    return d[0]
                })
                .y(function (d) {
                    return d[1]
                })
                .useInteractiveGuideline(true)  // Tooltips which show the data points. Very nice!
                .rightAlignYAxis(true)          // Move the y-axis to the right side.
                .showControls(false)            // Don't allow user to choose 'Stacked', 'Stream' etc...
                .clipEdge(true)
                .noData('No Data available')
                .color(function (d) {
                    return facultyColours.get(d['key']);
                });

            chart.xAxis
                .tickFormat(function (d) {
                    return d3.time.format('%Y-%m-%d')(new Date(d))
                })
                .axisLabel('Date');

            chart.yAxis
                .tickFormat(d3.format(',.2f'))
                .axisLabel('TB');

            d3.select('#chart svg')
                .datum(nvd3Data)
                .transition().duration(500)
                .call(chart);

            // Update chart when the window resizes
            nv.utils.windowResize(chart.update);

            return chart;
        });
    };

    d3.select('#chart svg')[0][0].addEventListener('redraw', function (e) {
        render();
    }, false);

    utils.generateFacultyKey();

    return {
        render: render
    }
}();
