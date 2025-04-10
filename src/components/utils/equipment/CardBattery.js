import React, { useState } from 'react';
import {
    ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line
} from 'recharts';
import DateRangeSlider from "../components/DateRangeSlider";

function CardBattery({ data, title }) {
    const updatedData = data.map((item) => ({
        ...item,
        timestamp: new Date(`${item['Time Step']}`).getTime(),
        'Battery Soc-%': (item['Battery Soc-%'] === "-1.00" || item['Battery Soc-%'] === "-0.1")
            ? null : parseFloat(item['Battery Soc-%']) * 100
    }));

    // Defining initial and final date limits based on the chart data
    const minTimestamp = updatedData[0]?.timestamp || 0;
    const maxTimestamp = updatedData[updatedData.length - 1]?.timestamp || 0;

    // Initial filter value - to avoid loading too many data at once
    const filterTimestamp = updatedData[240]?.timestamp || 0;

    const [sliderValues, setSliderValues] = useState([minTimestamp, filterTimestamp]);

    // Filtering based on the date range selected by the user
    const filteredData = updatedData.filter(
        (item) => item.timestamp >= sliderValues[0] && item.timestamp <= sliderValues[1]
    );

    const handleSliderChange = (values) => {
        setSliderValues(values);
    };

    const [visibleSeries, setVisibleSeries] = useState({
        'Battery (Dis)Charge-kWh': true,
        'Battery Soc-%': true
    });

    const handleCheckboxChange = (seriesKey) => {
        setVisibleSeries((prevState) => ({
            ...prevState,
            [seriesKey]: !prevState[seriesKey],
        }));
    };

    const formatXAxis = (tick) => {
        return tick.slice(0, 10);
    };

    const totalDays = Math.floor(filteredData.length / 24);
    const tickCount = Math.min(totalDays, 10);

    const interval = tickCount < 10 ? (Math.floor(totalDays / tickCount) * 24) : Math.floor(filteredData.length / 10);

    return (
        <>
            <h5>{title}</h5>
            <div className='d-flex align-items-center' style={{ marginBottom: '10px' }}>
                {/* Array of series keys and labels */}
                {Object.keys(visibleSeries).map((key) => (
                    <label key={key} className='d-flex align-items-center' style={{ marginLeft: key !== 'Battery (Dis)Charge-kWh' ? '10px' : '0' }}>
                        <input
                            type="checkbox"
                            checked={visibleSeries[key]}
                            onChange={() => handleCheckboxChange(key)}
                        />
                        <span style={{ marginLeft: '5px' }}>Show {key.toUpperCase()}</span>
                    </label>
                ))}
            </div>
            <ResponsiveContainer width={"100%"} height={300}>
                <ComposedChart data={filteredData} stackOffset="sign">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="Time Step"
                        angle='-8'
                        interval={interval}
                        tickFormatter={(tick, index) => formatXAxis(tick)}
                    />

                    {/* Primary Y-Axis for kWh (Left Side) */}
                    <YAxis label={{ value: 'kWh', angle: -90, position: 'insideLeft' }} />

                    {/* Secondary Y-Axis for SOC % (Right Side) */}
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        label={{ value: 'SOC %', angle: -90, position: 'insideRight' }}
                        domain={[0, 100]}
                    />

                    <Tooltip
                        labelFormatter={(label) => {
                            const date = new Date(label);
                            return date.toLocaleString("en-US", {
                                month: "short",
                                day: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                            });
                        }}
                        formatter={(value, name) => [`${value} ${name.includes('%') ? '%' : 'kWh'}`, name]}
                    />

                    <Legend />

                    {/* Bars for Charger Consumption and Production */}
                    {visibleSeries['Battery (Dis)Charge-kWh'] && (
                        <Bar dataKey="Battery (Dis)Charge-kWh" stackId="a" fill="#8884d8" />
                    )}

                    {/* Lines for SOC, SOC Arrival and SOC Departure - using right Y-Axis */}
                    {visibleSeries['Battery Soc-%'] && (
                        <Line yAxisId="right" type="monotone" dataKey="Battery Soc-%" stroke="#FF7300" />
                    )}
                </ComposedChart>
            </ResponsiveContainer>

            <DateRangeSlider
                minTimestamp={minTimestamp}
                maxTimestamp={maxTimestamp}
                sliderValues={sliderValues}
                onSliderChange={handleSliderChange}
            />
        </>
    );
}

export default CardBattery;
