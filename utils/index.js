import model from './model';
import india from './countries/india';

const timeThres = new Date('2020-12-31T00:00:00Z').getTime();
const minTime = new Date('2020-01-30T00:00:00Z').getTime();
const converter = 100000;

const dataNormalization = (data, min, max) => (data - min) / (max - min);

const scaleUp = (data) => data * converter;

const normalizeByPerDayStats = india.map((data, i) => ({
	...data,
	TimeStamp: new Date(data.Date).getTime(),
	Active: i > 0 ? data.Active - india[i - 1].Active : data.Active,
	Deaths: i > 0 ? data.Deaths - india[i - 1].Deaths : data.Deaths,
	Recovered: i > 0 ? data.Recovered - india[i - 1].Recovered : data.Recovered,
}));

export function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

export function predictOnDate(date) {
	const incomingDate = new Date(date);
	const incomingDateUnixTimestamp = new Date(
		Date.UTC(
			incomingDate.getUTCFullYear(),
			incomingDate.getUTCMonth(),
			incomingDate.getUTCDate(),
			0,
			0,
			0,
		),
	).getTime();
	const predictions = {
		Active: 0,
		Recovered: 0,
		Deaths: 0,
	};
	let lastRecordIndex = normalizeByPerDayStats.length - 1;
	const lastRecord = normalizeByPerDayStats[lastRecordIndex];
	if (incomingDateUnixTimestamp > lastRecord.TimeStamp) {
		const oneDay = 24 * 60 * 60 * 1000;
		let i = lastRecord.TimeStamp;
		while (i < incomingDateUnixTimestamp) {
			i += oneDay;
			const output = model([dataNormalization(i, minTime, timeThres)]).map((v) => scaleUp(v));
			predictions.Active += output[0];
			predictions.Recovered += output[1];
			predictions.Deaths += output[2];
		}
	} else {
		const d = new Date(date);
		const yesterday = new Date(d.setUTCDate(d.getUTCDate() - 1));
		const yesterdayTimeStamp = new Date(
			Date.UTC(
				yesterday.getUTCFullYear(),
				yesterday.getUTCMonth(),
				yesterday.getUTCDate(),
				0,
				0,
				0,
			),
		);
		const yesterdayUnixTimestamp = yesterdayTimeStamp.setUTCHours(0, 0, 0, 0);
		lastRecordIndex = normalizeByPerDayStats.findIndex(
			(record) => record.TimeStamp === yesterdayUnixTimestamp,
		);
		const output = model([
			dataNormalization(new Date(date).getTime(), minTime, timeThres),
		]).map((v) => scaleUp(v));
		predictions.Active += output[0];
		predictions.Recovered += output[1];
		predictions.Deaths += output[2];
	}
	const totalActive = Math.max(Math.floor(predictions.Active + india[lastRecordIndex].Active), 0);
	const totalRecovered = Math.max(
		Math.floor(predictions.Recovered + india[lastRecordIndex].Recovered),
		0,
	);
	const totalDeaths = Math.max(Math.floor(predictions.Deaths + india[lastRecordIndex].Deaths), 0);
	return {
		TotalConfirmed: totalActive + totalRecovered + totalDeaths,
		TotalActive: totalActive,
		TotalRecovered: totalRecovered,
		TotalDeaths: totalDeaths,
	};
}

export function dateFormatter(date) {
	const dateTimeFormat = new Intl.DateTimeFormat('en', {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
	});
	const [{ value: month }, , { value: day }] = dateTimeFormat.formatToParts(date);
	return `${day}-${month}`;
}
