import React from "react";
import ApexChart from "react-apexcharts";
import { Card } from "antd";

const PayInStatusChart = ({ success, pending, failed }) => {
    const series = [success, pending, failed];

    const options = {
        labels: ["Success", "Pending", "Failed"],
        colors: ["#52c41a", "#faad14", "#ff4d4f"],
        legend: {
            position: "bottom"
        },
        chart: {
            type: "donut"
        },
        plotOptions: {
            pie: {
                donut: {
                    size: "70%"
                }
            }
        },
        dataLabels: {
            enabled: false
        }
    };

    return (
        <Card title="Pay-In Status">
            <ApexChart
                options={options}
                series={series}
                type="donut"
                height={260}
            />
        </Card>
    );
};

export default PayInStatusChart;
