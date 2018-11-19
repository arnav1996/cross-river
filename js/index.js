$(document).ready(function(){



getData("2012");
getGraph("2012");
// secondGraph();
});

function getData(year){
    
    $.ajax({
    url : "https://ubfk62wvq7.execute-api.us-east-1.amazonaws.com/v1/?year=" + year,
    type : "GET",
    contentType : "application/json",
    success : function(data){
        document.getElementById("applied").innerHTML = '$' + data.loan_amt_sum.toLocaleString('en') ;
        document.getElementById("funded").innerHTML = '$' + data.funded_amt_sum.toLocaleString('en') ;
        document.getElementById("commited").innerHTML = '$' + data.funded_amt_inv_sum.toLocaleString('en') ;
        
  },
    error: function(error){
        alert(error);
    }
});
  
}

function getGraph(year) {
    document.getElementById("loader").style.visibility = "visible";
$.ajax({
    url : "https://ubfk62wvq7.execute-api.us-east-1.amazonaws.com/v1/graph?year=" + year,
    type : "GET",
    contentType : "application/json",
    success : function(data){
        console.log(data);
        firstGraph(data.loans_by_credit_grade);
        secondGraph(data.monthly_loan_volume);

        document.getElementById("loader").style.visibility = "hidden";
  },
    error: function(error){
        alert(error);
        document.getElementById("loader").style.visibility = "hidden";
    }
});
}
months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug','Sep','Oct','Nov','Dec']

function fetchdata(){
    var year_select = document.getElementById('year');  
    var year = year_select.options[year_select.selectedIndex].value;
    getData(year);
    getGraph(year);
}

//First Graph
function firstGraph(data){
    console.log(data);
    Highcharts.chart('line-graph', {

    title: {
        text: 'Loans by credit grade'
    },

    yAxis: {
        title: {
            text: 'Avg. Loan amount'
        }
    },
    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle'
    },

    xAxis: {
        title: {
            text: 'Month'
        },
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug','Sep','Oct','Nov','Dec']
    },

    series: [{
        name: 'A',
        data: getList(data, 'A'),
    }, {
        name: 'B',
        data: getList(data, 'B')
    }, {
        name: 'C',
        data: getList(data, 'C')
    }, {
        name: 'D',
        data: getList(data, 'D')
    }, {
        name: 'E',
        data: getList(data, 'E')
    }, {
        name: 'F',
        data: getList(data, 'F')
    }, {
        name: 'G',
        data: getList(data, 'G')
    }],

    responsive: {
        rules: [{
            condition: {
                maxWidth: 400
            },
            chartOptions: {
                legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom'
                }
            }
        }]
    }

});
}

//2nd graph
function secondGraph(data){

Highcharts.chart('bar-graph', {
    chart: {
        type: 'column'
    },
    title: {
        text: 'Monthly Loan Volume'
    },
    xAxis: {
        categories: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec'
        ],
        title: {
            text: 'Month'
        },
        crosshair: true
    },
    yAxis: {
        min: 0,
        title: {
            text: 'Loan Volume'
        }
    },
    tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
    },
    plotOptions: {
        column: {
            pointPadding: 0.2,
            borderWidth: 0
        }
    },
    series: [{
        data: getAmount(data)
    }]
});
}

function getAmount(data){
    arr = []
    for (index = 0; index < months.length; index++) { 
        //console.log(data[grade][months[index]]);
        arr.push(data[months[index]]); 
    }    
    return arr;
}
function getList(data, grade){
    
    arr = []

    for (index = 0; index < months.length; index++) { 
        arr.push(data[grade][months[index]]); 
    } 
    return arr;
}