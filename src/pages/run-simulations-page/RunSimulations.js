import React, { useState, useRef, useEffect } from "react";
import {
    Button,
    Container,
    Row,
    Col
} from "react-bootstrap";
import { FaPlay, FaUpload } from "react-icons/fa";

function RunSimulations() {
    const [schemaInfo, setSchemaInfo] = useState("");
    const [targetContainer, setTargetContainer] = useState("");
    const [availableHosts, setAvailableHosts] = useState([]);
    const fileInputRef = useRef(null);

    const handleSchemaUpload = async (event) => {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    setSchemaInfo(JSON.stringify(jsonData, null, 4));
                } catch (error) {
                    console.log("error");
                }
            };
            reader.readAsText(file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch("hosts");
            const json = await res.json();
            if (json.available_hosts) {
                setAvailableHosts(json.available_hosts);
                setTargetContainer(json.available_hosts[0]?.host || "");
            }
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    const handleTargetChange = (e) => {
        setTargetContainer(e.target.value);
    }

    const handleRunSimulation = async () => {
        try {
            const parsedConfig = JSON.parse(schemaInfo);
    
            const fileName = "simulation_config.json";
            const jsonOutput = {
                config: parsedConfig,
                save_as: fileName,
                target_host: targetContainer,
            };
    
            const response = await fetch("run-simulation", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(jsonOutput)
            });
    
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
    
            const result = await response.json();
            console.log("Simulation started successfully:", result);
        } catch (error) {
            console.error("Error running simulation:", error);
        }
    };  

    return (
        <>
            <Container fluid>
                <div className="d-flex justify-content-between gap-2">
                    {/* Hidden File Input */}
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleSchemaUpload}
                        ref={fileInputRef}
                        style={{ display: "none" }}
                    />

                    <Button
                        className="d-flex align-items-center"
                        variant="secondary"
                        onClick={handleUploadClick}
                    >
                        <FaUpload style={{ marginRight: "10px" }} />
                        Upload Schema
                    </Button>

                    {schemaInfo !== "" &&
                        <Button className="d-flex align-items-center" variant="primary" onClick={handleRunSimulation}>
                            <FaPlay style={{ marginRight: "10px" }} />
                            Run Simulation
                        </Button>
                    }
                </div>

                {schemaInfo && (
                    <>
                        <Row className="mt-3">
                            <Col>
                                <h4>Schema Config:</h4>
                                <textarea
                                    value={schemaInfo}
                                    readOnly={true}
                                    style={{
                                        width: "100%",
                                        height: "500px",
                                        fontFamily: "monospace",
                                        fontSize: "14px",
                                        padding: "10px",
                                        border: "1px solid #ccc",
                                        borderRadius: "5px",
                                        resize: "vertical",
                                        backgroundColor: "white"
                                    }}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <h4>Target Container:</h4>
                                <select value={targetContainer} onChange={handleTargetChange} className="w-25"
                                    style={{ padding: "5px 10px", cursor: "pointer", border: "1px solid #ccc", borderRadius: "5px", width: "100%" }}
                                >
                                    {availableHosts.map((host, index) => (
                                        <option key={index} value={host.name}>
                                            {host.name}
                                        </option>
                                    ))}
                                </select>
                            </Col>
                        </Row>
                    </>
                )}
            </Container>
        </>
    );
}

export default RunSimulations;
