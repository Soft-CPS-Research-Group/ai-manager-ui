import React, { useState } from 'react';
import {
    ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ReferenceLine, Line
} from 'recharts';
import { Row, Col } from "react-bootstrap";
import DateRangeSlider from "../components/DateRangeSlider";

function CardCharger({ data, title }) {
    const updatedData = data.map((item) => ({
        ...item,
        timestamp: new Date(`${item['Time Step']}`).getTime(),
        'Charger Consumption-kWh': item['Charger Consumption-kWh'] === "-1.00" ? null : item['Charger Consumption-kWh'],
        'Charger Production-kWh': item['Charger Production-kWh'] === "-1.00" ? null : item['Charger Production-kWh'],
        'EV Estimated SOC Arrival-%': (item['EV Estimated SOC Arrival-%'] === "-1.00" || item['EV Estimated SOC Arrival-%'] === "-0.1")
            ? null : parseFloat(item['EV Estimated SOC Arrival-%']) * 100,
        'EV Required SOC Departure-%': (item['EV Required SOC Departure-%'] === "-1.00" || item['EV Required SOC Departure-%'] === "-0.1")
            ? null : parseFloat(item['EV Required SOC Departure-%']) * 100,
        'EV SOC-%': (item['EV SOC-%'] === "-1.00" || item['EV SOC-%'] === "-0.1")
            ? null : parseFloat(item['EV SOC-%']) * 100
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
        'Charger Consumption-kWh': true,
        'Charger Production-kWh': true,
        'Charging Action-kWh': false,
        'EV Estimated SOC Arrival-%': true,
        'EV Estimated SOC Departure-%': true,
        'EV SOC-%': true
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

    // Filter markers based on EV Departure Time and Arrival Time
    const departureMarkers = filteredData
        .filter(item => item['EV Departure Time'] === "0")
        .map(item => ({
            timestep: item['Time Step'],
            EVName: item['EV Name']
        }));

    const arrivalMarkers = filteredData
        .filter(item => item['EV Arrival Time'] === "0")
        .map(item => ({
            timestep: item['Time Step'],
            EVName: item['EV Name']
        }));

    // Helper function to make the EV Name more readable (convert Electric_Vehicle_X to EVX)
    const formatEVName = (name) => {
        if (!name) return "Unknown EV";
        const formattedName = name.replace("Electric_Vehicle_", "EV");
        return formattedName;
    };

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
                            const formattedDate = date.toLocaleString("en-US", {
                                month: "short",
                                day: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                            });

                            // Find matching arrival and departure EVs
                            const arrivedEVs = arrivalMarkers
                                .filter(marker => marker.timestep === label)
                                .map(marker => formatEVName(marker.EVName));

                            const departedEVs = departureMarkers
                                .filter(marker => marker.timestep === label)
                                .map(marker => formatEVName(marker.EVName));

                            // Create message if an EV arrives or departs
                            let evMessage = "";
                            if (arrivedEVs.length > 0) {
                                evMessage += `${arrivedEVs.join(", ")} Arrived`;
                            }
                            if (departedEVs.length > 0) {
                                evMessage += `${departedEVs.join(", ")} Departed`;
                            }

                            return (
                                <>
                                    <span>{formattedDate}</span>
                                    {evMessage && <span style={{ fontWeight: "bold", marginTop: "4px" }}><br/>{evMessage}</span>}
                                </>
                            );
                        }}
                        formatter={(value, name) => [`${value} ${name.includes('%') ? '%' : 'kWh'}`, name]}
                    />

                    <Legend />

                    {/* Bars for Charger Consumption and Production */}
                    {visibleSeries['Charging Action-kWh'] && (
                        <Bar dataKey="Charging Action-kWh" fill="#fcf403" barSize={10} />
                    )}
                    {visibleSeries['Charger Consumption-kWh'] && (
                        <Bar dataKey="Charger Consumption-kWh" stackId="a" fill="#8884d8"  barSize={10}/>
                    )}
                    {visibleSeries['Charger Production-kWh'] && (
                        <Bar dataKey="Charger Production-kWh" stackId="a" fill="#82ca9d" />
                    )}

                    {/* Lines for SOC, SOC Arrival and SOC Departure - using right Y-Axis */}
                    {visibleSeries['EV Estimated SOC Arrival-%'] && (
                        <Line yAxisId="right" type="monotone" dataKey="EV Estimated SOC Arrival-%" stroke="#0088FE" />
                    )}
                    {visibleSeries['EV Estimated SOC Departure-%'] && (
                        <Line yAxisId="right" type="monotone" dataKey="EV Required SOC Departure-%" stroke="#FF7300" />
                    )}
                    {visibleSeries['EV SOC-%'] && (
                        <Line yAxisId="right" type="monotone" dataKey="EV SOC-%" stroke="#112424" />
                    )}

                    {/* Departure Markers */}
                    {departureMarkers.map((marker, index) => (
                        <ReferenceLine
                            key={"departure_" + index}
                            x={marker.timestep}
                            stroke="red"
                            strokeDasharray="5 5"
                            label={{
                                position: "middle",
                                value: formatEVName(marker.EVName),
                                fill: "red",
                                fontSize: 12,
                                fontWeight: "bold"
                            }}
                        />
                    ))}

                    {/* Arrival Markers */}
                    {arrivalMarkers.map((marker, index) => (
                        <ReferenceLine
                            key={"arrival_" + index}
                            x={marker.timestep}
                            stroke="blue"
                            strokeDasharray="5 5"
                            label={{
                                position: "middle",
                                value: formatEVName(marker.EVName),
                                fill: "blue",
                                fontSize: 12,
                                fontWeight: "bold"
                            }}
                        />
                    ))}
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

export default CardCharger;
