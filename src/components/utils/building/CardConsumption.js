import React, { useState } from "react";
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";
import DateRangeSlider from "../components/DateRangeSlider";

function CardConsumption({ data, title }) {
    const updatedData = data.map((item) => ({
        ...item,
        timestamp: new Date(`${item['Time Step']}`).getTime(), // Novo campo para filtragem das datas
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

    const formatXAxis = (tick) => {
        return tick.slice(0, 10);
    };

    const totalDays = Math.floor(filteredData.length / 24);
    const tickCount = Math.min(totalDays, 10);

    const interval = tickCount < 10 ? (Math.floor(totalDays / tickCount) * 24) : Math.floor(filteredData.length / 10);
    return (
        <>
            <h5>{title}</h5>
            <ResponsiveContainer width={"100%"} height={300}>
                <ComposedChart data={filteredData} stackOffset="sign">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="Time Step"
                        angle='-8'
                        interval={interval} tickFormatter={(tick, index) => formatXAxis(tick)}
                    />
                    <YAxis
                        label={{ value: "kWh", angle: -90, position: "insideLeft" }}
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
                        formatter={(value, name) => [`${value} kWh`, `${name}`]} />
                    <Legend />
                    <Bar dataKey="Non-shiftable Load-kWh" stackId="a" fill="#8884d8" />
                    <Bar dataKey="Net Electricity Consumption-kWh" stackId="a" fill="#82ca9d" />
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

export default CardConsumption;
