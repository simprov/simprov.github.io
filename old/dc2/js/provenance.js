/**
 * Created by Xpert on 7/23/2016.
 */

// All Charts
var allCharts = [usChart, industryChart, roundChart];

console.log("US", usChart.chartID());
console.log("Industry", industryChart.chartID());
console.log("ROUND", roundChart.chartID());

// Create Chart Map
// Will speed up getting and setting state to/from visualization
var chartMap = new Map();
chartMap.set('chart-'+  usChart.chartID(), usChart);
chartMap.set('chart-'+  industryChart.chartID(), industryChart);
chartMap.set('chart-'+  roundChart.chartID(), roundChart);

// Get State of Visualization
function getVizState(){
    var chk = {};
    allCharts.forEach(function(chart){
        chk['chart-' + chart.chartID()] = chart.filters().slice();
    });
    return chk;
}

// Set State of Visualization
function setVizState(state){
    Object.keys(state).forEach(function(chartID){
        chartMap.get(chartID).filter(null);
        state[chartID].forEach(function(filter){
                chartMap.get(chartID).filter(filter);
            });

    }); dc.redrawAll();
}

// Create Trail
var trail = SIMProv.UITrail()
    .attr('viz', 'myViz')
    .attr('test', 'myConsoleTest')
    .addControls()
    .renderTo('#controls')
    .init(getVizState());

// Add Checkpoint Rule
trail.checkpoint().clearRules().addRule(function(change){
    return change.nodeInMasterTrail().childNodes().length > 1;
});

// Get and Set the state of visualization
trail.getState(getVizState);
trail.setState(setVizState);

// Create Add Action
var addAction = trail.createAction('Add')
    .forward(function(state, data){
        state[data.chartId].push(data.filter);
        return state;
    })
    .inverse(function(state, current){
        var idx = state[current.chartId].indexOf(current.filter);
        if(idx > -1) state[current.chartId].splice(idx, 1);
        return state;
    })
    .undo(function(curChange, prevInMaster, prevInSub){
        chartMap.get(curChange.chartId).filter(curChange.filter);
        chartMap.get(curChange.chartId).redrawGroup();
    })
    .redo(function(curChange, nextChange){
        chartMap.get(nextChange.chartId).filter(nextChange.filter);
        chartMap.get(nextChange.chartId).redrawGroup();
    })
    .format(function(data){
        return "Added";
    });

// Create Remove Action
var removeAction = trail.createAction('Remove')
    .forward(function(state, data){
        var idx = state[data.chartId].indexOf(data.filter);
        if(idx > -1){ state[data.chartId].splice(idx, 1); }
        return state;
    })
    .inverse(function(state, current){
        state[current.chartId].push(current.filter);
        return state;
    })
    .undo(function(curChange, prevInMaster, prevInSub){
        chartMap.get(curChange.chartId).filter(curChange.filter).redrawGroup();
    })
    .redo(function(curChange, nextChange){
        chartMap.get(nextChange.chartId).filter(nextChange.filter).redrawGroup();
    })
    .format(function(data){
        return "Removed";
    });

// Capture
var captureThumbnail = function(change){
    change.captureThumbnail('#us-chart', 1000, { scale: 2, encoding: 'png' });
};

// Record Add/Remove Filters
var recordFilterChange = function(chart, filter, uplink){
    if(chart.filters().indexOf(filter) > -1){
        trail.record(addAction, { chartId: 'chart-'+chart.chartID(), filter:filter }, uplink).then(captureThumbnail).catch(console.log);
    } else {
        trail.record(removeAction, { chartId: 'chart-'+chart.chartID(), filter:filter }, uplink).then(captureThumbnail).catch(console.log);
    }
};

// Record on chart interactions
allCharts.forEach(function(chart){
    chart.on('filtered', recordFilterChange);
});

// Capture initial thumbnail
captureThumbnail(trail.getActionById('root-node'));