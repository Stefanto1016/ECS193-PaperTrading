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
                            //display: false,
                            ticks: {
                                // For a category axis, the val is the index so the lookup via getLabelForValue is needed
                                callback: function(val, index) {
                                // Hide every 2nd tick label
                                    return index % 1 === 0 ? this.getLabelForValue(val) : '';
                                },     
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
                    elements: {
                        point: {
                            borderWidth: 0,
                            backgroundColor: 'rgba(0,0,0,0)'
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'nearest',
                        axis: 'x'
                    },
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
                                // For a category axis, the val is the index so the lookup via getLabelForValue is needed
                                callback: function(val, index) {
                                // Hide every 4th tick label
                                    return index % 4 === 0 ? this.getLabelForValue(val) : '';
                                },     
                            }
                        }
                    }
                }}
            />
        </div>
    )
}
