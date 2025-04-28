import React, { useState } from 'react';
import {
    ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ReferenceLine, Line
} from 'recharts';
import { Row, Col, Button } from "react-bootstrap";
import DateRangeSlider from "../components/DateRangeSlider";

// Helper functions to adjust timestamps to full days
const floorToMidnightUTC = (timestamp) => {
    const date = new Date(timestamp);

    if (date.getHours() != 0 || date.getMinutes() != 0 || date.getSeconds() != 0) {
        date.setUTCHours(0, 0, 0, 0);
    }

    return date.getTime();
};

const ceilToEndOfDayUTC = (timestamp) => {
    const date = new Date(timestamp);

    if (date.getHours() != 23 || date.getMinutes() != 59 || date.getSeconds() != 59) {
        date.setUTCHours(23, 59, 59, 999);
    }

    return date.getTime();
};

function CardChargerDB({ data, title }) {
    const updatedData = data.map((item) => ({
        ...item,
        timestamp: new Date(item['timestamp']).getTime(),
        'EsocA': (item['EsocA'] === "-1.00" || item['EsocA'] === -0.1)
            ? null : item['EsocA'] * 100,
        'EsocD': (item['EsocD'] === "-1.00" || item['EsocD'] === -0.1)
            ? null : item['EsocD'] * 100,
        'soc': (item['soc'] === "-1.00" || item['soc'] === -0.1)
            ? null : item['soc'] * 100
    }));

    const minTimestamp = floorToMidnightUTC(updatedData[0]?.timestamp || 0);
    const maxTimestamp = ceilToEndOfDayUTC(updatedData[updatedData.length - 1]?.timestamp || 0);

    const baseIntervalMinutes = updatedData.length > 1
        ? Math.round((updatedData[1].timestamp - updatedData[0].timestamp) / (60 * 1000))
        : 1;

    const pointsPerDay = Math.floor((24 * 60) / baseIntervalMinutes);
    const defaultDataPoints = pointsPerDay * 10;
    const defaultFilterEnd = ceilToEndOfDayUTC(updatedData[defaultDataPoints]?.timestamp || maxTimestamp);

    const [sliderValues, setSliderValues] = useState([minTimestamp, defaultFilterEnd]);
    const [timeInterval, setTimeInterval] = useState(baseIntervalMinutes);
    const [intervalInput, setIntervalInput] = useState(baseIntervalMinutes);

    const handleSliderChange = (values) => setSliderValues(values);

    const handleApplyInterval = () => {
        const clamped = Math.max(baseIntervalMinutes, Math.min(60, intervalInput));
        setTimeInterval(clamped);
    };

    const filteredData = updatedData.filter(
        (item) => item.timestamp >= sliderValues[0] && item.timestamp <= sliderValues[1]
    );

    const aggregateData = (data, intervalMinutes) => {
        if (!data.length) return [];

        const result = [];
        let groupStart = data[0].timestamp;
        let tempGroup = [];

        for (const item of data) {
            if (item.timestamp - groupStart < intervalMinutes * 60 * 1000) {
                tempGroup.push(item);
            } else {
                result.push(aggregateGroup(groupStart, tempGroup));
                groupStart = item.timestamp;
                tempGroup = [item];
            }
        }

        if (tempGroup.length > 0) {
            result.push(aggregateGroup(groupStart, tempGroup));
        }

        return result;
    };

    const aggregateGroup = (timestamp, group) => {
        const avgKeys = ['EsocA', 'EsocD', 'soc'];

        const aggregated = { timestamp, 'Time Step': group[0]['timestamp'] };

        avgKeys.forEach(key => {
            const values = group.map(item => item[key]).filter(val => val !== null);
            aggregated[key] = values.length > 0
                ? values.reduce((sum, v) => sum + v, 0) / values.length
                : null;
        });

        return aggregated;
    };

    const getMidnightTicks = (data, intervalMinutes) => {
        if (!data.length) return [];
        const seen = new Set();
        const ticks = [];

        for (const item of data) {
            const d = new Date(item.timestamp);
            const isNearMidnight = d.getUTCHours() === 0 && d.getUTCMinutes() < intervalMinutes;

            if (isNearMidnight) {
                const midnightUTC = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
                const tick = midnightUTC.toISOString().slice(0, 19);
                
                if (!seen.has(tick)) {
                    seen.add(tick);
                    ticks.push(tick);
                }
            }
        }
        console.log(ticks)
        return ticks;
    };

    const aggregatedData = aggregateData(filteredData, timeInterval);
    const xAxisTicks = getMidnightTicks(aggregatedData, timeInterval);

    const [visibleSeries, setVisibleSeries] = useState({
        'EsocA': true,
        'EsocD': true,
        'soc': true
    });

    const handleCheckboxChange = (seriesKey) => {
        setVisibleSeries(prev => ({
            ...prev,
            [seriesKey]: !prev[seriesKey]
        }));
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center">
                <h5>{title}</h5>

                <div>
                    <label>
                        <span title={`Base interval: ${baseIntervalMinutes} minute(s)`}>
                            Interval (minutes):
                        </span>
                        <input
                            type="number"
                            min={baseIntervalMinutes}
                            max={60}
                            value={intervalInput}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setIntervalInput(Number.isNaN(val) ? baseIntervalMinutes : val);
                            }}
                            style={{ width: "80px", margin: "0 10px" }}
                        />
                    </label>
                    <Button
                        variant="secondary"
                        className="p-2"
                        onClick={handleApplyInterval}
                        disabled={
                            intervalInput < baseIntervalMinutes ||
                            intervalInput > 60 ||
                            intervalInput === timeInterval
                        }
                    >
                        Apply
                    </Button>
                </div>
            </div>

            <Row className="my-2">
                {Object.keys(visibleSeries).map((key) => (
                    <Col key={key} md={4}>
                        <label className="d-flex align-items-center">
                            <input
                                type="checkbox"
                                checked={visibleSeries[key]}
                                onChange={() => handleCheckboxChange(key)}
                            />
                            <span className="ml-2">Show {key}</span>
                        </label>
                    </Col>
                ))}
            </Row>

            <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={aggregatedData} stackOffset="sign">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="timestamp"
                        ticks={xAxisTicks}
                        tickFormatter={(tick) => {
                            const date = new Date(tick);
                            return date.toISOString().slice(0, 10);
                        }}
                        angle={-8}
                    />
                    <YAxis label={{ value: 'kWh', angle: -90, position: 'insideLeft' }} />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        label={{ value: 'SOC %', angle: -90, position: 'insideRight' }}
                        domain={[0, 100]}
                    />
                    <Tooltip
                        labelFormatter={(label) => {
                            const date = new Date(label);
                            const formattedDate = date.toLocaleString("en-US", {
                                month: "short",
                                day: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                            });

                            return (
                                <>
                                    <span>{formattedDate}</span>
                                </>
                            );
                        }}
                        formatter={(value, name) => [`${value} ${name.includes('%') ? '%' : 'kWh'}`, name]}
                    />
                    <Legend />

                    {visibleSeries['EsocA'] && (
                        <Line yAxisId="right" type="monotone" dataKey="EsocA" stroke="#0088FE" />
                    )}
                    {visibleSeries['EsocD'] && (
                        <Line yAxisId="right" type="monotone" dataKey="EsocD" stroke="#FF7300" />
                    )}
                    {visibleSeries['soc'] && (
                        <Line yAxisId="right" type="monotone" dataKey="soc" stroke="#112424" />
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

export default CardChargerDB;
