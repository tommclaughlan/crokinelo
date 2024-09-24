import { Line } from "react-chartjs-2";
import "./eloChart.css";
import "chart.js/auto";

export interface ChartData {
    t: number;
    elo: number;
}

interface ChartProps {
    data: ChartData[]
}

const EloChart = ({data}: ChartProps) => {
    const chartData = {
        labels: data.slice(-20).map(d => 'G' + (d.t + 1)),
        datasets: [
            {
                label: "Elo",
                data: data.slice(-20).map(d => d.elo),
                fill: true,
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        }
    };

    return <div className="chart-container">
        <Line data={chartData} options={chartOptions}/>
    </div>
}

export default EloChart;