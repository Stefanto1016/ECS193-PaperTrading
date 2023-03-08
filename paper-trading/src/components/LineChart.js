import React from "react";
import { Line } from "react-chartjs-2";
import {Chart as ChartJS} from 'chart.js/auto'


export function PerformanceChart({ chartData }) {
    return (
        <div className="LineChart">
            <Line
                data={chartData}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            ticks: {
                                display: false
                            }
                        }
                    }
                }}
            />
        </div>
    )
}

export function StockChart({ chartData }) {
    return (
        <div className="LineChart">
            <Line
                data={chartData}
                width={650}
                height={350}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            ticks: {
                                display: false
                            }
                        }
                    }
                }}
            />
        </div>
    )
}
