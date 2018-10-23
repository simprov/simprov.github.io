let normalCharts = [
    {id: 1, label: "GainLoss", divId: "gain-loss-chart"},
    {id: 3, label: "Quarter", divId: "quarter-chart"},
    {id: 4, label: "Day", divId: "day-of-week-chart"},
    {id: 7, label: "Year", divId: "yearly-bubble-chart"}
];

let rangeCharts = [
    {id: 2, label: "Fluctuation", divId: "fluctuation-chart"},
    {id: 6, label: "YearRange", divId: "monthly-volume-chart"}
];

setupSimprov(normalCharts, rangeCharts, {divId: '#selectiveviz'});