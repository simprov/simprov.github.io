let normalCharts = [
    {id: 1, label: "Delinq", divId: "delinq-2yrs-chart"},
    {id: 2, label: "Emp Length", divId: "emp-length-chart"},
    {id: 3, label: "Homeowner", divId: "home-ownership-chart"},
    {id: 4, label: "Inquiry", divId: "inq-last-6mths-chart"},
    {id: 5, label: "Annual Inc", divId: "annual-inc-chart"},
    {id: 6, label: "Public Rec", divId: "pub-rec-chart"},
    {id: 7, label: "Purpose", divId: "purpose-chart"},
    {id: 8, label: "Term", divId: "term-chart"},
    {id: 9, label: "Int Rate", divId: "int-rate-chart"}
];

let rangeCharts = [
    {id: 10, label: "Returns", divId: "average-returns"}
]

setupSimprov(normalCharts, rangeCharts, {divId: '#captureThumb'});