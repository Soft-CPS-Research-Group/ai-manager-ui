import React, { useState } from 'react';
import {
    ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line
} from 'recharts';
import { Row, Col } from "react-bootstrap";
import DateRangeSlider from "../components/DateRangeSlider";

function CardPricing({ data, title }) {
    const updatedData = data.map((item) => ({
        ...item,
        timestamp: new Date(`${item['Time Step']}`).getTime()
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
        'electricity_pricing-$/kWh': true,
        'electricity_pricing_predicted_1-$/kWh': true,
        'electricity_pricing_predicted_2-$/kWh': true,
        'electricity_pricing_predicted_3-$/kWh': true
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
                <Row>
                    {Object.keys(visibleSeries).map((key) => (
                        <Col key={key} md={4}>
                            <label key={key} className='d-flex align-items-center'>
                                <input
                                    type="checkbox"
                                    checked={visibleSeries[key]}
                                    onChange={() => handleCheckboxChange(key)}
                                />
                                <span style={{ marginLeft: '5px' }}>Show {key.toUpperCase()}</span>
                            </label>
                        </Col>
                    ))}
                </Row>

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

                    <YAxis label={{ value: '$/kWh', angle: -90, position: 'insideLeft' }} />

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
                    />

                    <Legend />

                    {visibleSeries['electricity_pricing-$/kWh'] && (
                        <Line type="monotone" dataKey="electricity_pricing-$/kWh" stroke="#FF7300" />
                    )}
                    {visibleSeries['electricity_pricing_predicted_1-$/kWh'] && (
                        <Line type="monotone" dataKey="electricity_pricing_predicted_1-$/kWh" stroke="#8884d8" />
                    )}
                    {visibleSeries['electricity_pricing_predicted_2-$/kWh'] && (
                        <Line type="monotone" dataKey="electricity_pricing_predicted_2-$/kWh" stroke="#82ca9d" />
                    )}
                    {visibleSeries['electricity_pricing_predicted_3-$/kWh'] && (
                        <Line type="monotone" dataKey="electricity_pricing_predicted_3-$/kWh" stroke="#0088FE" />
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

export default CardPricing;
