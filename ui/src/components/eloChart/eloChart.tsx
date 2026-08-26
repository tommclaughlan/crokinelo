import { Line } from "react-chartjs-2";
import "./eloChart.css";
import "chart.js/auto";

export interface ChartData {
    t: number;
    elo: number;
}

interface ChartProps {
    data: ChartData[];
    comparisonData?: ChartData[];
    primaryLabel?: string;
    secondaryLabel?: string;
}

const EloChart = ({
    data,
    comparisonData,
    primaryLabel = "Elo",
    secondaryLabel = "Comparison Elo",
}: ChartProps) => {
    const primaryValues = data.slice(-20).map((d) => d.elo);
    const secondaryValues = comparisonData?.slice(-20).map((d) => d.elo) ?? [];
    const labelsCount = Math.max(primaryValues.length, secondaryValues.length);
    const labels = Array.from({ length: labelsCount }, (_, index) => `G${index + 1}`);

    const alignedPrimary = Array.from({ length: labelsCount }, (_, index) =>
        index < primaryValues.length ? primaryValues[index] : null
    );

    const alignedSecondary = Array.from({ length: labelsCount }, (_, index) =>
        index < secondaryValues.length ? secondaryValues[index] : null
    );

    const chartData = {
        labels,
        datasets: [
            {
                label: primaryLabel,
                data: alignedPrimary,
                fill: !comparisonData,
                backgroundColor: "rgb(125,111,200,0.2)",
                borderColor: "rgb(125,111,200)",
            },
            ...(comparisonData
                ? [
                      {
                          label: secondaryLabel,
                          data: alignedSecondary,
                          fill: false,
                          backgroundColor: "rgb(21,166,142,0.2)",
                          borderColor: "rgb(21,166,142)",
                      },
                  ]
                : []),
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: Boolean(comparisonData)
            }
        }
    };

    return <div className="chart-container">
        <Line data={chartData} options={chartOptions}/>
    </div>
}

export default EloChart;