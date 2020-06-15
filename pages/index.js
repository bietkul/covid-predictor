import React from 'react';
import Head from 'next/head';
import {
	AreaChart, XAxis, YAxis, Tooltip, Area, CartesianGrid,
} from 'recharts';
import Select from 'react-select';
import DatePicker from 'react-datepicker';

import { predictOnDate, capitalizeFirstLetter, dateFormatter } from '../utils';

export default class Home extends React.Component {
	constructor(props) {
		super(props);
		this.options = [
			{ value: 'all', label: 'All' },
			{ value: 'active', label: 'Active' },
			{ value: 'confirmed', label: 'Confirmed' },
			{ value: 'recovered', label: 'Recovered' },
			{ value: 'death', label: 'Deaths' },
		];
		this.state = {
			width: null,
			data: [],
			selectedOption: this.options[0],
			startDate: new Date(),
		};
	}

	handleChange = (selectedOption) => {
		this.setState({ selectedOption });
	};

	handleDateChange = (date) => {
		this.setState({
			startDate: date,
		});
	};

	componentDidMount() {
		const data = [];
		const today = new Date();
		for (let i = today.getDate(); i <= today.getDate() + 30; i += 1) {
			const date = new Date(today.getFullYear(), today.getMonth(), i, 23, 59, 59, 0);
			const predict = predictOnDate(date.toISOString());
			data.push({
				name: dateFormatter(date),
				date: i,
				active: predict.TotalActive,
				death: predict.TotalDeaths,
				recovered: predict.TotalRecovered,
				confirmed: predict.TotalConfirmed,
			});
		}
		this.setState({
			width: window.innerWidth - 100,
			data,
		});
	}

	render() {
		const {
			startDate, selectedOption, data, width,
		} = this.state;
		const today = new Date();
		const date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 0);
		const predictions = predictOnDate(date.toISOString());
		return (
			<div className="container">
				<Head>
					<title>Covid-19 Predictor</title>
					<link rel="icon" href="/favicon.ico" />
					<script async defer src="https://buttons.github.io/buttons.js" />
				</Head>
				<main>
					<h2 className="title">
						Covid-19 Predictions for India
						{' '}
						<img
							alt="flag"
							style={{
								width: 40,
							}}
							src="/india.png"
						/>
					</h2>
					<div>
						<h3>Select a date</h3>
						<DatePicker
							selected={startDate}
							dateFormat="dd/MM/yyyy"
							onChange={this.handleDateChange}
							minDate={new Date()}
							maxDate={new Date(2020, 11, 31)}
						/>
					</div>
					<p className="description">
						Showing predictions for
						{' '}
						<b>{dateFormatter(startDate)}</b>
					</p>
					<a className="github-button" href="https://github.com/bietkul/covid-predictor" data-icon="octicon-star" aria-label="Star bietkul/covid-predictor on GitHub">Star</a>

					<div className="grid">
						<div className="card">
							<h3>Total Cases</h3>
							<p>{predictions.TotalConfirmed.toLocaleString()}</p>
						</div>

						<div className="card">
							<h3>Total Active</h3>
							<p>{predictions.TotalActive.toLocaleString()}</p>
						</div>

						<div className="card">
							<h3>Total Recovered</h3>
							<p>{predictions.TotalRecovered.toLocaleString()}</p>
						</div>

						<div className="card">
							<h3>Total Deaths</h3>
							<p>{predictions.TotalDeaths.toLocaleString()}</p>
						</div>
					</div>
				</main>

				<div>
					<h2 className="title">
						Predictions for the upcoming 30 days
					</h2>
					<div
						style={{
							width: 150,
							marginBottom: 50,
							marginLeft: 90,
						}}
					>
						<Select
							value={selectedOption}
							onChange={this.handleChange}
							options={this.options}
						/>
					</div>

					<AreaChart
						width={width - 100}
						height={400}
						data={data}
						margin={{
							top: 10,
							right: 30,
							left: 100,
							bottom: 0,
						}}
					>
						<defs>
							<linearGradient id="colorConfirmed" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="blue" stopOpacity={0.8} />
								<stop offset="95%" stopColor="blue" stopOpacity={0} />
							</linearGradient>
							<linearGradient id="colorDeath" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="red" stopOpacity={0.8} />
								<stop offset="95%" stopColor="red" stopOpacity={0} />
							</linearGradient>
							<linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#fcf403" stopOpacity={0.8} />
								<stop offset="95%" stopColor="#f8fc03" stopOpacity={0} />
							</linearGradient>
							<linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
								<stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
							</linearGradient>
						</defs>
						<XAxis dataKey="name" />
						<YAxis />
						<CartesianGrid strokeDasharray="3 3" />
						<Tooltip
							formatter={(...args) => {
								const formattedLabels = args;
								formattedLabels[1] = capitalizeFirstLetter(formattedLabels[1]);
								return formattedLabels;
							}}
						/>
						{selectedOption.value === 'all' || selectedOption.value === 'confirmed' ? (
							<Area
								type="monotone"
								dataKey="confirmed"
								stroke="#8884d8"
								fillOpacity={1}
								fill="url(#colorConfirmed)"
							/>
						) : null}
						{selectedOption.value === 'all' || selectedOption.value === 'active' ? (
							<Area
								type="monotone"
								dataKey="active"
								stroke="#fce303"
								fillOpacity={1}
								fill="url(#colorActive)"
							/>
						) : null}
						{selectedOption.value === 'all' || selectedOption.value === 'death' ? (
							<Area
								type="monotone"
								dataKey="death"
								stroke="#fc0303"
								fillOpacity={1}
								fill="url(#colorDeath)"
							/>
						) : null}
						{selectedOption.value === 'all' || selectedOption.value === 'recovered' ? (
							<Area
								type="monotone"
								dataKey="recovered"
								stroke="#82ca9d"
								fillOpacity={1}
								fill="url(#colorRecovered)"
							/>
						) : null}
					</AreaChart>
				</div>

				<footer>
					<a
						href="https://documenter.getpostman.com/view/10808728/SzS8rjbc?version=latest#d0ca988a-ac5f-4d30-ab64-b188e45149e4"
						target="_blank"
						rel="noopener noreferrer"
					>
						API Source
					</a>
				</footer>

				<style jsx>
					{`
						.container {
							min-height: 100vh;
							padding: 0 0.5rem;
							display: flex;
							flex-direction: column;
							justify-content: center;
							align-items: center;
						}

						main {
							padding: 5rem 0;
							flex: 1;
							display: flex;
							flex-direction: column;
							justify-content: center;
							align-items: center;
						}

						footer {
							width: 100%;
							height: 100px;
							border-top: 1px solid #eaeaea;
							display: flex;
							justify-content: center;
							align-items: center;
						}

						footer img {
							margin-left: 0.5rem;
						}

						footer a {
							display: flex;
							justify-content: center;
							align-items: center;
						}

						a {
							color: inherit;
							text-decoration: none;
						}

						.title a {
							color: #0070f3;
							text-decoration: none;
						}

						.title a:hover,
						.title a:focus,
						.title a:active {
							text-decoration: underline;
						}

						.title {
							margin: 0;
							line-height: 1.15;
							font-size: 2rem;
						}

						.title,
						.description {
							text-align: center;
						}

						.description {
							line-height: 1.5;
							font-size: 1.5rem;
						}

						code {
							background: #fafafa;
							border-radius: 5px;
							padding: 0.75rem;
							font-size: 1.1rem;
							font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
								DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
						}

						.grid {
							display: flex;
							align-items: center;
							justify-content: center;
							flex-wrap: wrap;
							max-width: 800px;
						}

						.card {
							margin: 1rem;
							flex-basis: 45%;
							padding: 1.5rem;
							text-align: left;
							color: inherit;
							text-decoration: none;
							border: 1px solid #eaeaea;
							border-radius: 10px;
							transition: color 0.15s ease, border-color 0.15s ease;
						}

						.card:hover,
						.card:focus,
						.card:active {
							color: #0070f3;
							border-color: #0070f3;
						}

						.card h3 {
							margin: 0 0 1rem 0;
							font-size: 1.5rem;
						}

						.card p {
							margin: 0;
							font-size: 1.25rem;
							line-height: 1.5;
						}

						.logo {
							height: 1em;
						}

						@media (max-width: 600px) {
							.grid {
								width: 100%;
								flex-direction: column;
							}
						}
					`}
				</style>

				<style jsx global>
					{`
						html,
						body {
							padding: 0;
							margin: 0;
							font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
								Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
						}

						* {
							box-sizing: border-box;
						}
					`}
				</style>
			</div>
		);
	}
}
