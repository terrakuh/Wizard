import { Grid } from "@material-ui/core"
import { Bar, Doughnut } from 'react-chartjs-2';

function generateChartData(labels: string[], data: number[]) {
    const chartData = {
        labels: labels,
        datasets: [
            {
                data: data,
            },
        ],
    };
    return chartData
}

export default function Stats() {

    const timeAverages: { [player: string]: number} = {
        "Maxi": 1,
        "Yunus": 5
    }
    const scoreAverages: { [player: string]: number} = {
        "Maxi": 400,
        "Yunus": -20
    }
    const bestScores: [name: string, score: number][] = [["Maxi", 830], ["Maxi", 580]]
    const playerWins: { [player: string]: number} = {
        "Maxi": 21,
        "Yunus": 1
    }

    const options = {
        indexAxis: 'y',
        // Elements options apply to all of the options unless overridden in a dataset
        // In this case, we are setting the border of each horizontal bar to be 2px wide
        elements: {
          bar: {
            borderWidth: 2,
          },
        },
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
          },
        },
      };

	return (
		<div>
            <Grid container spacing={3}>
                <Grid item>
                    <Bar type={"bar"} data={generateChartData(Object.keys(timeAverages), Object.values(timeAverages))} options={options} />
                </Grid>
                <Grid item>
                    <Bar type={"bar"} data={generateChartData(Object.keys(scoreAverages), Object.values(scoreAverages))} options={options} />
                </Grid>
                <Grid item>
                    <Bar type={"bar"} data={generateChartData(bestScores.map(entry => entry[0]), bestScores.map(entry => entry[1]))} options={options} />
                </Grid>
                <Grid item>
                    <Doughnut type={"doughnut"} data={generateChartData(Object.keys(playerWins), Object.values(playerWins))} options={options} />
                </Grid>
            </Grid>
        </div>
	)
}