import React, { useState, useEffect } from "react";
import { Row, Col, Button, Form } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import "@xyflow/react/dist/style.css";
import { FaArrowUp, FaArrowDown, FaPlus } from "react-icons/fa";
import dayjs from 'dayjs';

export default function DatasetsPage() {
    const [valid, setValid] = useState(true);
    const [show, setShow] = useState(false);

    const [datasetName, setDatasetName] = useState("");
    const handleDatasetName = async (e) => {
        const dataset = e.target.value;
        setDatasetName(dataset);
    };

    const [siteList, setSiteList] = useState([]);
    const [datasetSite, setDatasetSite] = useState("");
    const handleDatasetSite = async (e) => {
        const dataset = e.target.value;
        setDatasetSite(dataset);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch("sites");
            const json = await res.json();
            if (json.sites) {
                setSiteList(json.sites);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    const [datasetPeriod, setDatasetPeriod] = useState(1);
    const handleDatasetPeriod = async (e) => {
        const dataset = e.target.value;
        setDatasetPeriod(dataset);
    };

    const [dateFrom, setDateFrom] = useState("");
    const handleDateFrom = async (e) => {
        const dataset = e.target.value;
        setDateFrom(dataset);
    };

    const [dateUntil, setDateUntil] = useState("");
    const handleDateUntil = async (e) => {
        const dataset = e.target.value;
        setDateUntil(dataset);
    };

    // Main form
    const [formData, setFormData] = useState({
        random_seed: 2022,
        root_directory: "",
        central_agent: false,
        simulation_start_time_step: 0,
        simulation_end_time_step: 8759,
        episode_time_steps: "",
        rolling_episode_split: false,
        random_episode_split: false,
        seconds_per_time_step: 3600,
    });

    const [rewardFunctionData, setRewardFunctionData] = useState({ type: "", attributes: {} });
    const handleRewardFunctionChange = (data) => {
        setRewardFunctionData(data);
    };

    const [agentData, setAgentData] = useState({ type: "", attributes: {} });
    const handleAgentChange = (data) => {
        setAgentData(data);
    };

    // Observations list
    const [observations, setObservations] = useState({
        month: { active: false, shared_in_central_agent: false },
        day_type: { active: false, shared_in_central_agent: false },
        hour: { active: false, shared_in_central_agent: false },
        daylight_savings_status: { active: false, shared_in_central_agent: false },
        outdoor_dry_bulb_temperature: { active: false, shared_in_central_agent: false },
        outdoor_dry_bulb_temperature_predicted_1: { active: false, shared_in_central_agent: false },
        outdoor_dry_bulb_temperature_predicted_2: { active: false, shared_in_central_agent: false },
        outdoor_dry_bulb_temperature_predicted_3: { active: false, shared_in_central_agent: false },
        outdoor_relative_humidity: { active: false, shared_in_central_agent: false },
        outdoor_relative_humidity_predicted_1: { active: false, shared_in_central_agent: false },
        outdoor_relative_humidity_predicted_2: { active: false, shared_in_central_agent: false },
        outdoor_relative_humidity_predicted_3: { active: false, shared_in_central_agent: false },
        direct_solar_irradiance: { active: false, shared_in_central_agent: false },
        direct_solar_irradiance_predicted_1: { active: false, shared_in_central_agent: false },
        direct_solar_irradiance_predicted_2: { active: false, shared_in_central_agent: false },
        direct_solar_irradiance_predicted_3: { active: false, shared_in_central_agent: false },
        carbon_intensity: { active: false, shared_in_central_agent: false },
        indoor_dry_bulb_temperature: { active: false, shared_in_central_agent: false },
        net_electricity_consumption: { active: false, shared_in_central_agent: false },
        electricity_pricing: { active: false, shared_in_central_agent: false },
        electric_vehicle_soc: { active: false, shared_in_central_agent: false }
    });

    // Actions list
    const [actions, setActions] = useState({
        cooling_storage: { active: false },
        heating_storage: { active: false },
        dhw_storage: { active: false },
        electrical_storage: { active: false },
        electric_vehicle_storage: { active: false }
    });

    const handleSaveDataset = async () => {
        if (!valid) {
            alert("Invalid form data!");
        }

        const filteredFormData = Object.fromEntries(
            Object.entries(formData).map(([key, value]) => {
                if (typeof value === "boolean") return [key, value];
                if (value === "" || value === null) return [key, value];
                return [key, isNaN(value) ? value : parseFloat(value)];
            })
        );

        const configs = {
            ...filteredFormData,
            observations: {},
            actions: {},
            agent: agentData,
            reward_function: rewardFunctionData
        };

        Object.keys(actions).forEach((action) => {
            configs.actions[action] = {
                active: actions[action].active,
                shared_in_central_agent: actions[action].shared_in_central_agent
            };
        });

        Object.keys(observations).forEach((observation) => {
            configs.observations[observation] = {
                active: observations[observation].active,
                shared_in_central_agent: observations[observation].shared_in_central_agent
            };
        });

        try {
            const body = {
                name: datasetName,
                site_id: datasetSite,
                citylearn_configs: configs,
                from_ts: dayjs(dateFrom).format("YYYY-MM-DD HH:mm:ss"),
                until_ts: dayjs(dateUntil).format("YYYY-MM-DD HH:mm:ss"),
            };

            console.log(body);

            const response = await fetch("dataset", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                toast.success('Dataset created successfully!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false
                });
            } else {
                toast.error('Error creating dataset!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false
                });
            }
        } catch (error) {
            toast.error('Error creating dataset!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false
            });
        }
    };

    return (
        <>
            <Row>
                <Col className="d-flex flex-row-reverse">
                    {!show && <Button variant="primary" onClick={() => setShow(true)}>New Dataset</Button>}
                    {show && <Button variant="primary" onClick={handleSaveDataset}>Save Dataset</Button>}
                    {show && <Button variant="danger" style={{ marginRight: 15 }} onClick={() => setShow(false)}>Cancel</Button>}
                </Col>
                <ToastContainer />
            </Row>

            {/* Form for input data */}
            {show && (
                <>
                    <Row>
                        <Col md={6}>
                            <h4>Dataset Name</h4>
                            <Form.Control type="text" name="name" value={datasetName} onChange={handleDatasetName} />
                        </Col>
                        <Col md={3}>
                            <h4>Site</h4>
                            <Form.Select style={{
                                padding: "10px",
                                cursor: "pointer",
                                border: "1px solid #ccc",
                                borderRadius: "5px",
                                width: "100%",
                                textAlign: "left"
                            }} value={datasetSite} onChange={handleDatasetSite}>
                                {siteList.map((site) => (
                                    <option key={site} value={site}>{site}</option>
                                ))}
                            </Form.Select>
                        </Col>
                    </Row>

                    <BaseInfoForm formData={formData} setFormData={setFormData} />

                    <Row>
                        <Col md={6}>
                            <h4>Observations</h4>
                            <Selector name={"Observation"} options={observations} setOptions={setObservations} />
                        </Col>
                        <Col md={3}>
                            <h4>Actions</h4>
                            <Selector name={"Action"} options={actions} setOptions={setActions} />
                        </Col>
                    </Row>

                    <AgentForm onChange={handleAgentChange} setValid={setValid} />

                    <RewardFunctionForm onChange={handleRewardFunctionChange} />

                    <Row>
                        <Col md={4}>
                            <h4>Period</h4>
                            <Form.Control type="number" name="period" min={1} value={datasetPeriod} onChange={handleDatasetPeriod} />
                        </Col>
                        <Col md={4}>
                            <h4>From</h4>
                            <Form.Control type="datetime-local" name="from" value={dateFrom} onChange={handleDateFrom} />
                        </Col>
                        <Col md={4}>
                            <h4>Until</h4>
                            <Form.Control type="datetime-local" name="until" value={dateUntil} onChange={handleDateUntil} />
                        </Col>
                    </Row>
                </>
            )}
        </>
    );
}

// Form with the base information
const BaseInfoForm = ({ formData, setFormData }) => {
    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    return (<>
        <Form className="mt-3">
            <h4>Base Info</h4>
            <Row>
                <Col className="mb-2" md={6}>
                    <Form.Group>
                        <Form.Label>Random Seed</Form.Label>
                        <Form.Control type="number" name="random_seed" value={formData.random_seed} onChange={handleChange} />
                    </Form.Group>
                </Col>
                <Col className="mb-2" md={6}>
                    <Form.Group>
                        <Form.Label>Root Directory</Form.Label>
                        <Form.Control type="text" name="root_directory" value={formData.root_directory} onChange={handleChange} />
                    </Form.Group>
                </Col>

                <Col className="mb-2" md={6}>
                    <Form.Group>
                        <Form.Label>Simulation Start Time Step</Form.Label>
                        <Form.Control type="number" name="simulation_start_time_step" value={formData.simulation_start_time_step} onChange={handleChange} />
                    </Form.Group>
                </Col>
                <Col className="mb-2" md={6}>
                    <Form.Group>
                        <Form.Label>Simulation End Time Step</Form.Label>
                        <Form.Control type="number" name="simulation_end_time_step" value={formData.simulation_end_time_step} onChange={handleChange} />
                    </Form.Group>
                </Col>

                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Episode Time Steps</Form.Label>
                        <EpisodeTimeStepSelector name="Episode Time Steps" formData={formData} setFormData={setFormData} />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Seconds per Time Step</Form.Label>
                        <Form.Control type="number" name="seconds_per_time_step" value={formData.seconds_per_time_step} onChange={handleChange} />
                    </Form.Group>
                </Col>
            </Row>
            <Row className="mt-3">
                <Col md={4}>
                    <Form.Check className="mb-1 pl-0">
                        <Form.Check.Label>
                            <Form.Check.Input type="checkbox" name="central_agent" checked={formData.central_agent} onChange={handleChange} />
                            <span className="form-check-sign"></span>
                            Central Agent
                        </Form.Check.Label>
                    </Form.Check>
                </Col>
                <Col md={4}>
                    <Form.Check className="mb-1 pl-0">
                        <Form.Check.Label>
                            <Form.Check.Input type="checkbox" name="rolling_episode_split" checked={formData.rolling_episode_split} onChange={handleChange} />
                            <span className="form-check-sign"></span>
                            Rolling Episode Split
                        </Form.Check.Label>
                    </Form.Check>
                </Col>
                <Col md={4}>
                    <Form.Check className="mb-1 pl-0">
                        <Form.Check.Label>
                            <Form.Check.Input type="checkbox" name="random_episode_split" checked={formData.random_episode_split} onChange={handleChange} />
                            <span className="form-check-sign"></span>
                            Random Episode Split
                        </Form.Check.Label>
                    </Form.Check>
                </Col>
            </Row>
        </Form>
    </>)
}

// Form with the agent information
const AgentForm = ({ onChange, setValid }) => {
    const agentTypes = [
        "citylearn.agents.rbc.BasicBatteryRBC",
        "citylearn.agents.rbc.BasicRBC",
        "citylearn.agents.rbc.HourRBC",
        "citylearn.agents.rbc.OptimizedRBC",
        "citylearn.agents.rbc.RBC",
        "citylearn.agents.sac.SAC",
        "citylearn.agents.sac.SACRBC",
        "citylearn.agents.marlisa.MARLISA",
        "citylearn.agents.marlisa.MARLISARBC",
    ];

    const [selectedType, setSelectedType] = useState(agentTypes[0]);
    const [jsonAttributes, setJsonAttributes] = useState({});
    const [jsonText, setJsonText] = useState("");
    const [isValidJson, setIsValidJson] = useState(true);

    const handleTypeChange = (e) => {
        const newType = e.target.value;
        setSelectedType(newType);
        onChange({ type: newType, attributes: jsonAttributes });
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    setJsonAttributes(jsonData);
                    setJsonText(JSON.stringify(jsonData, null, 4)); // Pretty format JSON
                    setIsValidJson(true);

                    // Pass updated agent data to parent
                    setValid(true);
                    onChange({ type: selectedType, attributes: jsonData });
                } catch (error) {
                    setValid(false);
                }
            };
            reader.readAsText(file);
        }
    };

    // Handle manual edits in textarea
    const handleJsonChange = (e) => {
        const newText = e.target.value;
        setJsonText(newText);

        try {
            const updatedJson = JSON.parse(newText);
            setJsonAttributes(updatedJson);
            setIsValidJson(true);

            // Pass updated JSON to parent
            setValid(true);
            onChange({ type: selectedType, attributes: updatedJson });
        } catch (error) {
            setIsValidJson(false);
            setValid(false);
        }
    };

    return (
        <>
            <Form className="mt-3">
                <h4>Agent Info</h4>

                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="d-flex">Agent Type</Form.Label>
                            <Form.Select
                                style={{
                                    padding: "10px",
                                    paddingRight: "30px",
                                    cursor: "pointer",
                                    border: "1px solid #ccc",
                                    borderRadius: "5px",
                                    width: "100%",
                                    textAlign: "left"
                                }}
                                value={selectedType}
                                onChange={handleTypeChange}
                            >
                                {agentTypes.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Agent Config (.json)</Form.Label>
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleFileUpload}
                                style={{
                                    display: "block",
                                    padding: "6px",
                                    border: "1px solid #ccc",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    width: "100%"
                                }}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                {/* Show the JSON text area only when a JSON file is uploaded */}
                {jsonText && (
                    <Row className="mt-3">
                        <Col>
                            <Form.Group>
                                <Form.Label>Edit JSON Config:</Form.Label>
                                <textarea
                                    value={jsonText}
                                    onChange={handleJsonChange}
                                    onKeyDown={(e) => {
                                        if (e.key === "Tab") {
                                            e.preventDefault(); // Prevent default tab behavior

                                            const { selectionStart, selectionEnd } = e.target;
                                            const newText =
                                                jsonText.substring(0, selectionStart) +
                                                "\t" +
                                                jsonText.substring(selectionEnd);

                                            setJsonText(newText);

                                            // Move cursor after inserted tab
                                            setTimeout(() => {
                                                e.target.selectionStart = e.target.selectionEnd = selectionStart + 1;
                                            }, 0);
                                        }
                                    }}
                                    style={{
                                        width: "100%",
                                        height: "200px",
                                        fontFamily: "monospace",
                                        fontSize: "14px",
                                        padding: "10px",
                                        border: isValidJson ? "1px solid #ccc" : "2px solid red",
                                        borderRadius: "5px",
                                        resize: "vertical",
                                        backgroundColor: isValidJson ? "white" : "#ffe5e5"
                                    }}
                                />
                                {!isValidJson && (
                                    <p style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>
                                        Invalid JSON format. Please fix syntax errors.
                                    </p>
                                )}
                            </Form.Group>
                        </Col>
                    </Row>
                )}
            </Form>
        </>
    );
};

// Form with the reward function information
const RewardFunctionForm = ({ onChange }) => {
    const rewardFunctionTypes = [
        "citylearn.reward_function.RewardFunction",
        "citylearn.reward_function.MARL",
        "citylearn.reward_function.IndependentSACReward",
        "citylearn.reward_function.SolarPenaltyReward",
        "citylearn.reward_function.ComfortReward",
        "citylearn.reward_function.SolarPenaltyAndComfortReward",
        "citylearn.reward_function.V2GPenaltyReward"
    ];

    // State for selected function type
    const [selectedType, setSelectedType] = useState(rewardFunctionTypes[0]);

    // Handle select change
    const handleTypeChange = (e) => {
        const newType = e.target.value;
        setSelectedType(newType);

        onChange({ type: selectedType });
    };

    return (
        <Form className="mt-3">
            <h4>Reward Function Info</h4>

            {/* Dropdown to select reward function type */}
            <Row className="mb-3">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label className="d-flex">Reward Function Type</Form.Label>
                        <Form.Select style={{
                            padding: "10px",
                            cursor: "pointer",
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                            width: "100%",
                            textAlign: "left"
                        }} value={selectedType} onChange={handleTypeChange}>
                            {rewardFunctionTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>
        </Form>
    );
};

// Selector for actions and observations
const Selector = ({ name, options, setOptions }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleCheckboxChange = (option, field) => {
        setOptions((prev) => ({
            ...prev,
            [option]: { ...prev[option], [field]: !prev[option][field] }
        }));
    };

    return (
        <div style={{ width: "100%", position: "relative", display: "inline-block" }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    padding: "10px",
                    background: "lightgray",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "5px",
                    width: "100%",
                    textAlign: "left"
                }}
            >
                <span className="d-flex align-items-center">
                    <span style={{ marginRight: "5px" }}>Select {name.concat("s")}</span>
                    {isOpen ? <FaArrowUp /> : <FaArrowDown />}
                </span>
            </button>

            {isOpen && (
                <div
                    style={{
                        position: "absolute",
                        top: "100%",
                        left: "0",
                        background: "#fff",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        padding: "10px",
                        boxShadow: "2px 2px 5px rgba(0,0,0,0.2)",
                        width: "100%",
                        maxHeight: "300px",
                        overflowY: "auto",
                        zIndex: 10
                    }}
                >
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f5f5f5", textAlign: "left" }}>
                                <th style={{ padding: "8px" }}>{name}</th>
                                <th style={{ padding: "8px", textAlign: "center" }}>Active</th>
                                {name == "Observation" &&
                                    <th style={{ padding: "8px", textAlign: "center" }}>Shared</th>
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(options).map((option) => (
                                <tr key={option} style={{ borderBottom: "1px solid #ddd" }}>
                                    <td style={{ padding: "8px" }}>{option.replace(/_/g, " ").toUpperCase()}</td>
                                    <td>
                                        <Form.Check className="mb-0">
                                            <Form.Check.Label style={{ paddingBottom: "17px" }}>
                                                <Form.Check.Input
                                                    type="checkbox"
                                                    checked={options[option].active}
                                                    onChange={() => handleCheckboxChange(option, "active")}
                                                />
                                                <span className="form-check-sign"></span>
                                            </Form.Check.Label>
                                        </Form.Check>
                                    </td>
                                    {name == "Observation" &&
                                        <td>
                                            <Form.Check className="mb-0">
                                                <Form.Check.Label style={{ paddingBottom: "17px" }}>
                                                    <Form.Check.Input
                                                        type="checkbox"
                                                        checked={options[option].shared_in_central_agent}
                                                        onChange={() => handleCheckboxChange(option, "shared_in_central_agent")}
                                                    />
                                                    <span className="form-check-sign"></span>
                                                </Form.Check.Label>
                                            </Form.Check>
                                        </td>
                                    }
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const EpisodeTimeStepSelector = ({ name, formData, setFormData }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [ranges, setRanges] = useState([[0, 0.8]]); // Default range

    // Handle range input change
    const handleRangeChange = (index, field, value) => {
        const updatedRanges = [...ranges];
        updatedRanges[index][field] = parseFloat(value) || 0;
        setRanges(updatedRanges);
        setFormData({ ...formData, episode_time_steps: updatedRanges });
    };

    // Add new row
    const addRow = () => {
        setRanges([...ranges, [0, 0]]);
    };

    // Remove row
    const removeRow = (index) => {
        const updatedRanges = ranges.filter((_, i) => i !== index);
        setRanges(updatedRanges);
        setFormData({ ...formData, episode_time_steps: updatedRanges });
    };

    return (
        <div style={{ width: "100%", position: "relative", display: "inline-block" }}>
            {/* Dropdown Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    padding: "10px",
                    background: "lightgray",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "5px",
                    width: "100%",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <span>{name}</span>
                {isOpen ? <FaArrowUp /> : <FaArrowDown />}
            </button>

            {/* Dropdown Table */}
            {isOpen && (
                <div
                    style={{
                        position: "absolute",
                        top: "100%",
                        left: "0",
                        background: "#fff",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        padding: "10px",
                        boxShadow: "2px 2px 5px rgba(0,0,0,0.2)",
                        width: "100%",
                        maxHeight: "300px",
                        overflowY: "auto",
                        zIndex: 10,
                    }}
                >
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f5f5f5", textAlign: "left" }}>
                                <th style={{ padding: "8px" }}>Min</th>
                                <th style={{ padding: "8px" }}>Max</th>
                                <th style={{ padding: "8px" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ranges.map((range, index) => (
                                <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                                    <td>
                                        <Form.Control
                                            type="number"
                                            step="0.1"
                                            value={range[0]}
                                            onChange={(e) => handleRangeChange(index, 0, e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <Form.Control
                                            type="number"
                                            step="0.1"
                                            value={range[1]}
                                            onChange={(e) => handleRangeChange(index, 1, e.target.value)}
                                        />
                                    </td>
                                    <td style={{ paddingLeft: "10px" }}>
                                        <Button variant="danger" style={{
                                            padding: "5px 10px",
                                            background: "red",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "5px",
                                            cursor: "pointer"
                                        }} onClick={() => removeRow(index)} disabled={ranges.length === 1}>
                                            ✖
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Button className="d-flex align-items-center" variant="primary" onClick={addRow} style={{ marginTop: "5px" }}>
                        <FaPlus></FaPlus>
                        <span style={{ paddingLeft: "5px" }}>Add Row</span>
                    </Button>
                </div>
            )}
        </div>
    );
};