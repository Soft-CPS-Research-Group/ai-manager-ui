import React, { useState, useRef } from "react";
import {
    Button,
    Container,
    Row,
    Col
} from "react-bootstrap";
import { FaPlay, FaUpload } from "react-icons/fa";

function RunSimulations() {
    const [schemaInfo, setSchemaInfo] = useState("");
    const [targetContainer, setTargetContainer] = useState("1");
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

    const handleTargetChange = (e) => {
        setTargetContainer(e.target.value);
    }

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
                        <Button className="d-flex align-items-center" variant="primary">
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
                                <select value={targetContainer} onChange={handleTargetChange}>
                                    <option value={1}>1 Minute</option>
                                    <option value={15}>15 Minutes</option>
                                    <option value={30}>30 Minutes</option>
                                    <option value={60}>1 Hour</option>
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
