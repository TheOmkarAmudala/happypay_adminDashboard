import React from "react";
import ApexChart from "react-apexcharts";
import { Card, Button } from "antd";

const PayInStatusChart = ({ success, pending, failed }) => {
    const series = [success, pending, failed];

    const options = {
        labels: ["Success", "Pending", "Failed"],
        colors: ["#3f8600", "#fa8c16", "#cf1322"], // green, orange, red
        chart: {
            type: "donut"
        },
        legend: {
            position: "bottom"
        },
        tooltip: {
            y: {
                formatter: val => `${val} payments`
            }
        },
        plotOptions: {
            pie: {
                donut: {
                    size: "75%",
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: "Total",
                            formatter: () => success + pending + failed
                        }
                    }
                }
            }
        }
    };

    return (
        <Card title="Pay-In Status">
            <ApexChart
                options={options}
                series={series}
                type="donut"
                height={280}
            />

            <div style={{ textAlign: "center", marginTop: 12 }}>
                <p style={{ color: "#8c8c8c" }}>
                    Hover to see number of payments
                </p>

            </div>
        </Card>
    );
};

export default PayInStatusChart;
