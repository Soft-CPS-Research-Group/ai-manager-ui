import React, { useState } from 'react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DateRangeSlider from "../components/DateRangeSlider";

function CardEV({ data, title }) {
    const updatedData = data.map((item) => ({
        ...item,
        timestamp: new Date(`${item['Time Step']}`).getTime(), // Convert time step to timestamp
        // Replace -1 values with null for proper rendering
        'electric_vehicle_estimated_soc_arrival': item['electric_vehicle_estimated_soc_arrival'] === "-0.1" ? null : item['electric_vehicle_estimated_soc_arrival'],
        'electric_vehicle_required_soc_departure': item['electric_vehicle_required_soc_departure'] === "-0.1" ? null : item['electric_vehicle_required_soc_departure'],
        'electric_vehicle_soc': item['electric_vehicle_soc'] === "-1.0" ? null : item['electric_vehicle_soc'],
    }));

    // Definir limites da data inicial e final com base nos dados do gráfico
    const minTimestamp = updatedData[0]?.timestamp || 0;
    const maxTimestamp = updatedData[updatedData.length - 1]?.timestamp || 0;

    //Valor inicial do filtro - para não carregar muitos dados de uma vez
    const filterTimestamp = updatedData[240]?.timestamp || 0;

    const [sliderValues, setSliderValues] = useState([minTimestamp, filterTimestamp]);

    //Filtragem com base nas datas
    const filteredData = updatedData.filter(
        (item) => item.timestamp >= sliderValues[0] && item.timestamp <= sliderValues[1]
    );

    const handleSliderChange = (values) => {
        setSliderValues(values);
    };

    const [visibleSeries, setVisibleSeries] = useState({
        'electric_vehicle_estimated_soc_arrival': true,
        'electric_vehicle_required_soc_departure': true,
        'electric_vehicle_soc': true
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

    const formatYAxis = (tick) => {
        return tick * 100;
    };

    return (
        <>
            <h5>{title}</h5>
            <div className='d-flex align-items-center' style={{ marginBottom: '10px' }}>
                {/* Array of series keys and labels */}
                {['electric_vehicle_estimated_soc_arrival', 'electric_vehicle_required_soc_departure', 'electric_vehicle_soc'].map((key) => (
                    <label key={key} className='d-flex align-items-center' style={{ marginLeft: key !== 'electric_vehicle_estimated_soc_arrival' ? '10px' : '0' }}>
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
                <ComposedChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="Time Step"
                        angle='-8'
                        interval={interval} tickFormatter={(tick, index) => formatXAxis(tick)}
                    />
                    <YAxis
                        tickFormatter={(tick, index) => formatYAxis(tick)}
                        label={{ value: '%', angle: -90, position: 'insideLeft' }}
                        domain={[0, 1]} />
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
                        formatter={(value, name) => [`${value * 100} %`, `${name}`]} />
                    <Legend />
                    {visibleSeries['electric_vehicle_estimated_soc_arrival'] && (
                        <Line type="monotone" dataKey="electric_vehicle_estimated_soc_arrival" stroke="#8884d8" />
                    )}
                    {visibleSeries['electric_vehicle_required_soc_departure'] && (
                        <Line type="monotone" dataKey="electric_vehicle_required_soc_departure" stroke="#82ca9d" />
                    )}
                    {visibleSeries['electric_vehicle_soc'] && (
                        <Line type="monotone" dataKey="electric_vehicle_soc" stroke="#ff7300" />
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

export default CardEV;