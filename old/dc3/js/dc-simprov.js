function setupSimprov(normalChartSpecs, rangeChartSpecs, thumbnailOptions) {
    const normalChartIds = normalChartSpecs.map(function(d) { return d.id; });
    const rangeChartIds = rangeChartSpecs.map(function(d) { return d.id; });
    const allChartSpecs = [...normalChartSpecs,...rangeChartSpecs];
    const chartDivs = new Map(allChartSpecs.map(function(d) { return [d.id.toString(), d.divId]; }));
    const chartLabels = new Map(allChartSpecs.map(function(d) { return [d.id.toString(), d.label || "C" + d.id.toString()];}));

    // Thumbnail Config
    if (!thumbnailOptions) {
        thumbnailOptions = {}
    }
    let thumbnailScale = thumbnailOptions.scale || 2;
    let thumbnailEncoding = thumbnailOptions.encoding || 'png';
    let thumbnailDivId = thumbnailOptions.divId || 'body';
    let thumbnailDelay = thumbnailOptions.delay || 1000;

    let captureThumbnail = function (change) {
        change.captureThumbnail(thumbnailDivId, thumbnailDelay,
            {scale: thumbnailScale, encoding: thumbnailEncoding});
    };

    let allCharts = [...dc.chartRegistry.list()];
    const allChartIds = [...normalChartIds,...rangeChartIds];
    allCharts = allCharts.filter(function(d) { return allChartIds.indexOf(d.chartID()) > -1; });
    const chartMap = new Map(allCharts.map(function(d) { return [d.chartID().toString(), d]}));
    const normalCharts = normalChartIds.map(function(d) { return chartMap.get(d.toString()); });
    const rangeCharts = rangeChartIds.map(function(d) { return chartMap.get(d.toString()); });


    // globals
    let noRecord = false;
    let resetTrigger = false;

    function getVizState() {
        let state = {};
        allCharts.forEach(function(chart) {
            state[chart.chartID().toString()] = chart.filters().slice();
        });
        return state;
    }

    function setVizState(state) {
        noRecord = true;
        dc.filterAll();
        Object.keys(state).forEach(function(chartID) {
            let chart = chartMap.get(chartID);
            if (rangeCharts.indexOf(chart) > -1) {
                if (state[chartID].length > 0) {
                    let filters = state[chartID][0];
                    if (typeof filters[0] == "string") {
                        filters = filters.map(function(d) { return new Date(d);});
                    }
                    chart.filter(filters);
                }
            } else {
                state[chartID].forEach(function(filter) {
                    chart.filter(filter);
                });
            }
        });
        dc.redrawAll();
        noRecord = false;
    }

    let ResetFilters = SIMProv.createChangeClass('ResetFilters',
        function() {
            noRecord = true;
            dc.filterAll();
            dc.redrawAll();
            noRecord = false;
        });

    let ResetChart = SIMProv.createChangeClass('ResetChart',
        function() {
            noRecord = true;
            chartMap.get(this.data.chartId).filterAll();
            chartMap.get(this.data.chartId).redrawGroup();
            noRecord = false;
        });

    let ResetChartState = SIMProv.createChangeClass('ResetChartChange',
        function(state) {
            state[this.data.chartId] = [];
            return state;
        });

    let AddFilter = SIMProv.createChangeClass('AddFilter',
        function()  {
            noRecord = true;
            chartMap.get(this.data.chartId).filter(this.data.filter);
            chartMap.get(this.data.chartId).redrawGroup();
            noRecord = false;
        });

    let DeleteFilter = SIMProv.createChangeClass('DeleteFilter',
        function() {
            noRecord = true;
            chartMap.get(this.data.chartId).filter(this.data.filter);
            chartMap.get(this.data.chartId).redrawGroup();
            noRecord = false;
        });

    let AddFilterState = SIMProv.createStateChangeClass('AddFilterState',
        function(state) {
            state[this.data.chartId].push(this.data.filter);
            return state;
        });

    let DeleteFilterState = SIMProv.createStateChangeClass('DeleteFilterState',
        function(state)  {
            let idx = state[this.data.chartId].indexOf(this.data.filter);
            if (idx > -1) state[this.data.chartId].splice(idx, 1);
            return state;
        });

    let ChangeRangeFilter = SIMProv.createChangeClass('ChangeRangeFilter',
        function() {
            noRecord = true;
            // FIXME may only work for this example
            console.log("RUNNING CHANGE RANGE FILTER", this.data);
            console.trace();
            chartMap.get(this.data.chartId).filter(null);
            if (this.data.filter && this.data.filter.length) {
                let filters = this.data.filter[0];
                if (typeof filters[0] == "string") {
                    filters = this.data.filter[0].map(function (d) {
                        return new Date(d);
                    });
                }
                chartMap.get(this.data.chartId).filter(filters);
            }
            chartMap.get(this.data.chartId).redrawGroup();
            noRecord = false;
        });

    let ChangeRangeFilterState = SIMProv.createStateChangeClass('ChangeRangeFilterState',
        function(state) {
            state[this.data.chartId] = this.data.filter;
            return state;
        });

    let AddAction = SIMProv.createActionClass('AddAction',
        change=AddFilter,
        inverse=DeleteFilter,
        stateChange=AddFilterState,
        stateInverse=DeleteFilterState);

    let DeleteAction = SIMProv.createActionClass('DeleteAction',
        change=DeleteFilter,
        inverse=AddFilter,
        stateChange=DeleteFilterState,
        stateInverse=AddFilterState);

    let ResetAction = SIMProv.createActionClass('ResetAction',
        change=ResetChart,
        inverse=null,
        stateChange=ResetChartState);

    function formatRange(filter) {
        console.log("FILTER", filter);
        if ( filter[0][0] instanceof Date ) {
            function pad(s) {
                return (s < 10) ? '0' + s : s;
            }
            return "[" + filter[0].map(function(d) {
                    return [pad(d.getMonth() + 1), pad(d.getDate()), d.getFullYear()].join('/') }).join(',\n') + ']';
        } else {
            return "[" + filter.toString() + "]";
        }
    }

    let ChangeRangeAction = SIMProv.createActionClass('ChangeRangeAction',
        change=ChangeRangeFilter,
        null,
        stateChange=ChangeRangeFilterState);

    // Create Trail
    let trail = new SIMProv.UITrail()
    // .attr('viz', 'myViz')
    // .attr('test', 'myConsoleTest')
        .addControls()
        .renderTo('#controls')
        .init(getVizState());

    trail.registerClass(AddAction);
    trail.registerClass(DeleteAction);
    trail.registerClass(ResetAction);
    trail.registerClass(ChangeRangeAction);
    trail.registerClass(AddFilter);
    trail.registerClass(DeleteFilter);
    trail.registerClass(ResetChart);
    trail.registerClass(AddFilterState);
    trail.registerClass(DeleteFilterState);
    trail.registerClass(ResetChartState);
    trail.registerClass(ChangeRangeFilter);

// Add Checkpoint Rule
    trail.checkpoint().clearRules().addRule(function (change) {
        return change.nodeInMasterTrail().childNodes().length > 1;
    });

// Get and Set the state of visualization
    trail.resetChange = new ResetFilters();
    trail.getState(getVizState);
    trail.setState(setVizState);

    function filterAction(chart, filter) {
        console.log("FILTER ACTION", chart, filter);
        if (noRecord) {
            console.log("NO RECORD");
            return;
        }
        console.log("RECORD");
        const chartId = chart.chartID().toString();
        if (resetTrigger) {
            const actionData = {'chartId': chartId};
            let action = new ResetAction("Reset " + chartLabels.get(chartId),
                actionData);
            trail.record(action)
                .then(captureThumbnail)
                .catch(console.log);
        } else {
            const actionData = {
                'chartId': chartId,
                'filter': filter
            };
            if (chart.hasFilter(filter)) {
                let action = new AddAction(chartLabels.get(chartId) + " +" + filter.toString(),
                    actionData);
                trail.record(action)
                    .then(captureThumbnail)
                    .catch(console.log);
            } else {
                let action = new DeleteAction(chartLabels.get(chartId) + " -" + filter.toString(),
                    actionData);
                trail.record(action)
                    .then(captureThumbnail)
                    .catch(console.log);
            }
        }
        resetTrigger = false;
    }

    normalCharts.forEach(function(chart) {
        chart.on('filtered', filterAction);

        d3.select('#' + chartDivs.get(chart.chartID().toString()) + " a.reset").on('click', () => {
            resetTrigger = true;
        });
    });

    rangeCharts.forEach(function(chart) {
        chart.brush().on("brushend.monitor", () => {
            setTimeout(() => {
                const chartId = chart.chartID().toString();
                const actionData = {
                    chartId: chartId,
                    filter: chart.filters().slice()
                };
                let action = new ChangeRangeAction(
                    chartLabels.get(chartId) + " " + formatRange(actionData.filter),
                    actionData);
                trail.record(action).then(captureThumbnail);
            });
        });

        d3.select('#' + chartDivs.get(chart.chartID().toString()) + " a.reset").on('click', () => {
            const actionData = {'chartId': chartId};
            let action = new ResetAction("Reset" + chartLabels.get(chartId),
                actionData);
            trail.record(action)
                .then(captureThumbnail)
                .catch(console.log);
        });
    });

// Capture initial thumbnail
    setTimeout(() => {
        captureThumbnail(trail.getActionById('root-node'));
    }, thumbnailDelay);

    return trail;

}